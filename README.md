# Tony Cao - Portfolio

A portfolio website built with Astro, React Three Fiber, and Tailwind CSS.

## Stack

- **Astro** with React integration
- **Three.js** ecosystem (@react-three/fiber, @react-three/drei)
- **GSAP** animations
- **Tailwind CSS v4**
- **Zod** validation
- **TypeScript** (strict mode)

## Project Structure

```text
/
├── public/          # Static assets
├── src/
│   ├── components/  # React/Astro components
│   ├── layouts/     # Page layouts
│   ├── pages/       # Routes (file-based routing)
│   └── styles/      # Global styles
└── package.json
```

## Commands

All commands are run from the root of the project:

| Command           | Action                                       |
| :---------------- | :------------------------------------------- |
| `pnpm install`    | Installs dependencies                        |
| `pnpm dev`        | Starts local dev server at `localhost:4321`  |
| `pnpm build`      | Build your production site to `./dist/`      |
| `pnpm preview`    | Preview your build locally, before deploying |

## Development

Remember to import the Tailwind stylesheet in your layouts:

```typescript
// src/layouts/Layout.astro
import '../styles/global.css'
```

## Learn More

- [Astro Documentation](https://docs.astro.build)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Tailwind CSS](https://tailwindcss.com/docs)
