import os
import uuid
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import requests
import PyPDF2
import docx
# import logging # logging is already imported above
from docx.opc.exceptions import PackageNotFoundError
import docx2txt
# import docx # docx is already imported above


"""AskDocx – unified backend (file processing + JWT auth)"""

# ---------------------------------------------------------------------------
# Configuration & App Setup
# ---------------------------------------------------------------------------
load_dotenv()  # Load variables from .env

app = Flask(__name__)
CORS(
    app,
    resources={r"/api/*": {"origins": "http://localhost:5173"}},
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=["Authorization"],
)

# Database ---------------------------------------------------------------
basedir = os.path.abspath(os.path.dirname(__file__))
app.config["SQLALCHEMY_DATABASE_URI"] = (
    "mysql+pymysql://askdocx_user:dev@127.0.0.1:3306/askdocx?charset=utf8mb4"
)


app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "SET_A_REAL_SECRET")

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)


from datetime import timedelta
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=2)
# Uploads ---------------------------------------------------------------
UPLOAD_FOLDER = os.path.join(basedir, "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB

ALLOWED_EXTENSIONS = {"pdf", "docx"}

def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# Groq API --------------------------------------------------------------
GROQ_API_URL = os.getenv("GROQ_API_URL")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = "meta-llama/llama-4-maverick-17b-128e-instruct" # As per your original code, ensure this model is available or update if needed

# In-memory store (replace with Redis / DB for prod)
documents_store: dict[str, dict[str, str]] = {}

# ---------------------------------------------------------------------------
# Database model
# ---------------------------------------------------------------------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    pw_hash = db.Column(db.String(128), nullable=False)

    @classmethod
    def create(cls, email: str, password: str):
        return cls(email=email, pw_hash=bcrypt.generate_password_hash(password).decode())

# Create tables on first run
with app.app_context():
    db.create_all()

# ---------------------------------------------------------------------------
# Helper – text extraction
# ---------------------------------------------------------------------------

def extract_text_from_pdf(filepath: str) -> str:
    try:
        reader = PyPDF2.PdfReader(filepath)
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    except Exception as pdf_err:
        logging.error(f"PDF read error for {filepath}: {pdf_err}")
        raise ValueError(f"PDF read error: {pdf_err}")

def extract_text_from_docx(filepath: str) -> str:
    try:
        # 1 – try python-docx first (good for well-formed docs)
        return "\n".join(p.text for p in docx.Document(filepath).paragraphs)
    except Exception as err:
        # 2 – if **any** error occurs (metadata, corruption, etc.)
        #     fall back to docx2txt, which ignores metadata completely
        logging.warning(f"[docx] python-docx failed for {filepath} because: {err}. Falling back to docx2txt.")
        try:
            return docx2txt.process(filepath)
        except Exception as docx2txt_err:
            logging.error(f"docx2txt also failed for {filepath}: {docx2txt_err}")
            raise ValueError(f"DOCX read error with both libraries: {err}, then {docx2txt_err}")


def extract_text(filepath: str) -> str:
    ext = filepath.rsplit(".", 1)[1].lower()
    if ext == "pdf":
        return extract_text_from_pdf(filepath)
    if ext == "docx":
        return extract_text_from_docx(filepath)
    raise ValueError(f"Unsupported file type: {ext}")

# ---------------------------------------------------------------------------
# Auth Endpoints
# ---------------------------------------------------------------------------
@app.post("/api/auth/register")
def register():
    data = request.get_json() or {}
    if not data.get("email") or not data.get("password"):
        return {"success": False, "error": "Email & password required."}, 400

    if User.query.filter_by(email=data["email"]).first():
        return {"success": False, "error": "User already exists."}, 409

    user = User.create(data["email"], data["password"])
    db.session.add(user)
    db.session.commit()
    # --- FIX: Convert user.id to string for JWT identity ---
    token = create_access_token(identity=str(user.id))
    return {"success": True, "token": token}, 201

@app.post("/api/auth/login")
def login():
    data = request.get_json() or {}
    user = User.query.filter_by(email=data.get("email")).first()
    if not user or not bcrypt.check_password_hash(user.pw_hash, data.get("password", "")): # Added default for password
        return {"success": False, "error": "Invalid credentials."}, 401
    # --- FIX: Convert user.id to string for JWT identity ---
    token = create_access_token(identity=str(user.id))
    return {"success": True, "token": token}, 200

# ---------------------------------------------------------------------------
# Document Endpoints (JWT-protected)
# ---------------------------------------------------------------------------
@app.route("/api/upload-and-process", methods=["POST"])
@jwt_required()
def upload_and_process():
    current_user_identity = get_jwt_identity()  # This will be the string representation of user.id

    if "document" not in request.files:
        return {"success": False, "error": "No document file part in the request"}, 400

    file = request.files["document"]

    if file.filename == "":
        return {"success": False, "error": "No selected file"}, 400

    filepath = "" # Initialize filepath to ensure it's defined in case of early exit
    if file and allowed_file(file.filename):
        original_filename = file.filename
        secure_name = secure_filename(original_filename) # original_filename is already secure_filename in practice here
        temp_filename = f"{uuid.uuid4()}_{secure_name}"
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], temp_filename)

        try:
            file.save(filepath)
            extracted_text = extract_text(filepath)

            doc_id = str(uuid.uuid4())
            documents_store[doc_id] = {
                "owner": current_user_identity, # Storing string ID
                "filename": original_filename,
                "text": extracted_text,
            }
            # It's good practice to remove the temp file after processing
            # os.remove(filepath) # Moved to finally block

            return {
                "success": True,
                "documentId": doc_id,
                "message": f'File "{original_filename}" processed successfully.',
                "filename": original_filename, # Return original filename as per frontend expectation
            }, 200

        except ValueError as ve: # Catch specific text extraction errors
            logging.exception("Text extraction failed during upload-process")
            return {"success": False, "error": str(ve)}, 400 # Bad request if file content is problematic
        except Exception as e:
            logging.exception("Upload-process failed")
            return {"success": False, "error": f"An unexpected error occurred: {str(e)}"}, 500
        finally:
            if filepath and os.path.exists(filepath): # Ensure filepath is defined and exists
                os.remove(filepath)


    return {"success": False, "error": "File type not allowed"}, 400

@app.route("/api/ask-question", methods=["POST"])
@jwt_required()
def ask_question():
    current_user_identity = get_jwt_identity() # This is a string
    data = request.get_json() or {}
    doc_id = data.get("documentId")
    question = data.get("question")

    if not doc_id or not question:
        return {"success": False, "error": "Missing documentId or question"}, 400

    doc = documents_store.get(doc_id)
    # Ensure 'owner' in doc is also a string for correct comparison
    if not doc or doc.get("owner") != current_user_identity:
        return {"success": False, "error": "Document not found or access denied"}, 404

    context_text = doc["text"]
    # original_filename = doc["filename"] # Not used in this function currently

    prompt_messages = [
        {
            "role": "system",
            "content": (
                "You are an expert assistant. Answer strictly from the document text provided. "
                "If the answer isn't present, reply ‘The answer is not found in the provided document text.’\n\n"  # noqa
                "--- Document Context Start ---\n" + context_text + "\n--- Document Context End ---"
            ),
        },
        {"role": "user", "content": question},
    ]

    if not GROQ_API_KEY or not GROQ_API_URL:
        logging.error("Groq API not configured.")
        return {"success": False, "error": "Groq API not configured"}, 500

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": GROQ_MODEL,
        "messages": prompt_messages,
        "temperature": 0.7,
        "max_tokens": 1000, # Consider if this is appropriate for all use cases
        "top_p": 1,
    }

    try:
        resp = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=60)
        resp.raise_for_status() # Will raise an HTTPError for bad responses (4xx or 5xx)
        ai_response_data = resp.json()
        ai_answer = ai_response_data.get("choices", [{}])[0].get("message", {}).get("content")

        if ai_answer is None:
            logging.error(f"Could not parse answer from Groq response. Full response: {ai_response_data}")
            raise ValueError("Could not parse answer from Groq response")
        return {"success": True, "answer": ai_answer}, 200

    except requests.exceptions.RequestException as req_err: # More specific network/HTTP error
        logging.exception("Groq API request failed")
        return {"success": False, "error": f"Groq API communication error: {req_err}"}, 503
    except ValueError as val_err: # For parsing errors specifically
        logging.exception("Groq API response parsing failed")
        return {"success": False, "error": str(val_err)}, 500
    except Exception as e:
        logging.exception("Groq API call failed with an unexpected error")
        return {"success": False, "error": f"An unexpected Groq API error occurred: {e}"}, 503

# ---------------------------------------------------------------------------
# Misc
# ---------------------------------------------------------------------------
@app.route("/")
def index():
    return "AskDocx backend is running!"


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s %(module)s:%(lineno)d - %(message)s"
    )
    # Ensure DB tables are created within app context
    with app.app_context():
        db.create_all()  # builds the User table if it doesn't exist

    app.run(debug=True, host="0.0.0.0", port=5000)