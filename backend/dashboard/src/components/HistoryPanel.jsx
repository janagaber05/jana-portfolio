import { useEffect, useState } from 'react';
import { api } from '../api';
import { useCms } from '../context/ContentContext';

export default function HistoryPanel() {
  const { restoreRevisionToDraft } = useCms();
  const [revisions, setRevisions] = useState([]);
  const [error, setError] = useState('');
  const [restoringId, setRestoringId] = useState(null);

  useEffect(() => {
    api.getRevisions()
      .then(setRevisions)
      .catch((err) => setError(err.message));
  }, []);

  const restore = async (id) => {
    if (!window.confirm('Load this version into your draft? Publish when ready to go live.')) return;
    setRestoringId(id);
    setError('');
    try {
      await restoreRevisionToDraft(id);
    } catch (err) {
      setError(err.message);
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <section className="card">
      <h3 className="card-title">Version history</h3>
      <p className="muted">Last 10 published versions. Restore loads into draft — not live until you publish.</p>
      {error ? <p className="status error">{error}</p> : null}
      {revisions.length === 0 ? (
        <p className="muted">No versions yet. Publish to create your first snapshot.</p>
      ) : (
        <ul className="history-list">
          {revisions.map((revision) => (
            <li key={revision.id} className="history-item">
              <div>
                <strong>{revision.label || `Version #${revision.id}`}</strong>
                <p className="muted">{new Date(revision.created_at).toLocaleString()}</p>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={restoringId === revision.id}
                onClick={() => restore(revision.id)}
              >
                {restoringId === revision.id ? 'Loading…' : 'Restore to draft'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
