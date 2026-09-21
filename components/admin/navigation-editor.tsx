"use client";

import { useMemo, useState } from "react";
import type { NavigationItem, NavSource } from "@/types/content";
import { Field, SelectField } from "@/components/admin/fields";

const sourceOptions: Array<{ value: NavSource; label: string }> = [
  { value: "manual", label: "Manual (only the submenu items below)" },
  { value: "productCategories", label: "Auto: product categories" },
  { value: "principals", label: "Auto: principals" },
  { value: "newsCategories", label: "Auto: news categories" },
];

const clone = (items: NavigationItem[]) => items.map((item) => ({ ...item }));

export function NavigationEditor({ items, saving, error, onSave }: { items: NavigationItem[]; saving: boolean; error: string; onSave: (items: NavigationItem[], removed: NavigationItem[]) => Promise<void> }) {
  const [working, setWorking] = useState<NavigationItem[]>(() => clone(items));
  const [removed, setRemoved] = useState<NavigationItem[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [baseline, setBaseline] = useState(items);

  if (baseline !== items) {
    setBaseline(items);
    setWorking(clone(items));
    setRemoved([]);
    setConfirmDelete(null);
  }

  const dirty = useMemo(() => removed.length > 0 || JSON.stringify(working) !== JSON.stringify(items), [working, items, removed]);

  const parents = useMemo(() => working.filter((item) => !item.parent).sort((a, b) => a.sort - b.sort), [working]);
  const childrenOf = (key: string) => working.filter((item) => item.parent === key).sort((a, b) => a.sort - b.sort);

  function update(id: string, patch: Partial<NavigationItem>) {
    setWorking((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function move(id: string, direction: -1 | 1) {
    setWorking((current) => {
      const item = current.find((entry) => entry.id === id);
      if (!item) return current;
      const siblings = current.filter((entry) => (entry.parent || "") === (item.parent || "")).sort((a, b) => a.sort - b.sort);
      const index = siblings.findIndex((entry) => entry.id === id);
      const target = siblings[index + direction];
      if (!target) return current;
      const reordered = [...siblings];
      reordered[index] = target;
      reordered[index + direction] = item;
      const sortById = new Map(reordered.map((entry, entryIndex) => [entry.id, (entryIndex + 1) * 10]));
      return current.map((entry) => sortById.has(entry.id) ? { ...entry, sort: sortById.get(entry.id) as number } : entry);
    });
  }

  function removeItem(id: string) {
    const targets = working.filter((item) => item.id === id || item.parent === id);
    setWorking((current) => current.filter((item) => !targets.some((target) => target.id === item.id)));
    setRemoved((current) => [...current, ...targets.filter((target) => !current.some((entry) => entry.id === target.id))]);
    setConfirmDelete(null);
  }

  function addItem(parent: string) {
    const base: NavigationItem = {
      id: `draft-${Date.now()}`,
      key: `draft-${Date.now()}`,
      label: parent ? "New submenu item" : "New menu",
      href: "/",
      parent,
      sort: (working.filter((item) => (item.parent || "") === parent).length + 1) * 10,
      enabled: true,
      source: "manual",
    };
    setWorking((current) => [...current, base]);
  }

  async function handleSave() {
    await onSave(clone(working), removed);
  }

  function renderControls(item: NavigationItem) {
    return <span className="admin-card-tools">
      <button className="admin-tool-move" title="Move up" onClick={() => move(item.id, -1)}>↑</button>
      <button className="admin-tool-move" title="Move down" onClick={() => move(item.id, 1)}>↓</button>
      <button className={`navigation-toggle ${item.enabled ? "is-on" : "is-off"}`} onClick={() => update(item.id, { enabled: !item.enabled })}>{item.enabled ? "ON" : "OFF"}</button>
      {confirmDelete === item.id
        ? <>
            <button className="admin-tool-delete" onClick={() => removeItem(item.id)}>Confirm</button>
            <button className="admin-tool-cancel" onClick={() => setConfirmDelete(null)}>Cancel</button>
          </>
        : <button className="admin-tool-delete" onClick={() => setConfirmDelete(item.id)}>Delete</button>}
    </span>;
  }

  function renderFields(item: NavigationItem) {
    if (item.parent) {
      return <div className="navigation-fields">
        <Field label="Label" value={item.label} onChange={(value) => update(item.id, { label: value })} />
        <Field label="Link" value={item.href} onChange={(value) => update(item.id, { href: value })} />
        <SelectField label="Parent menu" value={item.parent} options={parents.map((parent) => ({ value: parent.id, label: parent.label }))} onChange={(value) => update(item.id, { parent: value })} />
      </div>;
    }
    return <div className="navigation-fields">
      <Field label="Label" value={item.label} onChange={(value) => update(item.id, { label: value })} />
      <Field label="Link" value={item.href} onChange={(value) => update(item.id, { href: value })} />
      <SelectField label="Submenu source" value={item.source || "manual"} options={sourceOptions} onChange={(value) => update(item.id, { source: value as NavSource })} />
    </div>;
  }

  function renderRow(item: NavigationItem, isChild: boolean) {
    return <article className={`navigation-node ${isChild ? "navigation-child" : "navigation-parent"}`} key={item.id}>
      <div className="navigation-node-bar">
        <span className="navigation-branch">{isChild ? "↳" : "☰"}</span>
        <div><strong>{item.label}</strong><small>{item.href}</small></div>
        {renderControls(item)}
      </div>
      <details className="navigation-edit"><summary>Edit item</summary>{renderFields(item)}</details>
    </article>;
  }

  return <div className="navigation-editor">
    <div className="admin-toolbar">
      <button className="button button-orange" onClick={() => addItem("")}>+ Add menu group</button>
      <button className="button admin-save" disabled={!dirty || saving} onClick={handleSave}>{saving ? "Saving..." : "Save navigation"}</button>
    </div>
    <p className="admin-help">Menus render on every page in this order. A group with an automatic source appends live entries from that collection after its manual submenu items. Changes take effect after “Save navigation”.</p>
    {error ? <p className="admin-error">{error}</p> : null}
    <div className="navigation-tree">
      {parents.map((parent) => {
        const children = childrenOf(parent.id);
        return <section className="navigation-group" key={parent.id}>
          <div className="navigation-group-head"><div><span className="eyebrow">MENU GROUP</span><h2>{parent.label}</h2><p>{parent.href}</p></div><span>{children.length} manual items · {sourceOptions.find((option) => option.value === (parent.source || "manual"))?.label}</span></div>
          {renderRow(parent, false)}
          <div className="navigation-children">{children.map((child) => renderRow(child, true))}</div>
          <button className="navigation-add-child" onClick={() => addItem(parent.id)}>+ Add submenu item</button>
        </section>;
      })}
      {working.filter((item) => item.parent && !parents.some((parent) => parent.id === item.parent)).map((item) => renderRow(item, true))}
    </div>
  </div>;
}
