import { useCallback } from "react";

import { api } from "../api/client";
import { useApi } from "../api/useApi";
import EmptyState from "../components/EmptyState";
import ErrorAlert from "../components/ErrorAlert";
import Money from "../components/Money";
import Spinner from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";
import { formatDateTime } from "../utils/format";

export default function AdminBidsPage() {
  const load = useCallback(() => api.adminBids(), []);
  const bids = useApi(load);

  return (
    <section className="card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Bids</h1>
        <button type="button" className="btn-secondary" onClick={bids.reload}>Refresh</button>
      </div>
      <ErrorAlert error={bids.error} onRetry={bids.reload} />
      {bids.loading ? (
        <Spinner label="Loading bids" />
      ) : bids.data?.length ? (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="py-2 pr-4">Bidder</th>
                <th className="py-2 pr-4">Lot</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Placed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bids.data.map((bid) => (
                <tr key={bid.id}>
                  <td className="py-3 pr-4 font-medium text-slate-900">{bid.bidderUsername}</td>
                  <td className="py-3 pr-4 text-slate-700">{bid.itemName}</td>
                  <td className="py-3 pr-4"><Money value={bid.amount} /></td>
                  <td className="py-3 pr-4"><StatusBadge status={bid.status} /></td>
                  <td className="py-3 text-slate-500">{formatDateTime(bid.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No bids yet" />
      )}
    </section>
  );
}
