import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { api } from "../api/client";
import { useApi } from "../api/useApi";
import { useAuth } from "../auth/AuthContext";
import Countdown from "../components/Countdown";
import EmptyState from "../components/EmptyState";
import ErrorAlert from "../components/ErrorAlert";
import Money from "../components/Money";
import Spinner from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";
import { formatDateTime } from "../utils/format";

function minimumFor(item) {
  if (item.currentBid !== null && item.currentBid !== undefined) {
    return Math.round((item.currentBid + 1) * 100) / 100;
  }
  return Math.max(item.startingPrice, item.auction.reservePrice);
}

export default function ItemPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const loadItem = useCallback(() => api.getItem(id), [id]);
  const loadBids = useCallback(() => api.listBids(id), [id]);
  const item = useApi(loadItem);
  const history = useApi(loadBids);

  const [amount, setAmount] = useState("");
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (item.data) setAmount(String(minimumFor(item.data)));
  }, [item.data]);

  if (item.loading) return <Spinner label="Loading lot" />;
  if (item.error) return <ErrorAlert error={item.error} onRetry={item.reload} />;
  if (!item.data) return null;

  const lot = item.data;
  const minimum = minimumFor(lot);
  const canBid = user?.role === "buyer" && lot.auction.status === "active";

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice("");
    try {
      await api.placeBid(lot.id, Number(amount));
      setNotice("Bid placed. You are the current highest bidder.");
      item.reload();
      history.reload();
    } catch (requestError) {
      setError(requestError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <section className="space-y-6">
        <div className="card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                {lot.category ?? "Lot"}
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{lot.name}</h1>
              <p className="mt-1 text-sm text-slate-500">Listed by {lot.seller.username}</p>
            </div>
            <StatusBadge status={lot.auction.status} />
          </div>

          <p className="mt-4 whitespace-pre-line text-slate-600">
            {lot.description || "No description provided."}
          </p>

          <dl className="mt-6 grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Starting price</dt>
              <dd className="mt-1 font-semibold text-slate-900"><Money value={lot.startingPrice} /></dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Reserve price</dt>
              <dd className="mt-1 font-semibold text-slate-900"><Money value={lot.auction.reservePrice} /></dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Auction window</dt>
              <dd className="mt-1 text-sm text-slate-700">
                {formatDateTime(lot.auction.startTime)} → {formatDateTime(lot.auction.endTime)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Bid history</h2>
            <span className="text-sm text-slate-500">{history.data?.length ?? 0} bids</span>
          </div>
          <ErrorAlert error={history.error} onRetry={history.reload} />
          {history.loading ? (
            <Spinner label="Loading bids" />
          ) : history.data?.length ? (
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="py-2 pr-4">Bidder</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2">Placed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.data.map((bid) => (
                    <tr key={bid.id}>
                      <td className="py-2 pr-4 font-medium text-slate-800">{bid.bidderUsername}</td>
                      <td className="py-2 pr-4"><Money value={bid.amount} /></td>
                      <td className="py-2 pr-4"><StatusBadge status={bid.status} /></td>
                      <td className="py-2 text-slate-500">{formatDateTime(bid.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No bids yet" description="Be the first to place a bid on this lot." />
          )}
        </div>
      </section>

      <aside className="card order-first h-fit lg:order-none">
        <p className="text-xs uppercase tracking-wide text-slate-500">Current bid</p>
        <p className="mt-1 text-3xl font-bold text-slate-900">
          <Money value={lot.currentBid ?? lot.startingPrice} />
        </p>
        <p className="mt-1 text-sm text-slate-500">{lot.bidCount} bids so far</p>

        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm">
          <p className="text-slate-500">Time remaining</p>
          <p className="mt-1 text-lg"><Countdown endTime={lot.auction.endTime} /></p>
        </div>

        <div className="mt-5">
          <ErrorAlert error={error} />
          {notice && (
            <p className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {notice}
            </p>
          )}

          {!user && (
            <p className="text-sm text-slate-600">
              <Link className="font-semibold text-indigo-600" to="/login">Sign in</Link> as a buyer to place a bid.
            </p>
          )}
          {user && user.role !== "buyer" && (
            <p className="text-sm text-slate-500">Only buyer accounts can place bids.</p>
          )}
          {user?.role === "buyer" && lot.auction.status !== "active" && (
            <p className="text-sm text-slate-500">This auction is {lot.auction.status} and is not accepting bids.</p>
          )}
          {canBid && (
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="label" htmlFor="amount">Your bid (minimum {minimum})</label>
                <input
                  id="amount"
                  className="input"
                  type="number"
                  step="0.01"
                  min={minimum}
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={busy}>
                {busy ? "Placing bid..." : "Place bid"}
              </button>
              <p className="text-xs text-slate-500">
                Bids must beat the current highest bid by at least 1.00.
              </p>
            </form>
          )}
        </div>
      </aside>
    </div>
  );
}
