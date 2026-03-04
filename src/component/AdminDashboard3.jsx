import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import axios from "axios";
import { API_BASE_URL, getAuthConfig } from "../utils/auth";

function AdminDashboard3() {
  const [admins, setAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [adminsError, setAdminsError] = useState("");
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    department: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAdmins = async () => {
    setAdminsLoading(true);
    setAdminsError("");

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/auth/admins/9165`,
        getAuthConfig()
      );
      setAdmins(response?.data?.data || []);
    } catch (error) {
      setAdminsError(error?.response?.data?.message || "Failed to fetch admins.");
    } finally {
      setAdminsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      await axios.post(
        `${API_BASE_URL}/api/user/create/9165`,
        formState,
        getAuthConfig()
      );
      setSuccessMessage("User created successfully.");
      setFormState({
        name: "",
        email: "",
        password: "",
        role: "student",
        department: "",
      });
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to create user. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      <AdminSidebar active="create-user" />
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 md:px-8">
          <h1 className="text-lg sm:text-xl font-bold">Create User</h1>
        </header>
        <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8">
          <div className="overflow-hidden rounded-xl border border-primary/10 bg-white dark:bg-slate-900 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
                <thead className="bg-primary/5">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Email</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Role</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  {adminsLoading && (
                    <tr>
                      <td className="px-6 py-4 text-sm text-slate-500" colSpan="3">
                        Loading admins...
                      </td>
                    </tr>
                  )}

                  {!adminsLoading && adminsError && (
                    <tr>
                      <td className="px-6 py-4 text-sm text-red-600" colSpan="3">
                        {adminsError}
                      </td>
                    </tr>
                  )}

                  {!adminsLoading && !adminsError && admins.length === 0 && (
                    <tr>
                      <td className="px-6 py-4 text-sm text-slate-500" colSpan="3">
                        No admins found.
                      </td>
                    </tr>
                  )}

                  {!adminsLoading &&
                    !adminsError &&
                    admins.map((admin) => (
                      <tr key={admin._id}>
                        <td className="px-6 py-4 text-sm font-medium">{admin.email}</td>
                        <td className="px-6 py-4 text-sm">admin</td>
                        <td className="px-6 py-4 text-right text-green-700 text-sm font-semibold">Active</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="w-full max-w-md bg-white dark:bg-background-dark rounded-xl shadow-2xl overflow-hidden border border-primary/10">
            <div className="px-6 py-6 border-b border-primary/5">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create New User</h3>
              <p className="text-slate-500 text-sm mt-1">Invite a new member to your workspace.</p>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                  {successMessage}
                </div>
              )}
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Full Name</label>
                <input className="mt-1 w-full px-4 py-2.5 rounded-lg border border-primary/10 bg-primary/5" placeholder="John Doe" type="text" name="name" value={formState.name} onChange={handleChange} />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Email Address</label>
                <input className="mt-1 w-full px-4 py-2.5 rounded-lg border border-primary/10 bg-primary/5" placeholder="john@example.com" type="email" name="email" value={formState.email} onChange={handleChange} />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Password</label>
                <input className="mt-1 w-full px-4 py-2.5 rounded-lg border border-primary/10 bg-primary/5" placeholder="Enter password" type="password" name="password" value={formState.password} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Role</label>
                  <select className="mt-1 w-full px-4 py-2.5 rounded-lg border border-primary/10 bg-primary/5" name="role" value={formState.role} onChange={handleChange}>
                    <option value="student">student</option>
                    <option value="teacher">teacher</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Department</label>
                  <input className="mt-1 w-full px-4 py-2.5 rounded-lg border border-primary/10 bg-primary/5" placeholder="Design" type="text" name="department" value={formState.department} onChange={handleChange} />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-4">
                <Link className="flex-1 py-2.5 px-4 rounded-lg bg-slate-100 text-slate-600 font-bold text-sm text-center" to="/admin-dashboard-2">Cancel</Link>
                <button className="flex-1 py-2.5 px-4 rounded-lg bg-primary text-white font-bold text-sm disabled:opacity-70 disabled:cursor-not-allowed" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard3;
