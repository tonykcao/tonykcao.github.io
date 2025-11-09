#!/usr/bin/env python3
"""
Generate Tailwind v4 CSS theme from colors.json
Single source of truth: colors.json
"""

import json
from pathlib import Path

def load_colors():
    """Load colors from colors.json"""
    with open('colors.json', 'r') as f:
        return json.load(f)

def generate_tailwind_css_theme(colors):
    """Generate Tailwind v4 CSS theme"""
    css = """@import "tailwindcss";

@theme {
  /* Primary Scale (Cyan/Teal) */
"""

    # Primary colors
    for key, value in colors['primary'].items():
        css += f"  --color-primary-{key}: {value};\n"

    css += "\n  /* Secondary Scale (Purple/Blue) */\n"
    # Secondary colors
    for key, value in colors['secondary'].items():
        css += f"  --color-secondary-{key}: {value};\n"

    css += "\n  /* Muted/Neutral Scale (Blue-Grey) */\n"
    # Muted colors
    for key, value in colors['muted'].items():
        css += f"  --color-muted-{key}: {value};\n"

    # Semantic colors with better naming
    css += """
  /* Semantic Colors */
  --color-content: var(--color-primary-100);
  --color-content-subtle: var(--color-muted-500);

  --color-bg-dark: var(--color-muted-950);
  --color-bg: var(--color-muted-900);
  --color-bg-light: var(--color-muted-800);

  --color-primary: var(--color-primary-400);
  --color-secondary: var(--color-secondary-700);
  --color-accent: var(--color-secondary-500);
}

@layer base {
  * {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  body {
    @apply bg-bg-dark text-content;
  }
}
"""

    return css

def main():
    """Main function to generate theme file"""
    print("Loading colors from colors.json...")
    colors = load_colors()

    print("Generating Tailwind v4 theme in global.css...")
    css_content = generate_tailwind_css_theme(colors)

    with open('src/styles/global.css', 'w') as f:
        f.write(css_content)

    print("✓ Generated src/styles/global.css")
    print("\n✓ Theme generated successfully!")
    print("  Source: colors.json")
    print("  Output: src/styles/global.css")
    print("\nUsage:")
    print("  - Text: text-content, text-content-subtle")
    print("  - Backgrounds: bg-bg-dark, bg-bg, bg-bg-light")
    print("  - Semantic: text-primary, bg-secondary, border-accent")
    print("  - Color scales: bg-primary-500, text-secondary-700, border-muted-800")

if __name__ == '__main__':
    main()
