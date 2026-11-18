# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Idioma:** En este proyecto, responde siempre en español.

## Proyecto

Arcade Vault: una plataforma para jugar online y competir por la mayor cantidad de puntos. El proyecto sigue desarrollo guiado por especificaciones (flujo `/spec` y `/spec-impl`, según las buenas prácticas de https://github.com/Klerith/fernando-skills, instaladas con `npx skills@latest add Klerith/fernando-skills`). Actualmente el código es el scaffold recién generado de Create Next App (`app/layout.tsx`, `app/page.tsx`), sin lógica de juegos todavía.

No hay un test runner configurado.

## Skills

Usa siempre /frontend-design para diseñar la interfaz de usuario.

## Advertencia sobre la versión de Next.js

Next 16.4.6 / React 19.3: tiene cambios incompatibles respecto a lo que podrías conocer (ver AGENTS.md). Antes de escribir código de Next.js, lee la guía relevante en `node_modules/next/dist/docs/` (`01-app`, `02-pages`, `03-architecture`, `04-community`). Usa el App Router (`app/`).

## Notas de configuración

- `next.config.ts` activa `cacheComponents`, `partialPrefetching` y `experimental.agentFeedback`. Con Cache Components, el acceso a datos dinámicos o sin caché debe manejarse según la documentación de Next (por ejemplo, con límites de Suspense o `use cache`), o el build fallará.
- Tailwind CSS v4 se integra mediante Turbopack: una regla en `turbopack.rules` de `next.config.ts` ejecuta `@tailwindcss/turbopack` sobre `*.css`, y `app/globals.css` usa `@import "tailwindcss"` con un bloque `@theme inline` (sin archivo `tailwind.config` ni configuración de PostCSS).
- Alias de rutas: `@/*` apunta a la raíz del repositorio (no a `src/`).
- `next dev` regenera AGENTS.md automáticamente; déjalo en su lugar.
