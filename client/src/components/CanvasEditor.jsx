import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Stage, Layer, Image as KonvaImage, Text as KonvaText } from 'react-konva';
import useImage from 'use-image';
import GeneratorPanel from './GeneratorPanel';
import ResultDock from './ResultDock';
import api from '../api';

/**
 * A hook that loads an image from a given URL. It returns the HTMLImageElement
 * once the image has loaded. This is similar to the `useImage` hook from
 * react-konva's examples.
 */
function LoadedImage({ url, ...rest }) {
  const [image] = useImage(url);
  return <KonvaImage image={image} {...rest} />;
}

export default function CanvasEditor() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [layers, setLayers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [results, setResults] = useState([]);
  const stageRef = useRef(null);

  // Load project details
  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await api.get(`/projects/${id}`);
        setProject(res.data);
        setLayers(res.data.layers || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchProject();
    // fetch assets as well
    async function fetchAssets() {
      try {
        const res = await api.get('/assets');
        setAssets(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchAssets();
  }, [id]);

  // Handle dragging of a layer
  const handleDragEnd = (e, layerId) => {
    const { x, y } = e.target.position();
    setLayers((prev) =>
      prev.map((lyr) => (lyr.id === layerId ? { ...lyr, position: { x, y } } : lyr)),
    );
  };

  // Add asset to canvas
  const addAssetToCanvas = (asset) => {
    const newLayer = {
      id: `${Date.now()}`,
      type: 'image',
      file: asset.url,
      position: { x: 50, y: 50 },
      opacity: 1,
      blendMode: 'normal',
      zIndex: layers.length + 1,
    };
    setLayers((prev) => [...prev, newLayer]);
  };

  // Add an AI-generated image to the canvas as a new layer
  const addResultToCanvas = (img) => {
    const newLayer = {
      id: `${Date.now()}`,
      type: 'image',
      file: img.url,
      position: { x: 50, y: 50 },
      opacity: 1,
      blendMode: 'normal',
      zIndex: layers.length + 1,
    };
    setLayers((prev) => [...prev, newLayer]);
  };

  // Upload new asset
  const handleFileUpload = async () => {
    if (!uploadFile) return;
    const formData = new FormData();
    formData.append('file', uploadFile);
    try {
      const res = await api.post('/assets/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAssets((prev) => [res.data, ...prev]);
      setUploadFile(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Save layers to project
  const handleSave = async () => {
    try {
      await api.put(`/projects/${id}`, { layers });
      // eslint-disable-next-line no-alert
      alert('Project saved');
    } catch (err) {
      console.error(err);
    }
  };

  if (!project) {
    return <p>Loading…</p>;
  }

  return (
    <div style={{ display: 'flex', gap: '16px' }}>
      {/* Left sidebar: assets and generator */}
      <div style={{ width: '260px' }}>
        {/* Assets panel */}
        <h3>素材库</h3>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setUploadFile(e.target.files[0])}
        />
        <button type="button" onClick={handleFileUpload} disabled={!uploadFile}>
          上传
        </button>
        <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '8px' }}>
          {assets.map((asset) => (
            <div
              key={asset._id}
              style={{ marginBottom: '8px', cursor: 'pointer' }}
              onClick={() => addAssetToCanvas(asset)}
              onKeyPress={() => addAssetToCanvas(asset)}
              role="button"
              tabIndex={0}
            >
              <img
                src={asset.url}
                alt={asset.originalName}
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
          ))}
        </div>
        {/* Generator panel */}
        <GeneratorPanel onResult={(imgs) => setResults(imgs)} />
        {/* Result dock */}
        <ResultDock results={results} onSelect={addResultToCanvas} />
      </div>
      {/* Canvas area */}
      <div style={{ flexGrow: 1, border: '1px solid #ccc', padding: '8px' }}>
        <Stage
          width={project.canvasSize.width}
          height={project.canvasSize.height}
          style={{ background: '#f0f0f0' }}
          ref={stageRef}
        >
          <Layer>
            {/* Render all image/text layers */}
            {layers.map((layer) => {
              if (layer.type === 'image') {
                return (
                  <LoadedImage
                    key={layer.id}
                    url={layer.file}
                    x={layer.position.x}
                    y={layer.position.y}
                    opacity={layer.opacity}
                    draggable
                    onDragEnd={(e) => handleDragEnd(e, layer.id)}
                  />
                );
              }
              if (layer.type === 'text') {
                return (
                  <KonvaText
                    key={layer.id}
                    text={layer.text || ''}
                    x={layer.position.x}
                    y={layer.position.y}
                    draggable
                    onDragEnd={(e) => handleDragEnd(e, layer.id)}
                    fontSize={layer.fontSize || 24}
                    fill={layer.color || 'black'}
                  />
                );
              }
              return null;
            })}
          </Layer>
        </Stage>
        <div style={{ marginTop: '8px' }}>
          <button type="button" onClick={handleSave}>
            保存项目
          </button>
        </div>
      </div>
    </div>
  );
}