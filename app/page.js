'use client';
import { useEffect, useState } from 'react';
import socket from "@/app/lib/socket";


export default function PostPage() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ id: null, title: '', content: '' });

  // Ambil data awal
  useEffect(() => {
    fetch('http://localhost:8080/api/v1/post')
      .then((res) => res.json())
      .then(setPosts);
  }, []);

  // Listener realtime
  useEffect(() => {
    socket.on('new_post', (post) => {
      setPosts((prev) => [post, ...prev]);
    });

    socket.on('updated_post', (post) => {
      setPosts((prev) => prev.map((p) => (p.id === post.id ? post : p)));
    });

    socket.on('deleted_post', (post) => {
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    });

    return () => {
      socket.off('new_post');
      socket.off('updated_post');
      socket.off('deleted_post');
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = form.id
      ? `http://localhost:8080/api/v1/post/${form.id}`
      : 'http://localhost:8080/api/v1/post';

    const method = form.id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        content: form.content,
      }),
    });

    if (res.ok) {
      setForm({ id: null, title: '', content: '' });
    }
  };

  const handleDelete = async (id) => {
    await fetch(`http://localhost:8080/api/v1/post/${id}`, { method: 'DELETE' });
  };

  const handleEdit = (post) => {
    setForm(post);
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4">Realtime Posts (Socket.IO + Bootstrap 5)</h1>

      <form onSubmit={handleSubmit} className="mb-5">
        <div className="mb-3">
          <input
            className="form-control"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div className="mb-3">
          <textarea
            className="form-control"
            placeholder="Content"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          {form.id ? 'Update' : 'Create'} Post
        </button>
        {form.id && (
          <button
            type="button"
            className="btn btn-secondary ms-2"
            onClick={() => setForm({ id: null, title: '', content: '' })}
          >
            Cancel
          </button>
        )}
      </form>

      <div className="list-group">
        {posts.map((post) => (
          <div key={post.id} className="list-group-item">
            <h5>{post.title}</h5>
            <p>{post.content}</p>
            <div>
              <button
                className="btn btn-sm btn-outline-primary me-2"
                onClick={() => handleEdit(post)}
              >
                Edit
              </button>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleDelete(post.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}