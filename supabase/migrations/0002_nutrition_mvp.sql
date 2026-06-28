create type nutrition_basis as enum ('per_100g', 'per_100ml', 'per_unit');
create type daily_food_entry_type as enum ('meal', 'product');

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) > 0),
  nutrition_basis nutrition_basis not null,
  calories numeric(10, 2) not null check (calories >= 0),
  protein numeric(10, 2) not null check (protein >= 0),
  carbs numeric(10, 2) not null check (carbs >= 0),
  fat numeric(10, 2) not null check (fat >= 0),
  unit_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (nutrition_basis = 'per_unit' and unit_name is not null and char_length(trim(unit_name)) > 0)
    or (nutrition_basis <> 'per_unit' and unit_name is null)
  )
);

create unique index products_active_name_ci_unique
  on products (lower(trim(name)))
  where is_active = true;

create table meal_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index meal_templates_active_name_ci_unique
  on meal_templates (lower(trim(name)))
  where is_active = true;

create table meal_template_ingredients (
  id uuid primary key default gen_random_uuid(),
  meal_template_id uuid not null references meal_templates(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity numeric(10, 2) not null check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (meal_template_id, product_id)
);

create table daily_food_entries (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null,
  entry_type daily_food_entry_type not null,
  name_snapshot text not null check (char_length(trim(name_snapshot)) > 0)
);

create table daily_food_entry_ingredients (
  id uuid primary key default gen_random_uuid(),
  daily_food_entry_id uuid not null references daily_food_entries(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name_snapshot text not null check (char_length(trim(product_name_snapshot)) > 0),
  nutrition_basis_snapshot nutrition_basis not null,
  calories_snapshot numeric(10, 2) not null check (calories_snapshot >= 0),
  protein_snapshot numeric(10, 2) not null check (protein_snapshot >= 0),
  carbs_snapshot numeric(10, 2) not null check (carbs_snapshot >= 0),
  fat_snapshot numeric(10, 2) not null check (fat_snapshot >= 0),
  unit_name_snapshot text,
  quantity numeric(10, 2) not null check (quantity > 0),
  check (
    (
      nutrition_basis_snapshot = 'per_unit'
      and unit_name_snapshot is not null
      and char_length(trim(unit_name_snapshot)) > 0
    )
    or (nutrition_basis_snapshot <> 'per_unit' and unit_name_snapshot is null)
  )
);

create table daily_nutrition_targets (
  id smallint primary key default 1 check (id = 1),
  calories_target numeric(10, 2) not null default 0 check (calories_target >= 0),
  protein_target numeric(10, 2) not null default 0 check (protein_target >= 0),
  carbs_target numeric(10, 2) not null default 0 check (carbs_target >= 0),
  fat_target numeric(10, 2) not null default 0 check (fat_target >= 0),
  updated_at timestamptz not null default now()
);

create trigger products_set_updated_at
before update on products
for each row execute function set_updated_at();

create trigger meal_templates_set_updated_at
before update on meal_templates
for each row execute function set_updated_at();

create trigger daily_nutrition_targets_set_updated_at
before update on daily_nutrition_targets
for each row execute function set_updated_at();

create index meal_template_ingredients_template_id_idx
  on meal_template_ingredients (meal_template_id);

create index meal_template_ingredients_product_id_idx
  on meal_template_ingredients (product_id);

create index daily_food_entries_entry_date_idx
  on daily_food_entries (entry_date);

create index daily_food_entry_ingredients_entry_id_idx
  on daily_food_entry_ingredients (daily_food_entry_id);

create index daily_food_entry_ingredients_product_id_idx
  on daily_food_entry_ingredients (product_id);
