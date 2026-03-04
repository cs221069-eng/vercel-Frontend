import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { API_BASE_URL, storeAuthSession } from "../utils/auth";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/login/9165`,
        { email, password },
        { withCredentials: true }
      );
      const redirectPath = response?.data?.redirect;
      const role = response?.data?.role;

      storeAuthSession(response?.data);

      if (redirectPath) {
        navigate(redirectPath);
      } else if (role === "admin") {
        navigate("/admin-dashboard-1");
      } else if (role === "teacher") {
        navigate("/teacher-dashboard-1");
      } else {
        navigate("/student-dashboard-1");
      }
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      <div className="relative hidden md:flex md:w-1/2 flex-col items-center justify-center p-12 bg-gradient-to-br from-primary via-[#1e3a8a] to-[#172554] overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-[-5%] right-[-5%] w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-8 p-6 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 shadow-2xl">
            <span className="material-symbols-outlined text-white !text-7xl">school</span>
          </div>
          <h1 className="text-white text-5xl font-black tracking-tight mb-4">UniProjects</h1>
          <p className="text-white/80 text-xl font-light max-w-md">
            Streamline your research journey. The ultimate management system for final year university projects.
          </p>
        </div>
      </div>

      <div className="flex w-full md:w-1/2 flex-col items-center justify-center p-4 sm:p-8 md:p-12">
        <div className="glass-effect w-full max-w-[460px] p-6 sm:p-8 md:p-10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:bg-slate-900/40 dark:border-slate-800">
          <div className="mb-8 sm:mb-10">
            <h3 className="text-slate-900 dark:text-white text-2xl sm:text-3xl font-bold mb-2">Welcome Back</h3>
            <p className="text-slate-500 dark:text-slate-400 text-base">Please sign in to your project portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
                {errorMessage}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold tracking-wide ml-1">University Email</label>
              <input className="w-full px-4 py-3 sm:py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" placeholder="student@university.edu" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold tracking-wide ml-1">Password</label>
              <input className="w-full px-4 py-3 sm:py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button className="w-full bg-primary hover:bg-accent text-white font-bold py-3 sm:py-4 rounded-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
