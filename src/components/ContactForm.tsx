"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";

type Category = "booking" | "refund" | "technical" | "complaint" | "question" | "other";

const CATEGORIES_EN: { value: Category; label: string }[] = [
  { value: "question",   label: "General Enquiry" },
  { value: "technical",  label: "Technical Support" },
  { value: "booking",    label: "Booking Issue" },
  { value: "refund",     label: "Refund Request" },
  { value: "complaint",  label: "Complaint" },
  { value: "other",      label: "Other" },
];

const CATEGORIES_AR: { value: Category; label: string }[] = [
  { value: "question",   label: "استفسار عام" },
  { value: "technical",  label: "دعم تقني" },
  { value: "booking",    label: "مشكلة حجز" },
  { value: "refund",     label: "طلب استرداد" },
  { value: "complaint",  label: "شكوى" },
  { value: "other",      label: "أخرى" },
];

export function ContactForm({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";
  const categories = isAr ? CATEGORIES_AR : CATEGORIES_EN;

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [category, setCategory] = useState<Category>("question");
  const [message,  setMessage]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          category,
          subject: name.trim(),
          body: message.trim(),
          contact_email: email.trim(),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setError(isAr
            ? "لقد أرسلت رسائل كثيرة. يرجى الانتظار دقيقة ثم المحاولة مجدداً."
            : "Too many requests. Please wait a moment and try again.");
        } else {
          setError(isAr
            ? "حدث خطأ. يرجى المحاولة مرة أخرى."
            : "Something went wrong. Please try again.");
        }
        return;
      }

      setTicketId(json.ticket?.id ?? "");
    } catch {
      setError(isAr
        ? "تعذّر الإرسال. يرجى التحقق من اتصالك والمحاولة مرة أخرى."
        : "Failed to send. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (ticketId !== null) {
    return (
      <div className="rounded-2xl border border-brand-mint/25 bg-brand-mint/5 p-8 text-center">
        <div className="mb-3 text-4xl">✅</div>
        <h2 className="mb-2 font-display text-xl font-semibold text-white">
          {isAr ? "تم إرسال رسالتك!" : "Message Sent!"}
        </h2>
        <p className="text-sm text-white/60">
          {isAr
            ? "شكراً لتواصلك معنا. سنرد عليك خلال 1-2 يوم عمل."
            : "Thanks for reaching out. We'll get back to you within 1-2 business days."}
        </p>
        {ticketId && (
          <p className="mt-3 font-mono text-xs text-white/30">
            {isAr ? "رقم التذكرة:" : "Ticket ID:"} {ticketId}
          </p>
        )}
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-brand-primary/60 focus:bg-white/[0.07]";

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir={isAr ? "rtl" : "ltr"} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Name */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/50">
            {isAr ? "الاسم الكامل" : "Full Name"} <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isAr ? "محمد يوسف" : "John Smith"}
            required
            minLength={2}
            maxLength={120}
            className={inputClass}
          />
        </div>

        {/* Email */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/50">
            {isAr ? "البريد الإلكتروني" : "Email"} <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={isAr ? "email@example.com" : "you@example.com"}
            required
            className={inputClass}
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-white/50">
          {isAr ? "نوع الاستفسار" : "Category"}
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className={`${inputClass} cursor-pointer`}
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value} className="bg-[#12121a] text-white">
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Message */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-white/50">
          {isAr ? "رسالتك" : "Message"} <span className="text-red-400">*</span>
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={isAr ? "اكتب رسالتك هنا…" : "Write your message here…"}
          required
          minLength={8}
          maxLength={4000}
          rows={5}
          className={`${inputClass} resize-none`}
        />
        <p className="mt-1 text-right text-[11px] text-white/20">
          {message.length} / 4000
        </p>
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !name.trim() || !email.trim() || !message.trim()}
        className="w-full rounded-xl bg-brand-primary py-3 text-sm font-semibold text-white
                   transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading
          ? (isAr ? "جارٍ الإرسال…" : "Sending…")
          : (isAr ? "إرسال الرسالة" : "Send Message")}
      </button>
    </form>
  );
}
