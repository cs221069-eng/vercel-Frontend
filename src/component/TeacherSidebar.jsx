import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { logoutUser } from "../utils/auth";

function TeacherSidebar({ active = "dashboard" }) {
  const navigate = useNavigate();
  const [proposalBadgeCount, setProposalBadgeCount] = useState(0);

  const linkClass = (isActive) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
      isActive
        ? "bg-primary/10 text-primary font-semibold"
        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
    }`;

  useEffect(() => {
    const teacherId = localStorage.getItem("userId");
    if (!teacherId) {
      return undefined;
    }

    const seenKey = `teacher_seen_proposals_${teacherId}`;

    const syncProposalCount = async () => {
      try {
        const response = await axios.get(
          `https://vercel-backend-w7h5.vercel.app/api/user/project/teacher/${teacherId}/9165`
        );
        const total = (response?.data?.data || []).filter(
          (proposal) => (proposal?.proposalStatus || "pending") === "pending"
        ).length;

        if (active === "projects") {
          localStorage.setItem(seenKey, String(total));
          setProposalBadgeCount(0);
          return;
        }

        const seen = Number.parseInt(localStorage.getItem(seenKey) || "0", 10);
        const unread = Math.max(total - (Number.isNaN(seen) ? 0 : seen), 0);
        setProposalBadgeCount(unread);
      } catch {
        setProposalBadgeCount(0);
      }
    };

    syncProposalCount();
    const intervalId = setInterval(syncProposalCount, 30000);
    return () => clearInterval(intervalId);
  }, [active]);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed h-full">
      <div className="p-6 flex items-center gap-3">
        <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-white">
          <span className="material-symbols-outlined">school</span>
        </div>
        <div>
          <h1 className="text-primary font-bold text-lg leading-tight">FYP Portal</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
            Teacher Edition
          </p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        <Link to="/teacher-dashboard-1" className={linkClass(active === "dashboard")}>
          <span className="material-symbols-outlined">dashboard</span>
          <span>Dashboard</span>
        </Link>
        <Link to="/teacher-dashboard-2" className={linkClass(active === "students")}>
          <span className="material-symbols-outlined">group</span>
          <span>My Students</span>
        </Link>
        <Link
          to="/teacher-projects"
          className={linkClass(active === "projects")}
        >
          <span className="relative inline-flex">
            <span className="material-symbols-outlined">assignment</span>
            {proposalBadgeCount > 0 && (
              <span className="absolute -top-2 -right-3 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {proposalBadgeCount > 9 ? "9+" : proposalBadgeCount}
              </span>
            )}
          </span>
          <span>Projects</span>
        </Link>
        <Link to="/teacher-reports" className={linkClass(active === "reports")}>
          <span className="material-symbols-outlined">assessment</span>
          <span>Reports</span>
        </Link>
      </nav>

      <div className="p-4 space-y-3 mt-auto">
        <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-xl border border-primary/10">
          <p className="text-xs font-semibold text-primary uppercase mb-1">Upcoming Deadline</p>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Phase 1 Submissions</p>
          <p className="text-xs text-slate-500 mt-1">Oct 24, 2023</p>
        </div>
        <button
          className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all"
          type="button"
          onClick={handleLogout}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export default TeacherSidebar;

