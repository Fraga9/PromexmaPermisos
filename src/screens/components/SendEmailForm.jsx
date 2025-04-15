import React, { useState } from 'react';
import styles from './SendEmailForm.module.css';

function SendEmailForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState({ success: false, message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ success: false, message: '' });

    try {
      const response = await fetch('http://localhost:5000/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus({ success: true, message: 'Correo enviado exitosamente.' });
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus({ success: false, message: 'Error al enviar el correo.' });
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus({ success: false, message: 'Error al enviar el correo.' });
    }
  };

  return (
    <div className={styles.sendEmailForm}>
      <h2>Enviar Correo</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Nombre</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="message">Mensaje</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="5"
            required
          ></textarea>
        </div>

        <button type="submit" className={styles.submitButton}>
          Enviar
        </button>
      </form>

      {status.message && (
        <p className={status.success ? styles.successMessage : styles.errorMessage}>
          {status.message}
        </p>
      )}
    </div>
  );
}

export default SendEmailForm;