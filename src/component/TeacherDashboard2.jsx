import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import TeacherSidebar from "./TeacherSidebar";

function TeacherDashboard2() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchStudents = async () => {
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
      setStudents(response?.data?.data?.students || []);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to fetch students.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return students;
    return students.filter((student) =>
      `${student?.name || ""} ${student?.email || ""} ${student?.projectTitle || ""} ${student?.department || ""}`
        .toLowerCase()
        .includes(query)
    );
  }, [students, searchTerm]);

  const getStatusLabel = (status) => {
    if (status === "accepted") return "Accepted";
    if (status === "rejected") return "Rejected";
    return "Pending";
  };

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      <TeacherSidebar active="students" />

      <main className="flex-1 ml-64">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-lg font-bold">Assigned Students</h1>
          <div className="flex items-center gap-3 w-full max-w-xl">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                placeholder="Search student..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={fetchStudents}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold"
            >
              Refresh
            </button>
          </div>
        </header>

        <div className="p-8">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Student</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Project</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Department</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Tasks</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Submissions</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading && (
                  <tr>
                    <td className="px-6 py-4 text-sm text-slate-500" colSpan="6">
                      Loading students...
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

                {!isLoading && !errorMessage && filteredStudents.length === 0 && (
                  <tr>
                    <td className="px-6 py-4 text-sm text-slate-500" colSpan="6">
                      No students found.
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  !errorMessage &&
                  filteredStudents.map((student) => (
                    <tr key={student.studentId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold">{student.name}</p>
                        <p className="text-xs text-slate-500">{student.email}</p>
                      </td>
                      <td className="px-6 py-4 text-sm">{student.projectTitle || "No project title"}</td>
                      <td className="px-6 py-4 text-sm">{student.department || "-"}</td>
                      <td className="px-6 py-4 text-sm">
                        {student.pendingTasks || 0} pending / {student.completedTasks || 0} completed
                      </td>
                      <td className="px-6 py-4 text-sm">{student.submissions || 0}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                          {getStatusLabel(student.projectStatus)}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TeacherDashboard2;

