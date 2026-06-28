# Nutrition Products Route

This route renders product library management.

- Delegate behavior to `ProductLibraryPage`.
- Products support `per_100g`, `per_100ml`, and `per_unit` nutrition bases only.
- Product create/edit/deactivate behavior belongs in the nutrition feature layer.
- Deactivate historical products instead of hard deleting them.
- Do not add product categories, brands, stores, tags, or barcode fields in the MVP.
