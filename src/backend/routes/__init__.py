from .auth_routes import bp as auth_bp
from .document_routes import bp as docs_bp
from .reset_password_routes import bp as reset_bp

def register_routes(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(docs_bp)
    app.register_blueprint(reset_bp)
