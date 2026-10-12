/* eslint-disable jsx-a11y/label-has-associated-control */
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import stacktapeLogoImage from './stacktape-logo.svg';

const injectedEnv = (window as Window & { STP_INJECTED_ENV?: { VITE_API_URL?: string } }).STP_INJECTED_ENV;
const API_URL = injectedEnv?.VITE_API_URL ?? '';

type Post = {
  id: string;
  title: string;
  authorEmail: string;
  content: string;
};

function PostsDemo() {
  const [postAuthor, setPostAuthor] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetch(`${API_URL}/posts`).then((response) => response.json()),
  });

  const mutation = useMutation({
    mutationFn: (variables: { title: string; content: string; authorEmail: string }) =>
      fetch(`${API_URL}/posts`, {
        method: 'POST',
        body: JSON.stringify(variables),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }).then((response) => response.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setPostAuthor('');
      setPostTitle('');
      setPostContent('');
    },
  });

  const posts: Post[] = query.data?.data ?? [];

  return (
    <section className="posts-panel" aria-labelledby="posts-title">
      <div className="section-heading">
        <p className="eyebrow">Existing workspace</p>
        <h1 id="posts-title">Posts</h1>
        <p className="section-copy">The original posts experience remains available from the home route.</p>
      </div>

      <div className="posts-list" aria-live="polite">
        {posts.map((post) => (
          <article className="post-card" key={post.id}>
            <p className="post-label">{post.title}</p>
            <p>{post.content}</p>
            <p className="post-author">{post.authorEmail}</p>
          </article>
        ))}
      </div>

      <form
        className="posts-form"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate({ title: postTitle, content: postContent, authorEmail: postAuthor });
        }}
      >
        <label htmlFor="post-title">Title</label>
        <input id="post-title" value={postTitle} onChange={(event) => setPostTitle(event.target.value)} type="text" />
        <label htmlFor="post-author">Author email</label>
        <input
          id="post-author"
          value={postAuthor}
          onChange={(event) => setPostAuthor(event.target.value)}
          type="email"
        />
        <label htmlFor="post-content">Post content</label>
        <textarea id="post-content" value={postContent} onChange={(event) => setPostContent(event.target.value)} />
        <button type="submit" className="secondary-button">
          Add new post
        </button>
      </form>

      <footer className="posts-footer">
        <a href="https://stacktape.com" target="_blank" rel="noopener noreferrer">
          Deployed using
          <img src={stacktapeLogoImage} alt="Stacktape logo" />
          Stacktape
        </a>
      </footer>
    </section>
  );
}

export default PostsDemo;
