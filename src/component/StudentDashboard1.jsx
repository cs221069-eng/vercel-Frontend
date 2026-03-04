import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { logoutUser } from "../utils/auth";

function StudentDashboard1() {
  const navigate = useNavigate();
  const location = useLocation();

  const timelineRef = useRef(null);
  const supervisorRef = useRef(null);
  const resourcesRef = useRef(null);

  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
  });
  const [isAddingTask, setIsAddingTask] = useState(false);

  const [submissionForm, setSubmissionForm] = useState({
    title: "",
    description: "",
  });
  const [submissionFiles, setSubmissionFiles] = useState([]);
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);

  const [resourceForm, setResourceForm] = useState({
    title: "",
    category: "general",
    url: "",
  });
  const [isAddingResource, setIsAddingResource] = useState(false);

  const [supervisorMessage, setSupervisorMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const studentId = localStorage.getItem("userId");

  const fetchDashboard = useCallback(async () => {
    if (!studentId) {
      setErrorMessage("Student id not found. Please login again.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.get(
        `https://vercel-backend-w7h5.vercel.app/api/user/student/dashboard/${studentId}/9165`
      );
      setDashboard(response?.data?.data || null);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Failed to load student dashboard."
      );
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    const section = new URLSearchParams(location.search).get("section");
    if (section === "timeline") timelineRef.current?.scrollIntoView({ behavior: "smooth" });
    if (section === "supervisor") supervisorRef.current?.scrollIntoView({ behavior: "smooth" });
    if (section === "resources") resourcesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [location.search, dashboard]);

  const activityItems = useMemo(
    () => dashboard?.recentActivities || [],
    [dashboard]
  );

  const pendingTaskItems = useMemo(
    () => dashboard?.pendingTasks || [],
    [dashboard]
  );
  const completedTaskItems = useMemo(
    () => dashboard?.completedTasks || [],
    [dashboard]
  );

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim() || !studentId) return;

    setIsAddingTask(true);
    try {
      await axios.post(
        `https://vercel-backend-w7h5.vercel.app/api/user/student/dashboard/task/${studentId}/9165`,
        taskForm
      );
      setTaskForm({ title: "", description: "", priority: "medium", dueDate: "" });
      await fetchDashboard();
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to add task.");
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleTaskStatusChange = async (taskId, status) => {
    if (!studentId || !taskId) return;
    try {
      await axios.patch(
        `https://vercel-backend-w7h5.vercel.app/api/user/student/dashboard/task/${studentId}/${taskId}/9165`,
        { status }
      );
      await fetchDashboard();
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to update task.");
    }
  };

  const handleSubmitWork = async (e) => {
    e.preventDefault();
    if (!submissionForm.title.trim() || !studentId) return;

    setIsSubmittingWork(true);
    try {
      const formData = new FormData();
      formData.append("title", submissionForm.title);
      formData.append("description", submissionForm.description);
      submissionFiles.forEach((file) => formData.append("documents", file));

      await axios.post(
        `https://vercel-backend-w7h5.vercel.app/api/user/student/dashboard/work/${studentId}/9165`,
        formData
      );

      setSubmissionForm({ title: "", description: "" });
      setSubmissionFiles([]);
      await fetchDashboard();
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to submit work.");
    } finally {
      setIsSubmittingWork(false);
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    if (!resourceForm.title.trim() || !resourceForm.url.trim() || !studentId) return;

    setIsAddingResource(true);
    try {
      await axios.post(
        `https://vercel-backend-w7h5.vercel.app/api/user/student/dashboard/resource/${studentId}/9165`,
        resourceForm
      );
      setResourceForm({ title: "", category: "general", url: "" });
      await fetchDashboard();
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to add resource.");
    } finally {
      setIsAddingResource(false);
    }
  };

  const handleSendSupervisorMessage = async (e) => {
    e.preventDefault();
    if (!supervisorMessage.trim() || !studentId) return;

    setIsSendingMessage(true);
    try {
      await axios.post(
        `https://vercel-backend-w7h5.vercel.app/api/user/student/dashboard/message/${studentId}/9165`,
        { message: supervisorMessage }
      );
      setSupervisorMessage("");
      await fetchDashboard();
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to send message.");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-primary rounded-lg p-1.5 text-white">
            <span className="material-symbols-outlined">terminal</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-primary">FYP Portal</h2>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <Link className="flex items-center gap-3 px-3 py-2.5 bg-primary text-white rounded-lg font-medium" to="/student-dashboard-1">
            <span className="material-symbols-outlined text-lg">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <Link className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium" to="/student-dashboard-2">
            <span className="material-symbols-outlined text-lg">folder_open</span>
            <span>Project</span>
          </Link>
          <Link className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium" to="/student-dashboard-1?section=timeline">
            <span className="material-symbols-outlined text-lg">timeline</span>
            <span>Timeline</span>
          </Link>
          <Link className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium" to="/student-dashboard-1?section=supervisor">
            <span className="material-symbols-outlined text-lg">group</span>
            <span>Supervisor</span>
          </Link>
          <Link className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium" to="/student-dashboard-1?section=resources">
            <span className="material-symbols-outlined text-lg">library_books</span>
            <span>Resources</span>
          </Link>
        </nav>
        <div className="p-4 mt-auto">
          <button
            className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 py-2 rounded-lg text-slate-700 font-semibold transition-all"
            onClick={handleLogout}
            type="button"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Student Dashboard</h1>
            <p className="text-slate-500 mt-1">
              {dashboard?.student?.name ? `Welcome ${dashboard.student.name}` : "Track your full FYP workflow"}
            </p>
          </div>
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-primary text-white font-semibold"
            onClick={fetchDashboard}
          >
            Refresh
          </button>
        </div>

        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        )}

        {isLoading && <p className="text-slate-500">Loading dashboard...</p>}

        {!isLoading && dashboard && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <p className="text-slate-500 text-sm">Total Tasks</p>
                <h3 className="text-2xl font-bold">{dashboard?.stats?.totalTasks || 0}</h3>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <p className="text-slate-500 text-sm">Completed</p>
                <h3 className="text-2xl font-bold">{dashboard?.stats?.completedTasks || 0}</h3>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <p className="text-slate-500 text-sm">Pending</p>
                <h3 className="text-2xl font-bold">{dashboard?.stats?.pendingTasks || 0}</h3>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <p className="text-slate-500 text-sm">Submissions</p>
                <h3 className="text-2xl font-bold">{dashboard?.stats?.submissions || 0}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <section className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Tasks</h3>
                  </div>
                  <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
                    <input
                      className="md:col-span-2 rounded-lg border-slate-200"
                      placeholder="Task title"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm((prev) => ({ ...prev, title: e.target.value }))}
                      required
                    />
                    <select
                      className="rounded-lg border-slate-200"
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm((prev) => ({ ...prev, priority: e.target.value }))}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <input
                      type="date"
                      className="rounded-lg border-slate-200"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                    />
                    <textarea
                      className="md:col-span-4 rounded-lg border-slate-200"
                      rows="2"
                      placeholder="Task description"
                      value={taskForm.description}
                      onChange={(e) => setTaskForm((prev) => ({ ...prev, description: e.target.value }))}
                    />
                    <button
                      type="submit"
                      disabled={isAddingTask}
                      className="md:col-span-4 rounded-lg bg-primary text-white py-2.5 font-semibold disabled:opacity-70"
                    >
                      {isAddingTask ? "Adding Task..." : "Add Task"}
                    </button>
                  </form>

                  <div className="space-y-5">
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-2">Pending</h4>
                      <div className="space-y-2">
                        {pendingTaskItems.length === 0 && (
                          <p className="text-sm text-slate-500">No pending tasks.</p>
                        )}
                        {pendingTaskItems.map((task) => (
                          <div key={task._id} className="rounded-lg border border-slate-200 p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <div>
                              <p className="font-semibold text-sm">{task.title}</p>
                              <p className="text-xs text-slate-500">
                                {task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : "No due date"} | Priority: {task.priority}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleTaskStatusChange(task._id, "completed")}
                              className="rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-700 px-3 py-1.5 text-xs font-semibold"
                            >
                              Mark Complete
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-2">Completed</h4>
                      <div className="space-y-2">
                        {completedTaskItems.length === 0 && (
                          <p className="text-sm text-slate-500">No completed tasks yet.</p>
                        )}
                        {completedTaskItems.map((task) => (
                          <div key={task._id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <div>
                              <p className="font-semibold text-sm">{task.title}</p>
                              <p className="text-xs text-slate-500">
                                Completed {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : ""}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleTaskStatusChange(task._id, "pending")}
                              className="rounded-lg bg-amber-50 border border-amber-300 text-amber-700 px-3 py-1.5 text-xs font-semibold"
                            >
                              Move To Pending
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-bold mb-4">Submit Work</h3>
                  <form onSubmit={handleSubmitWork} className="space-y-3">
                    <input
                      className="w-full rounded-lg border-slate-200"
                      placeholder="Submission title"
                      value={submissionForm.title}
                      onChange={(e) => setSubmissionForm((prev) => ({ ...prev, title: e.target.value }))}
                      required
                    />
                    <textarea
                      className="w-full rounded-lg border-slate-200"
                      rows="3"
                      placeholder="Description"
                      value={submissionForm.description}
                      onChange={(e) => setSubmissionForm((prev) => ({ ...prev, description: e.target.value }))}
                    />
                    <input
                      type="file"
                      multiple
                      onChange={(e) => setSubmissionFiles(Array.from(e.target.files || []))}
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingWork}
                      className="rounded-lg bg-primary text-white px-4 py-2.5 font-semibold disabled:opacity-70"
                    >
                      {isSubmittingWork ? "Submitting..." : "Submit"}
                    </button>
                  </form>
                </section>

                <section ref={timelineRef} className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-bold mb-4">Project Timeline</h3>
                  <div className="space-y-3">
                    {(dashboard?.timeline || []).map((item) => (
                      <div key={item.key} className="rounded-lg border border-slate-200 p-3">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">{item.label}</p>
                          <span className="text-xs uppercase text-slate-500">{item.status}</span>
                        </div>
                        <p className="text-xs text-slate-500">{item.description}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {item.date ? new Date(item.date).toLocaleString() : "No date yet"}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <section className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {activityItems.length === 0 && <p className="text-sm text-slate-500">No activity yet.</p>}
                    {activityItems.map((activity, index) => (
                      <div key={`${activity.createdAt}-${index}`} className="rounded-lg bg-slate-50 p-3">
                        <p className="text-sm">{activity.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{new Date(activity.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-bold mb-4">Upcoming Deadlines</h3>
                  <div className="space-y-3">
                    {(dashboard?.upcomingDeadlines || []).length === 0 && (
                      <p className="text-sm text-slate-500">No upcoming deadlines.</p>
                    )}
                    {(dashboard?.upcomingDeadlines || []).map((deadline) => (
                      <div key={deadline.id} className="rounded-lg border border-slate-200 p-3">
                        <p className="text-sm font-semibold">{deadline.title}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(deadline.dueDate).toLocaleDateString()} | {deadline.priority}
                        </p>
                        {deadline.isOverdue && (
                          <p className="text-xs font-semibold text-red-600">Overdue</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                <section ref={supervisorRef} className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-bold mb-4">Your Supervisor</h3>
                  <p className="font-semibold">{dashboard?.supervisor?.name || "Not assigned yet"}</p>
                  <p className="text-xs text-slate-500">{dashboard?.supervisor?.email || "-"}</p>
                  <div className="mt-4 space-y-2 max-h-52 overflow-y-auto pr-1">
                    {(dashboard?.messages || []).length === 0 && (
                      <p className="text-xs text-slate-500">No messages yet.</p>
                    )}
                    {(dashboard?.messages || []).slice(0, 20).map((message, idx) => (
                      <div
                        key={`${message.createdAt}-${idx}`}
                        className={`rounded-lg p-2 border ${
                          message.senderRole === "teacher"
                            ? "bg-blue-50 border-blue-200"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <p className="text-xs font-semibold capitalize">{message.senderRole}</p>
                        <p className="text-sm">{message.text}</p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {message.createdAt ? new Date(message.createdAt).toLocaleString() : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleSendSupervisorMessage} className="mt-4 space-y-2">
                    <textarea
                      className="w-full rounded-lg border-slate-200"
                      rows="3"
                      placeholder="Write message for supervisor..."
                      value={supervisorMessage}
                      onChange={(e) => setSupervisorMessage(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={isSendingMessage}
                      className="w-full rounded-lg bg-primary text-white py-2.5 font-semibold disabled:opacity-70"
                    >
                      {isSendingMessage ? "Sending..." : "Send Message"}
                    </button>
                  </form>
                </section>

                <section ref={resourcesRef} className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-bold mb-4">Resources</h3>
                  <form onSubmit={handleAddResource} className="space-y-2 mb-4">
                    <input
                      className="w-full rounded-lg border-slate-200"
                      placeholder="Resource title"
                      value={resourceForm.title}
                      onChange={(e) => setResourceForm((prev) => ({ ...prev, title: e.target.value }))}
                      required
                    />
                    <input
                      className="w-full rounded-lg border-slate-200"
                      placeholder="Resource URL"
                      value={resourceForm.url}
                      onChange={(e) => setResourceForm((prev) => ({ ...prev, url: e.target.value }))}
                      required
                    />
                    <input
                      className="w-full rounded-lg border-slate-200"
                      placeholder="Category (optional)"
                      value={resourceForm.category}
                      onChange={(e) => setResourceForm((prev) => ({ ...prev, category: e.target.value }))}
                    />
                    <button
                      type="submit"
                      disabled={isAddingResource}
                      className="w-full rounded-lg bg-slate-900 text-white py-2.5 font-semibold disabled:opacity-70"
                    >
                      {isAddingResource ? "Adding..." : "Add Resource"}
                    </button>
                  </form>

                  <div className="space-y-2">
                    {(dashboard?.resources || []).map((resource) => (
                      <a
                        key={resource._id || resource.url}
                        href={resource.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
                      >
                        <p className="text-sm font-semibold">{resource.title}</p>
                        <p className="text-xs text-slate-500">{resource.category}</p>
                      </a>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default StudentDashboard1;



