create table if not exists public.story_api_usage (
  bucket text primary key,
  minute_started timestamptz not null default date_trunc('minute', now()),
  minute_count integer not null default 0 check (minute_count >= 0),
  day_started date not null default current_date,
  day_count integer not null default 0 check (day_count >= 0),
  updated_at timestamptz not null default now()
);

alter table public.story_api_usage enable row level security;
revoke all on table public.story_api_usage from public, anon, authenticated;

create or replace function public.check_story_rate_limit(p_identifier text)
returns table (is_allowed boolean, retry_after_seconds integer, remaining_today integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  now_at timestamptz := now();
  minute_at timestamptz := date_trunc('minute', now_at);
  today_at date := current_date;
  user_minute integer;
  user_day integer;
  global_minute integer;
  global_day integer;
  user_minute_limit constant integer := 8;
  user_day_limit constant integer := 40;
  global_minute_limit constant integer := 30;
  global_day_limit constant integer := 300;
begin
  if p_identifier is null or length(p_identifier) < 16 or length(p_identifier) > 128 then
    raise exception 'invalid rate-limit identifier';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('__story_global__', 0));
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_identifier, 0));

  insert into public.story_api_usage(bucket) values ('__story_global__') on conflict do nothing;
  insert into public.story_api_usage(bucket) values (p_identifier) on conflict do nothing;

  update public.story_api_usage
  set minute_started = case when minute_started < minute_at then minute_at else minute_started end,
      minute_count = case when minute_started < minute_at then 0 else minute_count end,
      day_started = case when day_started < today_at then today_at else day_started end,
      day_count = case when day_started < today_at then 0 else day_count end,
      updated_at = now_at
  where bucket in ('__story_global__', p_identifier);

  select minute_count, day_count into global_minute, global_day
  from public.story_api_usage where bucket = '__story_global__' for update;
  select minute_count, day_count into user_minute, user_day
  from public.story_api_usage where bucket = p_identifier for update;

  if user_minute >= user_minute_limit or global_minute >= global_minute_limit then
    return query select false, greatest(1, 60 - extract(second from now_at)::integer), greatest(0, user_day_limit - user_day);
    return;
  end if;
  if user_day >= user_day_limit or global_day >= global_day_limit then
    return query select false, greatest(1, extract(epoch from (date_trunc('day', now_at) + interval '1 day' - now_at))::integer), greatest(0, user_day_limit - user_day);
    return;
  end if;

  update public.story_api_usage
  set minute_count = minute_count + 1,
      day_count = day_count + 1,
      updated_at = now_at
  where bucket in ('__story_global__', p_identifier);

  return query select true, 0, greatest(0, user_day_limit - user_day - 1);
end;
$$;

revoke all on function public.check_story_rate_limit(text) from public, anon, authenticated;
grant execute on function public.check_story_rate_limit(text) to service_role;

