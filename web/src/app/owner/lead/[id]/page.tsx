import Link from "next/link";

import { StatusForm } from "./status-form";

type Lead = {
  id: string;
  name: string;
  niche: string;
  team_size: number;
  problem: string;
  telegram_username: string | null;
  phone: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

type ReportResponse = {
  lead_id: string;
  report: unknown;
};

async function fetchJson<T>(path: string): Promise<T> {
  const upstream = process.env.API_UPSTREAM_URL ?? "http://localhost:8000";
  const response = await fetch(`${upstream}${path}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`fetch_failed:${path}`);
  }
  return response.json() as Promise<T>;
}

export default async function OwnerLeadPage({ params }: { params: { id: string } }) {
  const lead = await fetchJson<Lead>(`/api/leads/${params.id}`);

  let report: unknown | null = null;
  try {
    const reportResponse = await fetchJson<ReportResponse>(`/api/leads/${params.id}/report`);
    report = reportResponse.report;
  } catch {
    report = null;
  }

  return (
    <main className="container">
      <p>
        <Link href="/owner">← Назад</Link>
      </p>
      <h1>Лид: {lead.name}</h1>

      <section className="card">
        <p>
          <strong>Ниша:</strong> {lead.niche}
        </p>
        <p>
          <strong>Команда:</strong> {lead.team_size}
        </p>
        <p>
          <strong>Статус:</strong> {lead.status}
        </p>
        <p>
          <strong>Telegram:</strong> {lead.telegram_username ?? "—"}
        </p>
        <p>
          <strong>Телефон:</strong> {lead.phone ?? "—"}
        </p>
        <p>
          <strong>Проблема:</strong> {lead.problem}
        </p>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Сменить статус</h2>
        <StatusForm leadId={lead.id} />
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Отчет</h2>
        <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {report ? JSON.stringify(report, null, 2) : "Отчет еще не сгенерирован."}
        </pre>
      </section>
    </main>
  );
}
