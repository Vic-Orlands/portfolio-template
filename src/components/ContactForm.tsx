"use client";

import { useEffect, useState, type FormEvent } from "react";
import { PaperPlaneIcon } from "@radix-ui/react-icons";

const fieldClassName =
  "w-full rounded-[10px] border border-zinc-300 bg-white px-3 py-2.5 font-sans text-xs text-black outline-none transition-colors placeholder:text-zinc-300 focus:border-zinc-500 dark:border-zinc-800/70 dark:bg-zinc-900/40 dark:text-zinc-300 dark:placeholder:text-zinc-700 dark:focus:border-zinc-500";

export function ContactSection() {
  return (
    <section id="contact" className="border-t border-zinc-300 pt-6 dark:border-zinc-800">
      <h2 className="font-instrument text-base italic text-black dark:text-zinc-300">
        Let&apos;s Collaborate
      </h2>
      <p className="mt-0.5 font-sans text-sm text-zinc-600 dark:text-zinc-500">
        Send an inquiry or drop a line.
      </p>
    </section>
  );
}

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!error && !success) return;
    const timeout = window.setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 2000);
    return () => window.clearTimeout(timeout);
  }, [error, success]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim() || undefined,
          message: message.trim(),
        }),
      });
      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        id?: string;
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to send message.");
      }
      if (data?.ok !== true || !data.id) {
        throw new Error("Email delivery was not confirmed.");
      }

      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setSuccess("Message sent.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to send message.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="space-y-4"
      id="form-contact-portfolio"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="space-y-1 font-sans text-[11px] font-medium text-zinc-700 dark:text-zinc-400">
          NAME *
          <input
            type="text"
            required
            autoComplete="name"
            placeholder="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={fieldClassName}
          />
        </label>
        <label className="space-y-1 font-sans text-[11px] font-medium text-zinc-700 dark:text-zinc-400">
          EMAIL *
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={fieldClassName}
          />
        </label>
      </div>

      <label className="block space-y-1 font-sans text-[11px] font-medium text-zinc-700 dark:text-zinc-400">
        SUBJECT
        <input
          type="text"
          placeholder="Inquiry / Feedback / Collaboration"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          className={fieldClassName}
        />
      </label>

      <label className="block space-y-1 font-sans text-[11px] font-medium text-zinc-700 dark:text-zinc-400">
        MESSAGE *
        <textarea
          required
          rows={5}
          placeholder="Write your note here..."
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className={`${fieldClassName} resize-none leading-relaxed`}
        />
      </label>

      <div aria-live="polite" aria-atomic="true">
        {error && <p className="font-mono text-xs text-rose-500">{error}</p>}
        {success && (
          <p className="font-mono text-xs text-emerald-600 dark:text-emerald-400">
            {success}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-zinc-800 p-3 font-sans text-xs text-zinc-100 transition-colors hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 disabled:opacity-50 dark:bg-zinc-300 dark:text-zinc-800 dark:hover:bg-zinc-200"
      >
        {isSubmitting ? (
          <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <PaperPlaneIcon className="size-3.5" />
        )}
        <span>{isSubmitting ? "SENDING..." : "SEND MESSAGE"}</span>
      </button>
    </form>
  );
}
