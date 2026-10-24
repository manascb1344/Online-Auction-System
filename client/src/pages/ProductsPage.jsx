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

export default function ProductsPage() {
  const [term, setTerm] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(
    () => api.listItems({ status: "active", search: search || undefined, limit: 24 }),
    [search],
  );
  const { data, error, loading, reload } = useApi(load);

  const submit = (event) => {
    event.preventDefault();
    setSearch(term.trim());
  };

  return (
    <div>
      <section className="rounded-2xl bg-slate-900 px-6 py-8 text-white sm:px-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-300">Live catalogue</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Bid on lots closing soon</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Every lot is backed by an auction with a real end time, a reserve price, and a full bid history.
        </p>
        <form onSubmit={submit} className="mt-6 flex max-w-xl flex-col gap-2 sm:flex-row">
          <input
            className="input flex-1"
            placeholder="Search lots by name"
            aria-label="Search lots"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
          />
          <button className="btn-primary" type="submit">Search</button>
        </form>
      </section>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">
          {search ? `Results for "${search}"` : "Open auctions"}
        </h2>
        <button type="button" className="btn-secondary" onClick={reload}>Refresh</button>
      </div>

      <ErrorAlert error={error} onRetry={reload} />
      {loading && <Spinner label="Loading lots" />}
      {!loading && data?.length === 0 && (
        <EmptyState
          title="No lots match this filter"
          description="Try a different search, or check back when a seller lists something new."
        />
      )}

      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((item) => (
          <article key={item.id} className="card flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                  {item.category ?? "Lot"}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">{item.name}</h3>
              </div>
              <StatusBadge status={item.auction.status} />
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-slate-500">
              {item.description || "No description provided."}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-slate-500">Current bid</dt>
                <dd className="font-semibold text-slate-900">
                  <Money value={item.currentBid ?? item.startingPrice} />
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Bids</dt>
                <dd className="font-semibold text-slate-900">{item.bidCount}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Ends in</dt>
                <dd><Countdown endTime={item.auction.endTime} /></dd>
              </div>
              <div>
                <dt className="text-slate-500">Seller</dt>
                <dd className="truncate font-medium text-slate-700">{item.seller.username}</dd>
              </div>
            </dl>
            <Link to={`/products/${item.id}`} className="btn-primary mt-5">View lot</Link>
          </article>
        ))}
      </div>
    </div>
  );
}
