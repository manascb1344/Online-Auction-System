import { Link } from "react-router-dom";

export default function ForbiddenPage() {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">403</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Not available for your role</h1>
      <p className="mt-2 text-slate-500">Sign in with an account that has the required role to continue.</p>
      <Link className="btn-primary mt-6" to="/products">Back to the catalogue</Link>
    </div>
  );
}
