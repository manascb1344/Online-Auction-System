import { useCallback } from "react";

import { api } from "../api/client";
import { useApi } from "../api/useApi";
import EmptyState from "../components/EmptyState";
import ErrorAlert from "../components/ErrorAlert";
import Money from "../components/Money";
import Spinner from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";
import { formatDateTime } from "../utils/format";

export default function AdminAuctionsPage() {
  const load = useCallback(() => api.adminAuctions(), []);
  const auctions = useApi(load);

  return (
    <section className="card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Auctions</h1>
        <button type="button" className="btn-secondary" onClick={auctions.reload}>Refresh</button>
      </div>
      <ErrorAlert error={auctions.error} onRetry={auctions.reload} />
      {auctions.loading ? (
        <Spinner label="Loading auctions" />
      ) : auctions.data?.length ? (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="py-2 pr-4">Lot</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Reserve</th>
                <th className="py-2 pr-4">Current bid</th>
                <th className="py-2">Window</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auctions.data.map((auction) => (
                <tr key={auction.id}>
                  <td className="py-3 pr-4 font-medium text-slate-900">{auction.itemName}</td>
                  <td className="py-3 pr-4"><StatusBadge status={auction.status} /></td>
                  <td className="py-3 pr-4"><Money value={auction.reservePrice} /></td>
                  <td className="py-3 pr-4"><Money value={auction.currentBid ?? auction.reservePrice} /></td>
                  <td className="py-3 text-slate-500">
                    {formatDateTime(auction.startTime)} → {formatDateTime(auction.endTime)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No auctions yet" />
      )}
    </section>
  );
}
