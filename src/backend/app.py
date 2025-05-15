"""
Main entry-point for AskDocx backend.
Initialises Flask app, extensions, blueprints and creates DB tables.
"""

import os
from datetime import timedelta
from dotenv import load_dotenv
from flask import Flask
from extensions import db, bcrypt, jwt_manager, limiter, cors
from routes import register_routes    # registers every blueprint
import models                          # noqa: F401  (ensures models are imported)

load_dotenv()  # .env variables

def create_app() -> Flask:
    app = Flask(__name__)

    # ---------- Core configuration ----------
    app.config.update(
        SQLALCHEMY_DATABASE_URI=(
            "mysql+pymysql://askdocx_user:dev@127.0.0.1:3306/askdocx?charset=utf8mb4"
        ),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JWT_SECRET_KEY=os.getenv("JWT_SECRET_KEY", "SET_A_REAL_SECRET"),
        JWT_ACCESS_TOKEN_EXPIRES=timedelta(hours=2),
        UPLOAD_FOLDER=os.path.join(os.path.abspath(os.path.dirname(__file__)), "uploads"),
        MAX_CONTENT_LENGTH=16 * 1024 * 1024,   # 16 MB
    )

    # ---------- Initialise extensions ----------
    db.init_app(app)
    bcrypt.init_app(app)
    jwt_manager.init_app(app)
    limiter.init_app(app)
        # ---- Complete CORS configuration (identical policy) ----
    cors.init_app(
        app,
        resources={
            r"/api/*": {
                "origins": ["http://localhost:5173"],
                "methods": ["GET", "HEAD", "POST", "OPTIONS", "PUT", "DELETE"],
                "allow_headers": ["Content-Type", "Authorization"],
                "supports_credentials": True,
                "expose_headers": ["Authorization"],
            }
        },
    )

    cors.init_app(app)

    # ---------- Register blueprints ----------
    register_routes(app)

    # ---------- Ensure uploads folder ----------
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    @app.get("/")
    def index():
        return "AskDocx backend is running!", 200

    return app


if __name__ == "__main__":
    _app = create_app()
    with _app.app_context():
        db.create_all()
    _app.run(debug=True, host="0.0.0.0", port=5000)
