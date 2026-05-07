from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.core.config import settings

# Konfigurasi koneksi email menggunakan library fastapi-mail
conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def kirim_email_reset_password(email_tujuan: str, reset_token: str):
    # Membuat link yang akan mengarahkan user ke frontend
    reset_link = f"{settings.FRONTEND_URL}?token={reset_token}"
    
    html_content = f"""
    <html>
    <body>
        <h2>Reset Password Sistem Magang IPB</h2>
        <p>Anda telah meminta untuk melakukan reset password.</p>
        <p>Silakan klik link di bawah ini untuk membuat password baru:</p>
        <a href="{reset_link}" style="display:inline-block; padding:10px 20px; background-color:#4CAF50; color:white; text-decoration:none; border-radius:5px;">Reset Password</a>
        <p><i>Link ini hanya berlaku selama 15 menit. Jika Anda tidak merasa melakukan permintaan ini, abaikan saja email ini.</i></p>
    </body>
    </html>
    """

    message = MessageSchema(
        subject="Reset Password",
        recipients=[email_tujuan],  # Harus berupa list
        body=html_content,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    await fm.send_message(message)