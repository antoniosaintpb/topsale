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
    <main>
      <section className="siteShell leadSuccessShell">
        <header className="topbar successTopbar">
          <Link className="brand successBrandLink" href="/">
            TopSell
          </Link>
          <div className="topbarMenu successTopbarMenu">
            <Link className="successBackLink" href="/">
              На главный экран
            </Link>
          </div>
        </header>

        <section className="leadSuccessHero card">
          <span className="eyebrow">Заявка принята</span>
          <h1 className="heroTitle successTitle">Спасибо, {lead.name}. Мы зарегистрировали вашу заявку.</h1>
          <p className="heroText successText">
            Следующий шаг: откройте Telegram-бота, ответьте на короткие вопросы и мы продолжим диагностику уже в
            удобном формате.
          </p>

          <div className="successActions">
            <a className="topbarCta successPrimaryCta" href={telegramLink} target="_blank" rel="noreferrer">
              Перейти в Telegram-бота
            </a>
            <Link className="successSecondaryCta" href="/">
              Вернуться на главный экран
            </Link>
          </div>

          <div className="successChecklist">
            <div className="successStepCard">
              <strong>1. Откройте бота</strong>
              <span>Ссылка уже привязана к вашей заявке, ничего дополнительно вводить не нужно.</span>
            </div>
            <div className="successStepCard">
              <strong>2. Ответьте на вопросы</strong>
              <span>Короткий опрос поможет собрать контекст по воронке, команде и текущей проблеме.</span>
            </div>
            <div className="successStepCard">
              <strong>3. Получите разбор</strong>
              <span>После ответов мы сформируем краткий вывод и дальнейшие шаги по диагностике.</span>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
