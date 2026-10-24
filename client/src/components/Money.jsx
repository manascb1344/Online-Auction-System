const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export default function Money({ value }) {
  return <>{formatter.format(Number(value) || 0)}</>;
}
