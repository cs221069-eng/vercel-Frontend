import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import TeacherSidebar from "./TeacherSidebar";

function TeacherReports() {
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [proposalFilter, setProposalFilter] = useState("all");
  const [committeeFilter, setCommitteeFilter] = useState("all");

  const fetchReports = async () => {
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
        `https://vercel-backend-w7h5.vercel.app/api/user/teacher/reports/${teacherId}/9165`
      );
      setReportData(response?.data?.data || null);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to fetch reports.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredRows = useMemo(() => {
    const rows = reportData?.students || [];
    const query = searchTerm.trim().toLowerCase();

    return rows.filter((row) => {
      const proposalMatch = proposalFilter === "all" || row.proposalStatus === proposalFilter;
      const committeeMatch = committeeFilter === "all" || row.committeeStatus === committeeFilter;
      const queryMatch =
        !query ||
        `${row.name} ${row.email} ${row.projectTitle} ${row.department}`
          .toLowerCase()
          .includes(query);
      return proposalMatch && committeeMatch && queryMatch;
    });
  }, [reportData, searchTerm, proposalFilter, committeeFilter]);

  const downloadCsv = () => {
    const headers = [
      "Student",
      "Email",
      "Department",
      "Project",
      "Proposal Status",
      "Committee Status",
      "Pending Tasks",
      "Completed Tasks",
      "Completion Rate",
      "Submissions",
      "Last Submission",
      "Last Student Message",
    ];

    const rows = filteredRows.map((row) => [
      row.name || "",
      row.email || "",
      row.department || "",
      row.projectTitle || "",
      row.proposalStatus || "",
      row.committeeStatus || "",
      row.pendingTaskCount || 0,
      row.completedTaskCount || 0,
      `${row.completionRate || 0}%`,
      row.submissionCount || 0,
      row.lastSubmissionAt ? new Date(row.lastSubmissionAt).toLocaleString() : "",
      row.lastStudentMessageAt ? new Date(row.lastStudentMessageAt).toLocaleString() : "",
    ]);

    const csvContent = [headers, ...rows]
      .map((line) =>
        line
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "teacher_reports.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const summary = reportData?.summary || {};
  const monthly = reportData?.monthlyActivity || [];
  const maxMonthly = Math.max(
    1,
    ...monthly.map((m) => m.submissions + m.studentMessages + m.tasksCompleted)
  );

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      <TeacherSidebar active="reports" />

      <main className="flex-1 ml-64">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-lg font-bold">Reports</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchReports}
              className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={downloadCsv}
              disabled={filteredRows.length === 0}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold disabled:opacity-60"
            >
              Export CSV
            </button>
          </div>
        </header>

        <div className="p-8 space-y-6">
          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          )}

          {isLoading && <p className="text-slate-500">Loading reports...</p>}

          {!isLoading && reportData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Students</p>
                  <p className="text-2xl font-bold mt-2">{summary.totalStudents || 0}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Projects</p>
                  <p className="text-2xl font-bold mt-2">{summary.totalProjects || 0}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Submissions</p>
                  <p className="text-2xl font-bold mt-2">{summary.totalSubmissions || 0}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Completion</p>
                  <p className="text-2xl font-bold mt-2">{summary.overallCompletionRate || 0}%</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    className="rounded-lg bg-slate-100 dark:bg-slate-800 border-none px-3 py-2.5 text-sm"
                    placeholder="Search student/project..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <select
                    className="rounded-lg bg-slate-100 dark:bg-slate-800 border-none px-3 py-2.5 text-sm"
                    value={proposalFilter}
                    onChange={(e) => setProposalFilter(e.target.value)}
                  >
                    <option value="all">All Proposal Status</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <select
                    className="rounded-lg bg-slate-100 dark:bg-slate-800 border-none px-3 py-2.5 text-sm"
                    value={committeeFilter}
                    onChange={(e) => setCommitteeFilter(e.target.value)}
                  >
                    <option value="all">All Committee Status</option>
                    <option value="not_started">Not Started</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <div className="rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2.5 text-sm">
                    {filteredRows.length} row(s)
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Student</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Project</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Proposal</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Committee</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Tasks</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Submissions</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Completion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredRows.length === 0 && (
                        <tr>
                          <td className="px-5 py-4 text-sm text-slate-500" colSpan="7">
                            No report rows found.
                          </td>
                        </tr>
                      )}
                      {filteredRows.map((row) => (
                        <tr key={row.studentId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold">{row.name}</p>
                            <p className="text-xs text-slate-500">{row.email}</p>
                          </td>
                          <td className="px-5 py-4 text-sm">
                            <p>{row.projectTitle || "-"}</p>
                            <p className="text-xs text-slate-500">{row.department || "-"}</p>
                          </td>
                          <td className="px-5 py-4 text-sm capitalize">{row.proposalStatus || "-"}</td>
                          <td className="px-5 py-4 text-sm capitalize">{row.committeeStatus || "-"}</td>
                          <td className="px-5 py-4 text-sm">{row.pendingTaskCount} / {row.completedTaskCount}</td>
                          <td className="px-5 py-4 text-sm">{row.submissionCount}</td>
                          <td className="px-5 py-4 text-sm font-semibold">{row.completionRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4">Monthly Activity (Last 6 Months)</h3>
                <div className="space-y-3">
                  {monthly.map((item) => {
                    const value = item.submissions + item.studentMessages + item.tasksCompleted;
                    const width = Math.round((value / maxMonthly) * 100);
                    return (
                      <div key={item.key}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold">{item.label}</span>
                          <span className="text-slate-500">
                            {item.submissions} submissions, {item.studentMessages} messages, {item.tasksCompleted} tasks completed
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default TeacherReports;



