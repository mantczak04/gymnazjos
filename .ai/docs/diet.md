# Diet Module Specification

## Purpose

The diet module is the nutrition-tracking part of the application.

Its purpose is to let the user:

- define products with calories and macronutrients,
- define reusable meal templates built from products,
- log daily food intake quickly,
- add meals or single products to a day,
- edit daily food entries after adding them,
- calculate daily calories and macros,
- compare daily totals against fixed nutrition targets,
- provide diet data for the future dashboard.

The module should prioritize simple, fast, personal food logging over a complex public nutrition database.

The MVP does not use barcode scanning, external product databases, meal categories, or micronutrient tracking.

## Language

All application UI, code names, documentation, types, components, and database concepts should use English.

Examples:

```txt
Product
Meal Template
Daily Food Log
Add Product
Add Meal
Calories
Protein
Carbs
Fat
```

The app should not mix Polish and English UI labels.

## Core Concepts

### Product Library

The Product Library is the global pool of food products that can be used in meal templates and daily food logs.

Examples:

- Cottage Cheese
- Oat Milk
- Banana
- Egg
- Olive Oil
- Pasta
- Minced Meat

Each product defines nutrition values using one of three bases:

- `per_100g` — solid foods measured by weight.
- `per_100ml` — liquids measured by volume.
- `per_unit` — countable items or predefined portions.

Every product stores:

- calories,
- protein,
- carbs,
- fat.

The MVP does not track fiber, sugar, salt, saturated fat, micronutrients, vitamins, or minerals.

### Meal Library

The Meal Library is a collection of reusable meal templates.

Examples:

- Mass Shake
- Spaghetti
- Cottage Cheese Bowl
- Eggs and Bread

A meal template is built only from products in the Product Library.

A meal template represents one serving.

The app does not support meal serving multipliers in the MVP. If the user wants a bigger or smaller portion in a daily log, they should edit ingredient quantities in that daily entry.

### Daily Food Log

The Daily Food Log is the list of food entries for a specific date.

The user can add either:

- a meal from the Meal Library,
- a single product from the Product Library.

The daily log is one simple list. It is not split into breakfast, lunch, dinner, snacks, or custom meal sections.

A daily food entry can be edited after being added.

The app does not require closing or finishing a diet day.

## Product Nutrition Bases

### per_100g

Use `per_100g` for solid foods measured by weight.

Example:

```txt
Cottage Cheese
basis: per_100g

Nutrition:
133 kcal
18 g protein
4 g carbs
7 g fat

Daily entry:
250 g
```

### per_100ml

Use `per_100ml` for liquids measured by volume.

Example:

```txt
Oat Milk
basis: per_100ml

Nutrition:
45 kcal
1 g protein
7 g carbs
1.5 g fat

Daily entry:
600 ml
```

Example:

```txt
Olive Oil
basis: per_100ml

Nutrition:
884 kcal
0 g protein
0 g carbs
100 g fat

Daily entry:
10 ml
```

### per_unit

Use `per_unit` for countable items or predefined portions.

For `per_unit` products, the app stores only a human-readable unit name.

Examples:

```txt
Egg
basis: per_unit
unit_name: egg

Nutrition per egg:
78 kcal
6.5 g protein
0.6 g carbs
5.3 g fat
```

```txt
Banana
basis: per_unit
unit_name: banana

Nutrition per banana:
105 kcal
1.3 g protein
27 g carbs
0.3 g fat
```

The MVP does not store optional unit weight or unit volume.

If precise weight-based tracking is needed, the product should use `per_100g`.

If precise volume-based tracking is needed, the product should use `per_100ml`.

## Data Model

### Product

```txt
Product
  - id
  - name
  - nutrition_basis: per_100g | per_100ml | per_unit
  - calories
  - protein
  - carbs
  - fat
  - unit_name? only for per_unit
  - is_active: boolean
```

Rules:

- Active product names must be unique.
- Name uniqueness should be case-insensitive.
- Inactive products do not block creating a new active product with the same name.
- Products are not hard-deleted after they have been used in diet history.
- Inactive products are hidden from the default Product Library view.
- Inactive products are not shown by default when adding products to daily food logs or meal templates.
- Historical diet entries still display inactive products normally.
- Product values support decimals.

Examples of decimal values:

```txt
6.5 g protein
12.5 g fat
1.5 units
```

### Meal Template

```txt
Meal Template
  - id
  - name
  - is_active: boolean
```

Rules:

- Active meal template names must be unique.
- Name uniqueness should be case-insensitive.
- Inactive meal templates do not block creating a new active meal template with the same name.
- Meal templates are not hard-deleted after they have been used in diet history.
- Inactive meal templates are hidden from the default Meal Library view.
- Inactive meal templates are not shown by default when adding meals to a daily food log.
- Historical diet entries still display meals created from inactive templates normally.
- A meal template represents one serving.
- The MVP does not support meal serving multipliers.
- The MVP does not include meal notes or descriptions.

### Meal Template Ingredient

```txt
Meal Template Ingredient
  - id
  - meal_template_id
  - product_id
  - quantity
```

Rules:

- Meal templates can contain only products from the Product Library.
- The MVP does not support anonymous/manual meal ingredients that are not saved as products.
- If the user wants to use an ingredient in a meal template, they must first create it in the Product Library.
- A meal template cannot contain the same product more than once.
- The pair `meal_template_id + product_id` must be unique.
- If the user wants more of the same product in a meal, they should edit the quantity of the existing ingredient instead of adding a duplicate.
- Meal template ingredients do not have a meaningful manual order.
- The MVP does not need ingredient `order_index`, drag-and-drop, or Move up / Move down controls.
- Ingredients can be displayed in creation order or alphabetically.

Quantity meaning depends on the product nutrition basis:

```txt
per_100g  -> quantity is grams
per_100ml -> quantity is milliliters
per_unit  -> quantity is unit count
```

### Daily Food Entry

```txt
Daily Food Entry
  - id
  - date
  - entry_type: meal | product
  - name_snapshot
```

Rules:

- A daily food entry belongs to a specific date.
- The daily food log is one simple list of entries.
- Entries do not need `created_at`.
- The MVP does not support manual meal times.
- The MVP does not support breakfast/lunch/dinner/snack sections.
- The user can edit old days.
- The user can delete daily food entries.
- The UI should not create empty entries.
- Adding a daily food entry writes directly to Supabase.

### Daily Food Entry Ingredient

```txt
Daily Food Entry Ingredient
  - id
  - daily_food_entry_id
  - product_id?
  - product_name_snapshot
  - nutrition_basis_snapshot: per_100g | per_100ml | per_unit
  - calories_snapshot
  - protein_snapshot
  - carbs_snapshot
  - fat_snapshot
  - unit_name_snapshot?
  - quantity
```

Rules:

- Daily food entries store snapshots.
- Historical daily logs should not change when Product Library values are edited later.
- Historical daily logs should not change when Meal Templates are edited later.
- A meal added from Meal Library copies the meal's current products, quantities, and nutrition into the daily food log.
- The copied daily meal entry is editable.
- Editing the daily meal entry does not modify the original meal template.
- Editing the meal template later does not modify historical daily food logs.
- Editing a product later does not modify historical daily food logs.

## Snapshot Behavior

### Adding a Meal to a Day

Meals in the Meal Library are reusable meal templates.

When a meal is added to a diet day, the app copies the meal's current ingredients, quantities, and calculated nutrition into the daily food log as an editable snapshot.

Example meal template:

```txt
Spaghetti
- Pasta 120 g
- Minced Meat 150 g
- Tomato Sauce 200 g
```

Daily entry after adding:

```txt
Today:
Spaghetti
- Pasta 120 g
- Minced Meat 150 g
- Tomato Sauce 200 g
```

The user can edit only today's entry:

```txt
Pasta 120 g -> 160 g
```

The original `Spaghetti` meal template remains unchanged.

### Adding a Single Product to a Day

The user can add a single product directly to the daily food log without creating a meal template.

Example:

```txt
Banana
Quantity: 2 bananas
```

This entry contributes to the daily calories and macros, but does not appear in the Meal Library.

## Daily Food Log Behavior

### Main Daily View

The main diet screen should be `Today` / `Daily Food Log`.

It shows:

- selected date,
- list of food entries,
- add meal action,
- add product action,
- daily totals,
- daily targets.

Example:

```txt
Today

Mass Shake
920 kcal | 55P | 120C | 20F

Spaghetti
850 kcal | 45P | 100C | 25F

Banana × 2
210 kcal | 2.6P | 54C | 0.6F

Totals:
1980 / 3200 kcal
102.6 / 180 g protein
274 / 400 g carbs
45.6 / 90 g fat
```

### Date Navigation

The daily food log should support simple date navigation.

Recommended UI:

```txt
[< Previous day]  2026-06-28  [Next day]

[Pick date]
```

The user can edit old days.

The app does not need a "finished day" or "closed day" state.

### Daily Entry Display

A meal added from Meal Library appears as one food log entry.

The entry shows:

- meal name,
- total calories,
- total protein,
- total carbs,
- total fat,
- expandable ingredient list.

Example:

```txt
Spaghetti
850 kcal | 45P | 100C | 25F

Expanded:
- Pasta 160 g
- Minced Meat 150 g
- Tomato Sauce 200 g
```

A single product added to the day appears as a simpler entry:

```txt
Banana × 2
210 kcal | 2.6P | 54C | 0.6F
```

### Editing Daily Meal Entries

A daily meal entry can be edited after being added.

The user can:

- change ingredient quantities,
- remove ingredients,
- add more products from Product Library.

Example:

```txt
Spaghetti today:
- Pasta 120 g -> 160 g
- Minced Meat 150 g
- Tomato Sauce 200 g
- Parmesan 20 g added only today
```

Changes affect only the specific daily entry.

The original Meal Template remains unchanged.

### Editing Daily Product Entries

A single product entry can be edited after being added.

Examples:

```txt
Banana × 2 -> Banana × 1.5
Cottage Cheese 250 g -> Cottage Cheese 300 g
```

### Deleting Daily Entries

Every daily food entry can be deleted.

This applies to:

- meal entries,
- single product entries.

Deleting a daily entry removes it from that day and updates the daily totals.

### Entry Ordering

The daily log is a simple list.

Since entries do not need `created_at`, the MVP does not depend on time-based sorting.

Entries can be displayed in database/default order.

The MVP does not include:

- manual entry ordering,
- drag-and-drop,
- Move up / Move down controls,
- meal time input.

## Nutrition Calculations

### Product Entry Calculation

For `per_100g` products:

```txt
multiplier = quantity_g / 100
```

For `per_100ml` products:

```txt
multiplier = quantity_ml / 100
```

For `per_unit` products:

```txt
multiplier = quantity_units
```

Calculated nutrition:

```txt
calories_total = calories_snapshot * multiplier
protein_total = protein_snapshot * multiplier
carbs_total = carbs_snapshot * multiplier
fat_total = fat_snapshot * multiplier
```

### Meal Entry Calculation

A daily meal entry total is the sum of all ingredient totals.

```txt
meal_calories = sum(ingredient_calories_total)
meal_protein = sum(ingredient_protein_total)
meal_carbs = sum(ingredient_carbs_total)
meal_fat = sum(ingredient_fat_total)
```

### Daily Total Calculation

A daily total is the sum of all food entries for a date.

```txt
daily_calories = sum(entry_calories_total)
daily_protein = sum(entry_protein_total)
daily_carbs = sum(entry_carbs_total)
daily_fat = sum(entry_fat_total)
```

## Daily Targets

The MVP should support fixed global daily nutrition targets.

Targets:

```txt
Daily Targets
  - calories_target
  - protein_target
  - carbs_target
  - fat_target
```

Rules:

- Targets are global settings.
- The MVP does not support separate targets for training days and rest days.
- The MVP does not support per-day custom targets.
- The daily food log should show progress against targets.

Example display:

```txt
Calories: 2700 / 3200 kcal
Protein: 145 / 180 g
Carbs: 310 / 400 g
Fat: 75 / 90 g
```

## Product Library Behavior

### Product List

The Product Library should show active products by default.

Each product row/card should show:

- name,
- nutrition basis,
- calories,
- protein,
- carbs,
- fat,
- unit label.

Examples:

```txt
Cottage Cheese
133 kcal | 18P | 4C | 7F / 100 g
```

```txt
Oat Milk
45 kcal | 1P | 7C | 1.5F / 100 ml
```

```txt
Egg
78 kcal | 6.5P | 0.6C | 5.3F / egg
```

### Product Actions

The user can:

- create product,
- edit product,
- deactivate product,
- search products by name.

Product creation/edit form:

```txt
Product name
Nutrition basis: per_100g | per_100ml | per_unit
Calories
Protein
Carbs
Fat
Unit name, only for per_unit
```

Product creation should be available from:

- Product Library,
- Add Product to Day flow,
- Meal Template Create/Edit flow.

This is intentionally different from the workout module, where exercises are not created from the active workout screen.

Reason:

Food logging often requires quickly adding a missing product. Blocking this would make daily diet logging irritating.

### Product Categories

The MVP does not include product categories, brands, stores, tags, or barcode fields.

If brand/store matters, it can be included in the product name manually.

Example:

```txt
Cottage Cheese Lidl
Cottage Cheese Biedronka
```

## Meal Library Behavior

### Meal Template List

The Meal Library should show active meal templates by default.

Each meal template row/card should show:

- meal name,
- total calories,
- total protein,
- total carbs,
- total fat.

Example:

```txt
Mass Shake
920 kcal | 55P | 120C | 20F
```

Meal template totals are calculated from current template ingredients and current product values.

### Meal Template Actions

The user can:

- create meal template,
- edit meal template name,
- add products from Product Library,
- edit ingredient quantities,
- remove ingredients,
- deactivate meal template,
- search meal templates by name.

Meal template creation/edit form:

```txt
Meal name
Ingredients:
- Product
- Quantity
```

Rules:

- A meal template contains only products from the Product Library.
- A meal template cannot contain the same product more than once.
- A meal template represents one serving.
- The MVP does not support serving multipliers.
- The MVP does not support saving a daily food entry as a meal template.

## Diet Module Screens

### 1. Today / Daily Food Log

Purpose:

- Log food for the selected date.
- Show daily calorie and macro totals.
- Show progress against daily targets.

Content:

- selected date,
- previous day button,
- next day button,
- date picker,
- daily totals,
- daily targets,
- list of daily food entries,
- add meal button,
- add product button.

Actions:

- add meal from Meal Library,
- add product from Product Library,
- edit daily meal entry,
- edit daily product entry,
- delete daily entry,
- navigate to Product Library,
- navigate to Meal Library.

### 2. Product Library

Purpose:

- Manage products.

Content:

- list of active products,
- product nutrition basis,
- product calories and macros,
- search by name.

Actions:

- create product,
- edit product,
- deactivate product.

### 3. Meal Library

Purpose:

- Manage reusable meal templates.

Content:

- list of active meal templates,
- calculated meal calories and macros,
- search by name.

Actions:

- create meal template,
- edit meal template,
- deactivate meal template.

### 4. Meal Entry Details / Edit

Purpose:

- View and edit a daily meal entry snapshot.

Content:

- meal name snapshot,
- total calories and macros,
- ingredient list,
- ingredient quantities,
- calculated ingredient totals.

Actions:

- edit ingredient quantity,
- remove ingredient,
- add product from Product Library,
- save changes,
- delete the whole daily meal entry.

### 5. Product Create/Edit

Purpose:

- Create or edit products.

Content:

- product name,
- nutrition basis,
- unit name if needed,
- calories,
- protein,
- carbs,
- fat.

Actions:

- save product,
- deactivate product when editing.

### 6. Meal Template Create/Edit

Purpose:

- Create or edit reusable meal templates.

Content:

- meal name,
- ingredient list,
- calculated meal totals.

Actions:

- add product from Product Library,
- create missing product,
- edit ingredient quantity,
- remove ingredient,
- save meal template,
- deactivate meal template when editing.

## Dashboard Data

The diet module should provide daily aggregated data for the future dashboard.

Dashboard-relevant daily data:

```txt
date
total_calories
total_protein
total_carbs
total_fat
target_calories
target_protein
target_carbs
target_fat
```

The diet module itself does not need charts in the MVP.

Charts and trend analysis should be handled later in `dashboard.md`.

## MVP Scope

Included in MVP:

- Product Library.
- Create/edit/deactivate products.
- Products with `per_100g`, `per_100ml`, and `per_unit` nutrition basis.
- Calories, protein, carbs, and fat.
- Decimal values for quantities and nutrition.
- Meal Library.
- Create/edit/deactivate meal templates.
- Meal templates made only from Product Library products.
- Meal templates representing one serving.
- Daily Food Log as one simple list.
- Date navigation.
- Add meal from library to day as editable snapshot.
- Add single product to day.
- Create product while adding food to a day.
- Create product while editing a meal template.
- Edit daily meal entries.
- Edit daily product entries.
- Delete daily entries.
- Calculate daily calories and macros.
- Fixed global daily macro targets.
- Simple search by name for products and meals.
- Snapshot-based historical logging.
- English-only UI and naming.

Not included in MVP:

- Barcode scanning.
- External food database.
- Meal categories.
- Breakfast/lunch/dinner/snack split.
- Product categories.
- Product brands as separate fields.
- Product stores as separate fields.
- Product tags.
- Meal notes.
- Meal serving multipliers.
- Saving a daily food entry as a meal template.
- Copying full days.
- Copying entries from previous days.
- Closing or finishing diet days.
- Manual meal times.
- Entry `created_at`.
- Manual entry ordering.
- Micronutrients.
- Fiber/salt/sugar tracking.
- Charts inside the diet module.
- Offline draft system.
- AI food recognition.
- Recipe instructions.

## Implementation Notes for Agents

Keep diet-specific code inside:

```txt
src/features/nutrition/
```

Recommended structure:

```txt
src/features/nutrition/
  components/
  hooks/
  queries/
  schemas/
  types/
  utils/
```

Database queries should be kept out of React components.

Recommended query files:

```txt
src/features/nutrition/queries/products.ts
src/features/nutrition/queries/meal-templates.ts
src/features/nutrition/queries/daily-food-log.ts
src/features/nutrition/queries/daily-targets.ts
```

Recommended schema files:

```txt
src/features/nutrition/schemas/product.schema.ts
src/features/nutrition/schemas/meal-template.schema.ts
src/features/nutrition/schemas/daily-food-entry.schema.ts
src/features/nutrition/schemas/daily-targets.schema.ts
```

Recommended utility files:

```txt
src/features/nutrition/utils/nutrition-calculations.ts
src/features/nutrition/utils/nutrition-formatting.ts
src/features/nutrition/utils/snapshot.ts
```

Recommended hooks:

```txt
src/features/nutrition/hooks/use-products.ts
src/features/nutrition/hooks/use-meal-templates.ts
src/features/nutrition/hooks/use-daily-food-log.ts
src/features/nutrition/hooks/use-daily-targets.ts
```

Agents should preserve these product decisions unless the user explicitly changes them.
