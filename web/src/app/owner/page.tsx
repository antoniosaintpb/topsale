import Link from "next/link";

type LeadSummary = {
  id: string;
  name: string;
  niche: string;
  team_size: number;
  status: string;
  created_at: string;
};

async function fetchLeads(): Promise<LeadSummary[]> {
  const upstream = process.env.API_UPSTREAM_URL ?? "http://localhost:8000";
  const response = await fetch(`${upstream}/api/leads?limit=50`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("failed_to_fetch_leads");
  }
  return response.json();
}

export default async function OwnerHomePage() {
  const leads = await fetchLeads();

  return (
    <main className="container">
      <h1>Кабинет специалиста</h1>
      <p>Список последних заявок.</p>

      <section className="card">
        <div className="grid">
          {leads.map((lead) => (
            <div key={lead.id} className="card" style={{ boxShadow: "none", border: "1px solid #e6eaf5" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{lead.name}</div>
                  <div style={{ color: "#4b5876", fontSize: 14 }}>{lead.niche}</div>
                  <div style={{ color: "#4b5876", fontSize: 14 }}>Команда: {lead.team_size}</div>
                  <div style={{ color: "#4b5876", fontSize: 14 }}>Статус: {lead.status}</div>
                </div>
                <Link className="buttonLink" href={`/owner/lead/${lead.id}`}>
                  Открыть
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
