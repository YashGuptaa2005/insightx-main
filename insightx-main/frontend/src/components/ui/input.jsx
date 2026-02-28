import { clsx } from "clsx"

export function Input({ value, onChange, onKeyDown, placeholder, className }) {
  return (
    <input
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className={clsx(
        "w-full bg-[#2f2f2f] text-[#ececec] placeholder-[#8e8ea0]",
        "rounded-xl px-4 py-3 text-sm border border-[#3f3f3f]",
        "focus:outline-none focus:border-[#10a37f] transition-colors",
        className
      )}
    />
  )
}