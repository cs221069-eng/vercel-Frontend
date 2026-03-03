import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import { logoutUser } from "../utils/auth";

const statusStyles = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  accepted: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

const statusLabels = {
  pending: "Pending Review",
  accepted: "Accepted",
  rejected: "Rejected",
};

const committeeLabels = {
  not_started: "Not Started",
  pending: "Pending Committee",
  approved: "Committee Approved",
  rejected: "Committee Rejected",
};

function StudentDashboard2() {

  const navigate = useNavigate();
  const [studentName, setStudentName] = useState(localStorage.getItem("name") || "Student");
  const [teachers, setTeachers] = useState([]);
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    Domain: "Software Engineering",
    supervisor: "",
  });
  const [documents, setDocuments] = useState([]);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [latestProposal, setLatestProposal] = useState(null);
  const [isProposalLoading, setIsProposalLoading] = useState(false);
  const [isSupervisorModalOpen, setIsSupervisorModalOpen] = useState(false);
  const [activeRequestMeta, setActiveRequestMeta] = useState({
    hasActiveRequest: false,
    activeRequestStatus: "",
    activeRequestTeacher: "",
  });

  const fetchLatestProposal = async () => {
    const studentId = localStorage.getItem("userId");
    if (!studentId) {
      setLatestProposal(null);
      return;
    }

    setIsProposalLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3000/api/user/project/student/${studentId}/latest/9165`
      );
      setLatestProposal(response?.data?.data || null);
      setActiveRequestMeta({
        hasActiveRequest: Boolean(response?.data?.hasActiveRequest),
        activeRequestStatus: response?.data?.activeRequestStatus || "",
        activeRequestTeacher: response?.data?.activeRequestTeacher || "",
      });
    } catch {
      setLatestProposal(null);
      setActiveRequestMeta({
        hasActiveRequest: false,
        activeRequestStatus: "",
        activeRequestTeacher: "",
      });
    } finally {
      setIsProposalLoading(false);
    }
  };

  const fetchStudentName = async () => {
    const studentId = localStorage.getItem("userId");
    if (!studentId) return;

    try {
      const response = await axios.get(`http://localhost:3000/api/user/student/dashboard/${studentId}/9165`);
      const fetchedName = response?.data?.data?.student?.name || "";
      if (fetchedName) {
        setStudentName(fetchedName);
        localStorage.setItem("name", fetchedName);
      }
    } catch {
      // Keep fallback from localStorage.
    }
  };

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/user/teacher/all/9165");
        setTeachers(response?.data?.data || []);
      } catch (error) {
        console.error("Error fetching teachers:", error);
      }
    };

    fetchTeachers();
    fetchLatestProposal();
    fetchStudentName();

    const intervalId = setInterval(() => {
      fetchLatestProposal();
    }, 15000);

    return () => clearInterval(intervalId);
  }, []);

  const proposalStatus = latestProposal?.proposalStatus || "";
  const committeeStatus = latestProposal?.committeeStatus || "not_started";
  const hasActiveRequest = activeRequestMeta.hasActiveRequest;
  const visibleSupervisors = teachers.slice(0, 2);
  const selectedSupervisor = teachers.find((teacher) => teacher._id === formState.supervisor);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setDocuments(Array.from(e.target.files || []));
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    const studentId = localStorage.getItem("userId");

    if (!studentId) {
      setSubmitError("Please login again. Student id not found.");
      return;
    }

    if (hasActiveRequest) {
      setSubmitError("You already have an active teacher request. You can submit again only after rejection.");
      return;
    }

    if (selectedSupervisor?.availabilityStatus === "not_available") {
      setSubmitError("Selected supervisor is not available. Please choose another supervisor.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("title", formState.title);
      payload.append("description", formState.description);
      payload.append("Domain", formState.Domain);
      payload.append("supervisor", formState.supervisor);

      documents.forEach((file) => {
        payload.append("documents", file);
      });

      await axios.post(
        `http://localhost:3000/api/user/project/${studentId}/9165`,
        payload
        
      );

      setSubmitSuccess("Project proposal submitted successfully.");
      setFormState({
        title: "",
        description: "",
        Domain: "Software Engineering",
        supervisor: "",
      });
      setDocuments([]);
      await fetchLatestProposal();
    } catch (error) {
      setSubmitError(
        error?.response?.data?.message || "Failed to submit proposal."
      );
    } finally {
      setIsSubmitting(false);
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
<div className="px-4 mb-6">
<div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
<div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden">
<img className="h-full w-full object-cover" data-alt="Alex Johnson student profile picture" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhVRk4R8hs9BIqiOMJBXSgbsK7F9SGdCR75UrWo61w-TGZUzJx4xq4CZbAIsAVlD4OEUFxLY75ERW9G-q_simvyWLlV-EHB4-klNEDqyjM6mhTqrWMjFdSScBMa7MdjLH-8GeGvbAeUnFd9WmYxyeYI5Vl-rMr5AVzzVjH3v4bZ2hSbqCR_V3FjSGQ99E-E2ztPRUY5kWx2FYCX3DM7BwFbe560n33cYkfmHh3ngFtNV6yqJaBEJPTGe7CEVqW08V4SJZYrzVxMvw"/>
</div>
<div className="flex flex-col min-w-0">
<span className="text-sm font-semibold truncate">{studentName}</span>
<span className="text-xs text-slate-500 truncate">Final Year Student</span>
</div>
</div>
</div>
<nav className="flex-1 px-4 space-y-1">
<Link className="flex items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium" to="/student-dashboard-1">
<span className="material-symbols-outlined text-lg">dashboard</span>
<span>Dashboard</span>
</Link>
<Link className="flex items-center gap-3 px-3 py-2.5 bg-primary text-white rounded-lg font-medium" to="/student-dashboard-2">
<span className="material-symbols-outlined text-lg">folder_open</span>
<span>Project</span>
</Link>
<Link className="flex items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium" to="/student-dashboard-1?section=timeline">
<span className="material-symbols-outlined text-lg">calendar_month</span>
<span>Timeline</span>
</Link>
<Link className="flex items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium" to="/student-dashboard-1?section=supervisor">
<span className="material-symbols-outlined text-lg">group</span>
<span>Supervisor</span>
</Link>
<Link className="flex items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium" to="/student-dashboard-1?section=resources">
<span className="material-symbols-outlined text-lg">library_books</span>
<span>Resources</span>
</Link>
</nav>
<div className="p-4 mt-auto">
<button
className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 py-2 rounded-lg text-slate-700 dark:text-slate-200 font-semibold transition-all"
onClick={handleLogout}
type="button"
>
<span className="material-symbols-outlined text-lg">logout</span>
<span>Sign Out</span>
</button>
</div>
</aside>

<main className="flex-1 overflow-y-auto flex flex-col">
<header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3 sticky top-0 z-50">
<div className="flex items-center gap-8">
<div className="flex items-center gap-3 text-primary dark:text-blue-400">
<div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
<span className="material-symbols-outlined">school</span>
</div>
<h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">UniProjects</h2>
</div>
</div>
<div className="flex flex-1 justify-end gap-4 items-center">
<div className="hidden sm:flex relative max-w-xs w-full">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
<input className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20" placeholder="Search projects..." type="text"/>
</div>
<button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
<span className="material-symbols-outlined">notifications</span>
</button>
<div className="size-9 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-200 dark:border-slate-700">
<img className="w-full h-full object-cover" data-alt="User profile picture of a student" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdf7uKUO7EYrouAz2xssOH_SmQGtwMKFzDc9AQvZOrVKpkluvKUQeg93qE-4bwJ_AhDKIyQCcgVSRCnJqEkjA_y0oFVzDEix1_SjVc-3YM7w5wuhRzXUhfH_yZxZ0Gq5uSPp7MlcZBrX_nPijWdYKHllMqE2EFw-MitXXrOyx1o-7ME5OhH2I0XgLRTlAwJMI32tpxXTikaMg8Rf1M7EJtiUJkccw0CTQH7Xh5Q2DdN9wh-sAQ6TQPXWHi9XRw3N5eoZO9_LW6O3o"/>
</div>
</div>
</header>
<div className="max-w-5xl mx-auto w-full px-4 py-8">

<nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
<a className="hover:text-primary transition-colors" href="#">My Projects</a>
<span className="material-symbols-outlined text-xs">chevron_right</span>
<span className="text-slate-900 dark:text-slate-200 font-medium">New Proposal</span>
</nav>
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

<div className="lg:col-span-2 space-y-6">
<div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
<div className="p-6 border-b border-slate-100 dark:border-slate-800">
<h1 className="text-2xl font-bold text-slate-900 dark:text-white">Project Proposal</h1>
<p className="text-slate-500 text-sm mt-1">Submit your initial idea for faculty review and supervisor assignment.</p>
</div>
<form className="p-6 space-y-6" onSubmit={handleSubmitProposal}>
{hasActiveRequest && (
<div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
  You already sent a request to <strong>{activeRequestMeta?.activeRequestTeacher || latestProposal?.supervisor || "a teacher"}</strong>. New request is allowed only if this one is rejected.
</div>
)}
{submitError && (
<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
{submitError}
</div>
)}
{submitSuccess && (
<div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
{submitSuccess}
</div>
)}

<div className="space-y-2">
<label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Project Title</label>
<input className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary text-base" placeholder="e.g., AI-Driven Urban Traffic Management System" type="text" name="title" value={formState.title} onChange={handleInputChange} required/>
<p className="text-xs text-slate-400 italic">Make it clear and descriptive of your primary goal.</p>
</div>

<div className="space-y-2">
<label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Abstract / Description</label>
<textarea className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary text-base" placeholder="Provide a brief summary of your project objectives, methodology, and expected outcomes..." rows="6" name="description" value={formState.description} onChange={handleInputChange} required></textarea>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div className="space-y-2">
<label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Primary Domain</label>
<select className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary" name="Domain" value={formState.Domain} onChange={handleInputChange} required>
<option value="Software Engineering">Software Engineering</option>
<option value="Data Science &amp; AI">Data Science &amp; AI</option>
<option value="Cybersecurity">Cybersecurity</option>
<option value="Human-Computer Interaction">Human-Computer Interaction</option>
<option value="Internet of Things">Internet of Things</option>
</select>
</div>
<div className="space-y-2">
<label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Preferred Supervisor</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">person_search</span>
<select className="w-full pl-10 rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary" name="supervisor" value={formState.supervisor} onChange={handleInputChange} required>
<option value="">Select a faculty member</option>
{teachers.map((teacher) => (
<option key={teacher._id} value={teacher._id} disabled={teacher?.availabilityStatus === "not_available"}>
  {teacher.name} {teacher?.availabilityStatus === "not_available" ? "(Not Available)" : `(Slots: ${teacher?.remainingSlots ?? 0})`}
</option>
))}
</select>
</div>
</div>
</div>
<div className="space-y-2">
<label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Supporting Documents (Optional)</label>
<label className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-8 text-center bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group block">
<span className="material-symbols-outlined text-4xl text-slate-400 group-hover:text-primary transition-colors">upload_file</span>
<p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Drag and drop your initial brief or click to browse</p>
<p className="text-xs text-slate-400 mt-1">PDF, DOC, DOCX up to 10MB each</p>
<p className="text-xs text-slate-500 mt-2">{documents.length > 0 ? `${documents.length} file(s) selected` : "No file selected"}</p>
<input className="hidden" type="file" multiple accept=".pdf,.doc,.docx" onChange={handleFileChange}/>
</label>
</div>
<div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
<button className="px-6 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" type="button">Save as Draft</button>
<button className="px-8 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed" type="submit" disabled={isSubmitting || hasActiveRequest}>
                                    {isSubmitting ? "Submitting..." : "Submit Proposal"}
                                    <span className="material-symbols-outlined text-sm">send</span>
</button>
</div>
</form>
</div>
</div>

<div className="space-y-6">

<div className="bg-accent/10 dark:bg-accent/5 border border-accent/20 rounded-xl p-6">
<div className="flex items-center gap-2 text-accent mb-4">
<span className="material-symbols-outlined">lightbulb</span>
<h3 className="font-bold">Submission Tips</h3>
</div>
<ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
<li className="flex gap-2">
<span className="material-symbols-outlined text-accent text-lg">check_circle</span>
                                Ensure your title is under 15 words.
                            </li>
<li className="flex gap-2">
<span className="material-symbols-outlined text-accent text-lg">check_circle</span>
                                Mention specific technologies you plan to use.
                            </li>
<li className="flex gap-2">
<span className="material-symbols-outlined text-accent text-lg">check_circle</span>
                                Define clear, measurable success metrics.
                            </li>
<li className="flex gap-2">
<span className="material-symbols-outlined text-accent text-lg">check_circle</span>
                                Check supervisor availability before selecting.
                            </li>
</ul>
</div>

<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
<div className="flex items-center justify-between mb-4">
  <h3 className="font-bold text-slate-900 dark:text-white">Approval Process</h3>
  <button
    type="button"
    className="text-xs font-semibold text-primary hover:underline"
    onClick={fetchLatestProposal}
    disabled={isProposalLoading}
  >
    {isProposalLoading ? "Refreshing..." : "Refresh"}
  </button>
</div>
{isProposalLoading && (
  <p className="text-xs text-slate-500 mb-4">Loading your latest proposal...</p>
)}
{latestProposal && (
  <div className="mb-4 flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2">
    <div>
      <p className="text-xs text-slate-500">Latest Proposal</p>
      <p className="text-sm font-semibold text-slate-900 dark:text-white">{latestProposal?.title || "-"}</p>
    </div>
    <span className={`text-xs font-semibold border px-2 py-1 rounded-full ${statusStyles[proposalStatus] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
      {statusLabels[proposalStatus] || "No Status"}
    </span>
  </div>
)}
<div className="space-y-6 relative">
<div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800"></div>
<div className="relative flex items-start gap-4">
<div className={`size-6 rounded-full flex items-center justify-center text-white z-10 ${latestProposal ? "bg-primary" : "bg-slate-200 dark:bg-slate-700 text-slate-500"}`}>
<span className="text-[10px] font-bold">1</span>
</div>
<div>
<p className={`text-sm font-bold leading-tight ${latestProposal ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}>Draft Submission</p>
<p className="text-xs text-slate-500">{latestProposal?.createdAt ? new Date(latestProposal.createdAt).toLocaleDateString() : "Not submitted yet"}</p>
</div>
</div>
<div className="relative flex items-start gap-4">
<div className={`size-6 rounded-full flex items-center justify-center z-10 ${proposalStatus === "pending" ? "bg-amber-100 text-amber-700" : proposalStatus === "accepted" || proposalStatus === "rejected" ? "bg-primary text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500"}`}>
<span className="text-[10px] font-bold">2</span>
</div>
<div>
<p className={`text-sm font-bold leading-tight ${proposalStatus ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}>Supervisor Review</p>
<p className="text-xs text-slate-500">
  {proposalStatus === "pending" && "Waiting for teacher decision"}
  {proposalStatus === "accepted" && `Approved on ${latestProposal?.reviewedAt ? new Date(latestProposal.reviewedAt).toLocaleDateString() : "N/A"}`}
  {proposalStatus === "rejected" && `Rejected on ${latestProposal?.reviewedAt ? new Date(latestProposal.reviewedAt).toLocaleDateString() : "N/A"}`}
  {!proposalStatus && "Estimated 3-5 days"}
 </p>
</div>
</div>
<div className="relative flex items-start gap-4">
<div className={`size-6 rounded-full flex items-center justify-center z-10 ${committeeStatus === "approved" ? "bg-primary text-white" : committeeStatus === "pending" ? "bg-amber-100 text-amber-700" : committeeStatus === "rejected" ? "bg-red-100 text-red-700" : "bg-slate-200 dark:bg-slate-700 text-slate-500"}`}>
<span className="text-[10px] font-bold">3</span>
</div>
<div>
<p className={`text-sm font-bold leading-tight ${committeeStatus !== "not_started" ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}>Final Committee Approval</p>
<p className="text-xs text-slate-500">
  {committeeStatus === "not_started" && "Starts only after teacher accepts your proposal."}
  {committeeStatus === "pending" && "Admin/department committee decision is pending."}
  {committeeStatus === "approved" && `Approved by committee on ${latestProposal?.committeeReviewedAt ? new Date(latestProposal.committeeReviewedAt).toLocaleDateString() : "N/A"}.`}
  {committeeStatus === "rejected" && `Rejected by committee on ${latestProposal?.committeeReviewedAt ? new Date(latestProposal.committeeReviewedAt).toLocaleDateString() : "N/A"}.`}
</p>
{committeeStatus !== "not_started" && (
  <p className="text-[11px] font-semibold text-slate-600 mt-1">
    Status: {committeeLabels[committeeStatus] || "Pending Committee"}
  </p>
)}
</div>
</div>
</div>
</div>

<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
<div className="flex items-center justify-between mb-4">
<h3 className="font-bold text-slate-900 dark:text-white">Active Supervisors</h3>
<button
  className="text-xs text-primary font-semibold hover:underline"
  type="button"
  onClick={() => setIsSupervisorModalOpen(true)}
>
  View All
</button>
</div>
<div className="space-y-4">
{visibleSupervisors.length === 0 && (
  <p className="text-sm text-slate-500">No supervisors found.</p>
)}
{visibleSupervisors.map((teacher) => (
  <div className="flex items-center gap-3" key={teacher._id}>
    <div className="size-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold uppercase">
      {teacher?.name?.trim()?.charAt(0) || "T"}
    </div>
    <div className="min-w-0">
      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{teacher?.name || "Unknown Teacher"}</p>
      <p className="text-xs text-slate-500 truncate">{teacher?.department || "Department not set"}</p>
    </div>
    <div
      className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold ${
        teacher?.availabilityStatus === "not_available"
          ? "bg-red-100 text-red-700"
          : "bg-green-100 text-green-700"
      }`}
    >
      {teacher?.availabilityStatus === "not_available" ? "Not Available" : "Available"}
    </div>
  </div>
))}
</div>
</div>
</div>
</div>
</div>
{isSupervisorModalOpen && (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
    <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-bold">All Supervisors</h2>
        <button
          type="button"
          className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
          onClick={() => setIsSupervisorModalOpen(false)}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <div className="max-h-[70vh] overflow-y-auto p-5 space-y-3">
        {teachers.length === 0 && (
          <p className="text-sm text-slate-500">No supervisors found.</p>
        )}
        {teachers.map((teacher) => (
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-700 p-3" key={teacher._id}>
            <div className="size-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold uppercase">
              {teacher?.name?.trim()?.charAt(0) || "T"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{teacher?.name || "Unknown Teacher"}</p>
              <p className="text-xs text-slate-500 truncate">{teacher?.department || "Department not set"}</p>
              <p className="text-[11px] text-slate-500">Accepted: {teacher?.activeAcceptedCount ?? 0}/4</p>
            </div>
            <div
              className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold ${
                teacher?.availabilityStatus === "not_available"
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {teacher?.availabilityStatus === "not_available" ? "Not Available" : "Available"}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}
<footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-12 py-8">
<div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
<div className="flex items-center gap-2 opacity-50">
<span className="material-symbols-outlined text-lg">school</span>
<span className="text-sm font-bold">UniProjects Academic Portal</span>
</div>
<div className="flex gap-6 text-sm text-slate-500">
<a className="hover:text-primary" href="#">Policy</a>
<a className="hover:text-primary" href="#">Help Center</a>
<a className="hover:text-primary" href="#">Contact Support</a>
</div>
<p className="text-xs text-slate-400">© 2024 University Project Management System. All rights reserved.</p>
</div>
</footer>
</main>
</div>

  );
}

export default StudentDashboard2;
