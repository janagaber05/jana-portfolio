import { useContentDraft } from '../hooks/useContentDraft';
import { Card, Field, ImageUpload, Input, ListEditor, SaveBar, Textarea } from '../components/Form';

export default function AboutEditor() {
  const { draft, updateDraft, save, saving, ready } = useContentDraft();
  if (!ready) return null;

  const about = draft.about;
  const set = (key, val) => updateDraft((prev) => ({ ...prev, about: { ...prev.about, [key]: val } }));

  return (
    <div className="page">
      <header className="page-header">
        <h1>About section</h1>
        <p>Headline, bio copy, stats, CTAs, and photo.</p>
      </header>

      <Card title="Headline">
        <Field label="Label"><Input value={about.label} onChange={(v) => set('label', v)} /></Field>
        <Field label="Headline"><Input value={about.headline} onChange={(v) => set('headline', v)} /></Field>
        <Field label="Highlighted phrase"><Input value={about.headlineHighlight} onChange={(v) => set('headlineHighlight', v)} /></Field>
      </Card>

      <Card title="Body copy">
        <Field label="Paragraph 1"><Textarea value={about.paragraph1} onChange={(v) => set('paragraph1', v)} rows={5} /></Field>
        <Field label="Paragraph 2"><Textarea value={about.paragraph2} onChange={(v) => set('paragraph2', v)} rows={5} /></Field>
      </Card>

      <Card title="Stats">
        <ListEditor
          items={about.stats}
          onChange={(v) => set('stats', v)}
          newItem={{ value: '0', label: 'Label' }}
          fields={[
            { key: 'value', label: 'Value' },
            { key: 'label', label: 'Label' },
          ]}
        />
      </Card>

      <Card title="CTAs & badges">
        <Field label="Primary CTA text"><Input value={about.ctaPrimary} onChange={(v) => set('ctaPrimary', v)} /></Field>
        <Field label="Primary CTA link"><Input value={about.ctaPrimaryHref} onChange={(v) => set('ctaPrimaryHref', v)} /></Field>
        <Field label="Secondary CTA text"><Input value={about.ctaSecondary} onChange={(v) => set('ctaSecondary', v)} /></Field>
        <Field label="Secondary CTA link"><Input value={about.ctaSecondaryHref} onChange={(v) => set('ctaSecondaryHref', v)} /></Field>
        <Field label="Watermark"><Input value={about.watermark} onChange={(v) => set('watermark', v)} /></Field>
        <Field label="Badge"><Input value={about.badge} onChange={(v) => set('badge', v)} /></Field>
        <Field label="Float card label"><Input value={about.floatLabel} onChange={(v) => set('floatLabel', v)} /></Field>
        <Field label="Float card value"><Input value={about.floatValue} onChange={(v) => set('floatValue', v)} /></Field>
        <ImageUpload label="About photo" value={about.photo} onChange={(v) => set('photo', v)} />
      </Card>

      <SaveBar onSave={save} saving={saving} />
    </div>
  );
}
