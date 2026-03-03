import React from "react";

export default function Newsletter() {
  return (
    <div className="flex flex-col gap-5 bg-black/95 px-4 py-16 text-white sm:px-6 sm:py-20">
      <h1 className="mb-4 text-center text-3xl font-bold" style={{ fontFamily: '"Orbitron"' }}>
        Newsletter
      </h1>
      <h3 className="text-center text-xl font-bold">Join Our World</h3>
      <p className="mx-auto max-w-2xl text-center text-sm sm:text-base">
        Be the first to discover new collections, artisan stories, and exclusive invitations.
      </p>
      <div className="mx-auto mt-6 flex w-full max-w-3xl flex-col items-stretch gap-4 md:flex-row md:items-center">
        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-full border border-gray-100 bg-transparent px-4 py-3 text-white outline-none placeholder:text-sm"
        />
        <button className="flex items-center justify-center gap-2 rounded-full bg-white/30 px-5 py-3">
          Subscribe
        </button>
      </div>
    </div>
  );
}
