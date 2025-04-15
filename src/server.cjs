// server.js
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/send-email', async (req, res) => {
  const { name, email, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'Outlook365',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // No uses tu contraseña normal
    },
  });

  const mailOptions = {
    from: email,
    to: 'garzahector1013@gmail.com',
    subject: `Mensaje de ${name}`,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send('Correo enviado');
  } catch (error) {
    console.error('Error al enviar el correo:', error); // Log del error
    res.status(500).send(`Error al enviar el correo: ${error.message}`);
  }
});

app.listen(5000, () => console.log('Servidor en puerto 5000'));
