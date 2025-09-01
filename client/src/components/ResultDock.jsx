import React from 'react';

/**
 * ResultDock displays a list of generated images. When the user clicks on
 * one of the previews the parent callback onSelect is invoked with the
 * selected image. This allows the canvas editor to insert the image as
 * a new layer. The dock is intentionally simple: it renders all images
 * vertically with a small border so they can be previewed.
 */
export default function ResultDock({ results, onSelect }) {
  if (!results || results.length === 0) {
    return null;
  }
  return (
    <div style={{ marginTop: '16px' }}>
      <h3>生成结果</h3>
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {results.map((img, index) => (
          <div
            key={index}
            onClick={() => onSelect(img)}
            onKeyPress={() => onSelect(img)}
            role="button"
            tabIndex={0}
            style={{
              marginBottom: '8px',
              cursor: 'pointer',
              border: '1px solid #ccc',
              padding: '2px',
            }}
          >
            {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
            <img src={img.url} alt={`结果 ${index + 1}`} style={{ width: '100%' }} />
          </div>
        ))}
      </div>
    </div>
  );
}