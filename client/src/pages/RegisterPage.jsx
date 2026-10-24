import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { homeFor } from "../auth/roles";
import ErrorAlert from "../components/ErrorAlert";

export default function RegisterPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    role: "buyer",
    username: "",
    email: "",
    password: "",
    address: "",
  });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={homeFor(user.role)} replace />;

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload = { ...form };
      if (!payload.address.trim()) delete payload.address;
      const session = await api.register(payload);
      login(session);
      navigate(homeFor(session.user.role), { replace: true });
    } catch (requestError) {
      setError(requestError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="card">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">Buyers bid; sellers list lots. Admin accounts are provisioned separately.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <ErrorAlert error={error} />
          <div>
            <label className="label" htmlFor="role">I am a</label>
            <select id="role" className="input" value={form.role} onChange={update("role")}>
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="username">Username</label>
            <input id="username" className="input" value={form.username} onChange={update("username")} minLength={3} required />
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" className="input" value={form.email} onChange={update("email")} required />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" type="password" className="input" value={form.password} onChange={update("password")} minLength={8} required />
          </div>
          <div>
            <label className="label" htmlFor="address">Address (optional)</label>
            <input id="address" className="input" value={form.address} onChange={update("address")} />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-500">
          Already registered?{" "}
          <Link className="font-semibold text-indigo-600 hover:text-indigo-500" to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
