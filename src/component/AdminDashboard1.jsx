import { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import axios from "axios";
import { API_BASE_URL, getAuthConfig } from "../utils/auth";

function AdminDashboard1() {
  const [metrics, setMetrics] = useState({
    studentCount: 0,
    teacherCount: 0,
    committeeApproved: 0,
  });
  const [committeeQueue, setCommitteeQueue] = useState([]);
  const [adminEmail, setAdminEmail] = useState(localStorage.getItem("email") || "Admin");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reviewingProjectId, setReviewingProjectId] = useState("");

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/admin/dashboard/9165`,
        getAuthConfig()
      );
      const data = response?.data?.data || {};

      setMetrics({
        studentCount: data?.metrics?.studentCount || 0,
        teacherCount: data?.metrics?.teacherCount || 0,
        committeeApproved: data?.metrics?.committeeApproved || 0,
      });
      setCommitteeQueue(data?.committeeQueue || []);
      setAdminEmail(data?.currentAdmin?.email || localStorage.getItem("email") || "Admin");
    } catch (error) {
      setMetrics({ studentCount: 0, teacherCount: 0, committeeApproved: 0 });
      setCommitteeQueue([]);
      setErrorMessage(error?.response?.data?.message || "Failed to fetch dashboard summary.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCommitteeDecision = async (projectId, action) => {
    if (!projectId) return;

    setReviewingProjectId(projectId);
    setErrorMessage("");

    try {
      await axios.patch(
        `${API_BASE_URL}/api/user/project/${projectId}/committee/9165`,
        { action },
        getAuthConfig()
      );
      await fetchDashboardData();
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to submit committee decision.");
    } finally {
      setReviewingProjectId("");
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      <AdminSidebar active="dashboard" />

      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 md:px-8">
          <h2 className="font-bold text-sm sm:text-base">Academic Year Overview</h2>
          <div className="text-xs sm:text-sm text-slate-500">{adminEmail}</div>
        </header>

        <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <p className="text-slate-500 text-sm font-medium">Total Students</p>
              <h3 className="text-3xl font-bold mt-1">{metrics.studentCount}</h3>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <p className="text-slate-500 text-sm font-medium">Total Teachers</p>
              <h3 className="text-3xl font-bold mt-1">{metrics.teacherCount}</h3>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <p className="text-slate-500 text-sm font-medium">Committee Approved</p>
              <h3 className="text-3xl font-bold mt-1">{metrics.committeeApproved}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <h3 className="font-bold">Committee Approval Queue</h3>
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600"
                onClick={fetchDashboardData}
                disabled={isLoading}
              >
                {isLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Project Title</th>
                    <th className="px-6 py-4">Supervisor</th>
                    <th className="px-6 py-4">Teacher Status</th>
                    <th className="px-6 py-4">Committee</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {isLoading && (
                    <tr>
                      <td className="px-6 py-4 text-sm text-slate-500" colSpan="6">
                        Loading committee queue...
                      </td>
                    </tr>
                  )}

                  {!isLoading && errorMessage && (
                    <tr>
                      <td className="px-6 py-4 text-sm text-red-600" colSpan="6">
                        {errorMessage}
                      </td>
                    </tr>
                  )}

                  {!isLoading && !errorMessage && committeeQueue.length === 0 && (
                    <tr>
                      <td className="px-6 py-4 text-sm text-slate-500" colSpan="6">
                        No accepted proposals are waiting for committee decision.
                      </td>
                    </tr>
                  )}

                  {!isLoading &&
                    !errorMessage &&
                    committeeQueue.map((project) => (
                      <tr key={project._id}>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold">{project?.students?.name || "Unknown"}</p>
                          <p className="text-xs text-slate-500">{project?.students?.email || "-"}</p>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold">{project?.title || "-"}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{project?.supervisor || "-"}</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black">
                            Accepted
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black">
                            Pending
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              disabled={reviewingProjectId === project._id}
                              onClick={() => handleCommitteeDecision(project._id, "approve")}
                              className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 text-xs font-semibold disabled:opacity-60"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              disabled={reviewingProjectId === project._id}
                              onClick={() => handleCommitteeDecision(project._id, "reject")}
                              className="px-3 py-1.5 rounded-lg border border-red-300 bg-red-50 text-red-700 text-xs font-semibold disabled:opacity-60"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard1;
