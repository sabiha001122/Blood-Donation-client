// LoginPage allows existing users to sign in.
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/UI/Input";
import Button from "../../components/UI/Button";

function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in, move to dashboard.
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);

    if (!result.success) {
      setError(result.message);
      return;
    }
    // Redirect admins to admin dashboard, others to main dashboard.
    const destination = result.user?.role === "admin" ? "/admin" : "/";
    navigate(destination);
  };

  return (
    <div className="auth-shell">
      <div className="auth-grid">
        <div className="auth-hero hidden lg:flex">
          <span className="auth-badge">Community Blood Network</span>
          <h1 className="text-4xl font-semibold text-slate-900 font-display">
            Make every donation count.
          </h1>
          <p className="text-base text-slate-600">
            Coordinate donors, respond faster to emergencies, and keep your impact visible in one
            secure dashboard.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white/80 border border-white/70 p-4 shadow-sm">
              <p className="text-xs text-slate-500">Response</p>
              <p className="text-lg font-semibold text-slate-900">Fast</p>
            </div>
            <div className="rounded-2xl bg-white/80 border border-white/70 p-4 shadow-sm">
              <p className="text-xs text-slate-500">Coverage</p>
              <p className="text-lg font-semibold text-slate-900">Nationwide</p>
            </div>
            <div className="rounded-2xl bg-white/80 border border-white/70 p-4 shadow-sm">
              <p className="text-xs text-slate-500">Support</p>
              <p className="text-lg font-semibold text-slate-900">24/7</p>
            </div>
          </div>
        </div>

        <div className="auth-card pop-in w-full max-w-md p-8 sm:p-10">
          <h1 className="text-2xl font-semibold text-slate-900 mb-2 font-display">
            Welcome back
          </h1>
          <p className="text-sm text-slate-600 mb-6">Sign in to manage your donors and requests.</p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
            <div className="w-full">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-xl border px-3 py-2 pr-14 text-sm bg-white/90 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f3b37a] focus:border-[#e1473b] border-slate-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                      <circle cx="12" cy="12" r="3" />
                      <path d="M3 3l18 18" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit" className="w-full">
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <p className="text-sm text-slate-600 mt-6">
            Need an account?{" "}
            <Link className="text-[#b81f2f] hover:text-[#d62828] font-semibold" to="/register">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
