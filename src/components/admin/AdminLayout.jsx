import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  CalendarRange,
  DollarSign,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { adminLogout } from "../../api/admin";
import { useAdminAuth } from "../../context/useAdminAuth";
import "./AdminLayout.css";

function AdminLayout() {
  const { admin, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await adminLogout();
    } catch {
      // The session may already be expired; sign out locally regardless.
    } finally {
      signOut();
      navigate("/admin/login", { replace: true });
    }
  };

  return (
    <div className="admin-shell">
      <div
        className={`admin-sidebar-backdrop ${navOpen ? "is-open" : ""}`}
        onClick={() => setNavOpen(false)}
        aria-hidden="true"
      />

      <aside className={`admin-sidebar ${navOpen ? "is-open" : ""}`}>
        <div className="admin-sidebar-brand">
          <img
            className="admin-brand-logo"
            src="/ImageAssistant_Batch_Image_Downloader/html.geekcodelab.com/Holiday_Planners_-_Travel_Tour_HTML5_Template/10015.png"
            alt="Holiday Planners"
          />
          <span className="admin-brand-sub">Admin</span>
        </div>

        <nav className="admin-sidebar-nav">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "is-active" : ""}`
            }
            onClick={() => setNavOpen(false)}
          >
            <LayoutDashboard size={18} />
            Overview
          </NavLink>
          <NavLink
            to="/admin/reservations"
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "is-active" : ""}`
            }
            onClick={() => setNavOpen(false)}
          >
            <CalendarRange size={18} />
            Reservations
          </NavLink>
          <NavLink
            to="/admin/finance"
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "is-active" : ""}`
            }
            onClick={() => setNavOpen(false)}
          >
            <DollarSign size={18} />
            Finance
          </NavLink>
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-menu-button"
            onClick={() => setNavOpen((open) => !open)}
            aria-label="Toggle navigation"
            aria-expanded={navOpen}
          >
            {navOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="admin-topbar-title">Holiday Planners Admin</span>
          <div className="admin-topbar-actions">
            {admin && (
              <span className="admin-identity">
                <span className="admin-avatar" aria-hidden="true">
                  {admin.username.charAt(0).toUpperCase()}
                </span>
                <span className="admin-username">{admin.username}</span>
              </span>
            )}
            <button
              type="button"
              className="admin-logout-button"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? (
                <Loader2 size={16} className="spinner" />
              ) : (
                <LogOut size={16} />
              )}
              <span>Log out</span>
            </button>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
