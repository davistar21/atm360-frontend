"use client";
import React, { useState } from "react";
import { IADPerson, useIADStore } from "@/lib/store/IADStore";
import { addIADPerson, removeIADPerson } from "@/lib/api/iadApi";
import { useTransparencyStore } from "@/lib/store/transparencyStore";

export default function IADPersonnelManager() {
  const { current, personnel, addPerson, removePerson } = useIADStore();
  const [form, setForm] = useState({
    name: "",
    role: "ENGINEER",
    phone: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const { addLog } = useTransparencyStore();
  if (!current)
    return (
      <div
        style={{
          backgroundColor: "var(--color-zenith-neutral-50)",
          color: "var(--color-zenith-neutral-600)",
        }}
        className="p-4 rounded shadow text-sm"
      >
        No IAD selected.
      </div>
    );

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (!current) return;
    const p = {
      id: `p-${Date.now()}`,
      name: form.name,
      role: form.role as IADPerson["role"],
      phone: form.phone,
      email: form.email,
    };
    const r = await addIADPerson(current.id, p);
    if (r.ok) {
      addPerson(p);
      addLog({
        type: "security-event",
        details: `IAD personnel added: ${p.name} (${p.role}) for IAD ${current.name} (${current.id})`,
        severity: "info",
        user: { id: "system", role: "ops" },
        meta: {
          iadName: current.name,
          iadId: current.id,
          personName: p.name,
          personRole: p.role,
        },
      });
      setForm({ name: "", role: "ENGINEER", phone: "", email: "" });
    }
    setLoading(false);
  }

  async function handleRemove(id: string) {
    if (!current) return;
    setLoading(true);
    await removeIADPerson(current.id, id);
    removePerson(id);
    addLog({
      type: "security-event",
      details: `IAD personnel removed: ${id} from IAD ${current.name} (${current.id})`,
      severity: "info",
      user: { id: "system", role: "ops" },
      meta: { iadName: current.name, iadId: current.id, personId: id },
    });
    setLoading(false);
  }

  return (
    <div
      style={{ backgroundColor: "var(--color-zenith-neutral-50)" }}
      className="shadow rounded p-4 space-y-3"
    >
      <h4
        style={{ color: "var(--color-zenith-neutral-700)" }}
        className="font-semibold"
      >
        Personnel
      </h4>

      <ul className="space-y-2">
        {personnel.map((p) => (
          <li
            key={p.id}
            className="flex justify-between items-center"
            style={{ color: "var(--color-zenith-neutral-700)" }}
          >
            <div>
              <div
                className="text-sm font-medium"
                style={{ color: "var(--color-zenith-neutral-800)" }}
              >
                {p.name}
              </div>
              <div
                className="text-xs"
                style={{ color: "var(--color-zenith-neutral-500)" }}
              >
                {p.role} • {p.phone}
              </div>
            </div>
            <div>
              <button
                onClick={() => handleRemove(p.id)}
                className="text-sm"
                style={{ color: "var(--color-zenith-error)" }}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
        {personnel.length === 0 && (
          <li
            className="text-xs"
            style={{ color: "var(--color-zenith-neutral-400)" }}
          >
            No personnel added.
          </li>
        )}
      </ul>

      <form
        onSubmit={handleAdd}
        className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-3"
      >
        <input
          required
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="p-2 rounded col-span-2"
          style={{
            border: "1px solid var(--color-zenith-neutral-300)",
            color: "var(--color-zenith-neutral-700)",
            backgroundColor: "white",
          }}
        />
        <select
          value={form.role}
          onChange={(e) =>
            setForm({ ...form, role: e.target.value as IADPerson["role"] })
          }
          className="p-2 rounded"
          style={{
            border: "1px solid var(--color-zenith-neutral-300)",
            color: "var(--color-zenith-neutral-700)",
            backgroundColor: "white",
          }}
        >
          <option value="REPRESENTATIVE">Representative</option>
          <option value="ENGINEER">Engineer</option>
          <option value="COMPLIANCE OFFICER">Compliance Officer</option>
          <option value="CASH REPLENISHMENT AGENT">
            Cash Replenishment Agent
          </option>
          <option value="SECURITY OFFICER">Security Officer</option>
          <option value="SUPPORT">Support</option>
          <option value="OTHER">Other</option>
        </select>
        <input
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="p-2 rounded"
          style={{
            border: "1px solid var(--color-zenith-neutral-300)",
            color: "var(--color-zenith-neutral-700)",
            backgroundColor: "white",
          }}
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="p-2 rounded md:col-span-4"
          style={{
            border: "1px solid var(--color-zenith-neutral-300)",
            color: "var(--color-zenith-neutral-700)",
            backgroundColor: "white",
          }}
        />
        <div className="md:col-span-4">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded"
            style={{
              backgroundColor: "var(--color-zenith-accent-600)",
              color: "white",
            }}
          >
            {loading ? "Adding..." : "Add Person"}
          </button>
        </div>
      </form>
    </div>
  );
}
