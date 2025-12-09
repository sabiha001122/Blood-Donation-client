// Reusable button with a brighter primary style.
function Button({ children, className = "", type = "button", ...rest }) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-semibold text-white transition-all shadow-sm bg-gradient-to-r from-[#c8102e] to-[#e52b36] hover:from-[#e52b36] hover:to-[#f34a54] active:from-[#c8102e] active:to-[#e52b36] ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export default Button;
