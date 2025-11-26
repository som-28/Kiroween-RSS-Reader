# Accessibility Features

This document outlines the accessibility features implemented in the Haunted RSS Reader to ensure WCAG 2.1 AA compliance (with AAA support for high-contrast mode).

## Keyboard Navigation

### Global Keyboard Shortcuts

The application supports the following keyboard shortcuts for navigation:

- `H` - Navigate to Home
- `F` - Navigate to Feeds
- `A` - Navigate to Articles
- `D` - Navigate to Digests
- `S` - Navigate to Search
- `,` - Navigate to Settings
- `?` (Shift + /) - Toggle keyboard shortcuts help
- `Escape` - Close dialogs and modals

### Focus Management

- All interactive elements are keyboard accessible
- Visible focus indicators with 3px outline and glow effect
- Focus trap implemented for modals and dialogs
- Skip to main content link for quick navigation
- Tab order follows logical reading order

### Focus Indicators

Focus indicators are highly visible with:

- 3px solid outline in accent color
- 2-3px offset for clarity
- Additional glow effect (6px shadow) for buttons and links
- Distinct styling for form inputs

## ARIA Labels and Roles

### Semantic HTML

- Proper use of `<article>`, `<nav>`, `<main>`, `<section>` elements
- Heading hierarchy maintained throughout
- Lists use proper `<ul>`, `<ol>`, `<li>` structure

### ARIA Attributes

#### Navigation

- `aria-label` on navigation regions
- `aria-current` for active navigation items
- `aria-expanded` for expandable menus
- `aria-controls` linking menu buttons to panels

#### Interactive Elements

- `aria-label` for icon-only buttons
- `aria-pressed` for toggle buttons
- `aria-busy` for loading states
- `aria-live` regions for dynamic content updates

#### Decorative Elements

- `aria-hidden="true"` on decorative SVGs and animations
- `role="presentation"` for purely visual elements

#### Loading States

- `role="status"` for loading indicators
- `aria-live="polite"` for non-critical updates
- Descriptive labels for screen readers

### Alt Text

All images and icons include:

- Descriptive alt text for meaningful images
- Empty alt text (`alt=""`) or `aria-hidden="true"` for decorative images
- Icon labels via `aria-label` when icons convey meaning

## Color Contrast

### Standard Themes

All three standard themes (Graveyard, Haunted Mansion, Witch Cottage) meet WCAG AA standards:

- **Text on Background**: Minimum 4.5:1 contrast ratio
- **Large Text**: Minimum 3:1 contrast ratio
- **UI Components**: Minimum 3:1 contrast ratio

### High Contrast Mode

High contrast mode provides WCAG AAA compliance:

- **Text on Background**: Minimum 7:1 contrast ratio
- **Enhanced color differentiation**
- **Brighter accent colors** for better visibility
- **Increased border visibility**

#### High Contrast Color Palette

```css
Background: #000000 (Pure Black)
Secondary Background: #1a1a1a
Text: #ffffff (Pure White)
Primary Accent: #ffaa00 (Bright Orange)
Secondary Accent: #00ffff (Cyan)
Success/Green: #66ff66
Warning/Purple: #cc99ff
Error/Red: #ff6666
```

### Color Usage Guidelines

- Color is never the only means of conveying information
- Interactive states use multiple indicators (color + icon + text)
- Status indicators include both color and text labels
- Error messages include icons and descriptive text

## Screen Reader Support

### Tested With

- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS/iOS)
- TalkBack (Android)

### Screen Reader Features

- Descriptive labels for all interactive elements
- Live regions announce dynamic content changes
- Loading states announced appropriately
- Error messages announced immediately
- Form validation feedback is accessible

### Content Structure

- Logical heading hierarchy (h1 → h2 → h3)
- Landmarks for major page sections
- Skip links for bypassing repetitive content
- Descriptive link text (no "click here")

## Responsive Design

### Touch Targets

- Minimum 44x44px touch targets on mobile
- Adequate spacing between interactive elements
- Larger tap areas for primary actions

### Viewport Support

- Responsive from 320px to 4K displays
- Text scales appropriately at all sizes
- No horizontal scrolling required
- Content reflows naturally

## Animation and Motion

### Reduced Motion Support

Respects `prefers-reduced-motion` system setting:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### User Controls

- Animation toggle in settings
- Decorative animations can be disabled
- Essential animations (loading indicators) remain functional

## Form Accessibility

### Input Fields

- Associated labels for all inputs
- Clear error messages
- Inline validation feedback
- Required field indicators
- Placeholder text as hints, not labels

### Error Handling

- Errors announced to screen readers
- Visual error indicators
- Descriptive error messages
- Focus moved to first error on submission

## Testing Recommendations

### Automated Testing

Run accessibility audits with:

- Lighthouse (Chrome DevTools)
- axe DevTools
- WAVE browser extension

### Manual Testing

1. **Keyboard Navigation**: Navigate entire app using only keyboard
2. **Screen Reader**: Test with NVDA/JAWS/VoiceOver
3. **Zoom**: Test at 200% zoom level
4. **Color Blindness**: Use color blindness simulators
5. **High Contrast**: Test with Windows High Contrast mode

### Checklist

- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible on all elements
- [ ] No keyboard traps
- [ ] Skip links functional
- [ ] All images have alt text
- [ ] Color contrast meets WCAG AA
- [ ] High contrast mode available
- [ ] Screen reader announces all content
- [ ] Forms have proper labels
- [ ] Error messages are accessible
- [ ] Loading states announced
- [ ] Animations respect reduced motion
- [ ] Touch targets minimum 44x44px
- [ ] No horizontal scrolling

## Known Limitations

1. **Decorative Animations**: Some Halloween-themed animations may be distracting for users with attention disorders. These can be disabled in settings.

2. **Dark Theme**: The application uses a dark theme by default. Users who prefer light themes should use high-contrast mode or system settings.

3. **Complex Visualizations**: Article connection visualizations may be difficult to interpret with screen readers. Text alternatives are provided.

## Future Improvements

- [ ] Add more keyboard shortcuts for common actions
- [ ] Implement voice control support
- [ ] Add dyslexia-friendly font option
- [ ] Improve screen reader announcements for real-time updates
- [ ] Add customizable color themes
- [ ] Implement focus visible polyfill for older browsers

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Inclusive Components](https://inclusive-components.design/)

## Contact

For accessibility issues or suggestions, please open an issue on GitHub or contact the development team.
