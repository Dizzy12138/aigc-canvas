import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [titleInput, setTitleInput] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async () => {
    if (!titleInput) return;
    try {
      const res = await api.post('/projects', {
        title: titleInput,
      });
      setTitleInput('');
      navigate(`/projects/${res.data._id}`);
    } catch (err) {
      setError('Failed to create project');
    }
  };

  const handleDelete = async (id) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setError('Failed to delete project');
    }
  };

  return (
    <div>
      <h2>Your Projects</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          value={titleInput}
          onChange={(e) => setTitleInput(e.target.value)}
          placeholder="New project title"
        />
        <button type="button" onClick={handleCreate}>
          Create
        </button>
      </div>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <ul>
          {projects.map((project) => (
            <li key={project._id} style={{ marginBottom: '8px' }}>
              <span
                style={{ cursor: 'pointer', color: 'blue' }}
                onClick={() => navigate(`/projects/${project._id}`)}
              >
                {project.title}
              </span>
              <button
                type="button"
                style={{ marginLeft: '8px' }}
                onClick={() => handleDelete(project._id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}