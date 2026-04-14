## ADDED Requirements

### Requirement: Toast container element

The plugin SHALL render a fixed-position container element that holds all visible toast notifications and reflects the current contents of the `wp-toast` store. The container SHALL use `role="status"` and `aria-live="polite"` for accessibility.

#### Scenario: Container is present on page

- **WHEN** at least one toast has been queued during the current request and `wp_footer` has fired
- **THEN** a fixed-position container with `role="status"` and `aria-live="polite"` is present in the DOM

### Requirement: Automatic late rendering

The plugin SHALL emit the toaster block automatically on `wp_footer` at a late priority. Emission SHALL be unconditional when the request-scoped toast queue is non-empty. When the queue is empty, emission SHALL be gated by the `wp_toast_render_empty` filter, which SHALL default to `true`. Themes and consuming plugins SHALL NOT need to place the block by hand.

The `wp_toast_render_empty` filter value SHALL be interpreted as follows:

- `true` — render an empty container.
- `false` — do not render anything.
- a `callable` — call it with no arguments and coerce the result to bool; the intent is that template-tag-style conditionals such as `'is_singular'`, `'is_single'`, or `'is_post_type_archive'` can be passed directly as strings.
- any other value — coerce to bool.

#### Scenario: Page with queued toast always renders container

- **WHEN** a call to `wp_toast()` has queued at least one toast earlier in the request
- **THEN** on `wp_footer` the plugin emits the `wp-toast/toaster` block exactly once regardless of the `wp_toast_render_empty` filter, and the resulting container is present in the rendered DOM

#### Scenario: Empty queue with default filter renders empty container

- **WHEN** no call to `wp_toast()` happens during the request
- **AND** no code overrides the `wp_toast_render_empty` filter
- **THEN** on `wp_footer` the plugin emits the `wp-toast/toaster` block, an empty container is present in the rendered DOM, and the `wp-toast` view script module and stylesheet are enqueued so runtime `actions.add()` calls can mount into it

#### Scenario: Empty queue with filter set to false renders nothing

- **WHEN** no call to `wp_toast()` happens during the request
- **AND** a filter on `wp_toast_render_empty` returns `false`
- **THEN** the plugin does not emit the toaster block, no container element is present in the rendered DOM, and no `wp-toast` view script module or stylesheet is enqueued

#### Scenario: Empty queue with template-tag callable filter

- **WHEN** no call to `wp_toast()` happens during the request
- **AND** a filter on `wp_toast_render_empty` returns the string `'is_singular'`
- **THEN** the plugin invokes `is_singular()` with no arguments and, if it returns `true`, emits an empty container; if it returns `false`, emits nothing

### Requirement: Single container instance

The plugin SHALL ensure only one toast container is rendered per page, even if a theme or another plugin explicitly re-inserts the toaster block.

#### Scenario: Duplicate container prevention

- **WHEN** the plugin's automatic `wp_footer` emission has already rendered the container and another source (theme template, post content, or third-party plugin) renders the toaster block a second time
- **THEN** only one toast container element is present in the rendered DOM

### Requirement: Toast item rendering

Each toast in `state.toasts` SHALL be rendered as a child element of the container. Each toast item SHALL display its `content` as HTML, apply a CSS class reflecting its `variant`, and include a dismiss button if `dismissable` is `true`.

#### Scenario: Toast displays content as HTML

- **WHEN** a toast with `content: '<strong>Saved</strong> successfully'` is in the store
- **THEN** the toast item renders the HTML content with the `<strong>` tag interpreted as markup

#### Scenario: Toast applies variant class

- **WHEN** a toast with `variant: 'error'` is in the store
- **THEN** the toast item element has a CSS class `wp-toast--error`

#### Scenario: Dismissable toast apply dismissable class

- **WHEN** a toast with `dismissable: true` is in the store
- **THEN** the toast item element has a CSS class `wp-toast--dismissable`

#### Scenario: Dismissable toast shows close button

- **WHEN** a toast with `dismissable: true` is in the store
- **THEN** the toast item includes a close button with `aria-label="Dismiss notification"`

#### Scenario: Non-dismissable toast hides close button

- **WHEN** a toast with `dismissable: false` is in the store
- **THEN** the toast item does not include a close button

### Requirement: Content is sanitized before rendering

A toast's `content` SHALL be sanitized before it is written to the DOM, so that rendered toasts never contain unsafe HTML (for example, `<script>` elements or event-handler attributes). The renderer SHALL NOT write any `content` value to the DOM that has not passed through sanitization.

#### Scenario: Safe HTML content is preserved

- **WHEN** a toast with `content: '<strong>Saved</strong> <em>successfully</em>'` is rendered
- **THEN** the toast item contains a `<strong>` element and an `<em>` element with the expected text content

#### Scenario: Unsafe HTML content is stripped

- **WHEN** a toast with `content: '<img src=x onerror=alert(1)><script>alert(2)</script>ok'` is rendered
- **THEN** the toast item contains no `<script>` element and no `onerror` attribute, and the rendered DOM is safe

### Requirement: Dismiss button removes the toast

Clicking the dismiss button on a toast item SHALL remove that toast (and only that toast) from the page.

#### Scenario: Clicking dismiss removes toast

- **WHEN** the user clicks the dismiss button on a toast
- **THEN** that toast is removed from `state.toasts` and disappears from the DOM, while other visible toasts are unaffected

### Requirement: Hover pauses auto-dismiss

Auto-dismiss SHALL pause while the user hovers a toast item, and resume with the remaining time when the pointer leaves.

#### Scenario: Hovering a toast pauses its timer

- **WHEN** a toast with auto-dismiss time remaining is hovered
- **THEN** the toast is not removed while the pointer stays over the toast item

#### Scenario: Leaving a toast resumes its timer

- **WHEN** the pointer moves off a previously hovered toast
- **THEN** auto-dismiss resumes from the time remaining at the moment the hover began

### Requirement: Enter animation

When a toast is added, it SHALL animate in with a slide-up and fade-in transition before settling into its resting position in the stack.

#### Scenario: New toast animates in

- **WHEN** a new toast is added to the store and rendered in the DOM
- **THEN** the toast slides up and fades in from a transparent starting state

### Requirement: Exit animation

When a toast is removed, it SHALL animate out with a fade-out and slide-down transition before the element is removed from the DOM.

#### Scenario: Dismissed toast animates out

- **WHEN** a toast is removed from the store
- **THEN** the toast fades out and slides down before the element is removed from the DOM

### Requirement: Configurable position

The toast container SHALL support a `data-position` attribute with values: `top-left`, `top-right`, `bottom-left`, `bottom-right`, `top-center`, `bottom-center`. The default position SHALL be `bottom-right`.

#### Scenario: Default position is bottom-right

- **WHEN** the toaster block is rendered without a position attribute
- **THEN** the container is positioned at the bottom-right of the viewport

#### Scenario: Custom position is applied

- **WHEN** the toaster block is rendered with `position="top-center"`
- **THEN** the container is positioned at the top-center of the viewport

### Requirement: CSS custom properties for theming

The toast component SHALL expose CSS custom properties for its visual tokens — at minimum `--wp-toast-bg`, `--wp-toast-fg`, `--wp-toast-border`, `--wp-toast-radius`, `--wp-toast-shadow`, `--wp-toast-font-size`, `--wp-toast-padding`, `--wp-toast-gap`, and `--wp-toast-z-index` — so that themes can override any of them without touching the plugin's CSS.

#### Scenario: Theme overrides custom property

- **WHEN** a theme sets `--wp-toast-bg: #1a1a1a` on `:root`
- **THEN** all toast items render with the `#1a1a1a` background color

### Requirement: Stacking layout

Multiple visible toasts SHALL stack vertically with a gap controlled by `--wp-toast-gap`. Newer toasts SHALL appear at the edge closest to the viewport edge (bottom for bottom positions, top for top positions).

#### Scenario: Three toasts stack with gap

- **WHEN** three toasts are visible simultaneously
- **THEN** they are stacked vertically with the gap value from `--wp-toast-gap` between them
