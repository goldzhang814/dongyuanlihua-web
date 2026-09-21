"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { apiFetch, jsonInit } from "@/components/admin/api";

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await apiFetch("/api/admin/auth", jsonInit("POST", { username, password }));
      onLogin();
    } catch {
      setError("Invalid username or password");
    } finally {
      setBusy(false);
    }
  }

  return <main className="admin-login"><section className="admin-login-panel"><div className="admin-logo">DL <span>CONTENT DESK</span></div><span className="eyebrow">SECURE ADMIN ACCESS</span><h1>Sign in to manage content.</h1><p>Use your administrator account to edit navigation, products, news and FAQs.</p><form onSubmit={login}><label className="admin-field">Username<input required autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} /></label><label className="admin-field">Password<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>{error && <p className="admin-login-error">{error}</p>}<button className="button button-orange" type="submit" disabled={busy}>{busy ? "Signing in..." : "Sign in"} <span>↗</span></button></form><Link href="/">← View website</Link></section></main>;
}
