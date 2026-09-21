"use client";

import { useState, type FormEvent } from "react";

export function QuoteForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (asText(data.get("website"))) {
      setStatus("sent");
      return;
    }
    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: asText(data.get("name")),
          company: asText(data.get("company")),
          email: asText(data.get("email")),
          interest: asText(data.get("interest")),
          message: asText(data.get("message")),
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(body?.error || "Failed to send your inquiry");
      }
      setStatus("sent");
      form.reset();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to send your inquiry");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return <div className="quote-form quote-form-sent"><span className="eyebrow">INQUIRY RECEIVED</span><h2>Thank you. Your inquiry is with our team.</h2><p>We respond within 24 business hours. For urgent requests, message us on WhatsApp at +86 135 4415 3386.</p></div>;
  }

  return <form className="quote-form" onSubmit={submit}>
    <label>Full name<input required name="name" maxLength={100} /></label>
    <label>Company name<input required name="company" maxLength={200} /></label>
    <label>Email address<input required type="email" name="email" maxLength={200} /></label>
    <label>Product interest<select name="interest"><option>Shoe Machinery</option><option>Shoe Materials</option><option>Acetate Tow</option><option>Multiple products</option></select></label>
    <label>Requirements<textarea name="message" rows={5} maxLength={5000} /></label>
    <label className="hp-field">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
    {error ? <p className="admin-error">{error}</p> : null}
    <button className="button button-orange" type="submit" disabled={status === "sending"}>{status === "sending" ? "Sending..." : "Send inquiry"} <span>↗</span></button>
  </form>;
}

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}
