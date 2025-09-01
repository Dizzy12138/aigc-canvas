import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Stage, Layer, Image as KonvaImage, Text as KonvaText } from 'react-konva';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import useImage from 'use-image';
import GeneratorPanel from './GeneratorPanel';
import ResultDock from './ResultDock';
import ChatPanel from './ChatPanel';
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

function AssetItem({ asset, onAdd }) {
  const [, drag] = useDrag(() => ({ type: 'ASSET', item: asset }));
  return (
    <div
      ref={drag}
      style={{ marginBottom: '8px', cursor: 'move' }}
      role="button"
      tabIndex={0}
      onClick={() => onAdd(asset)}
      onKeyPress={() => onAdd(asset)}
    >
      <img
        src={asset.url}
        alt={asset.originalName}
        style={{ width: '100%', height: 'auto' }}
      />
    </div>
  );
}

export default function CanvasEditor() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [layers, setLayers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [results, setResults] = useState([]);
  const stageRef = useRef(null);
  const [, drop] = useDrop(
    () => ({
      accept: 'ASSET',
      drop: (item, monitor) => {
        const stage = stageRef.current;
        if (!stage) return;
        const stageRect = stage.container().getBoundingClientRect();
        const clientOffset = monitor.getClientOffset();
        const position = {
          x: clientOffset.x - stageRect.left,
          y: clientOffset.y - stageRect.top,
        };
        addAssetLayer(item, position);
      },
    }),
    [stageRef],
  );

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

  const addAssetLayer = useCallback((asset, position = { x: 50, y: 50 }) => {
    setLayers((prev) => {
      const nextZ = prev.length > 0 ? Math.max(...prev.map((l) => l.zIndex)) + 1 : 1;
      return [
        ...prev,
        {
          id: `${Date.now()}`,
          type: 'image',
          file: asset.url,
          position,
          opacity: 1,
          blendMode: 'normal',
          zIndex: nextZ,
        },
      ];
    });
  }, []);

  // Add an AI-generated image to the canvas as a new layer
  const addResultToCanvas = (img) => {
    addAssetLayer({ url: img.url });
  };

  // Layer order helpers
  const moveLayer = (id, dir) => {
    setLayers((prev) => {
      const sorted = [...prev].sort((a, b) => a.zIndex - b.zIndex);
      const index = sorted.findIndex((l) => l.id === id);
      if (dir === 'up' && index < sorted.length - 1) {
        [sorted[index].zIndex, sorted[index + 1].zIndex] = [
          sorted[index + 1].zIndex,
          sorted[index].zIndex,
        ];
      } else if (dir === 'down' && index > 0) {
        [sorted[index].zIndex, sorted[index - 1].zIndex] = [
          sorted[index - 1].zIndex,
          sorted[index].zIndex,
        ];
      }
      return sorted;
    });
  };
  const moveLayerUp = (id) => moveLayer(id, 'up');
  const moveLayerDown = (id) => moveLayer(id, 'down');

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

  const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <DndProvider backend={HTML5Backend}>
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
              <AssetItem key={asset._id} asset={asset} onAdd={addAssetLayer} />
            ))}
          </div>
          {/* Generator panel */}
          <GeneratorPanel onResult={(imgs) => setResults(imgs)} />
          {/* Result dock */}
          <ResultDock results={results} onSelect={addResultToCanvas} />
        </div>
        {/* Canvas area */}
        <div
          style={{ flexGrow: 1, border: '1px solid #ccc', padding: '8px' }}
          ref={drop}
        >
          <Stage
            width={project.canvasSize.width}
            height={project.canvasSize.height}
            style={{ background: '#f0f0f0' }}
            ref={stageRef}
          >
            <Layer>
              {/* Render all image/text layers */}
              {sortedLayers.map((layer) => {
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
          <div style={{ marginTop: '8px' }}>
            <h4>图层</h4>
            {sortedLayers.map((layer) => (
              <div key={layer.id} style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ flexGrow: 1 }}>{layer.type}</span>
                <button type="button" onClick={() => moveLayerUp(layer.id)}>
                  上移
                </button>
                <button type="button" onClick={() => moveLayerDown(layer.id)}>
                  下移
                </button>
              </div>
            ))}
          </div>
        </div>
        {/* Chat panel on the right */}
        <ChatPanel />
      </div>
    </DndProvider>
  );
}