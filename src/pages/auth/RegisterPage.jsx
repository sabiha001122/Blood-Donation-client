// RegisterPage creates a new account and logs the user in on success.
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/UI/Input";
import Button from "../../components/UI/Button";

function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    const result = await register(form.name, form.email, form.password);
    setLoading(false);
    if (!result.success) {
      setError(result.message);
      return;
    }
    const destination = result.user?.role === "admin" ? "/admin" : "/";
    navigate(destination);
  };

  return (
    <div className="auth-shell">
      <div className="auth-grid">
        <div className="auth-hero hidden lg:flex">
          <span className="auth-badge">Join BloodCare</span>
          <h1 className="text-4xl font-semibold text-slate-900 font-display">
            Build a stronger donor community.
          </h1>
          <p className="text-base text-slate-600">
            Create your profile, share availability, and stay connected with requesters when every
            minute matters.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white/80 border border-white/70 p-4 shadow-sm">
              <p className="text-xs text-slate-500">Alerts</p>
              <p className="text-lg font-semibold text-slate-900">Smart</p>
            </div>
            <div className="rounded-2xl bg-white/80 border border-white/70 p-4 shadow-sm">
              <p className="text-xs text-slate-500">Profiles</p>
              <p className="text-lg font-semibold text-slate-900">Verified</p>
            </div>
            <div className="rounded-2xl bg-white/80 border border-white/70 p-4 shadow-sm">
              <p className="text-xs text-slate-500">Impact</p>
              <p className="text-lg font-semibold text-slate-900">Visible</p>
            </div>
          </div>
        </div>

        <div className="auth-card pop-in w-full max-w-md p-8 sm:p-10">
          <h1 className="text-2xl font-semibold text-slate-900 mb-2 font-display">
            Create an account
          </h1>
          <p className="text-sm text-slate-600 mb-6">
            Register to manage donors, donations, and institutions.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              required
            />
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
                  placeholder="Create a secure password"
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
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>

          <p className="text-sm text-slate-600 mt-6">
            Already have an account?{" "}
            <Link className="text-[#b81f2f] hover:text-[#d62828] font-semibold" to="/login">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
