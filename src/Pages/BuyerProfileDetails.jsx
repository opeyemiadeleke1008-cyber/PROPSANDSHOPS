import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../Layouts/Footer";
import UserHeader from "../Layouts/UserHeader";

const SESSION_KEY = "propsandshops_session";
const USERS_KEY = "propsandshops_users";
const NOTIFICATIONS_KEY = "propsandshops_notifications";

function getSessionUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function getStoredUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function saveStoredUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getNotificationSettings() {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

function saveNotificationSettings(value) {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(value));
}

export default function BuyerProfileDetails() {
  const navigate = useNavigate();
  const [sessionUser, setSessionUser] = useState(getSessionUser());

  useEffect(() => {
    if (!sessionUser?.email) {
      navigate("/signin", { replace: true });
    }
  }, [navigate, sessionUser]);

  useEffect(() => {
    const refreshSession = () => setSessionUser(getSessionUser());
    window.addEventListener("storage", refreshSession);
    window.addEventListener("propsandshops-storage-updated", refreshSession);
    return () => {
      window.removeEventListener("storage", refreshSession);
      window.removeEventListener("propsandshops-storage-updated", refreshSession);
    };
  }, []);

  if (!sessionUser?.email) return null;

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new Event("propsandshops-storage-updated"));
    navigate("/", { replace: true });
  };

  const updateUserEverywhere = (patch) => {
    if (!sessionUser?.email) return;

    const nextSession = { ...sessionUser, ...patch };
    const users = getStoredUsers();
    const nextUsers = users.map((user) =>
      user.email?.toLowerCase() === sessionUser.email.toLowerCase()
        ? { ...user, ...patch }
        : user,
    );

    saveStoredUsers(nextUsers);
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    setSessionUser(nextSession);
    window.dispatchEvent(new Event("propsandshops-storage-updated"));
  };

  const notificationSettings = getNotificationSettings();
  const notificationsEnabled = Boolean(notificationSettings[sessionUser.email]);

  const handleNotificationToggle = () => {
    const nextSettings = {
      ...notificationSettings,
      [sessionUser.email]: !notificationsEnabled,
    };
    saveNotificationSettings(nextSettings);
    window.dispatchEvent(new Event("propsandshops-storage-updated"));
  };

  const handleProfilePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      updateUserEverywhere({
        photoName: file.name,
        photoDataUrl: String(reader.result || ""),
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[#f6f4ef]">
      <UserHeader />
      <main className="mx-auto w-[92%] max-w-5xl pt-28 pb-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-full border border-[#d9d5cd] px-4 py-2 text-sm font-semibold text-[#2f2d2a] transition hover:bg-[#ece7de]"
        >
          Back
        </button>

        <section className="mt-5 rounded-3xl border border-[#ddd3c6] bg-white p-8 shadow-[0_10px_28px_rgba(0,0,0,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-bold text-[#1f1f1f]" style={{ fontFamily: '"Orbitron"' }}>
              Buyer Profile
            </h1>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-[#e3b8b8] px-4 py-2 text-sm font-semibold text-[#8f3e3e] transition hover:bg-[#faecec]"
            >
              Log Out
            </button>
          </div>
          <p className="mt-2 text-[#5d5a55]">Your account details and onboarding information.</p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-[#f7f2e9] p-4 sm:col-span-2">
              <p className="text-xs uppercase text-[#8d7b65]">Profile Picture</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-14 w-14 overflow-hidden rounded-full border border-[#d8ccb9] bg-white">
                  {sessionUser.photoDataUrl ? (
                    <img src={sessionUser.photoDataUrl} alt="Buyer profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-xs text-[#8d7b65]">None</div>
                  )}
                </div>
                <p className="text-sm text-[#5d5a55]">{sessionUser.photoName || "No photo uploaded yet"}</p>
              </div>
            </div>
            <div className="rounded-xl bg-[#f7f2e9] p-4">
              <p className="text-xs uppercase text-[#8d7b65]">First Name</p>
              <p className="mt-1 font-semibold text-[#2a2824]">{sessionUser.firstName || "-"}</p>
            </div>
            <div className="rounded-xl bg-[#f7f2e9] p-4">
              <p className="text-xs uppercase text-[#8d7b65]">Last Name</p>
              <p className="mt-1 font-semibold text-[#2a2824]">{sessionUser.lastName || "-"}</p>
            </div>
            <div className="rounded-xl bg-[#f7f2e9] p-4">
              <p className="text-xs uppercase text-[#8d7b65]">Email</p>
              <p className="mt-1 font-semibold text-[#2a2824]">{sessionUser.email}</p>
            </div>
            <div className="rounded-xl bg-[#f7f2e9] p-4">
              <p className="text-xs uppercase text-[#8d7b65]">Phone</p>
              <p className="mt-1 font-semibold text-[#2a2824]">{sessionUser.phone || "-"}</p>
            </div>
            <div className="rounded-xl bg-[#f7f2e9] p-4">
              <p className="text-xs uppercase text-[#8d7b65]">Gender</p>
              <p className="mt-1 font-semibold text-[#2a2824]">{sessionUser.gender || "-"}</p>
            </div>
          </div>

          <section className="mt-8 rounded-2xl border border-[#e3dacd] bg-[#fcfaf6] p-5">
            <h2 className="text-xl font-bold text-[#1f1f1f]" style={{ fontFamily: '"Orbitron"' }}>
              Buyer Settings
            </h2>
            <p className="mt-1 text-sm text-[#5d5a55]">Manage notifications and your profile photo.</p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[#e6dece] bg-white p-4">
                <p className="text-sm font-semibold text-[#2a2824]">Notifications</p>
                <p className="mt-1 text-xs text-[#6f6b64]">Enable order and delivery updates.</p>
                <button
                  type="button"
                  onClick={handleNotificationToggle}
                  className={`mt-3 rounded-full px-4 py-2 text-xs font-semibold ${notificationsEnabled ? "bg-emerald-100 text-emerald-700" : "bg-[#efe6d9] text-[#5a4a3c]"}`}
                >
                  {notificationsEnabled ? "Enabled" : "Disabled"}
                </button>
              </div>

              <div className="rounded-xl border border-[#e6dece] bg-white p-4">
                <p className="text-sm font-semibold text-[#2a2824]">Change Profile Picture</p>
                <p className="mt-1 text-xs text-[#6f6b64]">Upload a new image for your account.</p>
                <label
                  htmlFor="buyer-profile-photo"
                  className="mt-3 inline-block cursor-pointer rounded-full border border-[#d9d5cd] px-4 py-2 text-xs font-semibold text-[#2f2d2a] hover:bg-[#ece7de]"
                >
                  Choose Image
                </label>
                <input
                  id="buyer-profile-photo"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePhotoChange}
                  className="hidden"
                />
              </div>
            </div>
          </section>
        </section>
      </main>
      <Footer />
    </div>
  );
}
