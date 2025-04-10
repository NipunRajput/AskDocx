import os
import uuid
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import requests

# --- Text Extraction Imports ---
import PyPDF2
import docx # python-docx

# --- Configuration ---
load_dotenv() # Load environment variables from .env file

app = Flask(__name__)
CORS(app) # Enable CORS for requests from your React frontend

# Configure upload folder (optional, adjust as needed)
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024 # Optional: Limit upload size (e.g., 16MB)

# --- Groq API Details ---
GROQ_API_URL = os.getenv("GROQ_API_URL")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = "deepseek-r1-distill-qwen-32b" # Or "mixtral-8x7b-32768" or your preferred model

# --- In-Memory Storage (Replace with DB/Cache for production) ---
# Simple dictionary to store extracted text associated with a unique ID
# WARNING: This data is lost when the Flask server restarts!
documents_store = {}

# --- Allowed File Extensions ---
ALLOWED_EXTENSIONS = {'pdf', 'docx'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- Text Extraction Logic ---
def extract_text_from_pdf(filepath):
    """Extracts text from a PDF file."""
    text = ""
    try:
        with open(filepath, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text: # Check if text extraction returned something
                    text += page_text + "\n" # Add newline between pages
        return text
    except Exception as e:
        logging.error(f"Error extracting PDF text: {e}")
        raise ValueError(f"Could not extract text from PDF: {e}")

def extract_text_from_docx(filepath):
    """Extracts text from a DOCX file."""
    text = ""
    try:
        doc = docx.Document(filepath)
        for para in doc.paragraphs:
            text += para.text + "\n"
        return text
    except Exception as e:
        logging.error(f"Error extracting DOCX text: {e}")
        raise ValueError(f"Could not extract text from DOCX: {e}")

def extract_text(filepath, filename):
    """Determines file type and calls the appropriate extraction function."""
    ext = filename.rsplit('.', 1)[1].lower()
    if ext == 'pdf':
        return extract_text_from_pdf(filepath)
    elif ext == 'docx':
        return extract_text_from_docx(filepath)
    # Add elif for '.doc' if you install 'textract' or another library
    # elif ext == 'doc':
    #    import textract
    #    return textract.process(filepath).decode('utf-8')
    else:
        raise ValueError(f"Unsupported file type: {ext}")

# --- API Routes ---

@app.route('/api/upload-and-process', methods=['POST'])
def upload_and_process():
    """
    Handles file upload, extracts text, stores it, and returns a document ID.
    Matches the frontend's expectation for the /api/upload-and-process endpoint.
    """
    if 'document' not in request.files:
        return jsonify({'success': False, 'error': 'No document file part in the request'}), 400

    file = request.files['document']

    if file.filename == '':
        return jsonify({'success': False, 'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        original_filename = file.filename
        # Secure the filename before saving (important!)
        secure_name = secure_filename(original_filename)
        # Create a unique filename for temporary storage to avoid conflicts
        temp_filename = f"{uuid.uuid4()}_{secure_name}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], temp_filename)

        try:
            file.save(filepath) # Save the file temporarily
            logging.info(f"File temporarily saved to: {filepath}")

            # Extract text from the saved file
            extracted_text = extract_text(filepath, secure_name)
            logging.info(f"Text extracted successfully from {secure_name}. Length: {len(extracted_text)}")

            # Generate a unique ID for this document
            doc_id = str(uuid.uuid4())

            # Store the extracted text in our simple in-memory store
            documents_store[doc_id] = {
                "filename": original_filename, # Store original name too if needed
                "text": extracted_text
            }
            logging.info(f"Document stored with ID: {doc_id}")

            # Clean up the temporary file
            os.remove(filepath)
            logging.info(f"Temporary file deleted: {filepath}")

            # Return success response with the document ID
            return jsonify({
                'success': True,
                'documentId': doc_id,
                'message': f'File "{original_filename}" processed successfully.',
                'filename': original_filename # Send back original name for display
            }), 200

        except ValueError as ve: # Catch extraction errors (incl. unsupported type)
             logging.error(f"Extraction Error: {ve}")
             # Clean up if file was saved but extraction failed
             if os.path.exists(filepath):
                 os.remove(filepath)
             return jsonify({'success': False, 'error': str(ve)}), 400
        except Exception as e:
            logging.error(f"An unexpected error occurred during upload/processing: {e}")
            # Clean up if file exists after unexpected error
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({'success': False, 'error': f'An unexpected error occurred: {e}'}), 500
    else:
        return jsonify({'success': False, 'error': 'File type not allowed'}), 400

@app.route('/api/ask-question', methods=['POST'])
def ask_question():
    """
    Receives a document ID and a question, retrieves the stored text,
    queries the Groq API, and returns the answer.
    """
    data = request.get_json()

    if not data:
        return jsonify({'success': False, 'error': 'Invalid JSON payload'}), 400

    doc_id = data.get('documentId')
    question = data.get('question')

    if not doc_id or not question:
        return jsonify({'success': False, 'error': 'Missing documentId or question in request'}), 400

    # Retrieve the stored document text
    document_data = documents_store.get(doc_id)
    if not document_data:
        return jsonify({'success': False, 'error': 'Invalid document ID or document not found'}), 404

    context_text = document_data.get('text', '')
    original_filename = document_data.get('filename', 'the document')

    if not context_text:
         return jsonify({'success': False, 'error': 'Could not retrieve text for the document ID'}), 500

    # --- Construct the Prompt for Groq ---
    # Provide context clearly separated from the question
    prompt_messages = [
        {
            "role": "system",
            "content": f"You are an expert assistant. Analyze the following document context provided below and answer the user's question based *only* on this text. The document's original filename was '{original_filename}'. Do not use any prior knowledge outside of the provided text. If the answer cannot be found in the text, say 'The answer is not found in the provided document text.'\n\n--- Document Context Start ---\n{context_text}\n--- Document Context End ---"
        },
        {
            "role": "user",
            "content": question
        }
    ]

    # --- Call Groq API ---
    if not GROQ_API_KEY or not GROQ_API_URL:
        return jsonify({'success': False, 'error': 'Groq API Key or URL not configured on the server'}), 500

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": GROQ_MODEL,
        "messages": prompt_messages,
        "temperature": 0.7, # Adjust as needed
        "max_tokens": 500,  # Adjust based on expected answer length & model limits
        "top_p": 1,
        "stop": None,
        # "stream": False, # Set to True if you want streaming responses
    }

    try:
        logging.info(f"Sending request to Groq for doc ID {doc_id}...")
        response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=60) # Added timeout
        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)

        api_result = response.json()
        logging.info("Received response from Groq.")

        # Extract the answer
        ai_answer = api_result.get("choices", [{}])[0].get("message", {}).get("content", None)

        if ai_answer is None:
             logging.error(f"Groq response structure unexpected: {api_result}")
             return jsonify({'success': False, 'error': 'Could not parse answer from Groq response'}), 500

        return jsonify({'success': True, 'answer': ai_answer}), 200

    except requests.exceptions.RequestException as e:
        logging.error(f"Error calling Groq API: {e}")
        # Check if response exists for more details
        error_detail = str(e)
        if e.response is not None:
            try:
                error_detail = f"{e} - Response: {e.response.text}"
            except Exception: # Handle cases where reading response text fails
                pass
        return jsonify({'success': False, 'error': f'Failed to communicate with Groq API: {error_detail}'}), 503 # 503 Service Unavailable
    except Exception as e:
        logging.error(f"An unexpected error occurred during question asking: {e}")
        return jsonify({'success': False, 'error': f'An unexpected server error occurred: {e}'}), 500


# Basic route to check if the server is running
@app.route('/')
def index():
    return "Flask backend is running!"

# --- Main Execution ---
if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO) # Enable basic logging
    # Use host='0.0.0.0' to make it accessible on your network
    app.run(debug=True, host='0.0.0.0', port=5000) # Run on port 5001 to avoid conflict with React default port