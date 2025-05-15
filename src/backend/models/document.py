from extensions import db

class UserDocument(db.Model):
    __tablename__ = "user_documents"

    id            = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id       = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    document_name = db.Column(db.String(255), nullable=False)
    extracted_text= db.Column(db.Text, nullable=False)
    chat          = db.Column(db.JSON, nullable=True)
    created_at    = db.Column(db.TIMESTAMP, server_default=db.func.now())
    updated_at    = db.Column(db.TIMESTAMP, server_default=db.func.now(), onupdate=db.func.now())

    user = db.relationship("User", backref=db.backref(
        "user_documents",
        lazy="dynamic",
        cascade="all, delete-orphan"
    ))

    def __repr__(self):
        return f"<UserDocument {self.id} - {self.document_name}>"
