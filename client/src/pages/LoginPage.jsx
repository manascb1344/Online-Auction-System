import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { homeFor } from "../auth/roles";
import ErrorAlert from "../components/ErrorAlert";

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ role: "buyer", username: "", password: "" });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={homeFor(user.role)} replace />;

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const session = await api.login(form);
      login(session);
      navigate(location.state?.from ?? homeFor(session.user.role), { replace: true });
    } catch (requestError) {
      setError(requestError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <section className="card">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sign in</h1>
        <p className="mt-1 text-sm text-slate-500">Use your account to bid, sell, or administer auctions.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <ErrorAlert error={error} />
          <div>
            <label className="label" htmlFor="role">Account type</label>
            <select id="role" className="input" value={form.role} onChange={update("role")}>
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="username">Username</label>
            <input id="username" className="input" autoComplete="username" value={form.username} onChange={update("username")} required />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" type="password" className="input" autoComplete="current-password" value={form.password} onChange={update("password")} required />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-500">
          New here?{" "}
          <Link className="font-semibold text-indigo-600 hover:text-indigo-500" to="/register">
            Create an account
          </Link>
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Demo account credentials are documented in SETUP.md; they are not bundled into the client.
        </p>
      </section>
    </div>
  );
}
