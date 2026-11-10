import { useState } from 'react';
import { hasSupabaseConfig, supabase } from '../lib/supabase';
import styles from './ContactSection.module.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeField(value, max) {
  return String(value || '').trim().slice(0, max);
}

export default function ContactForm({ contact }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [company, setCompany] = useState(''); // honeypot
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!contact?.formEnabled) return null;

  const submit = async (event) => {
    event.preventDefault();
    if (!hasSupabaseConfig || !supabase) {
      setStatus('Contact form is not configured yet.');
      return;
    }

    // Bots fill hidden fields — silently succeed without writing.
    if (company.trim()) {
      setStatus(contact.formSuccess || 'Thanks — your message was sent.');
      setName('');
      setEmail('');
      setMessage('');
      setCompany('');
      return;
    }

    const cleanName = sanitizeField(name, 100);
    const cleanEmail = sanitizeField(email, 200).toLowerCase();
    const cleanMessage = sanitizeField(message, 5000);

    if (!cleanName || !cleanEmail || !cleanMessage || !EMAIL_RE.test(cleanEmail)) {
      setStatus('Please check your name, email, and message.');
      return;
    }

    setSubmitting(true);
    setStatus('');

    const { error } = await supabase.from('contact_submissions').insert({
      name: cleanName,
      email: cleanEmail,
      message: cleanMessage,
    });

    setSubmitting(false);

    if (error) {
      setStatus('Could not send message. Please email directly.');
      return;
    }

    setName('');
    setEmail('');
    setMessage('');
    setCompany('');
    setStatus(contact.formSuccess || 'Thanks — your message was sent.');
  };

  return (
    <form className={styles.contactForm} onSubmit={submit} noValidate>
      <div className={styles.formGrid}>
        <label className={styles.formField}>
          <span>Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            autoComplete="name"
            required
          />
        </label>
        <label className={styles.formField}>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={200}
            autoComplete="email"
            required
          />
        </label>
      </div>
      {/* Honeypot — hidden from users */}
      <label
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', height: 0, overflow: 'hidden' }}
      >
        <span>Company</span>
        <input
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </label>
      <label className={styles.formField}>
        <span>Message</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          maxLength={5000}
          required
        />
      </label>
      <button type="submit" className={styles.formSubmit} disabled={submitting}>
        {submitting ? 'Sending…' : (contact.formSubmitLabel || 'Send message')}
      </button>
      {status ? <p className={styles.formStatus}>{status}</p> : null}
    </form>
  );
}
