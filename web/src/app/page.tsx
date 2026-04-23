"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import ColorBends from "@/components/ColorBends";
import CountUp from "@/components/CountUp";
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
    <main className="container pageWithShader">
      <div className="shaderBackground" aria-hidden>
        <ColorBends
          rotation={90}
          speed={0.2}
          colors={["#A855F7"]}
          transparent
          autoRotate={0}
          scale={0.7}
          frequency={1}
          warpStrength={1}
          mouseInfluence={2}
          parallax={0.5}
          noise={0.34}
          iterations={1}
          intensity={1.5}
          bandWidth={6}
        />
      </div>
      <header className="hero">
        <h1>AI-диагностика отдела продаж</h1>
        <p className="sectionLead" style={{ marginBottom: 0 }}>
          Соберём контекст по вашей команде и воронке, покажем узкие места и дадим приоритизированный план улучшений на
          ближайший месяц — без лишней теории и «воды».
        </p>
        <div className="heroActions">
          <a className="primary" href="#lead-form">
            Оставить заявку
          </a>
          <a href="#services">Что входит</a>
          <a href="#faq">Вопросы</a>
        </div>
      </header>

      <section className="section" aria-labelledby="stats-title">
        <h2 id="stats-title" className="sectionTitle">
          Почему это имеет смысл
        </h2>
        <p className="sectionLead">
          На крупных консалтинговых сайтах обычно много социального доказательства и программ. У нас фокус уже на первом
          шаге: быстро понять, где «течёт» выручка и что менять в первую очередь.
        </p>
        <div className="stats">
          <div className="stat">
            <div className="statValue">
              <CountUp to={24} duration={1.2} className="countUpText" /> ч
            </div>
            <div className="statLabel">ориентир по первому отчёту после сбора контекста</div>
          </div>
          <div className="stat">
            <div className="statValue">
              <CountUp to={5} duration={1.2} className="countUpText" />-<CountUp to={7} duration={1.2} className="countUpText" />
            </div>
            <div className="statLabel">коротких вопросов в Telegram вместо длинных брифов</div>
          </div>
          <div className="stat">
            <div className="statValue">
              <CountUp to={1} duration={1} className="countUpText" />
            </div>
            <div className="statLabel">понятный список приоритетов, а не десяток слайдов «для галочки»</div>
          </div>
        </div>
      </section>

      <section className="section" id="services" aria-labelledby="services-title">
        <h2 id="services-title" className="sectionTitle">
          Услуги и формат
        </h2>
        <p className="sectionLead">
          Не «построим отдел с нуля за N месяцев», а диагностика и дорожная карта под вашу реальность — как на
          сильных лендингах в нише B2B, только быстрее и дешевле на старте.
        </p>
        <div className="services">
          <article className="serviceCard">
            <h3>Сбор контекста</h3>
            <p>
              Уточняем нишу, состав команды, текущую воронку и главную боль. Удобно в Telegram: можно отвечать
              короткими сообщениями между делами.
            </p>
          </article>
          <article className="serviceCard">
            <h3>Диагностика продаж</h3>
            <p>
              Разбор типичных точек потерь: квалификация, скорость реакции, конверсии по этапам, мотивация, CRM и
              регламенты — в привязке к тому, что вы описали.
            </p>
          </article>
          <article className="serviceCard">
            <h3>Отчёт и приоритеты</h3>
            <p>
              Структурированные выводы: что мешает росту сейчас, какой эффект ожидать от правок, что делать в первую
              очередь, а что отложить.
            </p>
          </article>
          <article className="serviceCard">
            <h3>План на 30 дней</h3>
            <p>
              Пошаговый ориентир на месяц: гипотезы, метрики, контрольные точки. Без обещаний «удвоим за 2 месяца» —
              только то, что логично вытекает из ваших данных.
            </p>
          </article>
        </div>
      </section>

      <section className="section" aria-labelledby="how-title">
        <h2 id="how-title" className="sectionTitle">
          Как это работает
        </h2>
        <p className="sectionLead">По смыслу похоже на «экскурсию в процесс», только в цифровом формате.</p>
        <div className="steps">
          <div className="step">
            <div>
              <h3>Заявка на сайте</h3>
              <p>Оставляете контакты и кратко описываете ситуацию — этого достаточно, чтобы мы завели карточку лида.</p>
            </div>
          </div>
          <div className="step">
            <div>
              <h3>Диалог в Telegram</h3>
              <p>Бот задаёт уточняющие вопросы. Чем конкретнее ответы, тем точнее итоговый разбор.</p>
            </div>
          </div>
          <div className="step">
            <div>
              <h3>AI + проверка логики</h3>
              <p>Модель собирает выводы в отчёт. Вы получаете ссылку на страницу статуса и материалы для обсуждения.</p>
            </div>
          </div>
          <div className="step">
            <div>
              <h3>Следующий шаг</h3>
              <p>
                Решаете сами: внедрять с командой, подключать консультанта или углубляться в отдельный проект. Мы не
                «закрываем» вас на бесконечный контракт.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="faq" aria-labelledby="faq-title">
        <h2 id="faq-title" className="sectionTitle">
          Частые вопросы
        </h2>
        <p className="sectionLead">То, что обычно спрашивают до старта — в духе блоков доверия на B2B-сайтах.</p>
        <div className="faq">
          <details>
            <summary>Это замена консультанта или «живого» отдела продаж?</summary>
            <p>
              Нет. Это быстрый срез и гипотезы на основе ваших ответов. Для внедрения регламентов, обучения менеджеров
              и жёсткого контроля исполнения всё равно нужны люди и процессы внутри компании.
            </p>
          </details>
          <details>
            <summary>Нужен ли доступ к CRM и внутренним цифрам?</summary>
            <p>
              На старте достаточно описания воронки и показателей своими словами. Если позже решите подключить CRM и
              выгрузки — диагностика станет ещё точнее, но это не обязательное условие.
            </p>
          </details>
          <details>
            <summary>Сколько это занимает по времени?</summary>
            <p>
              Заявка — пара минут. Ответы в боте обычно укладываются в один небольшой созвон по длительности, но без
              синхронизации: можно отвечать асинхронно в удобное время.
            </p>
          </details>
          <details>
            <summary>Конфиденциальность</summary>
            <p>
              Не публикуем ваши данные и не используем их как публичный кейс без отдельного согласия. Детали хранения
              и обработки можно прописать в политике — по запросу добавим на сайт отдельной страницей.
            </p>
          </details>
          <details>
            <summary>Что если ответы бота покажутся «слишком общими»?</summary>
            <p>
              Качество растёт от детализации: конкретные цифры, примеры сделок, где отваливаются клиенты, как устроена
              мотивация. Чем больше фактов, тем меньше шаблонов в итоге.
            </p>
          </details>
        </div>
      </section>

      <section className="section card" id="lead-form" aria-labelledby="form-title">
        <h2 id="form-title" className="sectionTitle" style={{ marginTop: 0 }}>
          Заявка на диагностику
        </h2>
        <p className="muted" style={{ marginTop: 0, marginBottom: 16 }}>
          После отправки откроется страница со ссылкой на Telegram-бота — там продолжим сбор контекста.
        </p>
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
          {error ? <p className="errorText">{error}</p> : null}
        </form>
      </section>
    </main>
  );
}
