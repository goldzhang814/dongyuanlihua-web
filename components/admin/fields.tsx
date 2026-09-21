"use client";

import { useState, type ReactNode } from "react";

export type Patch = Record<string, unknown>;

export function Field({ label, value, onChange, textarea = false, placeholder = "" }: { label: string; value: string; onChange: (value: string) => void; textarea?: boolean; placeholder?: string }) {
  return <label className="admin-field">{label}{textarea ? <textarea rows={3} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /> : <input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />}</label>;
}

export function SelectField({ label, value, options, onChange }: { label: string; value: string; options: Array<{ value: string; label: string }>; onChange: (value: string) => void }) {
  return <label className="admin-field">{label}<select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>;
}

export function ItemCard({ id, index, dirty, busy, error, summary, collapsedByDefault = false, onSave, onDelete, children }: { id: string; index: number; dirty: boolean; busy: boolean; error: string; summary?: string; collapsedByDefault?: boolean; onSave: () => void; onDelete: () => void; children: ReactNode }) {
  const [expanded, setExpanded] = useState(!collapsedByDefault);
  if (!expanded) {
    return <div className={`admin-card admin-card-collapsed${dirty ? " dirty" : ""}`}>
      <div className="admin-card-head">
        <span>#{index + 1} · {id}{summary ? <b className="admin-card-summary">{summary}</b> : null}</span>
        <span className="admin-card-tools">
          {dirty ? <span className="admin-dirty">unsaved</span> : null}
          <button className="admin-tool-save" onClick={() => setExpanded(true)}>Edit</button>
          <button className="admin-tool-delete" onClick={onDelete}>Delete</button>
        </span>
      </div>
      {error ? <p className="admin-error">{error}</p> : null}
    </div>;
  }
  return <div className={`admin-card${dirty ? " dirty" : ""}`}>
    <div className="admin-card-head">
      <span>#{index + 1} · {id}</span>
      <span className="admin-card-tools">
        <button className="admin-tool-cancel" onClick={() => setExpanded(false)}>Collapse</button>
        {dirty ? <span className="admin-dirty">unsaved</span> : null}
        <button className="admin-tool-save" disabled={!dirty || busy} onClick={onSave}>{busy ? "Saving..." : "Save"}</button>
        <button className="admin-tool-delete" onClick={onDelete}>Delete</button>
      </span>
    </div>
    {error ? <p className="admin-error">{error}</p> : null}
    {children}
  </div>;
}

async function looksLikeImage(file: File): Promise<boolean> {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const at = (...signature: number[]) => signature.every((byte, index) => bytes[index] === byte);
  if (at(0xff, 0xd8, 0xff)) return true; // JPEG
  if (at(0x89, 0x50, 0x4e, 0x47)) return true; // PNG
  if (at(0x47, 0x49, 0x46, 0x38)) return true; // GIF
  if (at(0x42, 0x4d)) return true; // BMP
  if (at(0x52, 0x49, 0x46, 0x46) && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return true; // WebP
  if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) return true; // ISO-BMFF family (AVIF/HEIC)
  return false;
}

export function ImageUpload({ label, value, uploadable, hint, onChange, upload }: { label: string; value: string; uploadable: boolean; hint: string; onChange: (value: string) => void; upload: (file: File) => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return <div className="admin-field admin-upload">
    <span className="admin-upload-label">{label}</span>
    {value ? <img className="admin-image-preview" src={value} alt="" /> : null}
    <input value={value} placeholder="/products/machine.jpg or https://..." onChange={(event) => onChange(event.target.value)} />
    {uploadable
      ? <label className="admin-upload-button">{busy ? "Uploading..." : "Upload image"}<input type="file" accept="image/*" hidden disabled={busy} onChange={(event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        setBusy(true);
        setError("");
        (async () => {
          if (!(await looksLikeImage(file))) {
            throw new Error("This file is not a real image (content mismatch). If it is a PDF or a phone photo (HEIC) renamed to .jpg, convert it to JPG or PNG and try again.");
          }
          await upload(file);
        })()
          .catch((uploadError: unknown) => setError(uploadError instanceof Error ? uploadError.message : "Upload failed"))
          .finally(() => setBusy(false));
      }} /></label>
      : <p className="admin-help">{hint}</p>}
    {error ? <p className="admin-error">{error}</p> : null}
  </div>;
}
