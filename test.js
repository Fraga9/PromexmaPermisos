import nodemailer from 'nodemailer';
import dotenv from 'dotenv'; // Import dotenv to handle environment variables

// Initialize dotenv to load environment variables
dotenv.config();

// Configuración del transporte con SMTP de Outlook 365
const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false, // TLS (STARTTLS)
  auth: {
    user: process.env.EMAIL_USER, // Tu correo de Outlook 365
    pass: process.env.EMAIL_PASS // ⚠️ Requiere que la autenticación básica esté habilitada
  }
});

// Opciones del correo
const mailOptions = {
  from: 'hectore.garzaf@ext.cemex.com',
  to: 'garzahector1013@gmail.com',
  subject: 'Correo desde Outlook 365',
  text: 'Este es un correo enviado automáticamente desde Node.js usando Outlook 365.'
};

// Enviar el correo
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.log('Error al enviar:', error);
  }
  console.log('Correo enviado:', info.response);
});
