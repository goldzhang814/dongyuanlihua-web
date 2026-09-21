"use client";

import type { Quote } from "@/types/content";

export function QuotesPanel({ quotes, busy, errors, onDelete }: { quotes: Quote[]; busy: Record<string, boolean>; errors: Record<string, string>; onDelete: (id: string) => void }) {
  const sorted = [...quotes].sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  if (!sorted.length) {
    return <p className="admin-help">No inquiries yet. Quote requests submitted through the website contact form appear here.</p>;
  }
  return <div className="admin-list">
    {sorted.map((quote, index) => <div className="admin-card" key={quote.id}>
      <div className="admin-card-head">
        <span>#{sorted.length - index} · {quote.createdAt ? new Date(quote.createdAt).toLocaleString() : ""}</span>
        <span className="admin-card-tools">
          {busy[quote.id] ? <span className="admin-dirty">deleting...</span> : null}
          <button className="admin-tool-delete" disabled={Boolean(busy[quote.id])} onClick={() => onDelete(quote.id)}>Delete</button>
        </span>
      </div>
      {errors[quote.id] ? <p className="admin-error">{errors[quote.id]}</p> : null}
      <div className="admin-quote-body">
        <p><strong>{quote.name}</strong>{quote.company ? ` · ${quote.company}` : ""}</p>
        <p><a href={`mailto:${quote.email}`}>{quote.email}</a>{quote.interest ? <span className="admin-quote-tag">{quote.interest}</span> : null}</p>
        {quote.message ? <p className="admin-quote-message">{quote.message}</p> : null}
      </div>
    </div>)}
  </div>;
}
