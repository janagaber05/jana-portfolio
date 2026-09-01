import { useState } from 'react';
import { getProjectThumbnailSources } from '../utils/projectThumbnail';

export default function ProjectThumbnail({
  project,
  index = 0,
  className = '',
  imageClassName = '',
  fallbackClassName = '',
  alt,
}) {
  const sources = getProjectThumbnailSources(project, index);
  const [sourceIndex, setSourceIndex] = useState(0);
  const src = sources[sourceIndex] || '';
  const showImage = Boolean(src) && sourceIndex < sources.length;

  return (
    <div className={className}>
      {showImage ? (
        <img
          src={src}
          alt={alt || `${project.title} preview`}
          className={imageClassName}
          loading="lazy"
          decoding="async"
          onError={() => setSourceIndex((current) => current + 1)}
        />
      ) : (
        <span className={fallbackClassName} aria-hidden="true">
          {project.index}
        </span>
      )}
    </div>
  );
}
