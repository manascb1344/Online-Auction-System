import { useCallback } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/client";
import { useApi } from "../api/useApi";
import ErrorAlert from "../components/ErrorAlert";
import Spinner from "../components/Spinner";

const LABELS = [
  ["items", "Lots"],
  ["activeAuctions", "Active auctions"],
  ["bids", "Bids"],
  ["transactions", "Transactions"],
  ["buyers", "Buyers"],
  ["sellers", "Sellers"],
];

export default function AdminDashboardPage() {
  const load = useCallback(() => api.adminStats(), []);
  const stats = useApi(load);

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Administration</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Platform overview</h1>
        <p className="text-sm text-slate-500">Live counts straight from the SQL aggregate view.</p>
      </section>

      <ErrorAlert error={stats.error} onRetry={stats.reload} />
      {stats.loading ? (
        <Spinner label="Loading statistics" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LABELS.map(([key, label]) => (
            <div key={key} className="card">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{stats.data?.[key] ?? 0}</p>
            </div>
          ))}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <Link className="card transition hover:border-indigo-300" to="/admin/auctions">
          <h2 className="font-semibold text-slate-900">Auctions</h2>
          <p className="mt-1 text-sm text-slate-500">Reserve prices, status and current bids.</p>
        </Link>
        <Link className="card transition hover:border-indigo-300" to="/admin/bids">
          <h2 className="font-semibold text-slate-900">Bids</h2>
          <p className="mt-1 text-sm text-slate-500">Every bid with its bidder and state.</p>
        </Link>
        <Link className="card transition hover:border-indigo-300" to="/admin/transactions">
          <h2 className="font-semibold text-slate-900">Transactions</h2>
          <p className="mt-1 text-sm text-slate-500">Settled sales with buyer and seller.</p>
        </Link>
      </section>
    </div>
  );
}
