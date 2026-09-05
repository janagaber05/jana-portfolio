import { useContentDraft } from '../hooks/useContentDraft';
import {
  Card,
  ColorInput,
  Field,
  ImageUpload,
  Input,
  ListEditor,
  PdfUpload,
  Textarea,
} from '../components/Form';
import EditorActions from '../components/EditorActions';

const AVAILABILITY_OPTIONS = [
  { value: 'open', label: 'Open for work' },
  { value: 'booked', label: 'Fully booked' },
  { value: 'away', label: 'Away / limited' },
];

export default function SettingsEditor() {
  const {
    draft,
    updateDraft,
    save,
    publish,
    preview,
    saving,
    publishing,
    hasUnpublishedChanges,
    ready,
  } = useContentDraft();

  if (!ready) return null;

  const meta = draft.meta || {};
  const seo = meta.seo || {};
  const pageSeo = meta.pageSeo || { home: {}, work: {} };
  const settings = draft.settings || {};
  const availability = settings.availability || {};

  const setMeta = (key, val) => {
    updateDraft((prev) => ({ ...prev, meta: { ...prev.meta, [key]: val } }));
  };

  const setSeo = (key, val) => {
    updateDraft((prev) => ({
      ...prev,
      meta: { ...prev.meta, seo: { ...prev.meta?.seo, [key]: val } },
    }));
  };

  const setPageSeo = (page, key, val) => {
    updateDraft((prev) => ({
      ...prev,
      meta: {
        ...prev.meta,
        pageSeo: {
          ...prev.meta?.pageSeo,
          [page]: { ...prev.meta?.pageSeo?.[page], [key]: val },
        },
      },
    }));
  };

  const setSettings = (key, val) => {
    updateDraft((prev) => ({ ...prev, settings: { ...prev.settings, [key]: val } }));
  };

  const setAvailability = (key, val) => {
    updateDraft((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        availability: { ...prev.settings?.availability, [key]: val },
      },
      contact: {
        ...prev.contact,
        availableBadge: key === 'label' && val
          ? val
          : prev.contact?.availableBadge,
      },
    }));
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Site settings</h1>
        <p>Global branding, SEO, availability, and social links.</p>
      </header>

      <Card title="Branding">
        <Field label="Site title"><Input value={meta.siteTitle || ''} onChange={(v) => setMeta('siteTitle', v)} /></Field>
        <Field label="Copyright year"><Input value={meta.copyrightYear || ''} onChange={(v) => setMeta('copyrightYear', v)} /></Field>
        <ImageUpload label="Favicon / logo" value={settings.favicon || ''} onChange={(v) => setSettings('favicon', v)} enableCrop={false} />
        <div className="form-grid">
          <Field label="Cream"><ColorInput value={settings.colors?.cream} onChange={(v) => setSettings('colors', { ...settings.colors, cream: v })} /></Field>
          <Field label="Dark"><ColorInput value={settings.colors?.dark} onChange={(v) => setSettings('colors', { ...settings.colors, dark: v })} /></Field>
          <Field label="Burgundy"><ColorInput value={settings.colors?.burgundy} onChange={(v) => setSettings('colors', { ...settings.colors, burgundy: v })} /></Field>
          <Field label="Pink"><ColorInput value={settings.colors?.pink} onChange={(v) => setSettings('colors', { ...settings.colors, pink: v })} /></Field>
        </div>
      </Card>

      <Card title="Availability">
        <Field label="Status">
          <select
            className="input"
            value={availability.status || 'open'}
            onChange={(e) => {
              const status = e.target.value;
              const label = AVAILABILITY_OPTIONS.find((opt) => opt.value === status)?.label || '';
              setAvailability('status', status);
              setAvailability('label', label);
            }}
          >
            {AVAILABILITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Badge text (shown on site)">
          <Input value={availability.label || draft.contact?.availableBadge || ''} onChange={(v) => setAvailability('label', v)} />
        </Field>
      </Card>

      <Card title="Resume / CV">
        <p className="muted">Upload a PDF and turn on the download button. It appears in the contact section (and can power the About “Download CV” button).</p>
        <Field label="Show download button">
          <label className="home-pick">
            <input
              type="checkbox"
              checked={Boolean(draft.contact?.showResume)}
              onChange={(e) => updateDraft((prev) => ({
                ...prev,
                contact: { ...prev.contact, showResume: e.target.checked },
              }))}
            />
            <span>Display resume link on the site</span>
          </label>
        </Field>
        <Field label="Button label">
          <Input
            value={draft.contact?.resumeLabel || 'Download CV'}
            onChange={(v) => updateDraft((prev) => ({
              ...prev,
              contact: { ...prev.contact, resumeLabel: v },
            }))}
          />
        </Field>
        <PdfUpload
          value={draft.contact?.resumeUrl || ''}
          onChange={(v) => updateDraft((prev) => ({
            ...prev,
            contact: { ...prev.contact, resumeUrl: v, showResume: v ? true : prev.contact?.showResume },
          }))}
        />
      </Card>

      <Card title="Global SEO">
        <Field label="Default meta description"><Textarea value={seo.description || ''} onChange={(v) => setSeo('description', v)} rows={3} /></Field>
        <ImageUpload label="Default share image (OG)" value={seo.ogImage || ''} onChange={(v) => setSeo('ogImage', v)} aspect={1.91} outputWidth={1200} />
      </Card>

      <Card title="Home page SEO">
        <Field label="Title override"><Input value={pageSeo.home?.title || ''} onChange={(v) => setPageSeo('home', 'title', v)} placeholder={meta.siteTitle} /></Field>
        <Field label="Description"><Textarea value={pageSeo.home?.description || ''} onChange={(v) => setPageSeo('home', 'description', v)} rows={2} /></Field>
      </Card>

      <Card title="Work page SEO">
        <Field label="Title override"><Input value={pageSeo.work?.title || ''} onChange={(v) => setPageSeo('work', 'title', v)} /></Field>
        <Field label="Description"><Textarea value={pageSeo.work?.description || ''} onChange={(v) => setPageSeo('work', 'description', v)} rows={2} /></Field>
      </Card>

      <Card title="Social profiles">
        <ListEditor
          items={settings.socials || draft.hero?.navSocials || []}
          onChange={(v) => setSettings('socials', v)}
          newItem={{ label: 'instagram', href: 'https://instagram.com' }}
          fields={[
            { key: 'label', label: 'Label' },
            { key: 'href', label: 'URL' },
          ]}
        />
      </Card>

      <EditorActions
        draft={draft}
        onSaveDraft={save}
        onPublish={publish}
        onPreview={preview}
        saving={saving}
        publishing={publishing}
        hasChanges={hasUnpublishedChanges}
      />
    </div>
  );
}
