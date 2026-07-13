import { useCms } from '../context/ContentContext';
import { Card, Field, ImageUpload, Input, SaveBar, Textarea } from '../components/Form';
import { ListEditor } from '../components/Form';

export default function HeroEditor() {
  const { content, update, saveAll, saving } = useCms();
  if (!content) return null;

  const hero = content.hero;

  const save = () => saveAll(content);

  const setHero = (key, val) => {
    update((prev) => ({ ...prev, hero: { ...prev.hero, [key]: val } }));
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Hero section</h1>
        <p>Loading screen, navigation, portrait images, scroll strips, and UI chrome.</p>
      </header>

      <Card title="Loading & background text">
        <Field label="Load label"><Input value={hero.loadLabel} onChange={(v) => setHero('loadLabel', v)} /></Field>
        <Field label="Background line 1"><Input value={hero.bgLineOne} onChange={(v) => setHero('bgLineOne', v)} /></Field>
        <Field label="Background line 2"><Input value={hero.bgLineTwo} onChange={(v) => setHero('bgLineTwo', v)} /></Field>
      </Card>

      <Card title="Scroll strips">
        <Field label="Strip line 1"><Input value={hero.stripLineOne} onChange={(v) => setHero('stripLineOne', v)} /></Field>
        <Field label="Strip line 2"><Input value={hero.stripLineTwo} onChange={(v) => setHero('stripLineTwo', v)} /></Field>
        <Field label="Strip repeat count"><Input type="number" value={hero.stripRepeat} onChange={(v) => setHero('stripRepeat', Number(v))} /></Field>
      </Card>

      <Card title="Bottom UI">
        <Field label="Up next label"><Input value={hero.nextLabel} onChange={(v) => setHero('nextLabel', v)} /></Field>
        <Field label="Up next value"><Input value={hero.nextValue} onChange={(v) => setHero('nextValue', v)} /></Field>
        <Field label="Lock button (unlocked)"><Input value={hero.lockBtnUnlocked} onChange={(v) => setHero('lockBtnUnlocked', v)} /></Field>
        <Field label="Lock button (locked)"><Input value={hero.lockBtnLocked} onChange={(v) => setHero('lockBtnLocked', v)} /></Field>
        <Field label="Scroll cue"><Input value={hero.scrollCue} onChange={(v) => setHero('scrollCue', v)} /></Field>
        <Field label="Email"><Input value={hero.email} onChange={(v) => setHero('email', v)} /></Field>
        <Field label="Nav button text"><Input value={hero.navCta || 'get in touch'} onChange={(v) => setHero('navCta', v)} /></Field>
      </Card>

      <Card title="Images">
        <ImageUpload label="Hero portrait" value={hero.heroImage} onChange={(v) => setHero('heroImage', v)} />
        <ImageUpload label="Hero animated portrait" value={hero.heroAnimated} onChange={(v) => setHero('heroAnimated', v)} />
        <ImageUpload label="Logo" value={hero.logo} onChange={(v) => setHero('logo', v)} />
      </Card>

      <Card title="Navigation links">
        <ListEditor
          items={hero.navLinks}
          onChange={(v) => setHero('navLinks', v)}
          newItem={{ href: '#', label: 'Link' }}
          fields={[
            { key: 'label', label: 'Label' },
            { key: 'href', label: 'Href' },
          ]}
        />
      </Card>

      <Card title="Nav socials">
        <ListEditor
          items={hero.navSocials}
          onChange={(v) => setHero('navSocials', v)}
          newItem={{ href: 'https://', label: 'social' }}
          fields={[
            { key: 'label', label: 'Label' },
            { key: 'href', label: 'URL' },
          ]}
        />
      </Card>

      <SaveBar onSave={save} saving={saving} />
    </div>
  );
}
