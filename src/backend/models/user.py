from extensions import db, bcrypt

class User(db.Model):
    id       = db.Column(db.Integer, primary_key=True)
    email    = db.Column(db.String(120), unique=True, nullable=False)
    pw_hash  = db.Column(db.String(128), nullable=False)

    @classmethod
    def create(cls, email: str, password: str):
        return cls(
            email=email,
            pw_hash=bcrypt.generate_password_hash(password).decode()
        )
