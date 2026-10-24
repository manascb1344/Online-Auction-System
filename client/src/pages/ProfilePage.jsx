import { useCallback } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/client";
import { useApi } from "../api/useApi";
import { useAuth } from "../auth/AuthContext";
import EmptyState from "../components/EmptyState";
import ErrorAlert from "../components/ErrorAlert";
import Money from "../components/Money";
import Spinner from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";
import { formatDateTime } from "../utils/format";

export default function ProfilePage() {
  const { user } = useAuth();
  const loadMe = useCallback(() => api.me(), []);
  const loadBids = useCallback(() => api.myBids(), []);
  const loadTransactions = useCallback(() => api.myTransactions(), []);

  const profile = useApi(loadMe);
  const bids = useApi(loadBids);
  const transactions = useApi(loadTransactions);
  const account = profile.data?.user ?? user;

  return (
    <div className="space-y-6">
      <section className="card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Buyer account</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">{account.username}</h1>
            <p className="text-sm text-slate-500">{account.email}</p>
            {account.address && <p className="text-sm text-slate-500">{account.address}</p>}
          </div>
          <div className="rounded-xl bg-slate-900 px-5 py-4 text-right text-white">
            <p className="text-xs uppercase tracking-wide text-slate-400">Account balance</p>
            <p className="mt-1 text-2xl font-bold"><Money value={account.accountBalance} /></p>
          </div>
        </div>
        <ErrorAlert error={profile.error} onRetry={profile.reload} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900">My bids</h2>
          <ErrorAlert error={bids.error} onRetry={bids.reload} />
          {bids.loading ? (
            <Spinner label="Loading bids" />
          ) : bids.data?.length ? (
            <ul className="mt-3 divide-y divide-slate-100">
              {bids.data.map((bid) => (
                <li key={bid.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <Link className="truncate font-medium text-slate-900 hover:text-indigo-600" to={`/products/${bid.itemId}`}>
                      {bid.itemName}
                    </Link>
                    <p className="text-xs text-slate-500">{formatDateTime(bid.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-sm">
                    <Money value={bid.amount} />
                    <StatusBadge status={bid.status} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No bids yet" description="Browse the catalogue and place your first bid." />
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900">Transaction history</h2>
          <ErrorAlert error={transactions.error} onRetry={transactions.reload} />
          {transactions.loading ? (
            <Spinner label="Loading transactions" />
          ) : transactions.data?.length ? (
            <ul className="mt-3 divide-y divide-slate-100">
              {transactions.data.map((transaction) => (
                <li key={transaction.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{transaction.itemName}</p>
                    <p className="text-xs text-slate-500">
                      {transaction.paymentMethod} · {formatDateTime(transaction.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-sm">
                    <Money value={transaction.amount} />
                    <StatusBadge status={transaction.status} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No transactions yet" description="Won auctions will appear here once settled." />
          )}
        </div>
      </section>
    </div>
  );
}
