import os, smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

def send_email(to_email: str, subject: str, body: str) -> None:
    from_email = os.getenv("EMAIL_USER")
    password   = os.getenv("EMAIL_PASS")

    msg = MIMEMultipart()
    msg["From"], msg["To"], msg["Subject"] = from_email, to_email, subject
    msg.attach(MIMEText(body, "plain"))

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(from_email, password)
        server.send_message(msg)
        server.quit()
        print("Email sent.")
    except Exception as exc:
        print("Failed to send email:", exc)
