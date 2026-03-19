📢 Use this project, [contribute](https://github.com/{OrganizationName}/{AppName}) to it or open issues to help evolve it using [Store Discussion](https://github.com/vtex-apps/store-discussion).

## Buy Together App

<!-- DOCS-IGNORE:start -->
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-0-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->
<!-- DOCS-IGNORE:end -->

The **Buy Together App** is a VTEX IO app that creates a **Buy Together** block based on the **Show Together** cross‑sell from the VTEX Catalog. It allows you to display, alongside the current product, one or more suggested products, automatically calculate the total value of the bundle (with or without discount), and offer a simplified purchase flow in a single card.

**Key features:**
- ✅ Automatic integration with the VTEX Catalog **Show Together** cross‑sell
- ✅ Display of the current product + list of suggested products in a horizontal layout
- ✅ Current product in Buy Together stays synchronized with the SKU selected on the PDP
- ✅ Automatic calculation of the bundle total value
- ✅ Support for a **discount percentage** applied over the bundle final price
- ✅ Option for **custom text** next to the price (e.g., "PIX", "cash", etc.), enabled by default
- ✅ Option to ignore cross‑sell and use a **manual SKU** as the suggested product
- ✅ Display of **installment conditions** with fully customizable text via messages
- ✅ Structure compatible with `product-summary` and `product-list-context`
- ✅ Support for multiple languages via message files (`pt`, `en`, `es`, `context`)

### How the component works

The Buy Together App:

1. Identifies the **current product** through `vtex.product-context`.
   - The `buy-together-current-product` block dynamically follows the SKU selected in the PDP main selector.
2. Fetches, via the `/api/catalog_system/pub/products/crossselling/showtogether/{productId}` API, the SKUs configured as **Show Together** in VTEX Admin.
3. Normalizes products using `vtex.product-summary` so you can reuse the same shelf/grid visual already used in the store.
4. Builds a **bundle card**, displaying:
   - Current product
   - Suggested products (with optional sliders/pagination)
   - Message above the total (configurable)
   - Bundle total value (with optional discount applied)
   - Additional text next to the price (optional)
   - Installment conditions (via messages)
5. Creates cart items from the selected SKUs and allows adding all of them at once via the buy button.

## Configuration

### Step 1: Adding the app to your theme dependencies

Add the `vtex-buy-together-app` app to your theme `manifest.json`:

```json
{
  "dependencies": {
    "sunhouse.vtex-buy-together-app": "0.x"
  }
}
```

### Step 2: Declaring the Buy Together block in the theme

Declare the `buy-together` block in your store’s templates, for example in the `store.product` template:

```json
{
  "store.product": {
    "children": [
      "product-name",
      "product-summary.shelf",
      "buy-together",
      "product-price",
      "buy-button"
    ]
  }
}
```

Then make sure the internal blocks are configured, following the app `store/blocks.json` file:

```json
{
  "buy-together": {
    "children": ["flex-layout.col#buyTogetherContent"]
  },
  "flex-layout.col#buyTogetherContent": {
    "children": ["flex-layout.row#buyTogetherContainer"]
  },
  "flex-layout.row#buyTogetherContainer": {
    "children": [
      "buy-together-current-product",
      "flex-layout.col#icon-plus",
      "buy-together-product-list",
      "flex-layout.col#icon-equals",
      "flex-layout.col#buyTogetherInformation"
    ]
  },
  "flex-layout.col#buyTogetherInformation": {
    "children": [
      "buy-together-message",
      "buy-together-total",
      "buy-together-installments",
      "buy-together-buy-button"
    ]
  }
}
```

> ⚠️ **Important:** the `buy-together` block is designed to be used **once per product page**, together with the standard product context. Multiple instances on the same page may cause unexpected behavior when building the item list.

### Blocks

The app exports the following blocks:

| Block name                 | Description                                                                 |
| -------------------------- | --------------------------------------------------------------------------- |
| `buy-together`             | Root Buy Together block. Wraps the full card with base and suggested products |
| `buy-together-current-product` | Displays the current product using a `product-summary` block              |
| `buy-together-product-list` | List of suggested products (Show Together) as a shelf/list                  |
| `buy-together-total`       | Displays the bundle total value (with discount applied, if configured)     |
| `buy-together-installments`| Displays the bundle installment conditions                                 |
| `buy-together-buy-button`  | Bundle buy button (adds all items to cart)                                 |
| `buy-together-message`     | Message (heading) displayed above the bundle total value                   |

### `buy-together` block props

The main props exposed by the `BuyTogether` schema are:

| Prop name               | Type      | Description                                                                                                                                          | Default value                 |
| ----------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `message`               | `string`  | Message displayed above the bundle total value.                                                                                                      | `"Compre o conjunto por:"`  |
| `useManualSku`          | `boolean` | When `true`, ignores the Show Together cross‑sell and uses the SKU informed in `manualSkuId` as the suggested product.                             | `false`                      |
| `manualSkuId`           | `string`  | SKU ID to be used as suggested product when `useManualSku` is enabled.                                                                              | `undefined`                  |
| `showCustomText`        | `boolean` | Defines whether the **Custom Text** will be displayed next to the price.                                                                            | `true`                       |
| `customText`            | `string`  | Text displayed next to the price (e.g., `"PIX"`, `"cash"`, etc.).                                                                                   | `"PIX"`                      |
| `discountPercentage`    | `number`  | Discount percentage to be applied over the bundle final price (0‑100). **Never leave it empty**: use `0` to apply no discount.                      | `0`                          |
| `showListMode`          | `boolean` | When `true` **and** no manual SKU is active, shows a list of suggested products (Show Together) instead of a single item. Always limited to a safe maximum number of items. | `false`                      |
| `showBuyWithCoupon`    | `boolean` | When `true`, the buy button applies a coupon code via Checkout API and the normal button is hidden. | `false` |
| `couponCode`           | `string`  | Coupon code to be applied when `showBuyWithCoupon` is enabled. | `""` |

> 💡 **Tip:** The discount is applied **product by product** when calculating the total value, ensuring that the percentage rule is respected even when item prices vary inside the bundle.

## How it works (Modus Operandi)

### Data flow

The Buy Together App organizes its behavior in a few steps:

1. **Base product identification**  
   Uses `vtex.product-context` to get the current product on the page.
2. **Show Together product discovery**  
   When `useManualSku` is `false`, the app calls the Show Together cross‑sell endpoint to fetch related SKUs.
3. **Fallback with manual SKU (optional)**  
   When `useManualSku` is `true` and `manualSkuId` is a valid number, the app ignores cross‑sell and builds the bundle using the informed SKU.
4. **Product normalization**  
   Returned products are normalized via `ProductSummary.mapCatalogProductToProductSummary`, allowing you to reuse the same shelf layout already used in the store.
5. **Total with discount calculation**  
   For each bundle item, the selling price is converted to currency (`sellingPrice / 100`) and, if `discountPercentage > 0`, a per‑item percentage discount is applied before summing.
6. **Cart items preparation**  
   The `mapSKUItemsToCartItems` utility function converts the product list into cart items compatible with the standard VTEX checkout flow.

### Behavior differences

- **With `useManualSku = false`**:  
  - The bundle is built from the **Show Together** cross‑sell relationships configured in Admin.  
  - By default (with `showListMode = false`), the UI shows **only the first SKU** returned as the suggested product.
  - When `showListMode = true`, the app uses the list of cross‑sell products to render **multiple suggested items** in `buy-together-product-list`:
    - The list is **randomized once per data change** and **limited to a maximum of 8 items** to keep the UI lightweight.
- **With `useManualSku = true`**:  
  - The app ignores cross‑sell and builds the bundle using the **single SKU** informed in `manualSkuId` as the suggested product.  
  - The `showListMode` flag is effectively ignored in this scenario: even if enabled, only the manual SKU will be shown as the suggested product.

### Relationship with VTEX Admin

- **Catalog (Show Together)**  
  - Configure product relationships of type **Show Together** in Admin so the app can automatically build Buy Together bundles.
- **Store Theme**  
  - Use the `buy-together` block on product pages, composing it with `flex-layout` and `product-summary` according to your layout needs.
- **Messages / Internationalization**  
  - Editor labels and descriptions (Site Editor) are loaded from the `messages/` files (`pt.json`, `en.json`, `es.json`, `context.json`).  
  - The `react/intlMessages.ts` file ensures the builder can statically parse all used messages, avoiding build warnings and improving build/render performance.

### Buy Together message and heading

The content rendered by the `buy-together-message` block (heading for the Buy Together section) follows this priority order:

1. `children` declared directly in the `buy-together-message` block in the theme.
2. `message` prop configured on the `buy-together-message` block itself.
3. `message` coming from the `BuyTogether` context (`message` prop of the root block).
4. Static fallback: `"Compre o conjunto por:"`.

In the HTML markup, the `buy-together-message` block is rendered as a heading (`<h2>`), which helps SEO by signaling the Buy Together section as a relevant heading on the product page.

## Customization

To apply CSS customizations to this and other blocks, follow the [Using CSS Handles for store customization](https://vtex.io/docs/recipes/style/using-css-handles-for-store-customization) recipe.

You can customize the app in two complementary ways:
- Edit the default/pre-custom styles shipped with the app in `react/styles.css` (it targets the same CSS Handles used by the components).
- Or customize from the Store Theme using CSS Handles (recommended when you want changes without modifying the app).

Both approaches can be used independently or together without issues.

### CSS Handles

The Buy Together App exposes the following CSS handles:

| CSS Handle                 | Description                                                    |
| -------------------------- | -------------------------------------------------------------- |
| `buyTogetherContainer`     | Main container of the Buy Together card                        |
| `currentProduct`           | Current product area                                           |
| `currentProductWrapper`    | Wrapper for the current product                                |
| `productList`              | Container for the suggested products list                      |
| `buyTogetherTitleContainer`| Container for the Buy Together heading/title                   |
| `buyTogetherTitle`         | Title of the Buy Together block                                |
| `buyTogetherInfo`          | Info column (message, total, installments, button)             |
| `totalValue`               | Bundle total value area                                        |
| `totalProducts`            | Container summarizing the number of products                   |
| `buyTogetherProductList`   | List of products in the bundle                                 |
| `buyTogetherProductItem`   | Individual product item in the bundle list                     |
| `totalProductsCount`       | Product count inside the bundle                                |
| `arrowDisabled`            | Style applied to disabled navigation arrows                    |
| `buyButton`                | Bundle buy button                                              |
| `arrowNext`                | “Next” navigation arrow                                       |
| `arrowPrev`                | “Previous” navigation arrow                                   |
| `arrow`                    | Base style for navigation arrows                               |

### Customization example

```css
/* Highlight bundle total value */
.totalValue {
  font-weight: 700;
  font-size: 1.25rem;
}

/* Style the bundle buy button */
.buyButton {
  background-color: #134cd8;
  border-radius: 999px;
}

.buyButton:hover {
  filter: brightness(1.05);
}
```

## Messages and Internationalization

The main editor and store messages are defined in `messages/pt.json`, `messages/en.json`, `messages/es.json`, and `messages/context.json`. Some examples:

- `admin/editor.buy-together.title` / `admin/editor.buy-together.description`
- `admin/editor.buy-together.discountPercentage.*`
- `admin/editor.buy-together.customText.*`
- `admin/editor.buy-together.showCustomText.*`
- `admin/editor.buy-together.installments.*`
- `store/buy-together.installments.default`

These messages allow you to:

- Localize the component title and description in the Site Editor.  
- Customize the **installments** text displayed to users.  
- Adjust internal configuration instructions (for example, reinforcing that `discountPercentage` should never be left empty).

## Additional resources

- **Development log and technical decisions**: check `docs/DEVELOPMENT_LOG.md` to follow relevant changes made to the app, as well as refinements in messages, schema, and block structure.

<!-- DOCS-IGNORE:start -->

## Contributors ✨

Thanks goes to these wonderful people:

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind are welcome!

<!-- DOCS-IGNORE:end -->

