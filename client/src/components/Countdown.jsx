import { useEffect, useState } from "react";

function format(remaining) {
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  return `${days > 0 ? `${days}d ` : ""}${hours}h ${minutes}m ${seconds}s`;
}

export default function Countdown({ endTime }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const target = new Date(endTime).getTime();
  if (!Number.isFinite(target)) return <span className="text-slate-400">-</span>;

  const remaining = target - now;
  if (remaining <= 0) return <span className="font-semibold text-rose-600">Ended</span>;

  return (
    <span className={remaining < 3600000 ? "font-semibold text-amber-600" : "text-slate-600"}>
      {format(remaining)}
    </span>
  );
}
