# Themes

Themes are located in the `src/client/public` directory. Themes should be named `[name].css`, where `[name]` is a simple lowercase identifier for the theme.

## Variables

Theme variables should be declared at the start of a theme file, in the `:root` CSS selector.

```css
:root {
    --property-name: #ffffff;
}
```

Skinscape uses the following variables:

### Fonts

- `font-small`: Default small font.
- `font-large`: Default large font.

### Base

- `main-color`: Main background color.
- `secondary-color`: Secondary background color.
- `inlay-color`: Inlay color. Used for backgrounds of inlay elements such as the color palette.
- `scene-color`: Color of the scene.
- `error-color`: Color for error borders and text.

### Text

- `text-primary`: Primary text color.
- `text-secondary`: Secondary text color.
- `link-text`: Link text color.

### Icon

- `icon-color`: Icon color. Used for icons such as the tool icons.

### Button

- `button-color`: Button background color.
- `button-hover`: Hovered button background color.
- `button-select`: Selected button background color.
- `button-outline-hover`: Hovered button outline color.
- `button-outline-select`: Selected button outline color.

### Border

- `border-dark`: Most contrasting border color.
- `border-color`: Base border color.
- `border-light`: Least contrasting border color.

## Custom Rulesets

To style something not supported by variables, [CSS rulesets](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics) can be used.

