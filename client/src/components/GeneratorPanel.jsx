import React, { useState, useEffect, useRef } from 'react';
import api from '../api';

/**
 * GeneratorPanel provides an interface similar to Xingliu.AI for creating
 * images with AI. Users can select a base model, set generation parameters
 * (width, height, number of outputs) and provide a text prompt. When
 * generation is triggered the panel calls the backend to start a job and
 * polls for completion. On success, the generated images are passed back
 * to the parent component via the onResult callback.
 */
export default function GeneratorPanel({ onResult }) {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [prompt, setPrompt] = useState('');
  const [width, setWidth] = useState(768);
  const [height, setHeight] = useState(1024);
  const [batch, setBatch] = useState(4);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  // Fetch available models from the backend on mount
  useEffect(() => {
    async function fetchModels() {
      try {
        const res = await api.get('/ai/models');
        setModels(res.data);
        if (res.data && res.data.length > 0) {
          setSelectedModel(res.data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchModels();
  }, []);

  // Trigger a new generation job and poll for results
  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const res = await api.post('/ai/generate', {
        prompt,
        width,
        height,
        batch,
        model: selectedModel,
      });
      const { jobId } = res.data;
      intervalRef.current = setInterval(async () => {
        try {
          const statusRes = await api.get(`/ai/job/${jobId}`);
          if (statusRes.data.status === 'completed') {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setLoading(false);
            onResult(statusRes.data.result || []);
          } else if (statusRes.data.status === 'failed') {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setLoading(false);
            // eslint-disable-next-line no-alert
            alert('Generation failed');
          }
        } catch (err) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setLoading(false);
          console.error(err);
        }
      }, 1000);
    } catch (err) {
      setLoading(false);
      console.error(err);
    }
  };

  useEffect(
    () => () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    },
    [],
  );

  return (
    <div style={{ marginBottom: '16px' }}>
      <h3>生成器</h3>
      <div style={{ marginBottom: '8px' }}>
        <label htmlFor="model-select">基础模型:</label>
        <select
          id="model-select"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          style={{ marginLeft: '4px' }}
        >
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>
      <div style={{ marginBottom: '8px' }}>
        <label htmlFor="prompt-input">提示词:</label>
        <textarea
          id="prompt-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          style={{ width: '100%', resize: 'vertical' }}
          placeholder="描述你想要的画面"
        />
      </div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <div>
          <label htmlFor="width-input">宽:</label>
          <input
            id="width-input"
            type="number"
            value={width}
            onChange={(e) => setWidth(parseInt(e.target.value, 10))}
            style={{ width: '70px', marginLeft: '4px' }}
          />
        </div>
        <div>
          <label htmlFor="height-input">高:</label>
          <input
            id="height-input"
            type="number"
            value={height}
            onChange={(e) => setHeight(parseInt(e.target.value, 10))}
            style={{ width: '70px', marginLeft: '4px' }}
          />
        </div>
        <div>
          <label htmlFor="batch-input">数量:</label>
          <input
            id="batch-input"
            type="number"
            min={1}
            max={10}
            value={batch}
            onChange={(e) => setBatch(parseInt(e.target.value, 10))}
            style={{ width: '60px', marginLeft: '4px' }}
          />
        </div>
      </div>
      <button type="button" onClick={handleGenerate} disabled={loading}>
        {loading ? '生成中…' : '生成'}
      </button>
    </div>
  );
}