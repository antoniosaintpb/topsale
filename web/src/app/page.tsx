"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { API_BASE_URL } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      niche: String(form.get("niche") || ""),
      team_size: Number(form.get("team_size") || 1),
      problem: String(form.get("problem") || ""),
      telegram_username: String(form.get("telegram_username") || "") || null,
      phone: String(form.get("phone") || "") || null
    };

    try {
      const response = await fetch(`${API_BASE_URL}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error("Не удалось отправить заявку");
      }
      const data = await response.json();
      router.push(`/lead/${data.id}`);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Ошибка отправки";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="container">
      <h1>AI-диагностика отдела продаж</h1>
      <p>
        Оставь заявку и получи первичный анализ узких мест, прогноз эффекта и план действий на 30 дней.
      </p>

      <section className="card">
        <form className="grid" onSubmit={onSubmit}>
          <label>
            Имя
            <input name="name" required minLength={2} />
          </label>
          <label>
            Ниша бизнеса
            <input name="niche" required minLength={2} />
          </label>
          <label>
            Размер команды продаж
            <input name="team_size" type="number" required min={1} max={5000} />
          </label>
          <label>
            Текущая проблема
            <textarea name="problem" rows={4} required minLength={10} />
          </label>
          <label>
            Telegram username
            <input name="telegram_username" placeholder="@username" />
          </label>
          <label>
            Телефон
            <input name="phone" inputMode="tel" />
          </label>

          <button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Отправка..." : "Отправить заявку"}
          </button>
          {error ? <p>{error}</p> : null}
        </form>
      </section>
    </main>
  );
}
