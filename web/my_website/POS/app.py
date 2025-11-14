from flask import Flask, render_template, request
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)

# === CONFIGURATION ===
GMAIL_USER = "jamesodago6@gmail.com"
GMAIL_PASSWORD = "wiyr qibb wrmj chjw"  # your 16-char Gmail App Password
RECEIVER_EMAIL = "jamesodago6@gmail.com"  # where the message will be sent

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/submit', methods=['POST'])
def submit():
    print("Form submitted!")  # test
    name = request.form.get('name')
    email = request.form.get('email')
    subject_input = request.form.get('subject')
    message = request.form.get('message')
    # === Create the email ===
    subject = f"New message from {name}: {subject_input}"
    body = f"Name: {name}\nEmail: {email}\n\nMessage:\n{message}"

    msg = MIMEMultipart()
    msg['From'] = GMAIL_USER
    msg['To'] = RECEIVER_EMAIL
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        # === Send email via Gmail SMTP ===
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(GMAIL_USER, GMAIL_PASSWORD)
            server.send_message(msg)

        return "✅ Message sent successfully! I'll get back to you soon."

    except Exception as e:
        print("Error:", e)
        return "❌ Sorry, there was an error sending your message."

if __name__ == '__main__':
    app.run(debug=True)