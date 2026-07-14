import { useCallback, useState } from 'react';
import Cropper from 'react-easy-crop';

const ASPECT_PRESETS = [
  { id: 'hero', label: 'Hero 21:9', value: 21 / 9 },
  { id: 'wide', label: 'Wide 16:9', value: 16 / 9 },
  { id: 'screen', label: 'Screen 3:4', value: 3 / 4 },
  { id: 'square', label: 'Square 1:1', value: 1 },
  { id: 'free', label: 'Free', value: null },
];

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}

async function getCroppedBlob(imageSrc, pixelCrop, outputWidth) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not crop image');

  const targetWidth = outputWidth
    ? Math.min(outputWidth, Math.round(pixelCrop.width))
    : Math.round(pixelCrop.width);
  const targetHeight = Math.round((pixelCrop.height / pixelCrop.width) * targetWidth);

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetWidth,
    targetHeight,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Could not export cropped image'));
          return;
        }
        resolve(blob);
      },
      'image/jpeg',
      0.92,
    );
  });
}

export default function ImageCropModal({
  imageSrc,
  fileName = 'image.jpg',
  initialAspect = 21 / 9,
  outputWidth = 2400,
  onCancel,
  onConfirm,
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspectId, setAspectId] = useState(() => {
    const match = ASPECT_PRESETS.find((preset) => (
      preset.value && Math.abs(preset.value - initialAspect) < 0.01
    ));
    return match?.id || 'hero';
  });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const aspect = ASPECT_PRESETS.find((preset) => preset.id === aspectId)?.value ?? null;

  const onCropComplete = useCallback((_area, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const confirm = async () => {
    if (!croppedAreaPixels) return;
    setBusy(true);
    setError('');
    try {
      const blob = await getCroppedBlob(imageSrc, croppedAreaPixels, outputWidth);
      const base = fileName.replace(/\.[^.]+$/, '') || 'image';
      const file = new File([blob], `${base}-cropped.jpg`, { type: 'image/jpeg' });
      await onConfirm(file);
    } catch (err) {
      setError(err.message || 'Could not crop image');
      setBusy(false);
    }
  };

  return (
    <div className="crop-modal" role="dialog" aria-modal="true" aria-label="Edit image before upload">
      <div className="crop-modal-card">
        <header className="crop-modal-header">
          <div>
            <strong>Edit image</strong>
            <p className="muted">Crop and zoom to match how it will look on the site, then upload.</p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
        </header>

        <div className="crop-aspect-row">
          {ASPECT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={`btn btn-sm ${aspectId === preset.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setAspectId(preset.id)}
              disabled={busy}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="crop-stage">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect || undefined}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            showGrid
          />
        </div>

        <label className="crop-zoom">
          <span>Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            disabled={busy}
          />
        </label>

        {error ? <p className="field-error">{error}</p> : null}

        <div className="crop-modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={confirm} disabled={busy || !croppedAreaPixels}>
            {busy ? 'Uploading…' : 'Crop & upload'}
          </button>
        </div>
      </div>
    </div>
  );
}
