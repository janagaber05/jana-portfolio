import { useState } from 'react';
import { hasSupabaseConfig, supabase } from '../lib/supabase';
import styles from './ContactSection.module.css';

export default function ContactForm({ contact }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!contact?.formEnabled) return null;

  const submit = async (event) => {
    event.preventDefault();
    if (!hasSupabaseConfig || !supabase) {
      setStatus('Contact form is not configured yet.');
      return;
    }

    setSubmitting(true);
    setStatus('');

    const { error } = await supabase.from('contact_submissions').insert({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    });

    setSubmitting(false);

    if (error) {
      setStatus('Could not send message. Please email directly.');
      return;
    }

    setName('');
    setEmail('');
    setMessage('');
    setStatus(contact.formSuccess || 'Thanks — your message was sent.');
  };

  return (
    <form className={styles.contactForm} onSubmit={submit}>
      <div className={styles.formGrid}>
        <label className={styles.formField}>
          <span>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className={styles.formField}>
          <span>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
      </div>
      <label className={styles.formField}>
        <span>Message</span>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} required />
      </label>
      <button type="submit" className={styles.formSubmit} disabled={submitting}>
        {submitting ? 'Sending…' : (contact.formSubmitLabel || 'Send message')}
      </button>
      {status ? <p className={styles.formStatus}>{status}</p> : null}
    </form>
  );
}
