import os, uuid, json, logging
from flask import Blueprint, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from extensions import db
from models import UserDocument
from utils import extract_text
import requests, os

bp = Blueprint("docs", __name__, url_prefix="/api")

# --------------- helpers ---------------
ALLOWED_EXTENSIONS = {"pdf", "docx","xlsx","doc","pptx","txt"}
GROQ_API_URL  = os.getenv("GROQ_API_URL")
GROQ_API_KEY  = os.getenv("GROQ_API_KEY")
GROQ_MODEL    = "meta-llama/llama-4-maverick-17b-128e-instruct"

def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# --------------- endpoints ---------------
@bp.post("/upload-and-process")
@jwt_required()
def upload_and_process():
    user_id = int(get_jwt_identity())
    if "document" not in request.files:
        return {"success": False, "error": "No document field."}, 400

    file = request.files["document"]
    if file.filename == "":
        return {"success": False, "error": "No selected file."}, 400
    if not allowed_file(file.filename):
        return {"success": False, "error": "File type not allowed."}, 400

    uploads_dir = current_app.config["UPLOAD_FOLDER"]  # via Flask app context
    original    = secure_filename(file.filename)
    temp_name   = f"{uuid.uuid4()}_{original}"
    temp_path   = os.path.join(uploads_dir, temp_name)

    try:
        file.save(temp_path)
        extracted_text = extract_text(temp_path)

        doc = UserDocument(
            user_id=user_id,
            document_name=original,
            extracted_text=extracted_text,
            chat=[{
                "sender": "ai",
                "text": f'File "{original}" processed! Ask me anything about its content.'
            }]
        )
        db.session.add(doc)
        db.session.commit()
        return {"success": True, "documentId": doc.id, "filename": original}, 200
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


@bp.post("/ask-question")
@jwt_required()
def ask_question():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    doc_id = data.get("documentId")
    q      = data.get("question")

    if not doc_id or not q:
        return {"success": False, "error": "Missing documentId or question."}, 400

    doc = UserDocument.query.filter_by(id=doc_id, user_id=user_id).first()
    if not doc:
        return {"success": False, "error": "Document session not found."}, 404

    prompt_msgs = [
        {
            "role": "system",
            "content": (
                "You are an expert assistant. Answer strictly from the document text provided. "
                "If the answer isn't present, reply ‘The answer is not found in the provided document text.’\n\n"
                "--- Document Context Start ---\n" + doc.extracted_text + "\n--- Document Context End ---"
                " • Always cite the paragraph number."
            ),
        },
        {"role": "user", "content": q},
    ]

    headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
    payload = {"model": GROQ_MODEL, "messages": prompt_msgs, "temperature": 0.7, "max_tokens": 2048, "top_p": 1}

    try:
        resp = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=60)
        resp.raise_for_status()
        answer = resp.json()["choices"][0]["message"]["content"]
    except Exception as exc:
        logging.exception("Groq API error")
        return {"success": False, "error": f"Groq API error: {exc}"}, 503

    doc.chat = (doc.chat or []) + [{"sender": "user", "text": q}, {"sender": "ai", "text": answer}]
    db.session.commit()
    return {"success": True, "answer": answer}, 200


@bp.get("/user-documents")
@jwt_required()
def list_user_documents():
    user_id = int(get_jwt_identity())
    docs = UserDocument.query.filter_by(user_id=user_id).order_by(UserDocument.updated_at.desc()).all()
    res = [{
        "id": d.id,
        "document_name": d.document_name,
        "created_at": d.created_at.isoformat(),
        "updated_at": d.updated_at.isoformat(),
        "preview": (d.chat[0]["text"] if d.chat else "")[:100],
    } for d in docs]
    return {"success": True, "documents": res}, 200


@bp.get("/user-documents/<int:doc_id>")
@jwt_required()
def get_user_document_session(doc_id: int):
    user_id = int(get_jwt_identity())
    doc = UserDocument.query.filter_by(id=doc_id, user_id=user_id).first()
    if not doc:
        return {"success": False, "error": "Document session not found."}, 404
    return {
        "success": True,
        "document_session": {
            "id": doc.id,
            "document_name": doc.document_name,
            "chat_history": doc.chat or [],
            "created_at": doc.created_at.isoformat(),
            "updated_at": doc.updated_at.isoformat(),
        }
    }, 200
