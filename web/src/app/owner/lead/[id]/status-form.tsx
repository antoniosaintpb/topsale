"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUSES = [
  { value: "new", label: "new" },
  { value: "context_collecting", label: "context_collecting" },
  { value: "diagnosis_ready", label: "diagnosis_ready" },
  { value: "contacted", label: "contacted" },
  { value: "in_work", label: "in_work" }
];

export function StatusForm({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState("contacted");
  const [isSaving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSave() {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/leads/${leadId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (!response.ok) {
        throw new Error("Не удалось обновить статус");
      }
      router.refresh();
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Ошибка";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid">
      <label>
        Новый статус
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          {STATUSES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <button type="button" onClick={onSave} disabled={isSaving}>
        {isSaving ? "Сохранение..." : "Сохранить"}
      </button>
      {error ? <p>{error}</p> : null}
    </div>
  );
}
