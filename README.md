# Хроники власти

Мобильная PWA-игра, в которой игрок принимает политические решения, а модель создаёт сцены, последствия и следующие сюжетные линии.

## Локальный запуск

```bash
npm ci
npm run dev
```

## Архитектура

- React + TypeScript + Vite — интерфейс.
- Supabase Edge Function `story-turn` — безопасный серверный вызов модели.
- Supabase Postgres — ограничение частоты запросов.
- GitHub Actions — сборка и публикация в GitHub Pages.

Секрет `OPENAI_API_KEY` хранится только в Supabase Edge Function Secrets и не должен добавляться в этот репозиторий.
