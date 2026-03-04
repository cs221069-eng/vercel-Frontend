import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import TeacherSidebar from "./TeacherSidebar";

function TeacherDashboard1() {
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDashboard = async () => {
    const teacherId = localStorage.getItem("userId");
    if (!teacherId) {
      setErrorMessage("Teacher id not found. Please login again.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await axios.get(
        `https://vercel-backend-w7h5.vercel.app/api/user/teacher/dashboard/${teacherId}/9165`
      );
      setDashboard(response?.data?.data || null);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to fetch teacher dashboard.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const filteredActivities = useMemo(() => {
    const activities = dashboard?.recentActivities || [];
    const query = searchTerm.trim().toLowerCase();
    if (!query) return activities;
    return activities.filter((activity) =>
      `${activity?.studentName || ""} ${activity?.message || ""}`
        .toLowerCase()
        .includes(query)
    );
  }, [dashboard, searchTerm]);

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      <TeacherSidebar active="dashboard" />

      <main className="flex-1 ml-64">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-sm"
              placeholder="Search activity..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold"
            onClick={fetchDashboard}
          >
            Refresh
          </button>
        </header>

        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Teacher Overview</h2>
            <p className="text-slate-500 dark:text-slate-400">
              Supervision analytics and latest student updates.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          )}

          {isLoading && <p className="text-slate-500">Loading dashboard...</p>}

          {!isLoading && dashboard && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <p className="text-slate-500 text-sm font-medium">Assigned Students</p>
                  <h3 className="text-3xl font-bold mt-2">{dashboard?.summary?.assignedStudents || 0}</h3>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <p className="text-slate-500 text-sm font-medium">Pending Reviews</p>
                  <h3 className="text-3xl font-bold mt-2">{dashboard?.summary?.pendingReviews || 0}</h3>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <p className="text-slate-500 text-sm font-medium">Approved Projects</p>
                  <h3 className="text-3xl font-bold mt-2">{dashboard?.summary?.approvedProjects || 0}</h3>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <p className="text-slate-500 text-sm font-medium">Student Notifications</p>
                  <h3 className="text-3xl font-bold mt-2">{dashboard?.summary?.studentNotifications || 0}</h3>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {filteredActivities.length === 0 && (
                    <p className="text-sm text-slate-500">No activity found.</p>
                  )}
                  {filteredActivities.map((activity, index) => (
                    <div key={`${activity.createdAt}-${index}`} className="rounded-lg border border-slate-200 p-3">
                      <p className="text-sm font-semibold">{activity.studentName || "Student"}</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{activity.message}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {activity.createdAt ? new Date(activity.createdAt).toLocaleString() : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default TeacherDashboard1;

