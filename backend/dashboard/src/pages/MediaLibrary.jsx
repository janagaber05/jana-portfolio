import { useEffect, useState } from 'react';
import { api } from '../api';

export default function MediaLibrary() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    try {
      const list = await api.listUploads();
      setFiles(list);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      await api.upload(file);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Media library</h1>
        <p>Upload images from your device. Copy the URL only if you need it elsewhere.</p>
      </header>

      <div className="media-upload-bar">
        <label className="btn btn-primary">
          {uploading ? 'Uploading…' : 'Upload image'}
          <input type="file" accept="image/*" hidden onChange={onUpload} />
        </label>
      </div>

      {error ? <p className="status error">{error}</p> : null}

      <div className="media-grid">
        {files.map((file) => (
          <div key={file.name} className="media-item">
            <img src={file.url} alt={file.name} />
            <p className="media-name">{file.name}</p>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => copyUrl(file.url)}>
              Copy URL
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
