/* eslint-disable jsx-a11y/label-has-associated-control */
import { FormEvent, useState } from 'react';
import './App.css';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import stacktapeLogoImage from './stacktape-logo.svg';

const API_URL = (window as any).STP_INJECTED_ENV.VITE_API_URL;

type Post = {
  id: number;
  title: string;
  content: string;
  authorEmail: string;
};

type PostForm = {
  title: string;
  content: string;
  authorEmail: string;
};

const emptyForm: PostForm = { title: '', content: '', authorEmail: '' };

function App() {
  const [form, setForm] = useState<PostForm>(emptyForm);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [formError, setFormError] = useState('');
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['posts'],
    queryFn: () => fetch(`${API_URL}/posts`).then((response) => response.json()),
  });

  const mutation = useMutation({
    mutationFn: ({ id, post }: { id: number | null; post: PostForm }) =>
      fetch(`${API_URL}/posts${id ? `/${id}` : ''}`, {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(post),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }).then(async (response) => {
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || 'Unable to save the post.');
        }
        return result;
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setForm(emptyForm);
      setEditingPostId(null);
      setFormError('');
    },
    onError: (error: Error) => setFormError(error.message),
  });

  const posts: Post[] = query?.data?.data || [];

  const updateForm = (field: keyof PostForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const editPost = (post: Post) => {
    setEditingPostId(post.id);
    setForm({ title: post.title, content: post.content, authorEmail: post.authorEmail });
    setFormError('');
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingPostId(null);
    setForm(emptyForm);
    setFormError('');
  };

  const savePost = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim() || !form.content.trim() || !/^\S+@\S+\.\S+$/.test(form.authorEmail.trim())) {
      setFormError('Enter a title, content, and valid author email.');
      return;
    }
    mutation.mutate({ id: editingPostId, post: form });
  };

  let submitLabel = 'Add new post';
  if (mutation.isLoading) {
    submitLabel = 'Saving...';
  } else if (editingPostId) {
    submitLabel = 'Save changes';
  }

  return (
    <div className="App">
      <main>
        <h1>Stacktape demo posts application</h1>
        <h2>Posts</h2>
        {query.isLoading && <p role="status">Loading posts...</p>}
        {query.isError && <p role="alert">Unable to load posts. Please try again.</p>}
        {!query.isLoading && !query.isError && posts.length === 0 && <p>No posts have been published yet.</p>}
        <section className="Posts-container" aria-label="Published posts">
          {posts.map((post) => (
            <article className="Post-container" key={post.id}>
              <p className="Post-field-row">
                <span className="Post-field-label">Title:</span>
                <br />
                <span>{post.title}</span>
              </p>
              <p className="Post-field-row">
                <span className="Post-field-label">Author:</span>
                <br />
                <span>{post.authorEmail}</span>
              </p>
              <p className="Post-field-row">
                <span className="Post-field-label">Post content:</span>
                <br />
                <span>{post.content}</span>
              </p>
              <button type="button" className="Post-edit-button" onClick={() => editPost(post)}>
                Edit post
              </button>
            </article>
          ))}
        </section>

        <form onSubmit={savePost} aria-label={editingPostId ? 'Edit post' : 'Add post'}>
          <h2>{editingPostId ? 'Edit post' : 'Add a new post'}</h2>
          <label className="Form-input-label" htmlFor="title">
            Title
          </label>
          <input
            className="Form-input"
            id="title"
            value={form.title}
            onChange={(event) => updateForm('title', event.target.value)}
            type="text"
            required
          />
          <label className="Form-input-label" htmlFor="postAuthor">
            Author (email)
          </label>
          <input
            className="Form-input"
            id="postAuthor"
            value={form.authorEmail}
            onChange={(event) => updateForm('authorEmail', event.target.value)}
            type="email"
            required
          />
          <label className="Form-input-label" htmlFor="postText">
            Post content
          </label>
          <textarea
            className="Form-input Form-textarea"
            id="postText"
            value={form.content}
            onChange={(event) => updateForm('content', event.target.value)}
            required
          />
          {formError && (
            <p className="Form-error" role="alert">
              {formError}
            </p>
          )}
          <button type="submit" className="Form-submit-button" disabled={mutation.isLoading}>
            {submitLabel}
          </button>
          {editingPostId && (
            <button type="button" className="Form-cancel-button" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </form>
      </main>
      <footer className="Footer">
        <a href="https://stacktape.com" target="_blank" rel="noopener noreferrer">
          Deployed using
          <img src={stacktapeLogoImage} alt="Stacktape Logo" />
          Stacktape
        </a>
      </footer>
    </div>
  );
}

export default App;
