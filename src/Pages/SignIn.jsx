import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const USERS_KEY = "propsandshops_users";
const SESSION_KEY = "propsandshops_session";

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

export default function SignIn() {
  const navigate = useNavigate();
  const [view, setView] = useState("signin");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });

  const [signUpData, setSignUpData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    agree: false,
  });

  const [verifyCode, setVerifyCode] = useState(["", "", "", "", "", ""]);

  const [profileData, setProfileData] = useState({
    phone: "",
    gender: "",
    photoName: "",
    photoDataUrl: "",
  });

  const [pendingUser, setPendingUser] = useState(null);

  const panelTitle = useMemo(() => {
    if (view === "signin") return "Sign In";
    if (view === "signup") return "Sign Up";
    if (view === "verify") return "Verify Code";
    return "Complete Your Profile";
  }, [view]);

  const resetMessages = () => {
    setError("");
    setSuccess("");
  };

  const switchToSignIn = () => {
    resetMessages();
    setView("signin");
  };

  const switchToSignUp = () => {
    resetMessages();
    setView("signup");
  };

  const handleSignInSubmit = (event) => {
    event.preventDefault();
    resetMessages();

    if (!signInData.email.trim() || !signInData.password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    const users = getStoredUsers();
    const match = users.find(
      (user) =>
        user.email.toLowerCase() === signInData.email.trim().toLowerCase() &&
        user.password === signInData.password,
    );

    if (!match) {
      setError("No account found with these credentials.");
      return;
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(match));
    setSuccess(`Welcome back, ${match.firstName || "User"}. You are signed in.`);
    navigate("/buyer-dashboard", { replace: true });
  };

  const handleSignUpSubmit = (event) => {
    event.preventDefault();
    resetMessages();

    if (
      !signUpData.firstName.trim() ||
      !signUpData.lastName.trim() ||
      !signUpData.email.trim() ||
      !signUpData.password.trim()
    ) {
      setError("Please fill all sign up fields.");
      return;
    }

    if (!signUpData.agree) {
      setError("Please agree to terms before continuing.");
      return;
    }

    const users = getStoredUsers();
    const exists = users.some(
      (user) =>
        user.email.toLowerCase() === signUpData.email.trim().toLowerCase(),
    );

    if (exists) {
      setError("This email already exists. Sign in instead.");
      setView("signin");
      setSignInData((prev) => ({ ...prev, email: signUpData.email }));
      return;
    }

    setPendingUser({
      id: Date.now(),
      firstName: signUpData.firstName.trim(),
      lastName: signUpData.lastName.trim(),
      email: signUpData.email.trim(),
      password: signUpData.password,
    });

    setVerifyCode(["", "", "", "", "", ""]); // ✅ Fixed: array not string
    setView("verify");
    setSuccess("Account details captured. Enter any code to verify.");
  };

  // ✅ Fixed: single correct version, no duplicate
  const handleVerifySubmit = (event) => {
    event.preventDefault();
    resetMessages();

    const codeString = verifyCode.join("");
    if (!codeString.trim()) {
      setError("Enter a verification code to continue.");
      return;
    }

    if (!pendingUser) {
      setError("No signup session found. Please sign up again.");
      setView("signup");
      return;
    }

    setView("profile");
    setSuccess("Verification successful.");
  };

  const finalizeUser = (payload) => {
    const users = getStoredUsers();
    const updatedUsers = [...users, payload];
    saveStoredUsers(updatedUsers);
    localStorage.setItem(SESSION_KEY, JSON.stringify(payload));

    setPendingUser(null);
    setView("signin");
    setSignInData({ email: payload.email, password: "" });
    setSignUpData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      agree: false,
    });
    setProfileData({ phone: "", gender: "", photoName: "", photoDataUrl: "" });
    setVerifyCode(["", "", "", "", "", ""]); // ✅ Fixed: array not string
    setSuccess("Account created. You can now sign in.");
    navigate("/buyer-dashboard", { replace: true });
  };

  const handleCompleteProfile = (event) => {
    event.preventDefault();
    resetMessages();

    if (!pendingUser) {
      setError("No signup session found. Please sign up again.");
      setView("signup");
      return;
    }

    if (!profileData.phone.trim() || !profileData.gender.trim()) {
      setError("Please fill phone and gender, or use Skip.");
      return;
    }

    finalizeUser({
      ...pendingUser,
      verified: true,
      phone: profileData.phone.trim(),
      gender: profileData.gender,
      photoName: profileData.photoName,
      photoDataUrl: profileData.photoDataUrl,
    });
  };

  const handleSkipProfile = () => {
    resetMessages();

    if (!pendingUser) {
      setError("No signup session found. Please sign up again.");
      setView("signup");
      return;
    }

    finalizeUser({
      ...pendingUser,
      verified: true,
      phone: "",
      gender: "",
      photoName: "",
      photoDataUrl: "",
    });
  };

  const onPhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProfileData((prev) => ({
        ...prev,
        photoName: file.name,
        photoDataUrl: String(reader.result || ""),
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^[0-9]?$/.test(value)) return;

    const newCode = [...verifyCode];
    newCode[index] = value;
    setVerifyCode(newCode);

    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f2ec] px-4 py-10 sm:px-6">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border border-[#4e3f36] bg-[#f8f5ef] shadow-xl lg:grid-cols-[1.15fr_1fr]">
        <aside className="relative min-h-[280px] lg:min-h-[760px]">
          <img
            src="https://images.unsplash.com/photo-1726062899787-a3e688951804?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Interior"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="absolute left-6 top-6 text-2xl font-bold tracking-wide text-white"
            style={{ fontFamily: '"Orbitron"' }}
          >
            PROPSANDSHOPS
          </div>
          <div className="absolute bottom-6 left-6 right-6 rounded-xl border border-white/25 bg-white/20 p-4 text-white backdrop-blur-sm">
            <p className="text-sm sm:text-base">
              Build your account and continue your shopping journey.
            </p>
            <p className="mt-2 text-xs opacity-90">Secure local flow</p>
          </div>
        </aside>

        <section className="p-6 sm:p-10 lg:p-12">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mb-4 rounded-full border border-[#d9d5cd] px-4 py-2 text-sm font-semibold text-[#2f2d2a] transition hover:bg-[#ece7de] cursor-pointer"
          >
            Back
          </button>
          <h1
            className="text-3xl font-bold text-[#1f1f1f]"
            style={{ fontFamily: '"Orbitron"' }}
          >
            {panelTitle}
          </h1>
          <p className="mt-1 text-sm text-[#4e4e4e]">
            {view === "signin" && "Please fill your details to access your account."}
            {view === "signup" && "Fill your information below to create your account."}
            {view === "verify" && "Enter any code for now to continue."}
            {view === "profile" && "Add profile details or skip this step."}
          </p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {success}
            </div>
          )}

          {view === "signin" && (
            <form className="mt-8 space-y-4" onSubmit={handleSignInSubmit}>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#232323]">
                  Email
                </label>
                <input
                  type="email"
                  value={signInData.email}
                  onChange={(event) =>
                    setSignInData((prev) => ({ ...prev, email: event.target.value }))
                  }
                  className="w-full rounded-full border border-[#d9d5cd] bg-transparent px-4 py-3 outline-none transition focus:border-[#2b2926]"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-[#232323]">
                  Password
                </label>
                <input
                  type="password"
                  value={signInData.password}
                  onChange={(event) =>
                    setSignInData((prev) => ({ ...prev, password: event.target.value }))
                  }
                  className="w-full rounded-full border border-[#d9d5cd] bg-transparent px-4 py-3 outline-none transition focus:border-[#2b2926]"
                  placeholder="Enter password"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-[#2f2d2a] px-5 py-3 font-semibold text-white transition hover:bg-[#1e1d1b] cursor-pointer"
              >
                Sign In
              </button>

              <p className="text-center text-sm text-[#4e4e4e]">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={switchToSignUp}
                  className="font-semibold text-[#d1622d] underline cursor-pointer"
                >
                  Sign Up
                </button>
              </p>
              <button
                type="button"
                onClick={() => navigate("/admin-signin")}
                className="w-full rounded-full border border-[#2f2d2a] px-5 py-3 font-semibold text-[#2f2d2a] transition hover:bg-[#ece7de] cursor-pointer mt-5"
              >
                Sign In as Admin
              </button>
            </form>
          )}

          {view === "signup" && (
            <form className="mt-8 space-y-4" onSubmit={handleSignUpSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-[#232323]">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={signUpData.firstName}
                    onChange={(event) =>
                      setSignUpData((prev) => ({ ...prev, firstName: event.target.value }))
                    }
                    className="w-full rounded-full border border-[#d9d5cd] bg-transparent px-4 py-3 outline-none transition focus:border-[#2b2926]"
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-[#232323]">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={signUpData.lastName}
                    onChange={(event) =>
                      setSignUpData((prev) => ({ ...prev, lastName: event.target.value }))
                    }
                    className="w-full rounded-full border border-[#d9d5cd] bg-transparent px-4 py-3 outline-none transition focus:border-[#2b2926]"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-[#232323]">
                  Email
                </label>
                <input
                  type="email"
                  value={signUpData.email}
                  onChange={(event) =>
                    setSignUpData((prev) => ({ ...prev, email: event.target.value }))
                  }
                  className="w-full rounded-full border border-[#d9d5cd] bg-transparent px-4 py-3 outline-none transition focus:border-[#2b2926]"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-[#232323]">
                  Password
                </label>
                <input
                  type="password"
                  value={signUpData.password}
                  onChange={(event) =>
                    setSignUpData((prev) => ({ ...prev, password: event.target.value }))
                  }
                  className="w-full rounded-full border border-[#d9d5cd] bg-transparent px-4 py-3 outline-none transition focus:border-[#2b2926]"
                  placeholder="Enter password"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-[#4e4e4e]">
                <input
                  type="checkbox"
                  checked={signUpData.agree}
                  onChange={(event) =>
                    setSignUpData((prev) => ({ ...prev, agree: event.target.checked }))
                  }
                />
                Agree to <Link to="/terms" className="text-blue-500 underline">Terms & Conditions</Link>
              </label>

              <button
                type="submit"
                className="w-full rounded-full bg-[#2f2d2a] px-5 py-3 font-semibold text-white transition hover:bg-[#1e1d1b] cursor-pointer"
              >
                Continue to Verification
              </button>

              <p className="text-center text-sm text-[#4e4e4e]">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={switchToSignIn}
                  className="font-semibold text-[#d1622d] underline cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            </form>
          )}

          {view === "verify" && (
            <form className="mt-8 space-y-4" onSubmit={handleVerifySubmit}>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#232323]">
                  Verification Code
                </label>
                <div className="flex gap-2 font-black text-2xl">
                  {verifyCode.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      id={`code-${index}`}
                      value={digit}
                      onChange={(e) => handleChange(e, index)}
                      className="w-full rounded-full border border-[#d9d5cd] bg-transparent px-3 py-4 outline-none transition focus:border-[#2b2926] text-center"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-[#2f2d2a] px-5 py-3 font-semibold text-white transition hover:bg-[#1e1d1b] cursor-pointer mt-5"
              >
                Verify
              </button>

              <button
                type="button"
                onClick={() => {
                  setVerifyCode(["", "", "", "", "", ""]); // ✅ Fixed: array not string
                  setSuccess("You can enter any code to verify for now.");
                  setError("");
                }}
                className="w-full rounded-full border border-[#d9d5cd] px-5 py-3 font-semibold text-[#2f2d2a] transition hover:bg-[#ece7de]"
              >
                Resend Code
              </button>
            </form>
          )}

          {view === "profile" && (
            <form className="mt-8 space-y-4" onSubmit={handleCompleteProfile}>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#232323]">
                  Profile Photo (Optional)
                </label>
                <div className="flex justify-center">
                  <label
                    htmlFor="profile-photo"
                    className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-full border border-[#d9d5cd] bg-[#f8f5ef] text-center transition hover:bg-[#ece7de]"
                  >
                    {profileData.photoDataUrl ? (
                      <img
                        src={profileData.photoDataUrl}
                        alt="Profile preview"
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <>
                        <span className="text-xs font-semibold text-[#3a3a3a]">Add Photo</span>
                        <span className="text-[10px] text-[#767676]">Browse</span>
                      </>
                    )}
                  </label>
                  <input
                    id="profile-photo"
                    type="file"
                    accept="image/*"
                    onChange={onPhotoChange}
                    className="hidden"
                  />
                </div>
                {profileData.photoName && (
                  <p className="mt-2 text-center text-xs text-[#4e4e4e]">
                    Selected: {profileData.photoName}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-[#232323]">
                  Phone
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(event) =>
                    setProfileData((prev) => ({ ...prev, phone: event.target.value }))
                  }
                  className="w-full rounded-full border border-[#d9d5cd] bg-transparent px-4 py-3 outline-none transition focus:border-[#2b2926]"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-[#232323]">
                  Gender
                </label>
                <select
                  value={profileData.gender}
                  onChange={(event) =>
                    setProfileData((prev) => ({ ...prev, gender: event.target.value }))
                  }
                  className="w-full rounded-full border border-[#d9d5cd] bg-transparent px-4 py-3 outline-none transition focus:border-[#2b2926]"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-[#2f2d2a] px-5 py-3 font-semibold text-white transition hover:bg-[#1e1d1b] cursor-pointer"
              >
                Complete Profile
              </button>

              <button
                type="button"
                onClick={handleSkipProfile}
                className="w-full rounded-full border border-[#d9d5cd] px-5 py-3 font-semibold text-[#2f2d2a] transition hover:bg-[#ece7de] cursor-pointer"
              >
                Skip for Now
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}