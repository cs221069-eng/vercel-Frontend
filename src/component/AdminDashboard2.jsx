import AdminSidebar from "./AdminSidebar";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL, getAuthConfig } from "../utils/auth";

function AdminDashboard2() {
  const USERS_PER_PAGE = 20;
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [editingUser, setEditingUser] = useState(null);
  const [editErrorMessage, setEditErrorMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "student",
    department: "",
    status: "active",
  });

  const fetchUsers = async (page = 1) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/all/9165`, getAuthConfig({
        params: {
          page,
          limit: USERS_PER_PAGE,
        },
      }));

      const fetchedUsers = response?.data?.data || [];
      const pagination = response?.data?.pagination || {};

      setUsers(fetchedUsers);
      setCurrentPage(pagination.currentPage || page);
      setTotalPages(pagination.totalPages || 1);
      setTotalUsers(pagination.totalUsers || fetchedUsers.length);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Failed to fetch users."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  const handleEditClick = (user) => {
    setEditErrorMessage("");
    setEditingUser(user);
    setEditForm({
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || "student",
      department: user?.department || "",
      status: user?.status || "active",
    });
  };

  const closeEditModal = () => {
    setEditErrorMessage("");
    setIsUpdating(false);
    setEditingUser(null);
  };

  const handleDeleteClick = (user) => {
    setDeleteErrorMessage("");
    setDeletingUser(user);
  };

  const closeDeleteModal = () => {
    setDeleteErrorMessage("");
    setIsDeleting(false);
    setDeletingUser(null);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser?._id) return;

    setEditErrorMessage("");
    setIsUpdating(true);

    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/user/edit/${editingUser._id}/9165`,
        {
          name: editForm.name,
          email: editForm.email,
          role: editForm.role,
          department: editForm.department,
          status: editForm.status,
        },
        getAuthConfig()
      );

      const updatedUser = response?.data?.user;
      const normalizedUser = Array.isArray(updatedUser) ? updatedUser[0] : updatedUser;
      if (normalizedUser?._id) {
        setUsers((prev) =>
          prev.map((user) => (user._id === normalizedUser._id ? normalizedUser : user))
        );
      }
      closeEditModal();
    } catch (error) {
      setEditErrorMessage(
        error?.response?.data?.message || "Failed to update user."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser?._id) return;

    setDeleteErrorMessage("");
    setIsDeleting(true);

    try {
      await axios.delete(
        `${API_BASE_URL}/api/user/delete/${deletingUser._id}/9165`,
        getAuthConfig()
      );
      const expectedPage =
        users.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      await fetchUsers(expectedPage);
      closeDeleteModal();
    } catch (error) {
      setDeleteErrorMessage(
        error?.response?.data?.message || "Failed to delete user."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      <AdminSidebar active="user" />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 sm:px-6 md:px-8 shrink-0">
          <h1 className="text-lg sm:text-xl font-bold">User Management</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Name</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Role</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Department</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {isLoading && (
                    <tr>
                      <td className="px-6 py-4 text-sm text-slate-500" colSpan="5">
                        Loading users...
                      </td>
                    </tr>
                  )}

                  {!isLoading && errorMessage && (
                    <tr>
                      <td className="px-6 py-4 text-sm text-red-600" colSpan="5">
                        {errorMessage}
                      </td>
                    </tr>
                  )}

                  {!isLoading && !errorMessage && users.length === 0 && (
                    <tr>
                      <td className="px-6 py-4 text-sm text-slate-500" colSpan="5">
                        No users found.
                      </td>
                    </tr>
                  )}

                  {!isLoading &&
                    !errorMessage &&
                    users.map((user) => (
                      <tr
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        key={user._id}
                      >
                        <td className="px-6 py-4 text-sm font-bold">{user.name}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 capitalize">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {user.department}
                        </td>
                        <td className="px-6 py-4 text-sm text-emerald-600 capitalize">
                          {user.status}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-3 text-slate-500">
                            <button
                              className="hover:text-blue-600 transition-colors"
                              type="button"
                              aria-label="Edit user"
                              onClick={() => handleEditClick(user)}
                            >
                              <span className="material-symbols-outlined !text-[20px]">edit</span>
                            </button>
                            <button
                              className="hover:text-red-600 transition-colors"
                              type="button"
                              aria-label="Delete user"
                              onClick={() => handleDeleteClick(user)}
                            >
                              <span className="material-symbols-outlined !text-[20px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {!isLoading && !errorMessage && (
              <div className="flex flex-col gap-3 border-t border-slate-200 dark:border-slate-800 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Showing page {currentPage} of {totalPages} ({totalUsers} users)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fetchUsers(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => fetchUsers(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold">Edit User</h2>
              <button
                type="button"
                onClick={closeEditModal}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                aria-label="Close edit form"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
              {editErrorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {editErrorMessage}
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Full Name
                </label>
                <input
                  className="mt-1 w-full px-4 py-2.5 rounded-lg border border-primary/10 bg-primary/5"
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditFormChange}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Email Address
                </label>
                <input
                  className="mt-1 w-full px-4 py-2.5 rounded-lg border border-primary/10 bg-primary/5"
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditFormChange}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Role
                  </label>
                  <select
                    className="mt-1 w-full px-4 py-2.5 rounded-lg border border-primary/10 bg-primary/5"
                    name="role"
                    value={editForm.role}
                    onChange={handleEditFormChange}
                  >
                    <option value="student">student</option>
                    <option value="teacher">teacher</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Status
                  </label>
                  <select
                    className="mt-1 w-full px-4 py-2.5 rounded-lg border border-primary/10 bg-primary/5"
                    name="status"
                    value={editForm.status}
                    onChange={handleEditFormChange}
                  >
                    <option value="active">active</option>
                    <option value="inactive">inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Department
                </label>
                <input
                  className="mt-1 w-full px-4 py-2.5 rounded-lg border border-primary/10 bg-primary/5"
                  type="text"
                  name="department"
                  value={editForm.department}
                  onChange={handleEditFormChange}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-slate-100 text-slate-600 font-bold text-sm disabled:opacity-70"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-lg bg-primary text-white font-bold text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-red-600">Delete User</h2>
            </div>

            <div className="p-5 space-y-4">
              {deleteErrorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {deleteErrorMessage}
                </div>
              )}

              <p className="text-sm text-slate-600 dark:text-slate-300">
                Are you sure you want to delete <span className="font-semibold">{deletingUser?.name}</span>?
                This action cannot be undone.
              </p>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-slate-100 text-slate-600 font-bold text-sm disabled:opacity-70"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-red-600 text-white font-bold text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard2;
