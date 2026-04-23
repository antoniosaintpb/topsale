"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import CountUp from "@/components/CountUp";
import { API_BASE_URL } from "@/lib/api";

const services = [
  {
    title: "Экспресс-диагностика продаж",
    description:
      "Быстро выявляем, где теряются заявки, где тормозит воронка и какие решения дадут наибольший эффект в ближайшие недели."
  },
  {
    title: "Разбор CRM и регламентов",
    description:
      "Смотрим, как у вас устроены этапы, поля, логика контроля и передача лидов. Находим, что мешает команде работать системно."
  },
  {
    title: "План внедрения на 30 дней",
    description:
      "Собираем понятную дорожную карту: что делать сначала, какие метрики смотреть и как проверять, что изменения реально работают."
  }
] as const;

const benefits = [
  "Собираем контекст через короткую форму и Telegram, а не через многочасовые брифы.",
  "Фокусируемся на практических точках роста: скорость реакции, квалификация, конверсии, дисциплина.",
  "Отдаём не просто диагноз, а последовательность действий, которую можно брать в работу сразу."
] as const;

const steps = [
  {
    title: "Оставляете заявку",
    description: "Фиксируете нишу, состав команды и ключевую проблему, чтобы мы сразу зашли в контекст."
  },
  {
    title: "Отвечаете на вопросы в Telegram",
    description: "Бот собирает важные детали по процессу продаж, не перегружая лишними полями."
  },
  {
    title: "Получаете отчёт и план",
    description: "Мы формируем выводы, приоритеты и рекомендации, которые можно обсуждать внутри команды."
  }
] as const;

const faqItems = [
  {
    question: "Это замена консультанта или руководителя отдела продаж?",
    answer:
      "Нет. Это быстрый аналитический слой: помогает понять, что происходит в продажах и куда смотреть в первую очередь. Внедрение изменений всё равно требует людей и процессов."
  },
  {
    question: "Нужен ли доступ к CRM и цифрам компании?",
    answer:
      "На старте достаточно описания воронки, команды и текущих болей. Если дальше захотите усилить точность, можно подключать данные глубже."
  },
  {
    question: "Сколько времени это займёт с моей стороны?",
    answer:
      "Обычно форма плюс ответы в Telegram занимают 20-40 минут суммарно. Это асинхронный формат, без обязательных созвонов."
  },
  {
    question: "Что я получу в итоге?",
    answer:
      "Вы получите структурированный разбор текущей ситуации, список приоритетов, объяснение причин просадки и пошаговый план на ближайшие 30 дней."
  }
] as const;

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
    <main>
      <section className="siteShell">
        <header className="topbar">
          <div className="brand">TopSell</div>
          <nav className="topnav" aria-label="Основная навигация">
            <a href="#services">Услуги</a>
            <a href="#process">Процесс</a>
            <a href="#faq">FAQ</a>
          </nav>
          <a className="topbarCta" href="#lead-form">
            Оставить заявку
          </a>
        </header>

        <section className="heroGrid">
          <div className="heroCopy">
            <span className="eyebrow">AI sales diagnostics</span>
            <h1 className="heroTitle">Понимание проблем в продажах без долгого консалтинга</h1>
            <p className="heroText">
              Соберём контекст по команде, воронке и управлению, покажем узкие места и подготовим план действий на 30
              дней. Формат быстрый, понятный и без лишней теории.
            </p>
            <div className="heroActions">
              <a className="primary" href="#lead-form">
                Начать диагностику
              </a>
              <a href="#services">Посмотреть формат</a>
            </div>
          </div>

          <div className="heroPanel card">
            <p className="heroPanelTitle">Что вы получаете</p>
            <ul className="bulletList">
              <li>Разбор текущей ситуации в отделе продаж</li>
              <li>Приоритизированные точки роста</li>
              <li>План внедрения на 2-4 недели</li>
            </ul>
            <div className="heroPanelStats">
              <div className="miniStat">
                <div className="miniStatValue">
                  <CountUp to={24} duration={1.2} className="countUpText" /> ч
                </div>
                <div className="miniStatLabel">ориентир по первому отчёту</div>
              </div>
              <div className="miniStat">
                <div className="miniStatValue">
                  <CountUp to={5} duration={1.2} className="countUpText" />-<CountUp to={7} duration={1.2} className="countUpText" />
                </div>
                <div className="miniStatLabel">вопросов в Telegram</div>
              </div>
            </div>
          </div>
        </section>

        <section className="section blockSection" aria-labelledby="services-title" id="services">
          <div className="sectionHead">
            <span className="eyebrow">Наши услуги</span>
            <h2 id="services-title" className="sectionTitle largeTitle">
              Диагностика, которая помогает понять, что менять в первую очередь
            </h2>
            <p className="sectionLead wideLead">
              Вдохновляемся чистой структурой Boldo: крупный оффер, ясные секции, хорошие отступы и удобное чтение как
              на компьютере, так и на телефоне. Контент при этом остаётся твоим.
            </p>
          </div>
          <div className="servicesGrid">
            {services.map((service) => (
              <article className="serviceCard featureCard" key={service.title}>
                <div className="featureIcon" aria-hidden>
                  •
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section splitSection">
          <div className="splitMedia card darkCard">
            <p className="darkCardEyebrow">Почему это имеет смысл</p>
            <div className="metricsRow">
              <div className="metricItem">
                <div className="metricValue">
                  <CountUp to={24} duration={1.2} className="countUpText" /> ч
                </div>
                <div className="metricLabel">до первого структурированного вывода</div>
              </div>
              <div className="metricItem">
                <div className="metricValue">
                  <CountUp to={1} duration={1} className="countUpText" />
                </div>
                <div className="metricLabel">единый список приоритетов вместо хаоса гипотез</div>
              </div>
            </div>
          </div>

          <div className="splitContent">
            <h2 className="sectionTitle largeTitle">Не строим красивую теорию. Помогаем увидеть, где реально течёт выручка.</h2>
            <ul className="checkList">
              {benefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
            <a className="textCta" href="#lead-form">
              Оставить заявку
            </a>
          </div>
        </section>

        <section className="section blockSection" aria-labelledby="process-title" id="process">
          <div className="sectionHead">
            <span className="eyebrow">Как это работает</span>
            <h2 id="process-title" className="sectionTitle largeTitle">
              Короткий путь от заявки до понятного плана действий
            </h2>
          </div>
          <div className="processGrid">
            {steps.map((step, index) => (
              <article className="step processCard" key={step.title}>
                <div className="processIndex">{String(index + 1).padStart(2, "0")}</div>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section splitSection reverseSplit">
          <div className="splitContent">
            <span className="eyebrow">Для собственника и команды</span>
            <h2 className="sectionTitle largeTitle">Чтобы не спорить о симптомах, а быстро договориться о приоритетах</h2>
            <p className="sectionLead wideLead">
              Диагностика полезна, когда отдел продаж вроде бы работает, но результат нестабилен: падают конверсии,
              менеджеры по-разному обрабатывают лиды, нет ясности, что влияет на рост сильнее всего.
            </p>
          </div>
          <div className="quoteCard card">
            <p className="quoteText">
              «Идея не в том, чтобы заменить руководителя или консультанта, а в том, чтобы быстро собрать картину и
              сократить путь до внятных решений».
            </p>
            <p className="quoteAuthor">TopSell Diagnostics</p>
          </div>
        </section>

        <section className="section blockSection" id="faq" aria-labelledby="faq-title">
          <div className="sectionHead">
            <span className="eyebrow">Частые вопросы</span>
            <h2 id="faq-title" className="sectionTitle largeTitle">
              Всё, что обычно спрашивают до старта
            </h2>
          </div>
          <div className="faq">
            {faqItems.map((item) => (
              <details key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="section leadSection card" id="lead-form" aria-labelledby="form-title">
          <div className="leadSectionHead">
            <div>
              <span className="eyebrow">Старт</span>
              <h2 id="form-title" className="sectionTitle largeTitle">
                Оставьте заявку на диагностику
              </h2>
              <p className="muted">
                После отправки откроется страница со ссылкой на Telegram-бота. Там продолжим сбор контекста и перейдём
                к деталям.
              </p>
            </div>
          </div>
          <form className="leadForm" onSubmit={onSubmit}>
            <div className="formColumns">
              <label>
                Имя
                <input name="name" required minLength={2} />
              </label>
              <label>
                Ниша бизнеса
                <input name="niche" required minLength={2} />
              </label>
            </div>

            <div className="formColumns">
              <label>
                Размер команды продаж
                <input name="team_size" type="number" required min={1} max={5000} />
              </label>
              <label>
                Telegram username
                <input name="telegram_username" placeholder="@username" />
              </label>
            </div>

            <label>
              Текущая проблема
              <textarea name="problem" rows={5} required minLength={10} />
            </label>

            <label>
              Телефон
              <input name="phone" inputMode="tel" />
            </label>

            <div className="formFooter">
              <button disabled={isSubmitting} type="submit">
                {isSubmitting ? "Отправка..." : "Отправить заявку"}
              </button>
              {error ? <p className="errorText">{error}</p> : null}
            </div>
          </form>
        </section>

        <footer className="footer">
          <div>
            <div className="brand footerBrand">TopSell</div>
            <p className="muted footerText">AI-диагностика отдела продаж для быстрого понимания узких мест и точек роста.</p>
          </div>
          <div className="footerLinks">
            <a href="#services">Услуги</a>
            <a href="#process">Процесс</a>
            <a href="#faq">FAQ</a>
            <a href="#lead-form">Заявка</a>
          </div>
        </footer>
      </section>
    </main>
  );
}
