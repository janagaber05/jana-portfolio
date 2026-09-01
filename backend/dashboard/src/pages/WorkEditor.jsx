import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EditorActions from '../components/EditorActions';
import { mediaUrl } from '../api';
import { Card, Field, Input, Textarea } from '../components/Form';
import { useContentDraft } from '../hooks/useContentDraft';
import { duplicateProject } from '../utils/cmsTools';
import { createProject } from '../utils/projectHelpers';
import { removeProjectFromDraft } from '../utils/removeProject';
import { getMoreWorkUrl } from '../utils/preview';

function ProjectCard({ project, onHome, onOpen, onDragStart, onDragOver, onDrop, dragging }) {
  const isHidden = project.published === false;
  const isScheduled = project.publishAt && new Date(project.publishAt).getTime() > Date.now();

  return (
    <button
      type="button"
      className={`project-card${dragging ? ' project-card--dragging' : ''}`}
      style={{ '--project-accent': project.accent || '#6D0101' }}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onOpen}
    >
      <div className="project-card-thumb" aria-hidden="true">
        {project.thumbnail ? (
          <img src={mediaUrl(project.thumbnail)} alt="" className="project-card-thumb-img" />
        ) : (
          <span className="project-card-index">{project.index}</span>
        )}
      </div>
      <div className="project-card-body">
        <h3 className="project-card-title">{project.title}</h3>
        <p className="project-card-meta">{project.tag} · {project.year}</p>
        {onHome ? <span className="project-card-badge">On homepage</span> : null}
        {isHidden ? <span className="project-card-badge project-card-badge--muted">Hidden</span> : null}
        {isScheduled ? <span className="project-card-badge project-card-badge--muted">Scheduled</span> : null}
      </div>
      <span className="project-card-edit">Edit →</span>
    </button>
  );
}

export default function WorkEditor() {
  const navigate = useNavigate();
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
  const [dragIndex, setDragIndex] = useState(null);

  if (!ready) return null;

  const fw = draft.featuredWork;
  const homeLimit = fw.homeLimit ?? 6;
  const homeSlugs = fw.homeProjectSlugs || [];
  const homeCount = homeSlugs.length;

  const setFw = (key, val) => {
    updateDraft((prev) => ({ ...prev, featuredWork: { ...prev.featuredWork, [key]: val } }));
  };

  const reorderProjects = (fromIndex, toIndex) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    updateDraft((prev) => {
      const projects = [...prev.featuredWork.projects];
      const [moved] = projects.splice(fromIndex, 1);
      projects.splice(toIndex, 0, moved);
      return {
        ...prev,
        featuredWork: {
          ...prev.featuredWork,
          projects: projects.map((project, index) => ({
            ...project,
            index: String(index + 1).padStart(2, '0'),
          })),
        },
      };
    });
  };

  const addProject = () => {
    const project = createProject(fw.projects);
    updateDraft((prev) => ({
      ...prev,
      featuredWork: {
        ...prev.featuredWork,
        projects: [...prev.featuredWork.projects, project],
      },
    }));
    navigate(`/work/project/${project.slug}`);
  };

  const duplicate = (project) => {
    const copy = duplicateProject(project, fw.projects);
    updateDraft((prev) => ({
      ...prev,
      featuredWork: {
        ...prev.featuredWork,
        projects: [...prev.featuredWork.projects, copy],
      },
    }));
    navigate(`/work/project/${copy.slug}`);
  };

  const deleteProject = (project) => {
    if (!window.confirm(`Delete "${project.title}"? This removes the project and its case study from your site.`)) {
      return;
    }

    updateDraft((prev) => removeProjectFromDraft(prev, project.slug));
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Projects</h1>
        <p>Drag cards to reorder. Click to edit. {homeCount} of {homeLimit} are on the homepage scroll.</p>
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
          All published projects appear on this page.
          {' '}
          <a href={getMoreWorkUrl()} target="_blank" rel="noreferrer">Open /work</a>
        </p>
      </Card>

      <div className="project-grid-header">
        <h2 className="section-title">All projects</h2>
        <button type="button" className="btn btn-secondary" onClick={addProject}>
          Add project
        </button>
      </div>

      <div className="project-grid">
        {fw.projects.map((project, index) => (
          <div key={project.id || project.slug} className="project-card-wrap">
            <ProjectCard
              project={project}
              dragging={dragIndex === index}
              onHome={homeSlugs.includes(project.slug)}
              onOpen={() => navigate(`/work/project/${project.slug}`)}
              onDragStart={(event) => {
                setDragIndex(index);
                event.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
              }}
              onDrop={(event) => {
                event.preventDefault();
                reorderProjects(dragIndex, index);
                setDragIndex(null);
              }}
            />
            <div className="project-card-actions">
              <button
                type="button"
                className="btn btn-ghost btn-sm project-duplicate-btn"
                onClick={() => duplicate(project)}
              >
                Duplicate
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm project-delete-btn"
                onClick={() => deleteProject(project)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {fw.projects.length === 0 ? (
        <p className="muted">No projects yet. Click Add project to create one.</p>
      ) : null}

      <EditorActions
        draft={draft}
        onSaveDraft={save}
        onPublish={publish}
        onPreview={preview}
        saving={saving}
        publishing={publishing}
        hasChanges={hasUnpublishedChanges}
        previewPath="/work"
      />
    </div>
  );
}
