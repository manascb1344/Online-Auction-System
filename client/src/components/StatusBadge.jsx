const STYLES = {
  active: "bg-emerald-100 text-emerald-700",
  scheduled: "bg-sky-100 text-sky-700",
  closed: "bg-slate-200 text-slate-600",
  winning: "bg-emerald-100 text-emerald-700",
  outbid: "bg-amber-100 text-amber-700",
  won: "bg-indigo-100 text-indigo-700",
  lost: "bg-slate-200 text-slate-600",
  completed: "bg-emerald-100 text-emerald-700",
  refunded: "bg-rose-100 text-rose-700",
};

export default function StatusBadge({ status }) {
  const style = STYLES[status] ?? "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${style}`}>
      {status}
    </span>
  );
}
