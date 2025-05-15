import logging
import PyPDF2
import docx
import docx2txt
from docx.opc.exceptions import PackageNotFoundError  # noqa: F401  (used by python-docx)

def extract_text_from_pdf(path: str) -> str:
    try:
        reader = PyPDF2.PdfReader(path)
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    except Exception as exc:
        logging.error("PDF read error: %s", exc)
        raise ValueError(f"PDF read error: {exc}")

def extract_text_from_docx(path: str) -> str:
    try:
        return "\n".join(p.text for p in docx.Document(path).paragraphs)
    except Exception as err:
        logging.warning("python-docx failed (%s) – falling back to docx2txt", err)
        try:
            return docx2txt.process(path)
        except Exception as err2:
            logging.error("docx2txt also failed: %s", err2)
            raise ValueError(f"DOCX read error: {err}, then {err2}")

def extract_text(path: str) -> str:
    ext = path.rsplit(".", 1)[1].lower()
    if ext == "pdf":
        return extract_text_from_pdf(path)
    if ext == "docx":
        return extract_text_from_docx(path)
    raise ValueError(f"Unsupported file type: {ext}")
