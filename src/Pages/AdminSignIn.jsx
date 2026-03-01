import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const ADMIN_ALLOWED_KEY = "propsandshops_admin_allowed_emails";
const ADMIN_SESSION_KEY = "propsandshops_admin_session";
const ADMIN_CREDENTIALS_KEY = "propsandshops_admin_credentials";

const DEFAULT_ADMIN_EMAILS = [
  "opeyemidelek@outlook.com",
  "admin2@propsandshops.com",
  "admin3@propsandshops.com",
];

function getAllowedAdminEmails() {
  try {
    const raw = localStorage.getItem(ADMIN_ALLOWED_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_ALLOWED_KEY, JSON.stringify(DEFAULT_ADMIN_EMAILS));
      return DEFAULT_ADMIN_EMAILS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length) return parsed;
    localStorage.setItem(ADMIN_ALLOWED_KEY, JSON.stringify(DEFAULT_ADMIN_EMAILS));
    return DEFAULT_ADMIN_EMAILS;
  } catch (error) {
    localStorage.setItem(ADMIN_ALLOWED_KEY, JSON.stringify(DEFAULT_ADMIN_EMAILS));
    return DEFAULT_ADMIN_EMAILS;
  }
}

function getAdminCredentialsMap() {
  try {
    const raw = localStorage.getItem(ADMIN_CREDENTIALS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

function saveAdminCredentialsMap(value) {
  localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(value));
}

export default function AdminSignIn() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const normalizedEmail = useMemo(
    () => formData.email.trim().toLowerCase(),
    [formData.email],
  );
  const allowlist = useMemo(
    () => getAllowedAdminEmails().map((email) => email.toLowerCase()),
    [],
  );
  const credentialsMap = getAdminCredentialsMap();
  const isAllowlisted = allowlist.includes(normalizedEmail);
  const hasExistingPassword = Boolean(credentialsMap[normalizedEmail]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!normalizedEmail || !formData.password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    if (!isAllowlisted) {
      setError("You are not allowed to sign in as admin.");
      return;
    }

    const adminCredentials = getAdminCredentialsMap();
    const existingPassword = adminCredentials[normalizedEmail];

    if (!existingPassword) {
      adminCredentials[normalizedEmail] = formData.password.trim();
      saveAdminCredentialsMap(adminCredentials);
      setSuccess("Password created successfully. You are now signed in as admin.");
    } else if (existingPassword !== formData.password.trim()) {
      setError("Incorrect admin password.");
      return;
    } else {
      setSuccess("Admin sign in successful.");
    }

    localStorage.setItem(
      ADMIN_SESSION_KEY,
      JSON.stringify({
        email: normalizedEmail,
        role: "admin",
        signedInAt: new Date().toISOString(),
      }),
    );
    window.dispatchEvent(new Event("propsandshops-storage-updated"));
    navigate("/admin-dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f5f2ec] px-6 py-12">
      <div className="mx-auto max-w-2xl rounded-3xl border border-[#d9d5cd] bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-[#1f1f1f]" style={{ fontFamily: '"Orbitron"' }}>
          Admin Sign In
        </h1>
        <p className="mt-3 text-[#4e4e4e]">
          First-time admin sign-in will create your password. Next sign-ins use the same password.
        </p>
        {error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        {success && (
          <p className="mt-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            {success}
          </p>
        )}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-[#232323]">Admin Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="Enter admin email"
              className="w-full rounded-full border border-[#d9d5cd] px-4 py-3 outline-none focus:border-[#2f2d2a]"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-[#232323]">
              {hasExistingPassword ? "Password" : "Create Password"}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
              placeholder={hasExistingPassword ? "Enter password" : "Create password"}
              className="w-full rounded-full border border-[#d9d5cd] px-4 py-3 outline-none focus:border-[#2f2d2a]"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-[#2f2d2a] px-5 py-3 font-semibold text-white transition hover:bg-[#1e1d1b]"
          >
            {hasExistingPassword ? "Sign In as Admin" : "Create Password & Sign In"}
          </button>
        </form>
        <p className="mt-4 text-xs text-[#666]">
          Allowed emails key: <span className="font-semibold">{ADMIN_ALLOWED_KEY}</span>. Credentials key:{" "}
          <span className="font-semibold">{ADMIN_CREDENTIALS_KEY}</span>.
        </p>
        <button
          type="button"
          onClick={() => navigate("/signin")}
          className="mt-6 rounded-full border border-[#2f2d2a] px-5 py-2 font-semibold text-[#2f2d2a] transition hover:bg-[#ece7de]"
        >
          Back to User Sign In
        </button>
      </div>
    </div>
  );
}
