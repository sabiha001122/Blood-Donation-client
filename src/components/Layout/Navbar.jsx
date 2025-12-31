// Simple top navigation bar with brand, main links, and auth actions.
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/bloodcare-logo.svg";

const navLinkClass = ({ isActive }) =>
  `min-w-[70px] whitespace-nowrap text-center px-2.5 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
    isActive
      ? "bg-slate-900 text-white shadow-md"
      : "text-slate-700 hover:bg-white/80 hover:text-[#d62828]"
  }`;

const getAvatarUrl = (user) => {
  const seed = user?.name || user?.email || "User";
  return (
    user?.profilePicture ||
    `https://i.pravatar.cc/150?u=${encodeURIComponent(seed)}`
  );
};

function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const avatarUrl = getAvatarUrl(user);

  const handleLogoutClick = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white/70 backdrop-blur-xl shadow-[0_8px_24px_rgba(15,23,42,0.08)] border-b border-white/60 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img
            src={logo}
            alt="BloodCare logo"
            className="h-11 w-11 rounded-2xl object-contain bg-white shadow-sm border border-white/80"
            loading="lazy"
          />
          <span className="text-xl font-semibold text-slate-900 font-display tracking-tight">BloodCare</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1.5 flex-1 justify-center min-w-0 px-2">
          <NavLink to="/search" className={navLinkClass}>
            Find Donors
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/feed" className={navLinkClass}>
                Help Requests
              </NavLink>
              <NavLink to="/inbox" className={navLinkClass}>
                Inbox
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

        <div className="flex items-center gap-2 shrink-0">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center uppercase overflow-hidden">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={user?.name ? `${user.name} profile` : "User profile"}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span>{user?.name?.[0] || "U"}</span>
                  )}
                </div>
                <div className="leading-tight hidden lg:block">
                  <div className="font-semibold">{user?.name || "User"}</div>
                  <div className="text-xs text-slate-500">{user?.email}</div>
                </div>
              </div>
              <button
                onClick={handleLogoutClick}
                className="px-4 py-2 rounded-full text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition shadow-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#d62828] via-[#e1473b] to-[#f08c3b] hover:from-[#bf1f2f] hover:to-[#e6732d] transition shadow-md"
                style={{ color: "#fff" }}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-full text-sm font-semibold border border-[#f1c6b4] text-[#b81f2f] hover:bg-[#fff1e8] transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile nav when authenticated */}
      <div className="md:hidden bg-white border-t border-slate-100 px-3 py-2 flex gap-2 overflow-x-auto">
        <NavLink to="/search" className={navLinkClass}>
          Find
        </NavLink>
        {isAuthenticated ? (
          <>
            <NavLink to="/requests" className={navLinkClass}>
              Requests
            </NavLink>
            <NavLink to="/inbox" className={navLinkClass}>
              Inbox
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
