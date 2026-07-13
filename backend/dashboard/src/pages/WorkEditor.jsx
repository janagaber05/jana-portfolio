import { useNavigate } from 'react-router-dom';
import { useCms } from '../context/ContentContext';
import { Card, Field, Input, SaveBar, Textarea } from '../components/Form';
import { createProject } from '../utils/projectHelpers';
import { getMoreWorkPreviewUrl } from '../utils/preview';

function ProjectCard({ project, onHome, onOpen }) {
  return (
    <button
      type="button"
      className="project-card"
      style={{ '--project-accent': project.accent || '#6D0101' }}
      onClick={onOpen}
    >
      <div className="project-card-thumb" aria-hidden="true">
        <span className="project-card-index">{project.index}</span>
      </div>
      <div className="project-card-body">
        <h3 className="project-card-title">{project.title}</h3>
        <p className="project-card-meta">{project.tag} · {project.year}</p>
        {onHome ? <span className="project-card-badge">On homepage</span> : null}
      </div>
      <span className="project-card-edit">Edit →</span>
    </button>
  );
}

export default function WorkEditor() {
  const navigate = useNavigate();
  const { content, update, saveAll, saving } = useCms();
  if (!content) return null;

  const fw = content.featuredWork;
  const homeLimit = fw.homeLimit ?? 6;
  const homeSlugs = fw.homeProjectSlugs || [];
  const homeCount = homeSlugs.length;

  const save = () => saveAll(content);

  const setFw = (key, val) => {
    update((prev) => ({ ...prev, featuredWork: { ...prev.featuredWork, [key]: val } }));
  };

  const addProject = () => {
    const project = createProject(fw.projects);
    update((prev) => ({
      ...prev,
      featuredWork: {
        ...prev.featuredWork,
        projects: [...prev.featuredWork.projects, project],
      },
    }));
    navigate(`/work/project/${project.slug}`);
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Projects</h1>
        <p>Click a project card to edit it. {homeCount} of {homeLimit} are on the homepage scroll.</p>
      </header>

      <Card title="Homepage scroll">
        <Field label="Eyebrow"><Input value={fw.eyebrow} onChange={(v) => setFw('eyebrow', v)} /></Field>
        <Field label="Count label" hint={`${homeCount} of ${homeLimit} selected for home.`}>
          <Input value={fw.countLabel} onChange={(v) => setFw('countLabel', v)} />
        </Field>
        <Field label="Homepage project limit" hint="Max projects on the home scroll. Pick them inside each project.">
          <Input
            type="number"
            min="1"
            max="12"
            value={homeLimit}
            onChange={(v) => {
              const next = Number(v);
              setFw('homeLimit', next);
              if (homeSlugs.length > next) {
                setFw('homeProjectSlugs', homeSlugs.slice(0, next));
              }
            }}
          />
        </Field>
        <Field label="Card CTA text"><Input value={fw.cardCta} onChange={(v) => setFw('cardCta', v)} /></Field>
        <Field label="More work label"><Input value={fw.moreWorkLabel || 'More work'} onChange={(v) => setFw('moreWorkLabel', v)} /></Field>
        <Field label="More work arrow"><Input value={fw.moreWorkArrow || '→'} onChange={(v) => setFw('moreWorkArrow', v)} /></Field>
      </Card>

      <Card title="More work page (/work)">
        <Field label="Page title"><Input value={fw.moreWorkPageTitle || 'More work'} onChange={(v) => setFw('moreWorkPageTitle', v)} /></Field>
        <Field label="Page intro"><Textarea value={fw.moreWorkPageIntro || ''} onChange={(v) => setFw('moreWorkPageIntro', v)} rows={3} /></Field>
        <p className="muted">
          All projects appear on this page.
          {' '}
          <a href={getMoreWorkPreviewUrl()} target="_blank" rel="noreferrer">Preview /work</a>
        </p>
      </Card>

      <div className="project-grid-header">
        <h2 className="section-title">All projects</h2>
        <button type="button" className="btn btn-secondary" onClick={addProject}>
          Add project
        </button>
      </div>

      <div className="project-grid">
        {fw.projects.map((project) => (
          <ProjectCard
            key={project.id || project.slug}
            project={project}
            onHome={homeSlugs.includes(project.slug)}
            onOpen={() => navigate(`/work/project/${project.slug}`)}
          />
        ))}
      </div>

      {fw.projects.length === 0 ? (
        <p className="muted">No projects yet. Click Add project to create one.</p>
      ) : null}

      <SaveBar onSave={save} saving={saving} />
    </div>
  );
}
