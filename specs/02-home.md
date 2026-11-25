# SPEC 02 — Página de inicio (Home) de Arcade Vault

> **Estado:** Implementado
> **Depende de:** SPEC 01
> **Fecha:** 2026-11-23
> **Objetivo:** Implementar en Next.js la landing `Home` de `references/templates/home-about/` en `/`, moviendo la Biblioteca a `/games`, con datos mock estáticos y sin implementar la página About.

---

## Por qué existe este spec

El SPEC 01 dejó la Biblioteca en `/`. El prototipo de `references/templates/home-about/` añade una landing (hero, ventajas, juegos, estadísticas, actividad, precios y CTA final) que debe ocupar `/`. Eso obliga a mover la Biblioteca a otra ruta y a tocar los enlaces que apuntan a `/`. About (`about.jsx`) viene en la misma carpeta pero se implementa en otro spec.

---

## Alcance

**Dentro:**

- Ruta `/` con la landing: hero (siluetas flotantes, título, subtítulo, CTAs, indicador "DESLIZA"), sección `// 01 ¿POR QUÉ ARCADE VAULT?` (4 tarjetas con icono pixel), `// 02 JUEGOS DISPONIBLES AHORA` (6 mini-tarjetas + botón "VER TODOS LOS JUEGOS →"), franja de estadísticas, `// 03 ACTIVIDAD EN VIVO` (ticker de últimas puntuaciones y top 5 de hoy), `// 04 PRECIOS` (plan único + 3 preguntas frecuentes) y CTA final "¿LISTO PARA JUGAR?".
- Nueva ruta `/games` con la Biblioteca actual (hero `av-hero` + `<Library />`), sin cambios de diseño.
- Efecto `reveal` al hacer scroll (`IntersectionObserver`) en las secciones del Home.
- Nav: se añade el enlace "Inicio" (`/`) en escritorio y menú móvil; "Biblioteca" pasa a apuntar a `/games`.
- Actualizar los enlaces que hoy apuntan a `/` con sentido de "Biblioteca" para que apunten a `/games`.
- Portar a `app/globals.css` solo las reglas CSS del Home que faltan (bloques `HOME PAGE`, `ACTIVITY` y `PRICING` de `references/templates/home-about/styles.css`).
- Datos mock estáticos y tipados del ticker y del top de jugadores en `lib/home.ts`.

**Fuera de alcance (para otros specs):**

- La página About (`about.jsx`), el enlace "Acerca de" del nav y todo el CSS de About, del gamepad (`.gp-*`, `.dp-*`, `.div-*`), de contacto y de `tweaks`/`spinner`.
- Actividad en tiempo real, o datos derivados de `seededScores` o `av_scores` (el ticker y el top son texto fijo).
- Que los CTAs cambien según la sesión (el Home no lee `localStorage`).
- Renombrar `/juegos/[id]` y `/jugar/[id]` (se quedan como en el SPEC 01).
- Cambios de diseño respecto al template; no se vuelve a invocar `/frontend-design`.
- Tests automatizados (no hay test runner configurado).
- Internacionalización.

---

## Modelo de datos

```ts
// lib/home.ts
export type NeonColor = "cyan" | "magenta" | "yellow" | "green";

export interface Feature {
  icon: "GAMEPAD" | "FREE" | "TROPHY" | "ROCKET";
  title: string;       // "JUEGOS CLÁSICOS"
  desc: string;
  color: NeonColor;
}

export interface Activity {
  player: string;      // "NEONFOX"
  game: string;        // nombre visible, "Caída"
  score: number;
  ago: string;         // "hace 2 min" (texto fijo)
  color: NeonColor;
}

export interface TopPlayer {
  rank: number;
  player: string;
  score: number;
}

export const FEATURES: Feature[];       // 4 elementos
export const ACTIVITY: Activity[];      // 7 filas del template
export const TOP_PLAYERS: TopPlayer[];  // 5 filas del template
export const HOME_STATS: { n: string; u: string; s: string }[]; // 3 bloques
```

Convenciones:

- Los datos son literales del template, con un solo cambio de copy: el primer stat pasa de `12+ / JUEGOS / Y CONTANDO` a `8 / JUEGOS / Y CONTANDO`, para coincidir con el catálogo real (`GAMES.length`).
- Los mini-cards usan `GAMES.slice(0, 6)` de `lib/games.ts` (sin datos nuevos).
- Números con `toLocaleString("es-ES")`.
- No se agrega ninguna clave a `localStorage`.

---

## Plan de implementación

1. **Mover la Biblioteca.** Crear `app/games/page.tsx` con el contenido actual de `app/page.tsx` (hero `av-hero` + `<Library />`). Actualizar en `components/nav.tsx` el enlace "Biblioteca" a `/games` y `isActive("biblioteca")` para `/games`, `/juegos/*` y `/jugar/*`. Actualizar los enlaces "VOLVER AL VAULT" a `/games` en `app/juegos/[id]/page.tsx`, `components/game-player.tsx`, `components/hall-of-fame.tsx` y `app/not-found.tsx`. Verificar: `npm run dev`, `/games` muestra la Biblioteca y el nav la resalta.
2. **CSS del Home.** Portar a `app/globals.css` los bloques `HOME PAGE` (`styles.css` líneas ~930–1070, incluida `.reveal`), `ACTIVITY` y `PRICING` (~1621–1730), con sus `@keyframes` si los hay. Cotejar que no se dupliquen reglas ya presentes. Verificar: `npm run build` sigue pasando.
3. **Datos.** Crear `lib/home.ts` con los tipos y constantes del modelo. Verificar: `npx tsc --noEmit` sin errores.
4. **Componentes de presentación.** Crear en `components/home/`: `floating-silhouettes.tsx`, `feature-icon.tsx` y `mini-card.tsx` (Server Components; `mini-card` envuelto en `Link` a `/juegos/[id]`). Cada uno se porta del JSX del template cambiando `className`/`strokeWidth` ya válidos en React.
5. **Reveal.** Crear `components/home/reveal.tsx` (Client): envuelve el contenido de una sección y añade la clase `in` con `IntersectionObserver` (umbral 0.12, `unobserve` tras la primera intersección, `disconnect` en el cleanup). Si `IntersectionObserver` no existe, muestra la sección ya visible.
6. **Home en `/`.** Reemplazar `app/page.tsx` por la landing (Server Component) con las 6 secciones y el hero, usando los componentes anteriores y `lib/home.ts`. CTAs: "EXPLORAR JUEGOS" y "VER TODOS LOS JUEGOS" → `/games`; "CREAR CUENTA", "EMPEZAR GRATIS" → `/acceso`; "INSERTAR MONEDA" → `/games`; "VER SALÓN" → `/salon`. Verificar: `/` renderiza igual al template.
7. **Nav "Inicio".** Añadir "Inicio" (`/`) al nav de escritorio y al panel móvil, activo solo en `pathname === "/"`. No se agrega "Acerca de". Verificar: ancho ≤ 768 px muestra "Inicio" en el panel.
8. **Cierre.** Revisar que `app/page.tsx` ya no importe `Library`. Verificar: `npm run lint` y `npm run build` pasan.

Cada paso deja la app arrancable con `npm run dev`.

---

## Criterios de aceptación

- [x] `npm run build`, `npm run lint` y `npx tsc --noEmit` terminan sin errores.
- [x] `/` muestra el hero con las tres líneas del título, los dos CTAs y las 8 siluetas flotantes.
- [x] `/` muestra las secciones `// 01`, `// 02`, `// 03` y `// 04`, la franja de estadísticas y el CTA final "¿LISTO PARA JUGAR?".
- [x] La sección `// 01` muestra 4 tarjetas: JUEGOS CLÁSICOS, 100% GRATIS, LADDER BOARDS y SIEMPRE CRECIENDO.
- [x] La sección `// 02` muestra exactamente 6 mini-tarjetas, con los 6 primeros juegos de `GAMES`.
- [x] Hacer clic en una mini-tarjeta navega a `/juegos/[id]` del juego correcto.
- [x] El primer bloque de estadísticas muestra `8` y `JUEGOS`; los otros dos coinciden con el template.
- [x] El ticker muestra 7 filas y el top de hoy 5 filas, con los puntajes formateados con `es-ES` (ej. `+184.220`, `312.840`).
- [x] "VER SALÓN →" navega a `/salon`.
- [x] "EXPLORAR JUEGOS", "VER TODOS LOS JUEGOS →" e "INSERTAR MONEDA →" navegan a `/games`.
- [x] "CREAR CUENTA" y "EMPEZAR GRATIS →" navegan a `/acceso`, con o sin sesión.
- [x] `/games` muestra la Biblioteca con sus 8 tarjetas, búsqueda y chips funcionando como en el SPEC 01.
- [x] `/` ya no muestra la grilla ni el buscador de la Biblioteca.
- [x] Los enlaces "VOLVER AL VAULT" (Detalle, Reproductor, Salón y 404) navegan a `/games`.
- [x] El nav muestra "Inicio", "Biblioteca" y "Salón de la Fama" y no muestra "Acerca de".
- [x] "Inicio" está resaltado solo en `/`; "Biblioteca" solo en `/games`, `/juegos/*` y `/jugar/*`; "Salón de la Fama" solo en `/salon`.
- [x] Al hacer scroll, las secciones con `reveal` pasan de invisibles a visibles (clase `in`).
- [x] Con `IntersectionObserver` indefinido, todas las secciones del Home quedan visibles.
- [ ] Recargar `/` no produce errores de hydration en la consola.
- [ ] En ancho ≤ 768 px el Home no tiene scroll horizontal y el panel móvil incluye "Inicio".
- [x] `globals.css` no contiene reglas `.about-*`, `.gp-*`, `.dp-*` ni `.contact-*` nuevas.
- [x] No existe ninguna ruta `/about` ni referencia a ella en el código.

---

## Decisiones tomadas y descartadas

- **Sí:** Home en `/` y Biblioteca en `/games`. Decisión del usuario; la landing es la puerta de entrada natural del sitio.
- **No:** `/biblioteca` (recomendación inicial) ni `/juegos`. El usuario eligió `/games`.
- **Sí:** mantener `/juegos/[id]` y `/jugar/[id]` sin renombrar. Renombrarlos amplía el alcance y rompe enlaces del SPEC 01; ver riesgo de nomenclatura mixta.
- **No:** Biblioteca embebida en el Home. El template separa ambas pantallas.
- **Sí:** no incluir "Acerca de" en el nav hasta el spec de About. Evita un enlace roto.
- **No:** enlace al 404 ni enlace deshabilitado. Mala experiencia o CSS extra.
- **Sí:** datos de ticker y top como mock estático en `lib/home.ts`. El Home queda 100 % Server Component y sin lectura de `localStorage`.
- **No:** derivarlos de `seededScores`/`av_scores`. Mezcla persistencia en la landing y amplía el alcance.
- **Sí:** cambiar el stat "12+" a "8". Evita prometer un catálogo que no existe; es el único cambio de copy respecto al template.
- **Sí:** CTAs de registro siempre visibles, copy del template (incluye "Arkanoid, Tetris, Snake"). Decisión del usuario; mantiene el Home estático y evita hydration mismatch.
- **No:** ocultar CTAs con sesión iniciada. Requeriría `useSession` en el hero y parpadeo al hidratar.
- **Sí:** `Reveal` como único Client Component nuevo; el resto son Server Components. Minimiza JS enviado al cliente.
- **Sí:** portar solo el CSS del Home. Los bloques de About, gamepad y contacto pertenecen al spec de About.

---

## Riesgos identificados

| Riesgo | Mitigación |
| --- | --- |
| `.reveal` empieza con `opacity: 0`; sin JS o con error de hidratación las secciones quedan invisibles | `Reveal` marca visible si no hay `IntersectionObserver`; verificar con scroll en navegador real. |
| Los enlaces a `/` con sentido de "Biblioteca" se olvidan y llevan al Home | Buscar todas las ocurrencias de `href="/"` y `router.push("/")` en `app/` y `components/`; el login (`auth-form.tsx`) se mantiene en `/` por decisión: tras iniciar sesión se aterriza en el Home. |
| Nomenclatura mixta (`/games` en inglés, `/juegos/[id]` en español) | Aceptado en este spec; unificar rutas va en un spec aparte si molesta. |
| Cache Components falla el build por acceso dinámico | El Home no usa `params`, `searchParams` ni `localStorage`; consultar `node_modules/next/dist/docs/` antes de escribir las páginas, según `CLAUDE.md`. |
| Clases CSS duplicadas o en conflicto al portar bloques del template | Cotejar cada selector con `app/globals.css` antes de pegarlo; añadir solo los que falten. |
| Copy con marcas de terceros ("Arkanoid", "Tetris") | Se mantiene a petición del usuario; es copy del template, sin uso de logos. |

---

## Lo que **no** está en este spec

- La página About y el enlace "Acerca de".
- Actividad en vivo real, backend o puntuaciones dinámicas en el Home.
- CTAs que reaccionan a la sesión.
- Renombrar las rutas `/juegos/[id]` y `/jugar/[id]`.
- Tests automatizados e internacionalización.
- Cambios de diseño respecto al template.

Cada uno de esos puntos, si se aborda, va en su propio spec.
