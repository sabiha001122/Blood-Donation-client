// Reusable button with a brighter primary style.
function Button({ children, className = "", type = "button", ...rest }) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-semibold text-white transition-all shadow-[0_12px_24px_rgba(214,40,40,0.2)] bg-gradient-to-r from-[#d62828] via-[#e1473b] to-[#f08c3b] hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(214,40,40,0.3)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3b37a] ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export default Button;
