import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { logout } from "../../redux/slices/authSlice";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out");
    navigate("/");
  };

  return (
    <nav className="border-b border-dark-600 bg-dark-800/50 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-primary-400">
          ⚡ CodeArena
        </Link>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/problems" className="text-gray-300 hover:text-primary-400 transition-colors text-sm font-medium">
            Problems
          </Link>
          <Link to="/contests" className="text-gray-300 hover:text-primary-400 transition-colors text-sm font-medium">
            Contests
          </Link>
          <Link to="/leaderboard" className="text-gray-300 hover:text-primary-400 transition-colors text-sm font-medium">
            Leaderboard
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-dark-600 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-gray-200 hidden sm:block">{user.name}</span>
                <span className="text-xs text-gray-500">▼</span>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-dark-800 border border-dark-600 rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-dark-600">
                      <div className="text-sm font-medium text-white">{user.name}</div>
                      <div className="text-xs text-gray-500 truncate">{user.email}</div>
                      <div className="text-xs text-primary-400 mt-1">
                        {user.role === "admin" ? "👑 Admin" : "👤 User"}
                      </div>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-dark-700"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-dark-700"
                    >
                      Profile
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        to="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-primary-400 hover:bg-dark-700"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-dark-700 border-t border-dark-600"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-secondary text-sm">
                Login
              </Link>
              <Link to="/register" className="btn-primary text-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}