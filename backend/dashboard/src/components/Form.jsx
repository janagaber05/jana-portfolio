import { useState } from 'react';
import { api, mediaUrl } from '../api';

export function Field({ label, hint, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}

export function Input({ value, onChange, ...props }) {
  return (
    <input
      className="input"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  );
}

export function Textarea({ value, onChange, rows = 4, ...props }) {
  return (
    <textarea
      className="textarea"
      rows={rows}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  );
}

export function ColorInput({ value, onChange }) {
  return (
    <div className="color-row">
      <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)} />
      <Input value={value} onChange={onChange} />
    </div>
  );
}

export function SaveBar({ onSave, saving, label = 'Save changes' }) {
  return (
    <div className="save-bar">
      <button type="button" className="btn btn-primary" onClick={onSave} disabled={saving}>
        {saving ? 'Saving…' : label}
      </button>
    </div>
  );
}

export function Card({ title, children }) {
  return (
    <section className="card">
      {title ? <h3 className="card-title">{title}</h3> : null}
      {children}
    </section>
  );
}

export function ImageUpload({ value, onChange, label = 'Image', hint }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const result = await api.upload(file);
      onChange(result.url);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <Field
      label={label}
      hint={hint || 'Tap to choose an image from your device.'}
    >
      <div className="image-picker">
        {value ? (
          <div className="image-picker-preview">
            <img src={mediaUrl(value)} alt="" className="image-picker-img" />
            <div className="image-picker-actions">
              <label className={`btn btn-secondary btn-sm ${uploading ? 'upload-btn-loading' : ''}`}>
                {uploading ? 'Uploading…' : 'Change image'}
                <input type="file" accept="image/*" hidden onChange={handleFile} disabled={uploading} />
              </label>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange('')}>
                Remove
              </button>
            </div>
          </div>
        ) : (
          <label className={`image-picker-dropzone ${uploading ? 'upload-btn-loading' : ''}`}>
            <span className="image-picker-icon" aria-hidden="true">+</span>
            <span className="image-picker-text">
              {uploading ? 'Uploading…' : 'Choose image from device'}
            </span>
            <input type="file" accept="image/*" hidden onChange={handleFile} disabled={uploading} />
          </label>
        )}
      </div>
      {error ? <p className="field-error">{error}</p> : null}
    </Field>
  );
}

export function ListEditor({ items, onChange, fields, newItem, maxItems }) {
  const updateItem = (index, key, val) => {
    const next = items.map((item, i) => (i === index ? { ...item, [key]: val } : item));
    onChange(next);
  };

  const removeItem = (index) => onChange(items.filter((_, i) => i !== index));
  const addItem = () => {
    if (maxItems && items.length >= maxItems) return;
    onChange([...items, { ...newItem }]);
  };

  const atMax = maxItems && items.length >= maxItems;

  return (
    <div className="list-editor">
      {items.map((item, index) => (
        <div key={index} className="list-item">
          <div className="list-item-fields">
            {fields.map((field) => {
              if (field.type === 'image') {
                return (
                  <ImageUpload
                    key={field.key}
                    label={field.label}
                    value={item[field.key]}
                    onChange={(v) => updateItem(index, field.key, v)}
                    hint={field.hint}
                  />
                );
              }

              return (
                <Field key={field.key} label={field.label}>
                  {field.type === 'textarea' ? (
                    <Textarea
                      value={item[field.key]}
                      onChange={(v) => updateItem(index, field.key, v)}
                      rows={field.rows || 3}
                    />
                  ) : (
                    <Input
                      value={item[field.key]}
                      onChange={(v) => updateItem(index, field.key, v)}
                    />
                  )}
                </Field>
              );
            })}
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeItem(index)}>
            Remove
          </button>
        </div>
      ))}
      {atMax ? (
        <p className="muted list-max-hint">Maximum {maxItems} items.</p>
      ) : (
        <button type="button" className="btn btn-secondary" onClick={addItem}>Add item</button>
      )}
    </div>
  );
}
