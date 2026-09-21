import { useSyncExternalStore } from "react";
import type { SiteData } from "@/types/content";

export type Backend = "local" | "pocketbase";
export type AdminSnapshot = { status: "ready"; data: SiteData; backend: Backend } | { status: "error"; error: string } | null;

export type MutationResult = { ok: true; data: SiteData };

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init);
  const body = (await response.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!response.ok || !body) throw new Error(body?.error || `Request failed (${response.status})`);
  return body;
}

export function jsonInit(method: string, payload: unknown): RequestInit {
  return { method, headers: { "content-type": "application/json" }, body: JSON.stringify(payload) };
}

const messageOf = (error: unknown) => (error instanceof Error ? error.message : "Request failed");

let snapshot: AdminSnapshot = null;
let backend: Backend = "local";
let pending: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

async function fetchSnapshot() {
  try {
    const body = await apiFetch<{ data: SiteData; backend: Backend }>("/api/admin/content");
    backend = body.backend;
    snapshot = { status: "ready", data: body.data, backend: body.backend };
  } catch (error) {
    snapshot = { status: "error", error: messageOf(error) };
  }
  emit();
}

export function refreshAdminData(): Promise<void> {
  if (!pending) {
    snapshot = null;
    pending = fetchSnapshot().finally(() => {
      pending = null;
    });
  }
  return pending;
}

export function commitAdminData(data: SiteData) {
  snapshot = { status: "ready", data, backend };
  emit();
}

export function clearAdminData() {
  snapshot = null;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useAdminData(): AdminSnapshot {
  return useSyncExternalStore(subscribe, () => snapshot, () => null);
}
