import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link to="/products" className="text-lg font-bold tracking-tight text-slate-900">
            Auction<span className="text-indigo-600">House</span>
          </Link>

          <nav className="-mx-1 flex flex-wrap items-center gap-1">
            <NavItem to="/products">Browse</NavItem>
            {user?.role === "buyer" && <NavItem to="/profile">My activity</NavItem>}
            {user?.role === "seller" && <NavItem to="/seller">Seller studio</NavItem>}
            {user?.role === "admin" && (
              <>
                <NavItem to="/admin">Overview</NavItem>
                <NavItem to="/admin/auctions">Auctions</NavItem>
                <NavItem to="/admin/bids">Bids</NavItem>
                <NavItem to="/admin/transactions">Transactions</NavItem>
              </>
            )}
          </nav>

          <div className="flex items-center gap-3 text-sm">
            {user ? (
              <>
                <span className="hidden text-slate-500 sm:inline">
                  {user.username} <span className="text-slate-400">· {user.role}</span>
                </span>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link className="font-medium text-slate-600 hover:text-slate-900" to="/login">
                  Sign in
                </Link>
                <Link className="btn-primary" to="/register">
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500">
        Online Auction System · Express · MySQL 8 / PostgreSQL 16 · React 18
      </footer>
    </div>
  );
}
