import { useEffect, useMemo, useState } from "react";
import {
  Buildings,
  Coins,
  Crown,
  MagnifyingGlass,
  Newspaper,
  ShieldCheck,
  Sparkle,
  UsersThree,
  X,
} from "@phosphor-icons/react";

type Metrics = {
  treasury: number;
  people: number;
  elite: number;
  security: number;
  diplomacy: number;
};
type Choice = { id: string; label: string; hint: string };
type Theory = {
  id: string;
  title: string;
  summary: string;
  confidence: number;
  status: string;
};
type Clue = {
  id: string;
  title: string;
  text: string;
  reliability: "Подтверждено" | "Неясно" | "Сомнительно";
  supports: string[];
};
type Relationship = {
  name: string;
  role: string;
  trust: number;
  suspicion: number;
  stance: string;
};
type Obligation = {
  id: string;
  to: string;
  promise: string;
  dueTurn: number;
  status: "Активно" | "Выполнено" | "Нарушено";
};
type DelayedEffect = {
  id: string;
  sourceChoice: string;
  dueTurn: number;
  warning: string;
};
type Mechanics = {
  insight: number;
  exposure: number;
  leverage: number;
  relationships: Relationship[];
  obligations: Obligation[];
  delayedEffects: DelayedEffect[];
};
type Story = {
  premise: string;
  mystery: string;
  seasonQuestion: string;
  act: number;
  actTitle: string;
  objective: string;
  hiddenTruth: string;
  mechanics: Mechanics;
  theories: Theory[];
  clues: Clue[];
  characters: string[];
};
type Scene = {
  chapter: string;
  kicker: string;
  title: string;
  text: string;
  speaker: string;
  role: string;
  discovery: string;
  choices: Choice[];
};
type Consequence = {
  headline: string;
  text: string;
  newspaper: string;
  callback: string;
};
type TurnResponse = {
  mode: "ai" | "demo";
  consequence: Consequence;
  scene: Scene;
  changes: Metrics;
  threads: string[];
  story: Story;
};
type HistoryItem = {
  turn: number;
  title: string;
  choice: string;
  result: string;
  callback: string;
};
type Save = {
  turn: number;
  metrics: Metrics;
  scene: Scene | null;
  story: Story | null;
  history: HistoryItem[];
  threads: string[];
};

const API = "https://eyeesjdoqnjfhhbljawq.supabase.co/functions/v1/story-turn";
const ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5ZWVzamRvcW5qZmhoYmxqYXdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyOTAzNTcsImV4cCI6MjEwNDg2NjM1N30.ADPxixgrriI3UIGl5JhWd2gw4R303GXxdu9nqTgbtEQ";
const SAVE_KEY = "chronicles-save-v3";
const makeInitial = (): Save => ({
  turn: 1,
  metrics: { treasury: 62, people: 58, elite: 51, security: 67, diplomacy: 44 },
  scene: null,
  story: null,
  history: [],
  threads: [],
});
const clamp = (n: number) => Math.max(0, Math.min(100, n));

export default function App() {
  const [game, setGame] = useState<Save>(() => {
    try {
      return (
        JSON.parse(localStorage.getItem(SAVE_KEY) || "null") || makeInitial()
      );
    } catch {
      return makeInitial();
    }
  });
  const [loading, setLoading] = useState(false),
    [error, setError] = useState<string | null>(null),
    [result, setResult] = useState<TurnResponse | null>(null),
    [dossier, setDossier] = useState(false),
    [mode, setMode] = useState<"ai" | "demo" | null>(null);
  const danger = useMemo(
    () => Object.values(game.metrics).filter((v) => v < 25).length,
    [game.metrics],
  );
  useEffect(() => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(game));
  }, [game]);
  useEffect(() => {
    if (!game.scene) requestTurn(null);
  }, []);

  async function requestTurn(choice: Choice | null) {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: ANON,
          Authorization: `Bearer ${ANON}`,
        },
        body: JSON.stringify({
          turn: game.turn,
          choice,
          metrics: game.metrics,
          story: game.story,
          threads: game.threads,
          history: game.history.slice(-10),
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(payload?.error || `Сервер ответил ${response.status}`);
      const data = payload as TurnResponse;
      setMode(data.mode);
      if (choice && game.scene) {
        const metrics = Object.fromEntries(
          Object.entries(game.metrics).map(([k, v]) => [
            k,
            clamp(v + data.changes[k as keyof Metrics]),
          ]),
        ) as Metrics;
        setGame((g) => ({
          ...g,
          turn: g.turn + 1,
          metrics,
          scene: data.scene,
          story: data.story,
          threads: data.threads,
          history: [
            ...g.history,
            {
              turn: g.turn,
              title: g.scene!.title,
              choice: choice.label,
              result: data.consequence.headline,
              callback: data.consequence.callback,
            },
          ],
        }));
        setResult(data);
      } else
        setGame((g) => ({
          ...g,
          scene: data.scene,
          story: data.story,
          threads: data.threads,
        }));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Не удалось связаться с хроникой",
      );
    } finally {
      setLoading(false);
    }
  }
  const reset = () => {
    localStorage.removeItem(SAVE_KEY);
    const fresh = makeInitial();
    setGame(fresh);
    setResult(null);
    setDossier(false);
    setMode(null);
    setTimeout(() => requestFresh(fresh), 0);
  };
  async function requestFresh(fresh: Save) {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: ANON,
          Authorization: `Bearer ${ANON}`,
        },
        body: JSON.stringify({
          turn: 1,
          choice: null,
          metrics: fresh.metrics,
          story: null,
          threads: [],
          history: [],
        }),
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload?.error || `Сервер ответил ${response.status}`);
      const data = payload as TurnResponse;
      setMode(data.mode);
      setGame({
        ...fresh,
        scene: data.scene,
        story: data.story,
        threads: data.threads,
      });
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Не удалось создать новую историю",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <header>
        <div className="brand">
          <Crown weight="fill" />
          <span>
            <b>ХРОНИКИ ВЛАСТИ</b>
            <small>Политический детектив · сезон из 12 глав</small>
          </span>
        </div>
        <button
          className="archive-button"
          onClick={() => setDossier(true)}
          aria-label="Открыть досье"
        >
          <MagnifyingGlass />
        </button>
      </header>
      <section className="metrics" aria-label="Показатели государства">
        <Metric icon={Coins} label="Казна" value={game.metrics.treasury} />
        <Metric icon={UsersThree} label="Народ" value={game.metrics.people} />
        <Metric icon={Buildings} label="Элиты" value={game.metrics.elite} />
        <Metric
          icon={ShieldCheck}
          label="Порядок"
          value={game.metrics.security}
        />
      </section>
      <main>
        <div className={`scene-art mood-${danger}`}>
          <div className="sun" />
          <div className="city-silhouette" />
          <span>ХОД {game.turn} / 12</span>
          {mode && (
            <small>
              {mode === "ai"
                ? "ИСТОРИЯ СОЗДАЁТСЯ МОДЕЛЬЮ"
                : "ДЕМОНСТРАЦИОННЫЙ РЕЖИМ"}
            </small>
          )}
        </div>
        {game.story && (
          <>
            <button className="mystery-strip" onClick={() => setDossier(true)}>
              <MagnifyingGlass weight="bold" />
              <span>
                <small>ГЛАВНАЯ ЗАГАДКА</small>
                <b>{game.story.mystery}</b>
              </span>
            </button>
            <section
              className="investigation-stats"
              aria-label="Состояние расследования"
            >
              <div>
                <small>Раскрытие</small>
                <b>{game.story.mechanics.insight}%</b>
              </div>
              <div className={game.story.mechanics.exposure > 65 ? "hot" : ""}>
                <small>Риск</small>
                <b>{game.story.mechanics.exposure}%</b>
              </div>
              <div>
                <small>Влияние</small>
                <b>{game.story.mechanics.leverage}/5</b>
              </div>
            </section>
          </>
        )}
        <article className="scene-card" aria-busy={loading}>
          {loading && !game.scene ? (
            <Loading />
          ) : (
            game.scene && (
              <>
                <div className="act-line">
                  <span>АКТ {game.story?.act || 1}</span>
                  <b>{game.story?.actTitle}</b>
                </div>
                <div className="speaker">
                  <div>{game.scene.speaker.slice(0, 1)}</div>
                  <span>
                    <b>{game.scene.speaker}</b>
                    <small>{game.scene.role}</small>
                  </span>
                </div>
                <small className="kicker">
                  {game.scene.kicker} · {game.scene.chapter}
                </small>
                <h1>{game.scene.title}</h1>
                <p>{game.scene.text}</p>
                <div className="discovery">
                  <small>УЛИКА</small>
                  <b>{game.scene.discovery}</b>
                </div>
                <div className="choices">
                  {game.scene.choices.map((choice, i) => (
                    <button
                      key={choice.id}
                      disabled={loading}
                      onClick={() => requestTurn(choice)}
                    >
                      <i>{i + 1}</i>
                      <span>
                        <b>{choice.label}</b>
                        <small>{choice.hint}</small>
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )
          )}
          {loading && game.scene && (
            <div className="thinking">
              <Sparkle weight="fill" /> Модель связывает решение с предыдущими
              главами…
            </div>
          )}
          {error && (
            <div className="error">
              <b>Связь с хроникой потеряна</b>
              <span>{error}</span>
              <button onClick={() => requestTurn(null)}>Повторить</button>
            </div>
          )}
        </article>
      </main>
      {result && (
        <div className="overlay">
          <article className="result-card">
            <Newspaper weight="fill" />
            <small>ПОСЛЕДСТВИЯ РЕШЕНИЯ</small>
            <h2>{result.consequence.headline}</h2>
            <p>{result.consequence.text}</p>
            <div className="callback">
              <small>ЭХО ПРОШЛОГО РЕШЕНИЯ</small>
              <b>{result.consequence.callback}</b>
            </div>
            <blockquote>«{result.consequence.newspaper}»</blockquote>
            <Changes changes={result.changes} />
            <button onClick={() => setResult(null)}>
              Перейти к главе {game.turn}
            </button>
          </article>
        </div>
      )}
      {dossier && (
        <Dossier
          game={game}
          onClose={() => setDossier(false)}
          onReset={reset}
        />
      )}
    </div>
  );
}

function Dossier({
  game,
  onClose,
  onReset,
}: {
  game: Save;
  onClose: () => void;
  onReset: () => void;
}) {
  const s = game.story;
  return (
    <div className="archive">
      <div className="archive-head">
        <span>
          <small>СЕКРЕТНОЕ ДОСЬЕ</small>
          <h2>Дело президента</h2>
        </span>
        <button onClick={onClose} aria-label="Закрыть">
          <X />
        </button>
      </div>
      {s ? (
        <>
          <section className="case-file">
            <small>ЦЕНТРАЛЬНЫЙ ВОПРОС</small>
            <h3>{s.mystery}</h3>
            <p>{s.premise}</p>
            <div>
              <b>Текущая цель</b>
              <span>{s.objective}</span>
            </div>
          </section>
          <h3 className="section-title">Теории</h3>
          <div className="theories">
            {s.theories.map((t, i) => (
              <article key={t.id}>
                <div>
                  <i>{i + 1}</i>
                  <span>
                    <b>{t.title}</b>
                    <small>{t.status}</small>
                  </span>
                  <strong>{t.confidence}%</strong>
                </div>
                <p>{t.summary}</p>
                <meter min="0" max="100" value={t.confidence} />
              </article>
            ))}
          </div>
          <h3 className="section-title">Ключевые фигуры</h3>
          <div className="relationships">
            {s.mechanics.relationships.map((person) => (
              <article key={person.name}>
                <div>
                  <span>
                    <b>{person.name}</b>
                    <small>{person.role}</small>
                  </span>
                  <strong>
                    {person.trust} доверие · {person.suspicion} подозрение
                  </strong>
                </div>
                <p>{person.stance}</p>
              </article>
            ))}
          </div>
          {(s.mechanics.obligations.length > 0 ||
            s.mechanics.delayedEffects.length > 0) && (
            <>
              <h3 className="section-title">Отложенные последствия</h3>
              <div className="debts">
                {s.mechanics.obligations.map((item) => (
                  <article key={item.id}>
                    <small>ОБЕЩАНИЕ · ДО ХОДА {item.dueTurn}</small>
                    <b>{item.to}</b>
                    <p>{item.promise}</p>
                    <span>{item.status}</span>
                  </article>
                ))}
                {s.mechanics.delayedEffects.map((item) => (
                  <article key={item.id}>
                    <small>ЭХО РЕШЕНИЯ · ХОД {item.dueTurn}</small>
                    <b>{item.sourceChoice}</b>
                    <p>{item.warning}</p>
                  </article>
                ))}
              </div>
            </>
          )}
          <h3 className="section-title">Улики · {s.clues.length}</h3>
          <div className="clues">
            {s.clues
              .slice()
              .reverse()
              .map((c) => (
                <article key={c.id}>
                  <span
                    className={`reliability ${c.reliability === "Подтверждено" ? "confirmed" : c.reliability === "Сомнительно" ? "doubtful" : ""}`}
                  >
                    {c.reliability}
                  </span>
                  <b>{c.title}</b>
                  <p>{c.text}</p>
                </article>
              ))}
          </div>
        </>
      ) : (
        <p className="empty">Досье формируется вместе с первой главой.</p>
      )}
      <h3 className="section-title">Цепочка решений</h3>
      {game.history.length === 0 ? (
        <p className="empty">История начнётся после первого решения.</p>
      ) : (
        game.history
          .slice()
          .reverse()
          .map((item) => (
            <article className="history-item" key={item.turn}>
              <small>ХОД {item.turn}</small>
              <b>{item.title}</b>
              <span>{item.choice}</span>
              <p>{item.callback || item.result}</p>
            </article>
          ))
      )}
      <button className="reset" onClick={onReset}>
        Начать новую тайну
      </button>
    </div>
  );
}
function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Coins;
  label: string;
  value: number;
}) {
  return (
    <div className={value < 25 ? "critical" : ""}>
      <Icon weight="fill" />
      <span>
        <small>{label}</small>
        <b>{value}</b>
      </span>
    </div>
  );
}
function Changes({ changes }: { changes: Metrics }) {
  const names: Record<keyof Metrics, string> = {
    treasury: "Казна",
    people: "Народ",
    elite: "Элиты",
    security: "Порядок",
    diplomacy: "Дипломатия",
  };
  return (
    <div className="changes">
      {(Object.keys(changes) as Array<keyof Metrics>)
        .filter((k) => changes[k] !== 0)
        .map((k) => (
          <span className={changes[k] > 0 ? "up" : "down"} key={k}>
            {names[k]} {changes[k] > 0 ? "+" : ""}
            {changes[k]}
          </span>
        ))}
    </div>
  );
}
function Loading() {
  return (
    <div className="loading">
      <Crown weight="fill" />
      <b>Создаётся новая тайна</b>
      <span>
        Модель формирует единый сюжет, героев, улики и три конкурирующие теории…
      </span>
    </div>
  );
}
