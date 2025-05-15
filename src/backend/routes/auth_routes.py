from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from extensions import db, bcrypt
from models import User

bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@bp.post("/register")
def register():
    data = request.get_json() or {}
    if not data.get("email") or not data.get("password"):
        return {"success": False, "error": "Email & password required."}, 400

    if User.query.filter_by(email=data["email"]).first():
        return {"success": False, "error": "User already exists."}, 409

    user = User.create(data["email"], data["password"])
    db.session.add(user)
    db.session.commit()
    token = create_access_token(identity=str(user.id))
    return {"success": True, "token": token}, 201


@bp.post("/login")
def login():
    data = request.get_json() or {}
    user = User.query.filter_by(email=data.get("email")).first()
    if not user or not bcrypt.check_password_hash(user.pw_hash, data.get("password", "")):
        return {"success": False, "error": "Invalid credentials."}, 401
    token = create_access_token(identity=str(user.id))
    return {"success": True, "token": token}, 200
