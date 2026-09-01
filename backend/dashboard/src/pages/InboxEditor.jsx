import { useEffect, useState } from 'react';
import { api } from '../api';

export default function InboxEditor() {
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.getContactSubmissions()
      .then((data) => {
        setSubmissions(data);
        setError('');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id) => {
    await api.markSubmissionRead(id);
    setSubmissions((items) => items.map((item) => (
      item.id === id ? { ...item, read_at: new Date().toISOString() } : item
    )));
  };

  const unreadCount = submissions.filter((item) => !item.read_at).length;

  return (
    <div className="page">
      <header className="page-header">
        <h1>Contact inbox</h1>
        <p>
          Messages from your portfolio contact form.
          {unreadCount > 0 ? ` ${unreadCount} unread.` : ''}
        </p>
      </header>

      {loading ? <p className="muted">Loading messages…</p> : null}
      {error ? (
        <p className="status error">
          {error.includes('contact_submissions')
            ? 'Inbox table not set up yet. Run backend/supabase/09_cms_features.sql in Supabase.'
            : error}
        </p>
      ) : null}

      {!loading && submissions.length === 0 ? (
        <section className="card">
          <p className="muted">No messages yet. Enable the contact form in Contact editor.</p>
        </section>
      ) : null}

      <div className="inbox-list">
        {submissions.map((item) => (
          <article key={item.id} className={`inbox-item${item.read_at ? '' : ' inbox-item--unread'}`}>
            <header className="inbox-item-header">
              <div>
                <strong>{item.name}</strong>
                <p className="muted">{item.email}</p>
              </div>
              <time className="muted">{new Date(item.created_at).toLocaleString()}</time>
            </header>
            <p className="inbox-message">{item.message}</p>
            <div className="inbox-actions">
              <a href={`mailto:${item.email}`} className="btn btn-secondary btn-sm">Reply</a>
              {!item.read_at ? (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => markRead(item.id)}>
                  Mark read
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
