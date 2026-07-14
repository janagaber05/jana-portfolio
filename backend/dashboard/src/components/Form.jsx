import { useState } from 'react';
import { api, mediaUrl } from '../api';
import ImageCropModal from './ImageCropModal';

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

export function ImageUpload({
  value,
  onChange,
  label = 'Image',
  hint,
  aspect = 21 / 9,
  outputWidth = 2400,
  enableCrop = true,
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [cropSrc, setCropSrc] = useState('');
  const [pendingName, setPendingName] = useState('image.jpg');

  const uploadBlobFile = async (file) => {
    setUploading(true);
    setError('');
    try {
      const result = await api.upload(file);
      onChange(result.url);
    } catch (err) {
      setError(err.message || 'Upload failed');
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError('');

    if (!enableCrop) {
      try {
        await uploadBlobFile(file);
      } catch {
        // shown in error state
      }
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPendingName(file.name || 'image.jpg');
    setCropSrc(objectUrl);
  };

  const closeCrop = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc('');
  };

  const confirmCrop = async (file) => {
    await uploadBlobFile(file);
    closeCrop();
  };

  return (
    <div className="image-upload-block">
      <Field
        label={label}
        hint={hint || 'Choose an image, crop it to fit the site, then upload.'}
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

      {cropSrc ? (
        <ImageCropModal
          imageSrc={cropSrc}
          fileName={pendingName}
          initialAspect={aspect}
          outputWidth={outputWidth}
          onCancel={closeCrop}
          onConfirm={confirmCrop}
        />
      ) : null}
    </div>
  );
}

export function VideoUpload({
  value,
  onChange,
  label = 'Walkthrough video',
  hint,
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 80 * 1024 * 1024) {
      setError('Video is too large. Keep uploads under ~80MB, or paste a YouTube/Vimeo link instead.');
      event.target.value = '';
      return;
    }

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

  const previewUrl = mediaUrl(value);
  const isFileVideo = /\.(mp4|webm|mov|m4v)(\?|$)/i.test(previewUrl);

  return (
    <Field
      label={label}
      hint={hint || 'Upload an MP4/WebM from your device, or paste a YouTube / Vimeo / direct video URL below.'}
    >
      <div className="image-picker">
        {value ? (
          <div className="image-picker-preview">
            {isFileVideo ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video
                className="image-picker-img"
                src={previewUrl}
                controls
                playsInline
                preload="metadata"
              />
            ) : (
              <p className="muted" style={{ padding: '0.75rem 0' }}>
                Linked video ready — save to show it on the project page.
              </p>
            )}
            <div className="image-picker-actions">
              <label className={`btn btn-secondary btn-sm ${uploading ? 'upload-btn-loading' : ''}`}>
                {uploading ? 'Uploading…' : 'Change video file'}
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/*"
                  hidden
                  onChange={handleFile}
                  disabled={uploading}
                />
              </label>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange('')}>
                Remove
              </button>
            </div>
          </div>
        ) : (
          <label className={`image-picker-dropzone ${uploading ? 'upload-btn-loading' : ''}`}>
            <span className="image-picker-icon" aria-hidden="true">▶</span>
            <span className="image-picker-text">
              {uploading ? 'Uploading…' : 'Choose video from device'}
            </span>
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/*"
              hidden
              onChange={handleFile}
              disabled={uploading}
            />
          </label>
        )}
      </div>
      <Input
        value={value}
        onChange={onChange}
        placeholder="Or paste YouTube / Vimeo / video URL"
      />
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
                    aspect={field.aspect ?? 3 / 4}
                    outputWidth={field.outputWidth ?? 1400}
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
