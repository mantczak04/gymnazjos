create extension if not exists pgcrypto;

create type exercise_logging_type as enum ('weighted_reps', 'reps_only');
create type workout_session_exercise_source as enum ('template', 'ad_hoc');

create table exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) > 0),
  logging_type exercise_logging_type not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index exercises_name_ci_unique on exercises (lower(trim(name)));

create table workout_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index workout_templates_active_name_ci_unique
  on workout_templates (lower(trim(name)))
  where is_active = true;

create table workout_template_exercises (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references workout_templates(id) on delete cascade,
  exercise_id uuid not null references exercises(id),
  order_index integer not null check (order_index >= 0),
  created_at timestamptz not null default now(),
  unique (template_id, exercise_id),
  unique (template_id, order_index)
);

create table workout_sessions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references workout_templates(id),
  started_at timestamptz not null,
  finished_at timestamptz not null,
  post_workout_feeling smallint not null check (post_workout_feeling between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (finished_at >= started_at)
);

create table workout_session_exercises (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references workout_sessions(id) on delete cascade,
  exercise_id uuid not null references exercises(id),
  order_index integer not null check (order_index >= 0),
  source workout_session_exercise_source not null,
  created_at timestamptz not null default now(),
  unique (session_id, exercise_id),
  unique (session_id, order_index)
);

create table workout_sets (
  id uuid primary key default gen_random_uuid(),
  session_exercise_id uuid not null references workout_session_exercises(id) on delete cascade,
  set_index integer not null check (set_index >= 0),
  reps integer not null check (reps > 0),
  weight numeric(8, 2) check (weight is null or weight >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_exercise_id, set_index)
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger exercises_set_updated_at
before update on exercises
for each row execute function set_updated_at();

create trigger workout_templates_set_updated_at
before update on workout_templates
for each row execute function set_updated_at();

create trigger workout_sessions_set_updated_at
before update on workout_sessions
for each row execute function set_updated_at();

create trigger workout_sets_set_updated_at
before update on workout_sets
for each row execute function set_updated_at();

create index workout_sessions_finished_at_idx on workout_sessions (finished_at desc);
create index workout_session_exercises_exercise_id_idx on workout_session_exercises (exercise_id);
create index workout_sets_session_exercise_id_idx on workout_sets (session_exercise_id);
