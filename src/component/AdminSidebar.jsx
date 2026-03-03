import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../utils/auth";

function AdminSidebar({ active }) {
  const navigate = useNavigate();
  const baseClass =
    "block px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-sm whitespace-nowrap";
  const activeClass =
    "px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-semibold text-sm whitespace-nowrap";

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  return (
    <aside className="w-full md:w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col py-4 md:py-6">
      <div className="px-4 md:px-6">
        <h1 className="text-lg font-bold text-primary">FYP Central</h1>
        <p className="text-xs text-slate-500 mt-1">Admin Portal</p>
        <nav className="mt-4 md:mt-8 flex flex-wrap gap-2 md:block md:space-y-2">
          {active === "dashboard" ? (
            <div className={activeClass}>Dashboard</div>
          ) : (
            <Link className={baseClass} to="/admin-dashboard-1">
              Dashboard
            </Link>
          )}

          {active === "user" ? (
            <div className={activeClass}>User</div>
          ) : (
            <Link className={baseClass} to="/admin-dashboard-2">
              User
            </Link>
          )}

          {active === "create-user" ? (
            <div className={activeClass}>Create User</div>
          ) : (
            <Link className={baseClass} to="/admin-dashboard-3">
              Create User
            </Link>
          )}

          <button className={`${baseClass} text-left w-full`} onClick={handleLogout} type="button">
            Logout
          </button>
        </nav>
      </div>
    </aside>
  );
}

export default AdminSidebar;
