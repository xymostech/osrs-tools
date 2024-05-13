import classNames from "classnames";

export default function Checkbox({
  checked,
  onChange,
  className,
  ...restProps
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className={classNames(className, "max-h-10")}
      {...restProps}
    />
  );
}
