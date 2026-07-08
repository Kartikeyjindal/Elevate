/**
 * Smooth theme toggle with cross-fade overlay.
 * Bridges the visual gap between CSS transitions and React's synchronous re-render.
 *
 * @param {boolean} isDark - current dark mode state
 * @param {function} applyTheme - callback to apply the theme (receives nextTheme string)
 */
export function smoothToggleTheme(isDark, applyTheme) {
  const nextTheme = isDark ? 'light' : 'dark';

  // Create a semi-transparent overlay in the destination theme color
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 99999;
    background: ${isDark ? '#f4f6f9' : '#0b0f19'};
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s ease;
  `;
  document.body.appendChild(overlay);

  // Fade overlay in → swap theme at peak → fade out
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.style.opacity = '0.4';

      setTimeout(() => {
        applyTheme(nextTheme);

        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 280);
      }, 180);
    });
  });
}
