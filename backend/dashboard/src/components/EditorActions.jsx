import { openPreview } from '../utils/previewDraft';

export function EditorActions({
  onSaveDraft,
  onPublish,
  onPreview,
  saving = false,
  publishing = false,
  hasChanges = false,
  previewPath = '/',
  draft,
}) {
  const handlePreview = () => {
    if (onPreview) {
      onPreview();
      return;
    }
    if (draft) openPreview(draft, previewPath);
  };

  return (
    <div className="save-bar editor-actions">
      <div className="editor-actions-left">
        {hasChanges ? <span className="editor-draft-badge">Unpublished changes</span> : null}
      </div>
      <div className="editor-actions-right">
        <button type="button" className="btn btn-secondary" onClick={handlePreview}>
          Preview
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onSaveDraft}
          disabled={saving || publishing}
        >
          {saving ? 'Saving draft…' : 'Save draft'}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onPublish}
          disabled={saving || publishing}
        >
          {publishing ? 'Publishing…' : 'Publish live'}
        </button>
      </div>
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

export default EditorActions;
