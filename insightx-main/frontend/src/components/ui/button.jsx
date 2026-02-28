import { clsx } from "clsx"

export function Button({ children, onClick, disabled, className, variant = "default" }) {
  const base = "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none"
  const variants = {
    default: "bg-[#10a37f] text-white hover:bg-[#0d8c6d] px-4 py-2",
    ghost: "bg-transparent text-[#8e8ea0] hover:bg-[#2f2f2f] hover:text-white px-3 py-2",
    outline: "border border-[#3f3f3f] bg-transparent text-[#ececec] hover:bg-[#2f2f2f] px-4 py-2"
  }
  return (
    <button onClick={onClick} disabled={disabled} className={clsx(base, variants[variant], className)}>
      {children}
    </button>
  )
}