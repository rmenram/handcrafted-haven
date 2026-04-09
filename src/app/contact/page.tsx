"use client";

import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("idle");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (!res.ok) {
        setStatus("error");
        return;
      }

      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <header className="mb-10 space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight">Contact Us</h1>
        <p className="text-slate-600">
          We’d love to hear from you. Send us a message and we’ll get back to you soon.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border bg-white p-8 shadow-sm"
      >
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:ring-amber-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:ring-amber-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Message</label>
          <textarea
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:ring-amber-500"
          ></textarea>
        </div>

        <button
          type="submit"
          className="rounded-md bg-amber-600 px-5 py-2 text-white shadow-sm transition hover:bg-amber-700"
        >
          Send Message
        </button>

        {status === "success" && (
          <p className="text-sm text-green-600">Your message has been sent!</p>
        )}
        {status === "error" && (
          <p className="text-sm text-red-600">Something went wrong. Try again.</p>
        )}
      </form>
    </main>
  );
}
