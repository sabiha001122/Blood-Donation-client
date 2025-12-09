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
    <div className="flex items-center justify-center py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">Create an account</h1>
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
          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Choose a strong password"
            required
          />
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <Button type="submit" className="w-full">
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>

        <p className="text-sm text-slate-600 mt-6">
          Already have an account?{" "}
          <Link className="text-red-600 hover:text-red-700 font-semibold" to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
