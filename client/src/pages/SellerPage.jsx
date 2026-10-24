import { useCallback, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/client";
import { useApi } from "../api/useApi";
import Countdown from "../components/Countdown";
import EmptyState from "../components/EmptyState";
import ErrorAlert from "../components/ErrorAlert";
import Money from "../components/Money";
import Spinner from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";
import { formatDateTime } from "../utils/format";

const EMPTY_FORM = {
  name: "",
  description: "",
  startingPrice: "",
  category: "",
  startTime: "",
  endTime: "",
};

export default function SellerPage() {
  const load = useCallback(() => api.myItems(), []);
  const items = useApi(load);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice("");
    try {
      const body = {
        name: form.name.trim(),
        startingPrice: Number(form.startingPrice),
        endTime: new Date(form.endTime).toISOString(),
      };
      if (form.description.trim()) body.description = form.description.trim();
      if (form.category.trim()) body.category = form.category.trim();
      if (form.startTime) body.startTime = new Date(form.startTime).toISOString();

      await api.createItem(body);
      setForm(EMPTY_FORM);
      setNotice("Lot published. It is now visible in the catalogue.");
      items.reload();
    } catch (requestError) {
      setError(requestError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Seller studio</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">List a new lot</h1>
            <p className="text-sm text-slate-500">Creating a lot also opens an auction with the same reserve price.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {items.data?.length ?? 0} lots
          </span>
        </div>

        <form onSubmit={submit} className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="label" htmlFor="name">Lot name</label>
            <input id="name" className="input" value={form.name} onChange={update("name")} minLength={3} required />
          </div>
          <div className="md:col-span-2">
            <label className="label" htmlFor="description">Description</label>
            <textarea id="description" className="input min-h-24" value={form.description} onChange={update("description")} />
          </div>
          <div>
            <label className="label" htmlFor="startingPrice">Starting price (INR)</label>
            <input id="startingPrice" type="number" min="0.01" step="0.01" className="input" value={form.startingPrice} onChange={update("startingPrice")} required />
          </div>
          <div>
            <label className="label" htmlFor="category">Category</label>
            <input id="category" className="input" value={form.category} onChange={update("category")} />
          </div>
          <div>
            <label className="label" htmlFor="startTime">Auction starts (optional)</label>
            <input id="startTime" type="datetime-local" className="input" value={form.startTime} onChange={update("startTime")} />
          </div>
          <div>
            <label className="label" htmlFor="endTime">Auction ends</label>
            <input id="endTime" type="datetime-local" className="input" value={form.endTime} onChange={update("endTime")} required />
          </div>

          <div className="md:col-span-2">
            <ErrorAlert error={error} />
            {notice && (
              <p className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                {notice}
              </p>
            )}
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? "Publishing..." : "Publish lot"}
            </button>
          </div>
        </form>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold text-slate-900">Your lots</h2>
        <ErrorAlert error={items.error} onRetry={items.reload} />
        {items.loading ? (
          <Spinner label="Loading your lots" />
        ) : items.data?.length ? (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Lot</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Current bid</th>
                  <th className="py-2 pr-4">Bids</th>
                  <th className="py-2 pr-4">Ends</th>
                  <th className="py-2">Window</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.data.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 pr-4">
                      <Link className="font-medium text-slate-900 hover:text-indigo-600" to={`/products/${item.id}`}>
                        {item.name}
                      </Link>
                    </td>
                    <td className="py-3 pr-4"><StatusBadge status={item.auction.status} /></td>
                    <td className="py-3 pr-4"><Money value={item.currentBid ?? item.startingPrice} /></td>
                    <td className="py-3 pr-4">{item.bidCount}</td>
                    <td className="py-3 pr-4"><Countdown endTime={item.auction.endTime} /></td>
                    <td className="py-3 text-slate-500">
                      {formatDateTime(item.auction.startTime)} → {formatDateTime(item.auction.endTime)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No lots yet" description="Publish your first lot with the form above." />
        )}
      </section>
    </div>
  );
}
