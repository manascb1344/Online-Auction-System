import { useCallback } from "react";

import { api } from "../api/client";
import { useApi } from "../api/useApi";
import EmptyState from "../components/EmptyState";
import ErrorAlert from "../components/ErrorAlert";
import Money from "../components/Money";
import Spinner from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";
import { formatDateTime } from "../utils/format";

export default function AdminTransactionsPage() {
  const load = useCallback(() => api.adminTransactions(), []);
  const transactions = useApi(load);

  return (
    <section className="card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
        <button type="button" className="btn-secondary" onClick={transactions.reload}>Refresh</button>
      </div>
      <ErrorAlert error={transactions.error} onRetry={transactions.reload} />
      {transactions.loading ? (
        <Spinner label="Loading transactions" />
      ) : transactions.data?.length ? (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="py-2 pr-4">Lot</th>
                <th className="py-2 pr-4">Buyer</th>
                <th className="py-2 pr-4">Seller</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Method</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Settled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.data.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="py-3 pr-4 font-medium text-slate-900">{transaction.itemName}</td>
                  <td className="py-3 pr-4 text-slate-700">{transaction.buyerUsername}</td>
                  <td className="py-3 pr-4 text-slate-700">{transaction.sellerUsername}</td>
                  <td className="py-3 pr-4"><Money value={transaction.amount} /></td>
                  <td className="py-3 pr-4 capitalize text-slate-700">{transaction.paymentMethod.replace("_", " ")}</td>
                  <td className="py-3 pr-4"><StatusBadge status={transaction.status} /></td>
                  <td className="py-3 text-slate-500">{formatDateTime(transaction.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No transactions yet" />
      )}
    </section>
  );
}
