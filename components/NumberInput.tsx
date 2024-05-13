export default function NumberInput({
  value,
  onChange,
  ...restProps
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <input
      type="number"
      className="bg-transparent border border-slate-400 p-1 rounded"
      value={value.toString()}
      onChange={(e) => onChange(parseInt(e.target.value))}
      {...restProps}
    />
  );
}
