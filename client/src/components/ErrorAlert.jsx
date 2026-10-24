export default function ErrorAlert({ error, onRetry }) {
  if (!error) return null;
  const minimum = error.details?.minimum;
  return (
    <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">
      <p className="font-semibold">{error.message}</p>
      {minimum !== undefined && <p className="mt-1">The minimum accepted amount is {minimum}.</p>}
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-2 font-semibold underline">
          Try again
        </button>
      )}
    </div>
  );
}
