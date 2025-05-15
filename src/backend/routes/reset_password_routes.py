import os
from datetime import timedelta
import jwt
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from flask import Blueprint, request, jsonify, current_app as app
from flask_jwt_extended import create_access_token
from extensions import limiter, db, bcrypt
from models import User
from utils import send_email

bp = Blueprint("reset", __name__, url_prefix="/api/auth")

# ---------- Forgot password ----------
@bp.post("/forgot-password")
@limiter.limit("10/minute")
def forgot_password():
    email = (request.get_json() or {}).get("email")
    if not email:
        return jsonify({"success": False, "message": "Email is required"}), 400

    user = User.query.filter_by(email=email).first()
    if user:
        token = create_access_token(identity=str(user.id), expires_delta=timedelta(minutes=15))
        link  = f"http://localhost:5173/reset-password?token={token}"
        body  = f"Click to reset your password (expires in 15 min):\n{link}"
        send_email(user.email, "Password Reset Request", body)

    # Always return OK to avoid account enumeration
    return jsonify({"success": True, "message": "If an account exists, a reset link was sent."}), 200


# ---------- Reset password ----------
@bp.post("/reset-password")
def reset_password():
    data = request.get_json() or {}
    token = data.get("token")
    new_pw = data.get("password", "").strip()

    if not token or not new_pw or len(new_pw) < 8:
        return jsonify({"success": False, "message": "Token and 8-char password required"}), 400

    try:
        decoded  = jwt.decode(token, app.config["JWT_SECRET_KEY"], algorithms=["HS256"])
        user_id  = decoded.get("sub")
        user     = db.session.get(User, int(user_id)) if user_id else None
        if not user:
            return jsonify({"success": False, "message": "Invalid token"}), 400

        user.pw_hash = bcrypt.generate_password_hash(new_pw).decode()
        db.session.commit()
        return jsonify({"success": True, "message": "Password reset successful"}), 200

    except ExpiredSignatureError:
        return jsonify({"success": False, "message": "Reset link expired"}), 400
    except InvalidTokenError:
        return jsonify({"success": False, "message": "Invalid token"}), 400
    except Exception as exc:
        return jsonify({"success": False, "message": str(exc)}), 500
