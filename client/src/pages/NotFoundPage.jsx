import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">404</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 text-slate-500">The page you requested does not exist or has moved.</p>
      <Link className="btn-primary mt-6" to="/products">Back to the catalogue</Link>
    </div>
  );
}
