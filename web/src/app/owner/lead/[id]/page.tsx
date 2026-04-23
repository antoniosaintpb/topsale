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

type ReportProblem = {
  title: string;
  why: string;
  evidence: string;
};

type ReportAction = {
  priority: string;
  title: string;
  how: string;
  owner: string;
  timeframeDays: string;
};

type ReportMetric = {
  metric: string;
  currentGuess: string;
  target30d: string;
  confidence: string;
};

type ReportRisk = {
  risk: string;
  mitigation: string;
};

type ReportViewModel = {
  executiveSummary: string;
  topProblems: ReportProblem[];
  actions: ReportAction[];
  metrics: ReportMetric[];
  risks: ReportRisk[];
  mode: string | null;
  llmStatus: string | null;
  llmError: string | null;
};

async function fetchJson<T>(path: string): Promise<T> {
  const upstream = process.env.API_UPSTREAM_URL ?? "http://localhost:8000";
  const response = await fetch(`${upstream}${path}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`fetch_failed:${path}`);
  }
  return response.json() as Promise<T>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asText(value: unknown, fallback = "—"): string {
  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : fallback;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return fallback;
}

function asItems(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord);
}

function normalizeReport(report: unknown): ReportViewModel | null {
  if (!isRecord(report)) {
    return null;
  }

  const llm = isRecord(report.llm) ? report.llm : null;

  return {
    executiveSummary: asText(report.executive_summary, "Краткий вывод пока не заполнен."),
    topProblems: asItems(report.top_problems).map((item) => ({
      title: asText(item.title),
      why: asText(item.why),
      evidence: asText(item.evidence)
    })),
    actions: asItems(report.actions).map((item) => ({
      priority: asText(item.priority),
      title: asText(item.title),
      how: asText(item.how),
      owner: asText(item.owner),
      timeframeDays: asText(item.timeframe_days)
    })),
    metrics: asItems(report.metric_forecast).map((item) => ({
      metric: asText(item.metric),
      currentGuess: asText(item.current_guess),
      target30d: asText(item.target_30d),
      confidence: asText(item.confidence)
    })),
    risks: asItems(report.risks).map((item) => ({
      risk: asText(item.risk),
      mitigation: asText(item.mitigation)
    })),
    mode: typeof report.mode === "string" ? report.mode : null,
    llmStatus: llm && typeof llm.status === "string" ? llm.status : null,
    llmError: llm && typeof llm.error === "string" ? llm.error : null
  };
}

function formatLeadStatus(status: string): string {
  const labels: Record<string, string> = {
    new: "Новая",
    context_collecting: "Сбор контекста",
    diagnosis_ready: "Диагностика готова",
    contacted: "Связались",
    in_work: "В работе"
  };

  return labels[status] ?? status;
}

function formatConfidence(confidence: string): string {
  const labels: Record<string, string> = {
    low: "Низкая",
    med: "Средняя",
    high: "Высокая"
  };

  return labels[confidence] ?? confidence;
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

  const reportView = normalizeReport(report);

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
          <strong>Статус:</strong> {formatLeadStatus(lead.status)}
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
        {!reportView ? (
          <p className="muted" style={{ marginTop: 0 }}>
            Отчет еще не сгенерирован.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: "#eef3ff",
                  color: "#245bff",
                  fontSize: 13,
                  fontWeight: 700
                }}
              >
                Статус лида: {formatLeadStatus(lead.status)}
              </span>
              {reportView.mode === "fallback_demo" ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "8px 12px",
                    borderRadius: 999,
                    background: "#fff4e5",
                    color: "#a15c00",
                    fontSize: 13,
                    fontWeight: 700
                  }}
                >
                  Демо-режим отчета
                </span>
              ) : null}
              {reportView.llmStatus === "ok" ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "8px 12px",
                    borderRadius: 999,
                    background: "#ebf9f2",
                    color: "#1f8f60",
                    fontSize: 13,
                    fontWeight: 700
                  }}
                >
                  LLM: OK
                </span>
              ) : null}
            </div>

            <div
              style={{
                padding: 20,
                borderRadius: 18,
                background: "#f8faff",
                border: "1px solid #e5ecff"
              }}
            >
              <h3 style={{ margin: "0 0 10px" }}>Краткий вывод</h3>
              <p style={{ margin: 0, lineHeight: 1.7 }}>{reportView.executiveSummary}</p>
            </div>

            {reportView.topProblems.length > 0 ? (
              <div style={{ display: "grid", gap: 12 }}>
                <h3 style={{ margin: 0 }}>Ключевые проблемы</h3>
                {reportView.topProblems.map((problem, index) => (
                  <div
                    key={`${problem.title}-${index}`}
                    style={{
                      padding: 18,
                      borderRadius: 18,
                      background: "#fff",
                      border: "1px solid #e6eaf5"
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{problem.title}</div>
                    <p style={{ margin: "10px 0 0", color: "#4b5876", lineHeight: 1.6 }}>
                      <strong style={{ color: "#172036" }}>Почему:</strong> {problem.why}
                    </p>
                    <p style={{ margin: "8px 0 0", color: "#4b5876", lineHeight: 1.6 }}>
                      <strong style={{ color: "#172036" }}>Основание:</strong> {problem.evidence}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}

            {reportView.actions.length > 0 ? (
              <div style={{ display: "grid", gap: 12 }}>
                <h3 style={{ margin: 0 }}>План действий</h3>
                {reportView.actions.map((action, index) => (
                  <div
                    key={`${action.title}-${index}`}
                    style={{
                      padding: 18,
                      borderRadius: 18,
                      background: "#fff",
                      border: "1px solid #e6eaf5"
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        flexWrap: "wrap"
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>{action.title}</div>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "6px 10px",
                          borderRadius: 999,
                          background: "#eef3ff",
                          color: "#245bff",
                          fontSize: 12,
                          fontWeight: 700
                        }}
                      >
                        {action.priority}
                      </span>
                    </div>
                    <p style={{ margin: "10px 0 0", color: "#4b5876", lineHeight: 1.6 }}>
                      <strong style={{ color: "#172036" }}>Как делать:</strong> {action.how}
                    </p>
                    <p style={{ margin: "8px 0 0", color: "#4b5876", lineHeight: 1.6 }}>
                      <strong style={{ color: "#172036" }}>Ответственный:</strong> {action.owner}
                    </p>
                    <p style={{ margin: "8px 0 0", color: "#4b5876", lineHeight: 1.6 }}>
                      <strong style={{ color: "#172036" }}>Срок:</strong>{" "}
                      {action.timeframeDays === "—" ? "Не указан" : `${action.timeframeDays} дн.`}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}

            {reportView.metrics.length > 0 ? (
              <div style={{ display: "grid", gap: 12 }}>
                <h3 style={{ margin: 0 }}>Метрики и прогноз</h3>
                {reportView.metrics.map((metric, index) => (
                  <div
                    key={`${metric.metric}-${index}`}
                    style={{
                      padding: 18,
                      borderRadius: 18,
                      background: "#fff",
                      border: "1px solid #e6eaf5"
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{metric.metric}</div>
                    <p style={{ margin: "10px 0 0", color: "#4b5876", lineHeight: 1.6 }}>
                      <strong style={{ color: "#172036" }}>Текущая оценка:</strong> {metric.currentGuess}
                    </p>
                    <p style={{ margin: "8px 0 0", color: "#4b5876", lineHeight: 1.6 }}>
                      <strong style={{ color: "#172036" }}>Цель на 30 дней:</strong> {metric.target30d}
                    </p>
                    <p style={{ margin: "8px 0 0", color: "#4b5876", lineHeight: 1.6 }}>
                      <strong style={{ color: "#172036" }}>Уверенность:</strong>{" "}
                      {formatConfidence(metric.confidence)}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}

            {reportView.risks.length > 0 ? (
              <div style={{ display: "grid", gap: 12 }}>
                <h3 style={{ margin: 0 }}>Риски</h3>
                {reportView.risks.map((risk, index) => (
                  <div
                    key={`${risk.risk}-${index}`}
                    style={{
                      padding: 18,
                      borderRadius: 18,
                      background: "#fff",
                      border: "1px solid #e6eaf5"
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{risk.risk}</div>
                    <p style={{ margin: "10px 0 0", color: "#4b5876", lineHeight: 1.6 }}>
                      <strong style={{ color: "#172036" }}>Как снизить:</strong> {risk.mitigation}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}

            {reportView.llmStatus === "error" ? (
              <p
                style={{
                  margin: 0,
                  padding: "14px 16px",
                  borderRadius: 16,
                  background: "#fff7f7",
                  border: "1px solid #ffd7d7",
                  color: "#8c2f2f",
                  lineHeight: 1.6
                }}
              >
                Отчет сформирован в резервном режиме. Его можно читать и использовать как первичную
                гипотезу, но для точной диагностики стоит повторить генерацию после проверки LLM.
              </p>
            ) : null}
          </div>
        )}
      </section>
    </main>
  );
}
