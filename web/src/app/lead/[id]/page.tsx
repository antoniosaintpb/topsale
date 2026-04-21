import Link from "next/link";

import { API_BASE_URL, TELEGRAM_BOT_USERNAME } from "@/lib/api";

type LeadPageProps = {
  params: {
    id: string;
  };
};

async function getLead(id: string) {
  const response = await fetch(`${API_BASE_URL}/leads/${id}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("lead_not_found");
  }
  return response.json();
}

export default async function LeadPage({ params }: LeadPageProps) {
  const lead = await getLead(params.id);
  const telegramLink = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${lead.id}`;

  return (
    <main className="container">
      <h1>Заявка отправлена</h1>
      <section className="card">
        <p>Спасибо, {lead.name}. Ваша заявка зарегистрирована.</p>
        <p>Статус: {lead.status}</p>
        <p>Следующий шаг: откройте Telegram-бота и ответьте на короткие вопросы.</p>
        <Link className="buttonLink" href={telegramLink} target="_blank">
          Перейти в Telegram-бота
        </Link>
      </section>
    </main>
  );
}
