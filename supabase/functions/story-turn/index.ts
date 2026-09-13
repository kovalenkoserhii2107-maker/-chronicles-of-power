import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const allowed = [
  "https://kovalenkoserhii2107-maker.github.io",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];
const headers = (origin: string | null) => ({
  "Access-Control-Allow-Origin": allowed.includes(origin || "")
    ? origin!
    : allowed[0],
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
  Vary: "Origin",
});
const zero = { treasury: 0, people: 0, elite: 0, security: 0, diplomacy: 0 };

const demoStory = {
  premise:
    "В день вступления президента в должность архив находит приказ, подписанный им двенадцать лет назад — когда он ещё не занимал государственных постов.",
  mystery:
    "Кто создал «Нулевой протокол» и почему в нём заранее записаны решения нового президента?",
  seasonQuestion:
    "Можно ли изменить план, если каждое сопротивление тоже будто предусмотрено?",
  act: 1,
  actTitle: "Документ, которого не должно быть",
  objective:
    "Установить происхождение первой страницы протокола, не показав противнику, что документ найден.",
  hiddenTruth:
    "Протокол составила группа реформаторов на основе многолетней модели кризисов; подпись добавил человек из будущей администрации, чтобы заставить президента следовать прогнозу.",
  mechanics: {
    insight: 8,
    exposure: 12,
    leverage: 1,
    relationships: [
      {
        name: "Мира Вельская",
        role: "министр финансов",
        trust: 52,
        suspicion: 18,
        stance: "Поможет, если расследование не обрушит казну",
      },
      {
        name: "Леон Арден",
        role: "глава администрации",
        trust: 45,
        suspicion: 36,
        stance: "Защищает аппарат и старые регламенты",
      },
      {
        name: "Иона Рей",
        role: "архивист",
        trust: 61,
        suspicion: 12,
        stance: "Ищет происхождение документа",
      },
    ],
    obligations: [],
    delayedEffects: [],
  },
  theories: [
    {
      id: "continuity",
      title: "Тайный совет преемственности",
      summary:
        "Часть аппарата десятилетиями управляет сменой президентов и заранее готовит их решения.",
      confidence: 34,
      status: "Не подтверждена",
    },
    {
      id: "foreign",
      title: "Операция соседней державы",
      summary:
        "Документ — искусная подделка, созданная для раскола нового правительства.",
      confidence: 33,
      status: "Не подтверждена",
    },
    {
      id: "model",
      title: "Проект политического прогнозирования",
      summary:
        "Кто-то научился предугадывать кризисы и подталкивает власть к рассчитанному маршруту.",
      confidence: 33,
      status: "Не подтверждена",
    },
  ],
  clues: [
    {
      id: "ink",
      title: "Чернила из закрытой типографии",
      text: "Экспертиза связывает печать с типографией правительственного квартала, закрытой девять лет назад.",
      reliability: "Подтверждено",
      supports: ["continuity", "model"],
    },
  ],
  characters: [
    "Мира Вельская — министр финансов",
    "Леон Арден — глава администрации",
    "Иона Рей — архивист",
  ],
};
const demoScene = {
  chapter: "Глава I",
  kicker: "Акт I · Президентский архив",
  title: "Подпись из прошлого",
  text: "Через час после присяги архивист Иона Рей приносит вам папку без номера. Внутри — «Нулевой протокол», датированный двенадцатью годами ранее. На первой странице стоит ваша подпись, а следующий пункт точно описывает утренний сбой связи в порту. О находке знают только Рей и глава администрации Леон Арден. Министр финансов уже требует срочно открыть резервный канал связи — именно так предписывает документ. Если приказ настоящий, кто-то знал сегодняшний кризис заранее. Если поддельный, его автор находится очень близко к кабинету.",
  speaker: "Иона Рей",
  role: "архивист",
  discovery:
    "Чернила печати использовались только в закрытой правительственной типографии.",
  choices: [
    {
      id: "secret_exam",
      label: "Тайно проверить бумагу и чернила",
      hint: "Сохраним находку в секрете, но доверимся узкому кругу экспертов.",
    },
    {
      id: "follow_line",
      label: "Выполнить следующий пункт протокола",
      hint: "Проверим точность документа, рискуя сыграть по чужому сценарию.",
    },
    {
      id: "controlled_leak",
      label: "Передать разным людям разные версии",
      hint: "Попробуем вычислить источник по тому, какая версия всплывёт.",
    },
  ],
};
function demo(body: any) {
  if (!body.choice)
    return {
      mode: "demo",
      consequence: {
        headline: "",
        text: "",
        newspaper: "",
        callback: "История только начинается.",
      },
      scene: demoScene,
      changes: zero,
      threads: ["Происхождение Нулевого протокола"],
      story: demoStory,
    };
  return {
    mode: "demo",
    consequence: {
      headline: "Первая нить натянута",
      text: `Решение «${body.choice.label}» сузило круг посвящённых, но неизвестный автор протокола уже отвечает на ваш ход. На полях второй страницы появилась отметка, которой архивист прежде не видел.`,
      newspaper:
        "Новая администрация отменила два закрытых совещания без объяснения причин.",
      callback: `Выбранный вами метод «${body.choice.label}» определил, кому теперь доступна улика.`,
    },
    scene: {
      ...demoScene,
      chapter: "Глава II",
      kicker: "Акт I · Ночная канцелярия",
      title: "Отметка на полях",
      text: "Экспертиза ещё не закончена, когда Иона Рей замечает на второй странице свежий знак. Камеры не фиксировали входа в архив, но электронный журнал открывался с терминала главы администрации. Леон Арден утверждает, что его пропуск скопировали. Одновременно министр финансов сообщает: резервный канал, упомянутый в протоколе, вывел правительство на неизвестный сервер. Теперь у вас две нити — доступ изнутри и слишком точное предсказание. Обе могут быть настоящими, а могут специально вести в разные стороны.",
      discovery:
        "На второй странице появился свежий знак после того, как папка оказалась в президентском архиве.",
    },
    changes: { treasury: -2, people: 0, elite: -2, security: 3, diplomacy: 0 },
    threads: [
      "Происхождение Нулевого протокола",
      `Метод расследования: ${body.choice.label}`,
    ],
    story: {
      ...demoStory,
      clues: [
        ...demoStory.clues,
        {
          id: "fresh_mark",
          title: "Свежая отметка",
          text: "Кто-то получил доступ к папке уже после инаугурации.",
          reliability: "Неясно",
          supports: ["continuity", "foreign"],
        },
      ],
    },
  };
}

const string = { type: "string" };
const theory = {
  type: "object",
  additionalProperties: false,
  required: ["id", "title", "summary", "confidence", "status"],
  properties: {
    id: string,
    title: string,
    summary: string,
    confidence: { type: "integer", minimum: 0, maximum: 100 },
    status: string,
  },
};
const clue = {
  type: "object",
  additionalProperties: false,
  required: ["id", "title", "text", "reliability", "supports"],
  properties: {
    id: string,
    title: string,
    text: string,
    reliability: {
      type: "string",
      enum: ["Подтверждено", "Неясно", "Сомнительно"],
    },
    supports: { type: "array", maxItems: 3, items: string },
  },
};
const relationship = {
  type: "object",
  additionalProperties: false,
  required: ["name", "role", "trust", "suspicion", "stance"],
  properties: {
    name: string,
    role: string,
    trust: { type: "integer", minimum: 0, maximum: 100 },
    suspicion: { type: "integer", minimum: 0, maximum: 100 },
    stance: string,
  },
};
const obligation = {
  type: "object",
  additionalProperties: false,
  required: ["id", "to", "promise", "dueTurn", "status"],
  properties: {
    id: string,
    to: string,
    promise: string,
    dueTurn: { type: "integer", minimum: 1, maximum: 12 },
    status: { type: "string", enum: ["Активно", "Выполнено", "Нарушено"] },
  },
};
const delayedEffect = {
  type: "object",
  additionalProperties: false,
  required: ["id", "sourceChoice", "dueTurn", "warning"],
  properties: {
    id: string,
    sourceChoice: string,
    dueTurn: { type: "integer", minimum: 1, maximum: 12 },
    warning: string,
  },
};
const mechanics = {
  type: "object",
  additionalProperties: false,
  required: [
    "insight",
    "exposure",
    "leverage",
    "relationships",
    "obligations",
    "delayedEffects",
  ],
  properties: {
    insight: { type: "integer", minimum: 0, maximum: 100 },
    exposure: { type: "integer", minimum: 0, maximum: 100 },
    leverage: { type: "integer", minimum: 0, maximum: 5 },
    relationships: {
      type: "array",
      minItems: 3,
      maxItems: 6,
      items: relationship,
    },
    obligations: { type: "array", maxItems: 6, items: obligation },
    delayedEffects: { type: "array", maxItems: 6, items: delayedEffect },
  },
};
const story = {
  type: "object",
  additionalProperties: false,
  required: [
    "premise",
    "mystery",
    "seasonQuestion",
    "act",
    "actTitle",
    "objective",
    "hiddenTruth",
    "mechanics",
    "theories",
    "clues",
    "characters",
  ],
  properties: {
    premise: string,
    mystery: string,
    seasonQuestion: string,
    act: { type: "integer", minimum: 1, maximum: 3 },
    actTitle: string,
    objective: string,
    hiddenTruth: string,
    mechanics,
    theories: { type: "array", minItems: 3, maxItems: 3, items: theory },
    clues: { type: "array", maxItems: 12, items: clue },
    characters: { type: "array", minItems: 3, maxItems: 8, items: string },
  },
};
const schema = {
  type: "object",
  additionalProperties: false,
  required: ["consequence", "scene", "changes", "threads", "story"],
  properties: {
    consequence: {
      type: "object",
      additionalProperties: false,
      required: ["headline", "text", "newspaper", "callback"],
      properties: {
        headline: string,
        text: string,
        newspaper: string,
        callback: string,
      },
    },
    scene: {
      type: "object",
      additionalProperties: false,
      required: [
        "chapter",
        "kicker",
        "title",
        "text",
        "speaker",
        "role",
        "discovery",
        "choices",
      ],
      properties: {
        chapter: string,
        kicker: string,
        title: string,
        text: string,
        speaker: string,
        role: string,
        discovery: string,
        choices: {
          type: "array",
          minItems: 3,
          maxItems: 3,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["id", "label", "hint"],
            properties: { id: string, label: string, hint: string },
          },
        },
      },
    },
    changes: {
      type: "object",
      additionalProperties: false,
      required: ["treasury", "people", "elite", "security", "diplomacy"],
      properties: {
        treasury: { type: "integer", minimum: -12, maximum: 12 },
        people: { type: "integer", minimum: -12, maximum: 12 },
        elite: { type: "integer", minimum: -12, maximum: 12 },
        security: { type: "integer", minimum: -12, maximum: 12 },
        diplomacy: { type: "integer", minimum: -12, maximum: 12 },
      },
    },
    threads: { type: "array", maxItems: 8, items: string },
    story,
  },
};

async function requestIdentifier(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address =
    req.headers.get("cf-connecting-ip") ||
    forwarded ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`chronicles:${address}`),
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
async function checkRateLimit(req: Request) {
  const url = Deno.env.get("SUPABASE_URL");
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  let secret = legacy;
  try {
    const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
    secret = keys.default || Object.values(keys)[0] || legacy;
  } catch {}
  if (!url || typeof secret !== "string")
    throw new Error("Rate limiter is not configured");
  const response = await fetch(`${url}/rest/v1/rpc/check_story_rate_limit`, {
    method: "POST",
    headers: {
      apikey: secret,
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_identifier: await requestIdentifier(req) }),
  });
  if (!response.ok) throw new Error(`Rate limiter ${response.status}`);
  const [result] = await response.json();
  return result as {
    is_allowed: boolean;
    retry_after_seconds: number;
    remaining_today: number;
  };
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: headers(origin) });
  if (req.method !== "POST")
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: headers(origin),
    });
  try {
    const body = await req.json();
    if (JSON.stringify(body).length > 30000)
      throw new Error("История слишком велика");
    const key = Deno.env.get("OPENAI_API_KEY");
    if (!key)
      return new Response(JSON.stringify(demo(body)), {
        headers: headers(origin),
      });
    const limit = await checkRateLimit(req);
    if (!limit.is_allowed)
      return new Response(
        JSON.stringify({
          error: "Лимит решений временно исчерпан. Попробуйте позже.",
          code: "rate_limited",
        }),
        {
          status: 429,
          headers: {
            ...headers(origin),
            "Retry-After": String(limit.retry_after_seconds),
          },
        },
      );
    const targetTurn =
      Math.max(1, Number(body.turn) || 1) + (body.choice ? 1 : 0);
    const targetAct = targetTurn <= 4 ? 1 : targetTurn <= 9 ? 2 : 3;
    const actNames = {
      1: "Завязка",
      2: "Столкновение версий",
      3: "Разгадка и цена правды",
    };
    const prompt = `Ты — главный сценарист интерактивного политического детектива 13+ «Хроники власти». Мир и все лица вымышлены. Игрок — президент небольшой Черноморской Республики. Это НЕ генератор отдельных государственных задач, а единый сезон из 12 связанных глав вокруг одной загадки.

НАРРАТИВНЫЙ КОНТРАКТ:
1. При первом запросе создай загадку, которую можно сформулировать одним вопросом. Начни с невозможного документа, противоречивого события или скрытого государственного механизма. Сразу зафиксируй hiddenTruth — конкретную правду. Не меняй premise, mystery, seasonQuestion и hiddenTruth в следующих ответах.
2. Создай ровно 3 конкурирующие правдоподобные теории. У каждой должны быть сторонники, слабые места и частично совпадающие улики. Не делай одну теорию очевидно правильной. Сохраняй id теорий на протяжении всей партии.
3. Каждый следующий ход обязан быть прямым результатом выбранного решения. Назови в consequence.callback конкретное прежнее решение и объясни, как оно вернулось. Если история есть, сцена должна упомянуть хотя бы одно лицо, улику или выбор из неё.
4. Никаких случайных однотипных кризисов. Экономика, протесты, дипломатия и аппаратные конфликты допустимы только как части расследования центральной тайны.
5. Каждый ход либо добавляет одну новую улику, либо меняет надёжность старой. Обновляй веса теорий логично; это степень убедительности для игрока, не объективная вероятность. Ложные и частично верные следы допустимы.
6. Главы 1–4 знакомят с тайной и подозреваемыми; 5–9 сталкивают теории и возвращают ранние решения; 10–12 позволяют собрать объяснение и выбрать, что делать с правдой. Не раскрывай hiddenTruth прямо до главы 10. На 12-м ходу дай итог, зависящий от всей цепочки решений.
7. Три решения должны означать разные методы расследования или управления информацией: кому довериться, какую версию проверить, что раскрыть, чем рискнуть. Не обозначай «правильный» вариант.
8. Сцена 110–170 слов; последствие 70–110 слов. Изменения показателей от -12 до 12. discovery — одна короткая формулировка найденной или переоценённой улики.
9. Ответ обязан сохранять причинность, имена и факты входного состояния. Активных линий не более 8, улик не более 12.
10. Без реальных действующих партий и политиков, эротики, натуралистического насилия, самоповреждений и азартных игр.
11. mechanics.insight — прогресс понимания правды. Он растёт только за проверенные улики и не достигает 100 до главы 10. mechanics.exposure — насколько противник понимает, что его расследуют; при высоком значении он подбрасывает дезинформацию и давит через аппарат. mechanics.leverage — от 0 до 5 единиц политического влияния, которое можно заработать доказательствами или потерять при жёстких решениях.
12. relationships — 3–6 постоянных ключевых персонажей. После решения логично меняй trust и suspicion, сохраняй имена и роли. Высокое доверие открывает честную помощь, высокая подозрительность создаёт скрытое сопротивление. stance коротко описывает текущее отношение.
13. Если решение содержит обещание или сделку, создай obligation со сроком dueTurn через 2–4 главы. В срок обязательство обязано вернуться в сцену и стать выбором: выполнить, нарушить или переиграть. Завершённые обязательства помечай «Выполнено» или «Нарушено».
14. При первом запросе, когда choice отсутствует, delayedEffects обязан быть пустым массивом: нельзя создавать последствия для ещё не выбранных вариантов. После фактического выбора игрока до главы 9 добавь ровно один новый delayedEffect только для body.choice; никогда не создавай эффекты для двух невыбранных вариантов сцены. Срок — через 2–4 главы, но не позже главы 12. В dueTurn эффект обязан стать важной частью сцены и затем исчезнуть из списка. sourceChoice содержит точное название body.choice.label. Не удаляй незавершённые эффекты раньше срока.
15. Игрок может поверить в ложную теорию. Не исправляй его автоматически: выбранный метод расследования усиливает доступные ему доказательства и может временно увеличить вес ошибочной версии.
16. Финал зависит одновременно от insight, exposure, выполненных обещаний, отношений, показателей государства и того, какую теорию игрок фактически преследовал. Истину можно раскрыть, скрыть, использовать или понять слишком поздно.

Сейчас создаётся ход ${targetTurn}, акт ${targetAct} «${actNames[targetAct as 1 | 2 | 3]}». Входное состояние является каноном игры.`;
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: Deno.env.get("OPENAI_MODEL") || "gpt-5.4-mini",
        store: false,
        instructions: prompt,
        input: JSON.stringify(body),
        max_output_tokens: 3200,
        text: {
          format: {
            type: "json_schema",
            name: "mystery_turn",
            strict: true,
            schema,
          },
        },
      }),
    });
    if (!response.ok)
      throw new Error(`OpenAI ${response.status}: ${await response.text()}`);
    const data = await response.json();
    const outputText =
      data.output_text ??
      data.output
        ?.flatMap((item: any) => item.content ?? [])
        .find((content: any) => content.type === "output_text")?.text;
    if (typeof outputText !== "string" || !outputText.trim())
      throw new Error(
        `OpenAI не вернул текст сцены (status: ${data.status ?? "unknown"})`,
      );
    const parsed = JSON.parse(outputText);
    if (body.story) {
      parsed.story.premise = body.story.premise;
      parsed.story.mystery = body.story.mystery;
      parsed.story.seasonQuestion = body.story.seasonQuestion;
      parsed.story.hiddenTruth = body.story.hiddenTruth;
      const ids = new Set(
        body.story.theories?.map((item: any) => item.id) || [],
      );
      if (!parsed.story.theories.every((item: any) => ids.has(item.id)))
        parsed.story.theories = body.story.theories;
    }
    parsed.story.act = targetAct;
    parsed.story.actTitle = actNames[targetAct as 1 | 2 | 3];

    // Structured output guarantees shape, while this guard guarantees branch
    // causality: the model may only retain effects created by choices the
    // player actually made, never by the two alternatives they did not pick.
    const selectedChoices = [
      ...(Array.isArray(body.history)
        ? body.history.map((item: any) => item?.choice)
        : []),
      body.choice?.label,
    ].filter((item): item is string =>
      typeof item === "string" && item.trim().length > 0
    );
    parsed.story.mechanics.delayedEffects = selectedChoices.length === 0
      ? []
      : parsed.story.mechanics.delayedEffects.filter((effect: any) =>
        effect.dueTurn > targetTurn &&
        selectedChoices.some((choice) => effect.sourceChoice.includes(choice))
      );
    if (body.choice?.label && targetTurn <= 9) {
      const hasCurrentEffect = parsed.story.mechanics.delayedEffects.some(
        (effect: any) => effect.sourceChoice.includes(body.choice.label),
      );
      if (!hasCurrentEffect) {
        const dueTurn = Math.min(
          12,
          Math.max(targetTurn + 1, (Number(body.turn) || 1) + 2),
        );
        parsed.story.mechanics.delayedEffects.push({
          id: `choice_${Number(body.turn) || 1}_${body.choice.id || "effect"}`,
          sourceChoice: body.choice.label,
          dueTurn,
          warning: `Последствия решения проявятся к главе ${dueTurn}.`,
        });
      }
    }
    return new Response(JSON.stringify({ mode: "ai", ...parsed }), {
      headers: headers(origin),
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 400, headers: headers(origin) },
    );
  }
});
