import { useEffect, useState } from 'react';
import './App.css';
import CalculatorPage from './CalculatorPage';
import PostsDemo from './PostsDemo';

function getPathname() {
  return window.location.pathname;
}

function App() {
  const [pathname, setPathname] = useState(getPathname);

  useEffect(() => {
    const handlePopState = () => setPathname(getPathname());
    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div className="App-shell">
      <header className="site-header">
        <a className="brand" href="/">
          Revolte workspace
        </a>
        <nav aria-label="Primary navigation">
          <a className={pathname === '/' ? 'nav-link active' : 'nav-link'} href="/">
            Posts
          </a>
          <a className={pathname === '/calculator' ? 'nav-link active' : 'nav-link'} href="/calculator">
            Calculator
          </a>
        </nav>
      </header>
      {pathname === '/calculator' ? <CalculatorPage /> : <PostsDemo />}
    </div>
  );
}

export default App;
