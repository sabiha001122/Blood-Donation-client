// Simple top navigation bar with brand, main links, and auth actions.
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navLinkClass = ({ isActive }) =>
  `min-w-[96px] text-center px-3 py-2 rounded-md text-sm font-semibold transition-all ${
    isActive
      ? "bg-gradient-to-r from-[#c8102e] to-[#e52b36] text-white hover:text-white focus:text-white !text-white shadow-sm"
      : "text-slate-700 hover:bg-[#fde6e8] hover:text-[#c8102e]"
  }`;

function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white/80 backdrop-blur shadow-sm border-b border-slate-100 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="https://img.icons8.com/?size=100&id=26115&format=png&color=000000"
            alt="BloodCare logo"
            className="h-10 w-10 rounded-lg object-contain"
            loading="lazy"
          />
          <span className="text-xl font-semibold text-slate-900">BloodCare</span>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          <NavLink to="/search" className={navLinkClass}>
            Find Donors
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/feed" className={navLinkClass}>
                Help Requests
              </NavLink>
              <NavLink to="/requests" className={navLinkClass}>
                Requests
              </NavLink>
              <NavLink to="/" className={navLinkClass} end>
                Dashboard
              </NavLink>
              <NavLink to="/donors" className={navLinkClass}>
                {isAdmin ? "Donors" : "My Donor Profile"}
              </NavLink>
              {isAdmin ? (
                <>
                  <NavLink to="/donations" className={navLinkClass}>
                    Donations
                  </NavLink>
                  <NavLink to="/institutions" className={navLinkClass}>
                    Institutions
                  </NavLink>
                  <NavLink to="/admin" className={navLinkClass}>
                    Admin Panel
                  </NavLink>
                </>
              ) : null}
            </>
          ) : null}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center uppercase">
                  {user?.name?.[0] || "U"}
                </div>
                <div className="leading-tight">
                  <div className="font-semibold">{user?.name || "User"}</div>
                  <div className="text-xs text-slate-500">{user?.email}</div>
                </div>
              </div>
              <button
                onClick={handleLogoutClick}
                className="px-4 py-2 rounded-md text-sm bg-slate-900 text-white hover:bg-slate-800 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-md text-sm font-semibold text-white bg-gradient-to-r from-[#c8102e] to-[#e52b36] hover:from-[#e52b36] hover:to-[#f34a54] transition shadow-sm"
                style={{ color: "#fff" }}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-md text-sm font-semibold border border-[#f4c3c5] text-[#c8102e] hover:bg-[#fde6e8] transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile nav when authenticated */}
      <div className="md:hidden bg-white border-t border-slate-100 px-4 py-2 flex gap-2 overflow-x-auto">
        <NavLink to="/search" className={navLinkClass}>
          Find
        </NavLink>
        {isAuthenticated ? (
          <>
            <NavLink to="/requests" className={navLinkClass}>
              Requests
            </NavLink>
            <NavLink to="/" className={navLinkClass} end>
              Dashboard
            </NavLink>
            <NavLink to="/donors" className={navLinkClass}>
              {isAdmin ? "Donors" : "My Profile"}
            </NavLink>
            {isAdmin ? (
              <>
                <NavLink to="/donations" className={navLinkClass}>
                  Donations
                </NavLink>
                <NavLink to="/institutions" className={navLinkClass}>
                  Institutions
                </NavLink>
                <NavLink to="/admin" className={navLinkClass}>
                  Admin
                </NavLink>
              </>
            ) : null}
          </>
        ) : null}
      </div>
    </header>
  );
}

export default Navbar;
