import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import TeacherSidebar from "./TeacherSidebar";

const PAGE_SIZE = 8;

function TeacherProjects() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [studentFilter, setStudentFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isReviewingId, setIsReviewingId] = useState("");
  const [workspaceData, setWorkspaceData] = useState(null);
  const [workspaceError, setWorkspaceError] = useState("");
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(false);
  const [studentUpdateMap, setStudentUpdateMap] = useState({});
  const [teacherReply, setTeacherReply] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);

  const statusMeta = {
    pending: {
      label: "Pending",
      className: "bg-amber-100 text-amber-700",
    },
    accepted: {
      label: "Accepted",
      className: "bg-emerald-100 text-emerald-700",
    },
    rejected: {
      label: "Rejected",
      className: "bg-red-100 text-red-700",
    },
  };

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const teacherId = localStorage.getItem("userId");
        if (!teacherId) {
          setErrorMessage("Teacher id not found. Please login again.");
          setProjects([]);
          return;
        }

        const [projectResponse, dashboardResponse] = await Promise.all([
          axios.get(`https://vercel-backend-w7h5.vercel.app/api/user/project/teacher/${teacherId}/9165`),
          axios.get(`https://vercel-backend-w7h5.vercel.app/api/user/teacher/dashboard/${teacherId}/9165`),
        ]);

        const teacherStudents = dashboardResponse?.data?.data?.students || [];
        const studentMap = teacherStudents.reduce((acc, student) => {
          acc[student.studentId] = student;
          return acc;
        }, {});

        setProjects(projectResponse?.data?.data || []);
        setStudentUpdateMap(studentMap);
      } catch (error) {
        setErrorMessage(error?.response?.data?.message || "Failed to fetch projects.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleProposalReview = async (projectId, action) => {
    const teacherId = localStorage.getItem("userId");
    if (!teacherId || !projectId) {
      return;
    }

    setIsReviewingId(projectId);
    setErrorMessage("");

    try {
      const response = await axios.patch(
        `https://vercel-backend-w7h5.vercel.app/api/user/project/${projectId}/review/${teacherId}/9165`,
        { action }
      );

      const updated = response?.data?.data;
      if (!updated?._id) {
        return;
      }

      setProjects((prev) => {
        if ((updated?.proposalStatus || "pending") === "rejected") {
          return prev.filter((item) => item._id !== updated._id);
        }
        return prev.map((item) => (item._id === updated._id ? updated : item));
      });

      setSelectedProject((prev) =>
        prev && prev._id === updated._id
          ? (updated?.proposalStatus || "pending") === "rejected"
            ? null
            : updated
          : prev
      );
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to update proposal status.");
    } finally {
      setIsReviewingId("");
    }
  };

  const studentOptions = useMemo(() => {
    const students = projects
      .map((project) => project?.students)
      .filter((student) => student && student._id);

    const unique = [];
    const seen = new Set();

    students.forEach((student) => {
      if (!seen.has(student._id)) {
        seen.add(student._id);
        unique.push(student);
      }
    });

    return unique;
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return projects.filter((project) => {
      const status = project?.proposalStatus || "pending";
      if (status === "rejected") {
        return false;
      }

      const student = project?.students;
      const studentName = student?.name || "";
      const matchesStudent =
        studentFilter === "all" || student?._id === studentFilter;

      const haystack = [
        project?.title,
        project?.Domain,
        project?.supervisor,
        project?.supervisorId?.name,
        studentName,
        student?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || haystack.includes(query);
      return matchesStudent && matchesSearch;
    });
  }, [projects, searchTerm, studentFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedProjects = filteredProjects.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, studentFilter]);

  useEffect(() => {
    const fetchWorkspace = async () => {
      const teacherId = localStorage.getItem("userId");
      const studentId = selectedProject?.students?._id;

      if (!teacherId || !studentId) {
        setWorkspaceData(null);
        setWorkspaceError("");
        return;
      }

      setIsWorkspaceLoading(true);
      setWorkspaceError("");

      try {
        const response = await axios.get(
          `https://vercel-backend-w7h5.vercel.app/api/user/teacher/workspace/${teacherId}/student/${studentId}/9165`
        );
        setWorkspaceData(response?.data?.data || null);
      } catch (error) {
        setWorkspaceData(null);
        setWorkspaceError(
          error?.response?.data?.message || "Failed to load student workspace."
        );
      } finally {
        setIsWorkspaceLoading(false);
      }
    };

    if (selectedProject) {
      fetchWorkspace();
    } else {
      setWorkspaceData(null);
      setWorkspaceError("");
      setIsWorkspaceLoading(false);
      setTeacherReply("");
    }
  }, [selectedProject]);

  const getViewNotificationCount = (project) => {
    const studentId = project?.students?._id;
    const projectId = project?._id;
    if (!studentId || !projectId) return 0;

    const summary = studentUpdateMap[studentId];
    const studentUpdates = Number(summary?.studentUpdateCount || 0);
    const lastStudentUpdateAt = summary?.lastStudentUpdateAt;
    if (!studentUpdates || !lastStudentUpdateAt) return 0;

    const teacherId = localStorage.getItem("userId");
    if (!teacherId) return studentUpdates;

    const seenKey = `teacher_project_seen_${teacherId}_${projectId}`;
    const seenAt = localStorage.getItem(seenKey);
    if (!seenAt) return studentUpdates;

    const seenTime = new Date(seenAt).getTime();
    const lastTime = new Date(lastStudentUpdateAt).getTime();
    if (Number.isNaN(seenTime) || Number.isNaN(lastTime)) return studentUpdates;

    return seenTime >= lastTime ? 0 : studentUpdates;
  };

  const handleOpenProject = (project) => {
    const teacherId = localStorage.getItem("userId");
    const projectId = project?._id;

    if (teacherId && projectId) {
      const seenKey = `teacher_project_seen_${teacherId}_${projectId}`;
      localStorage.setItem(seenKey, new Date().toISOString());
    }

    setSelectedProject(project);
  };

  const handleSendTeacherReply = async () => {
    const teacherId = localStorage.getItem("userId");
    const studentId = selectedProject?.students?._id;

    if (!teacherId || !studentId || !teacherReply.trim()) return;

    setIsSendingReply(true);
    try {
      await axios.post(
        `https://vercel-backend-w7h5.vercel.app/api/user/teacher/message/${teacherId}/student/${studentId}/9165`,
        { message: teacherReply }
      );
      setTeacherReply("");

      const response = await axios.get(
        `https://vercel-backend-w7h5.vercel.app/api/user/teacher/workspace/${teacherId}/student/${studentId}/9165`
      );
      setWorkspaceData(response?.data?.data || null);
    } catch (error) {
      setWorkspaceError(error?.response?.data?.message || "Failed to send reply.");
    } finally {
      setIsSendingReply(false);
    }
  };

  const totalWithFiles = filteredProjects.filter(
    (project) => (project?.documents || []).length > 0
  ).length;
  const totalPending = filteredProjects.filter(
    (project) => (project?.proposalStatus || "pending") === "pending"
  ).length;

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      <TeacherSidebar active="projects" />

      <main className="flex-1 ml-64">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-lg font-bold">Student Project Proposals</h1>
          <p className="text-sm text-slate-500">
            {filteredProjects.length} proposal(s)
          </p>
        </header>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
              <p className="text-xs text-slate-500 uppercase font-semibold">Total Proposals</p>
              <p className="text-2xl font-bold mt-2">{filteredProjects.length}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
              <p className="text-xs text-slate-500 uppercase font-semibold">Pending Reviews</p>
              <p className="text-2xl font-bold mt-2">{totalPending}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
              <p className="text-xs text-slate-500 uppercase font-semibold">With Files</p>
              <p className="text-2xl font-bold mt-2">{totalWithFiles}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  search
                </span>
                <input
                  className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 border-none"
                  placeholder="Search by student, title, domain, supervisor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2.5 text-sm border-none min-w-64"
                value={studentFilter}
                onChange={(e) => setStudentFilter(e.target.value)}
              >
                <option value="all">All Students</option>
                {studentOptions.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Student</th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Project</th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Domain</th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Supervisor</th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Files</th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {isLoading && (
                    <tr>
                      <td className="px-5 py-4 text-sm text-slate-500" colSpan="7">
                        Loading projects...
                      </td>
                    </tr>
                  )}

                  {!isLoading && errorMessage && (
                    <tr>
                      <td className="px-5 py-4 text-sm text-red-600" colSpan="7">
                        {errorMessage}
                      </td>
                    </tr>
                  )}

                  {!isLoading && !errorMessage && pagedProjects.length === 0 && (
                    <tr>
                      <td className="px-5 py-4 text-sm text-slate-500" colSpan="7">
                        No proposals found for selected filters.
                      </td>
                    </tr>
                  )}

                  {!isLoading &&
                    !errorMessage &&
                    pagedProjects.map((project) => {
                      const student = project?.students || {};
                      const documents = project?.documents || [];
                      const projectStatus = project?.proposalStatus || "pending";
                      const currentStatus = statusMeta[projectStatus] || statusMeta.pending;
                      const notificationCount = getViewNotificationCount(project);
                      return (
                        <tr key={project._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold">{student?.name || "Unknown Student"}</p>
                            <p className="text-xs text-slate-500">{student?.email || "No email"}</p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold">{project?.title}</p>
                            <p className="text-xs text-slate-500 line-clamp-2 max-w-md">
                              {project?.description}
                            </p>
                          </td>
                          <td className="px-5 py-4 text-sm">{project?.Domain}</td>
                          <td className="px-5 py-4 text-sm">{project?.supervisor}</td>
                          <td className="px-5 py-4">
                            {documents.length === 0 && (
                              <span className="text-xs text-slate-500">No file uploaded</span>
                            )}
                            {documents.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {documents.map((doc) => (
                                  <a
                                    key={doc.fileId || doc.url || doc.originalName}
                                    href={doc.downloadUrl || doc.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/10"
                                  >
                                    <span className="material-symbols-outlined !text-[16px]">
                                      download
                                    </span>
                                    {doc.originalName || "Download"}
                                  </a>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${currentStatus.className}`}>
                              {currentStatus.label}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                                onClick={() => handleOpenProject(project)}
                              >
                                <span className="material-symbols-outlined !text-[16px]">
                                  visibility
                                </span>
                                View
                                {notificationCount > 0 && (
                                  <span className="ml-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                                    {notificationCount > 9 ? "9+" : notificationCount}
                                  </span>
                                )}
                              </button>
                              {projectStatus === "pending" && (
                                <>
                                  <button
                                    type="button"
                                    disabled={isReviewingId === project._id}
                                    className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
                                    onClick={() => handleProposalReview(project._id, "accept")}
                                  >
                                    Accept
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isReviewingId === project._id}
                                    className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                                    onClick={() => handleProposalReview(project._id, "reject")}
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {!isLoading && !errorMessage && filteredProjects.length > 0 && (
              <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Showing {(safePage - 1) * PAGE_SIZE + 1}-
                  {Math.min(safePage * PAGE_SIZE, filteredProjects.length)} of{" "}
                  {filteredProjects.length}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm disabled:opacity-50"
                    disabled={safePage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm disabled:opacity-50"
                    disabled={safePage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {selectedProject?.title || "Proposal Details"}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Submitted by {selectedProject?.students?.name || "Unknown Student"}
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setSelectedProject(null)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-3">
                  <p className="text-xs text-slate-500">Student Email</p>
                  <p className="text-sm font-semibold">{selectedProject?.students?.email || "No email"}</p>
                </div>
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-3">
                  <p className="text-xs text-slate-500">Domain</p>
                  <p className="text-sm font-semibold">{selectedProject?.Domain || "-"}</p>
                </div>
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-3">
                  <p className="text-xs text-slate-500">Supervisor</p>
                  <p className="text-sm font-semibold">{selectedProject?.supervisor || "-"}</p>
                </div>
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-3">
                  <p className="text-xs text-slate-500">Submitted On</p>
                  <p className="text-sm font-semibold">
                    {selectedProject?.createdAt
                      ? new Date(selectedProject.createdAt).toLocaleString()
                      : "-"}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-3">
                  <p className="text-xs text-slate-500">Proposal Status</p>
                  <p className="text-sm font-semibold">
                    {(statusMeta[selectedProject?.proposalStatus || "pending"] || statusMeta.pending).label}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold mb-2">Proposal Description</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-6">
                  {selectedProject?.description || "No description provided."}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold mb-2">Attached Files</h3>
                {(selectedProject?.documents || []).length === 0 && (
                  <p className="text-sm text-slate-500">No file uploaded.</p>
                )}
                {(selectedProject?.documents || []).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.documents.map((doc) => (
                      <a
                        key={doc.fileId || doc.url || doc.originalName}
                        href={doc.downloadUrl || doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
                      >
                        <span className="material-symbols-outlined !text-[16px]">
                          download
                        </span>
                        {doc.originalName || "Download"}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold mb-2">Student Workspace</h3>
                {isWorkspaceLoading && (
                  <p className="text-sm text-slate-500">Loading workspace...</p>
                )}
                {!isWorkspaceLoading && workspaceError && (
                  <p className="text-sm text-red-600">{workspaceError}</p>
                )}
                {!isWorkspaceLoading && !workspaceError && workspaceData && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-3">
                        <p className="text-xs text-slate-500">Pending Tasks</p>
                        {(workspaceData?.pendingTasks || []).length === 0 && (
                          <p className="text-sm text-slate-500 mt-1">No pending task.</p>
                        )}
                        {(workspaceData?.pendingTasks || []).slice(0, 4).map((task) => (
                          <p key={task._id} className="text-sm mt-1">• {task.title}</p>
                        ))}
                      </div>
                      <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-3">
                        <p className="text-xs text-slate-500">Completed Tasks</p>
                        {(workspaceData?.completedTasks || []).length === 0 && (
                          <p className="text-sm text-slate-500 mt-1">No completed task.</p>
                        )}
                        {(workspaceData?.completedTasks || []).slice(0, 4).map((task) => (
                          <p key={task._id} className="text-sm mt-1">• {task.title}</p>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold mb-2">Submitted Work (Download)</h4>
                      {(workspaceData?.submissions || []).length === 0 && (
                        <p className="text-sm text-slate-500">No submission yet.</p>
                      )}
                      {(workspaceData?.submissions || []).map((submission) => (
                        <div key={submission._id} className="rounded-lg border border-slate-200 p-3 mb-2">
                          <p className="text-sm font-semibold">{submission.title}</p>
                          <p className="text-xs text-slate-500 mb-2">
                            {submission.submittedAt
                              ? new Date(submission.submittedAt).toLocaleString()
                              : ""}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {(submission.documents || []).map((doc) => (
                              <a
                                key={doc.fileId || doc.url || doc.originalName}
                                href={doc.downloadUrl || doc.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
                              >
                                <span className="material-symbols-outlined !text-[16px]">
                                  download
                                </span>
                                {doc.originalName || "Download"}
                              </a>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold mb-2">Resources</h4>
                      {(workspaceData?.resources || []).length === 0 && (
                        <p className="text-sm text-slate-500">No resources added.</p>
                      )}
                      {(workspaceData?.resources || []).map((resource) => (
                        <a
                          key={resource._id || resource.url}
                          href={resource.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block rounded-lg border border-slate-200 p-2 mb-2 hover:bg-slate-50"
                        >
                          <p className="text-sm font-semibold">{resource.title}</p>
                          <p className="text-xs text-slate-500">{resource.category}</p>
                        </a>
                      ))}
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold mb-2">Messages From Student</h4>
                      {(workspaceData?.messages || []).filter((message) => message.senderRole === "student").length === 0 && (
                        <p className="text-sm text-slate-500">No student messages.</p>
                      )}
                      {(workspaceData?.messages || [])
                        .filter((message) => message.senderRole === "student")
                        .slice(0, 8)
                        .map((message, index) => (
                          <div key={`${message.createdAt}-${index}`} className="rounded-lg border border-slate-200 p-2 mb-2">
                            <p className="text-sm">{message.text}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {message.createdAt ? new Date(message.createdAt).toLocaleString() : ""}
                            </p>
                          </div>
                        ))}
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold mb-2">Reply To Student</h4>
                      <div className="space-y-2">
                        <textarea
                          className="w-full rounded-lg border border-slate-200 p-2 text-sm"
                          rows="3"
                          placeholder="Write a reply..."
                          value={teacherReply}
                          onChange={(e) => setTeacherReply(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={handleSendTeacherReply}
                          disabled={isSendingReply}
                          className="rounded-lg bg-primary text-white px-4 py-2 text-sm font-semibold disabled:opacity-60"
                        >
                          {isSendingReply ? "Sending..." : "Send Reply"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherProjects;



