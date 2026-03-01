import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Layouts/Header";

export default function Contact() {
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const onChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-[#e8e6e4]">
      <Header />

      <main className="mx-auto w-[95%] max-w-7xl pb-8 pt-24 sm:pt-28">
        <div className="overflow-hidden rounded-2xl border border-[#bbb] bg-white shadow-[0_18px_45px_rgba(0,0,0,0.08)] lg:grid lg:grid-cols-[1fr_1fr]">
          <section className="relative overflow-hidden bg-[#070b16] p-6 text-white sm:p-10">
            <p className="text-sm tracking-wide text-[#d7d8dd]" style={{ fontFamily: '"Orbitron"' }}>
              PropsAndShops
            </p>
            <h1 className="mt-6 max-w-sm text-4xl font-semibold leading-[1.05] tracking-tight sm:mt-8 sm:text-5xl">
              We&apos;d love to hear from you
            </h1>

            <div className="pointer-events-none absolute bottom-18 left-[-90px] hidden h-60 w-60 rounded-full border border-white/35 sm:block" />
            <div className="pointer-events-none absolute bottom-18 left-[130px] hidden h-60 w-60 rounded-full border border-dashed border-white/35 sm:block" />
            <div className="pointer-events-none absolute bottom-18 left-[350px] hidden h-60 w-60 rounded-full border border-white/35 sm:block" />

            <p className="mt-10 text-xs text-[#c5c8d0] sm:absolute sm:bottom-8 sm:mt-0">
              Reach out anytime. We respond within 24 hours.
            </p>
          </section>

          <section className="bg-[#efefef] p-6 sm:p-10">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-5 rounded-full border border-[#bfbfbf] px-4 py-2 text-sm font-semibold text-[#2f2d2a] transition hover:bg-[#dfdfdf]"
            >
              Back
            </button>

            <h2 className="text-4xl font-semibold tracking-tight text-[#1f1f1f] sm:text-5xl" style={{ fontFamily: '"Orbitron"' }}>
              Contact us
            </h2>

            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-[#4b4b4b]">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => onChange("firstName", e.target.value)}
                    placeholder="Enter your first name"
                    className="mt-2 w-full border-0 border-b border-[#b6b6b6] bg-transparent px-0 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-[#4b4b4b]">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => onChange("lastName", e.target.value)}
                    placeholder="Enter your last name"
                    className="mt-2 w-full border-0 border-b border-[#b6b6b6] bg-transparent px-0 py-2 outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-[#4b4b4b]">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => onChange("email", e.target.value)}
                    placeholder="Enter your email"
                    className="mt-2 w-full border-0 border-b border-[#b6b6b6] bg-transparent px-0 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-[#4b4b4b]">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => onChange("phone", e.target.value)}
                    placeholder="Enter your phone number"
                    className="mt-2 w-full border-0 border-b border-[#b6b6b6] bg-transparent px-0 py-2 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-[#4b4b4b]">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => onChange("message", e.target.value)}
                  placeholder="Enter your message"
                  rows={3}
                  className="mt-2 w-full resize-none border-0 border-b border-[#b6b6b6] bg-transparent px-0 py-2 outline-none"
                />
              </div>

              <button
                type="submit"
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#1f1f1f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#111]"
              >
                Submit
                <span aria-hidden="true">-&gt;</span>
              </button>

              {sent && (
                <p className="text-sm text-emerald-700">
                  Message sent successfully. We&apos;ll get back to you shortly.
                </p>
              )}
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
