# PocketBase setup

Create six collections in PocketBase with API names `products`, `product_categories`, `principals`, `news`, `news_categories`, and `faqs`.

## Products fields

- `slug`: text, required, unique
- `image`: file, single file, image types only
- `categoryId`: text, required
- `category`: text
- `eyebrow`: text
- `title`: text
- `summary`: text
- `description`: text
- `json`: JSON (product specifications)
- `seoTitle`: text, optional
- `seoDescription`: text, optional
- `seoKeywords`: text, optional, comma-separated

## News fields

- `slug`: text, required, unique
- `date`: text
- `category`: text
- `title`: text
- `excerpt`: text
- `content`: text
- `seoTitle`: text, optional
- `seoDescription`: text, optional
- `seoKeywords`: text, optional, comma-separated

## Product categories fields

- `slug`: text, required, unique
- `name`: text, required
- `description`: text

The product `categoryId` value must match the category `slug`. The three initial menu items are `shoe-machinery`, `shoe-materials`, and `acetate-tow`.

## Principals fields

- `slug`: text, required, unique
- `name`: text, required
- `shortName`: text
- `eyebrow`: text
- `title`: text
- `description`: text
- `seoTitle`: text, optional
- `seoDescription`: text, optional
- `seoKeywords`: text, optional, comma-separated
- `year`: text
- `logo`: file, single file, optional

The navigation links to `/principals/{slug}`, and the detail page is rendered from this collection.

## News categories fields

- `slug`: text, required, unique
- `name`: text, required
- `description`: text

The news `categoryId` value must match the category `slug`. The initial menu items are `company` and `industry`.

## FAQs fields

- `slug`: text, required, unique
- `question`: text
- `answer`: text

## Navigation fields

- `key`: text, required, unique (top-level menu identifier; referenced by submenu items via `parent`)
- `label`: text, required
- `href`: text, required
- `parent`: text (empty for top-level menus, otherwise the `key` of the parent menu)
- `sort`: number (lower renders first)
- `enabled`: bool (disabled menus are hidden on the site)
- `source`: text, one of `manual`, `productCategories`, `principals`, `newsCategories`

When `source` is not `manual`, the submenu automatically appends live entries from that collection (for example `/products/<slug>/`) after the manual submenu items. When the navigation collection is empty, the site falls back to the built-in product/principal/news menus derived from the categories.

## Quotes collection

- `name`: text, required
- `company`: text
- `email`: text, required
- `interest`: text
- `message`: text

The collection is created automatically the first time a visitor submits the contact form (no manual setup needed). Quote requests are read-only in the admin panel: view them under **Quotes** and delete handled ones. They are never editable, and public creation goes only through `POST /api/quotes`, which validates required fields and caps field lengths.

The admin panel saves items individually (create/update/delete per record); it no longer replaces whole collections, so editing one menu never touches the others.

Set the PocketBase superuser email and password in `.env.local` using the names in `.env.example`. When these values are present, the site reads and writes PocketBase instead of `content/data.json`. Product image and principal logo uploads go through `/api/admin/upload` and are stored in the PocketBase `products.image` / `principals.logo` file fields.
