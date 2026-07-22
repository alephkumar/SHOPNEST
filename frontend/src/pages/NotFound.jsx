import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
    <h1 className="font-display text-8xl text-ink/10 mb-2">404</h1>
    <h2 className="font-display text-2xl text-ink mb-2">Page not found</h2>
    <p className="text-sm text-slate-light mb-8 max-w-sm">
      The page you're looking for doesn't exist or may have been moved.
    </p>
    <Link to="/" className="btn-primary">Back to Home</Link>
  </div>
);

export default NotFound;
