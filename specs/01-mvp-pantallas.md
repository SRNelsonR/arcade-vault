# SPEC 01 — MVP visual de Arcade Vault (5 pantallas)

> **Estado:** Implementado
> **Depende de:** ninguna
> **Fecha:** 2026-11-17
> **Objetivo:** Implementar en Next.js (App Router) las cinco pantallas de `references/templates/` (Biblioteca, Detalle, Reproductor simulado, Salón de la Fama y Acceso) con datos mock, sin implementar ningún juego.

---

## Por qué existe este spec

El proyecto es todavía el scaffold de Create Next App. Los archivos de `references/templates/` son un prototipo React con Babel en el navegador (SPA con hash, `window.*`, sin tipos). Este spec los traslada a rutas reales de Next 16 con TypeScript, conservando el diseño visual exacto del prototipo. El CSS del template ya está portado en `app/globals.css` y las fuentes, el fondo (`.av-bg`, `.av-noise`) ya están en `app/layout.tsx`; este spec no los rehace.

---

## Alcance

**Dentro:**

- Rutas del App Router: `/` (Biblioteca), `/juegos/[id]` (Detalle), `/jugar/[id]` (Reproductor), `/salon` (Salón de la Fama), `/acceso` (Iniciar sesión / Crear cuenta).
- Navegación global (`Nav`) con enlaces, contador de créditos fijo "CRÉDITOS · 03", botón de sesión y menú móvil (hamburguesa con panel y backdrop). Footer global.
- Biblioteca: hero, búsqueda por nombre, chips de categoría, grilla de tarjetas con efecto tilt, estado "NO HAY RESULTADOS".
- Detalle: portada, etiquetas, descripción, franja de estadísticas, botones, tabla "MEJORES PUNTUACIONES".
- Reproductor simulado: HUD (jugador, puntuación, vidas, nivel), marco CRT con arena decorativa, puntaje que sube solo con un timer, pausa, fin de juego, modal "FIN DEL JUEGO" con guardado de puntuación, reiniciar, salir.
- Salón de la Fama: pestañas por juego, podio top 3, tabla de 12 filas, fila "TU MEJOR MARCA" si hay sesión.
- Acceso: pestañas Iniciar sesión / Crear cuenta, formulario, "Jugar como invitado", botones Google/GitHub (solo visuales).
- Sesión mock en `localStorage` (`av_user`) y puntajes guardados en `localStorage` (`av_scores`), visibles en Detalle y Salón de la Fama.
- Datos mock tipados: los 8 juegos del template y puntajes deterministas generados con semilla.
- Animaciones del template: tilt de tarjetas, `flicker` del hero, `fade-in`, `slide-in`, `blink`, `pulse`.
- Página 404 con el estilo del vault para ids de juego inexistentes.

**Fuera de alcance (para otros specs):**

- Lógica real de cualquier juego (colisiones, input de teclado/táctil, niveles reales, vidas reales).
- Backend, base de datos, API de puntuaciones, autenticación real, OAuth real (Google/GitHub), verificación de correo.
- Contador de créditos con lógica (se queda como texto fijo).
- Validación de formularios más allá de lo que hace el template.
- Tests automatizados (no hay test runner configurado).
- Internacionalización (la UI queda solo en español).
- Rediseño visual: se respeta el template; no se vuelve a invocar `/frontend-design` para cambiar su estética.

---

## Modelo de datos

```ts
// lib/games.ts
export type Category = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
export type AccentColor = "cyan" | "magenta" | "yellow" | "green";

export interface Game {
  id: string;          // slug: "bloque-buster", "caida", "serpentina", "gloton",
                       // "invasores", "rocas", "ranaria", "duelo-pixel"
  title: string;       // "BLOQUE BUSTER"
  short: string;       // descripción corta de la tarjeta
  long: string;        // descripción larga del Detalle
  cat: Category;
  cover: string;       // clase CSS existente en globals.css: "cover-bricks", "cover-tetro", ...
  color: AccentColor;  // color del botón JUGAR
  best: number;        // mejor puntuación global (mock)
  plays: string;       // "12.4K" (mock, ya formateado)
}

export const GAMES: Game[];
export const CATS: ["TODOS", ...Category[]];
```

```ts
// lib/scores.ts
export interface ScoreRow {
  rank: number;
  name: string;   // máx. 10 caracteres, mayúsculas
  score: number;
  date: string;   // "DD/MM/2026"
}

// Determinista: mismo seed => mismas filas en servidor y cliente.
export function seededScores(seed: number, count?: number): ScoreRow[];

// Mezcla filas mock con puntajes guardados del localStorage, ordena por score desc y reasigna rank.
export function mergeScores(mock: ScoreRow[], saved: SavedScore[], gameId: string): ScoreRow[];
```

```ts
// lib/session.tsx  (Client Component, Context)
export interface SessionUser { name: string }          // null = invitado / sin sesión
export interface SavedScore {
  game: string;   // Game["id"]
  score: number;
  name: string;
  at: number;     // Date.now()
}

// localStorage
// "av_user"   -> SessionUser | null (JSON)
// "av_scores" -> SavedScore[] (JSON)
```

Convenciones:

- Seeds heredados del template: Detalle usa `id.length * 17 + 3` con 10 filas; Salón usa `id.length * 23 + 7` con 12 filas.
- Números con `toLocaleString("es-ES")`.
- Lectura de `localStorage` solo tras el montaje (`useSyncExternalStore` o `useEffect`) para no causar hydration mismatch.
- Todas las lecturas/escrituras de `localStorage` van en `try/catch`; si falla, la app funciona sin persistir.

---

## Plan de implementación

1. **Datos y utilidades.** Crear `lib/games.ts` (tipos, `GAMES`, `CATS`) y `lib/scores.ts` (`seededScores`, `mergeScores`), portados de `references/templates/data.jsx`. Verificar: `npx tsc --noEmit` sin errores.
2. **Sesión.** Crear `lib/session.tsx` con `SessionProvider` y el hook `useSession()` (`user`, `login`, `signOut`, `scores`, `saveScore`) sobre `av_user` y `av_scores`.
3. **Layout global.** Crear `components/nav.tsx` (Client; links con `usePathname`, créditos fijos, botón de sesión, menú móvil) y `components/footer.tsx`. En `app/layout.tsx`, envolver `children` con `SessionProvider` y renderizar `Nav`, `<main className="av-main">` y `Footer` dentro de `#root`. Verificar: `npm run dev`, el nav y el footer aparecen sobre la página actual.
4. **Biblioteca (`/`).** Crear `components/game-card.tsx` (tilt) y `components/library.tsx` (búsqueda + chips + grilla + estado vacío). Reemplazar `app/page.tsx` por el hero y `<Library />`. Las tarjetas enlazan a `/juegos/[id]`.
5. **Detalle (`/juegos/[id]`).** Crear `app/juegos/[id]/page.tsx` (Server Component, `params` como Promise, `generateStaticParams`, `notFound()` si el id no existe) y `components/leaderboard.tsx` (Client, mezcla mock + `av_scores`). Botón "JUGAR AHORA" a `/jugar/[id]`, "VOLVER AL VAULT" a `/`.
6. **Reproductor (`/jugar/[id]`).** Crear `app/jugar/[id]/page.tsx` (mismo patrón de params) y `components/game-player.tsx` (Client): HUD, CRT, timer de 220 ms que suma 10–99 puntos, subida de nivel, pausa, fin, modal con input de iniciales (máx. 10, mayúsculas) y `saveScore`. "SALIR" a `/juegos/[id]`, "VOLVER AL VAULT" a `/`.
7. **Salón de la Fama (`/salon`).** Crear `app/salon/page.tsx` y `components/hall-of-fame.tsx` (Client; pestañas con `useState`, podio, tabla con `animationDelay`, fila "TU MEJOR MARCA" desde `av_scores` del usuario en ese juego, o "SIN MARCA AÚN" si no tiene).
8. **Acceso (`/acceso`).** Crear `app/acceso/page.tsx` y `components/auth-form.tsx` (Client): pestañas, campos (correo solo en "Crear cuenta"), submit mock que llama `login({ name })` y redirige a `/` con `useRouter`, "Jugar como invitado" (`login(null)`), botones Google/GitHub sin acción.
9. **404.** Crear `app/not-found.tsx` con el estilo del vault ("JUEGO NO ENCONTRADO" + enlace a `/`).
10. **Limpieza.** Eliminar los restos del scaffold que ya no se usan (`public/next.svg`, `public/vercel.svg` y otros SVG de ejemplo si nada los referencia). Verificar: `npm run lint` y `npm run build` pasan.

Cada paso deja la app arrancable con `npm run dev`.

---

## Criterios de aceptación

- [ ] `npm run build` termina sin errores (incluye Cache Components activo).
- [ ] `npm run lint` y `npx tsc --noEmit` terminan sin errores.
- [ ] Existen y responden las rutas `/`, `/juegos/bloque-buster`, `/jugar/bloque-buster`, `/salon` y `/acceso`.
- [ ] `/juegos/no-existe` y `/jugar/no-existe` muestran la página 404 del vault.
- [ ] La Biblioteca muestra las 8 tarjetas; escribir "caída" deja solo `CAÍDA`; elegir el chip `SHOOTER` deja `INVASORES` y `ROCAS`; una búsqueda sin coincidencias muestra "NO HAY RESULTADOS".
- [ ] Hacer clic en una tarjeta o en su botón JUGAR navega a `/juegos/[id]` del juego correcto.
- [ ] El Detalle muestra título, descripción, 4 etiquetas, estadísticas (Partidas, Mejor global, Dificultad) y 10 filas de puntuaciones.
- [ ] Recargar `/juegos/caida` muestra exactamente las mismas 10 filas (datos deterministas) y sin errores de hydration en la consola.
- [ ] En el Reproductor, la puntuación aumenta sola; PAUSA la detiene y muestra "EN PAUSA"; REANUDAR la continúa.
- [ ] En el Reproductor, FIN abre el modal "FIN DEL JUEGO" con la puntuación final; "GUARDAR PUNTUACIÓN" muestra "PUNTUACIÓN GUARDADA_" y escribe una entrada en `av_scores`.
- [ ] "JUGAR DE NUEVO" reinicia puntuación a 0, vidas a 3 y nivel a 01; "VOLVER AL VAULT" navega a `/`.
- [ ] Una puntuación guardada de un juego aparece (ordenada) en la tabla del Detalle y del Salón de ese juego tras navegar a ellos.
- [ ] El Salón muestra 8 pestañas (una por juego), el podio 02-01-03, 12 filas y cambia de datos al cambiar de pestaña.
- [ ] Con sesión iniciada, el Salón muestra "TU MEJOR MARCA EN {JUEGO}"; sin sesión no la muestra.
- [ ] En `/acceso`, "CREAR CUENTA" muestra el campo de correo; "INICIAR SESIÓN" lo oculta.
- [ ] Enviar el formulario con usuario `px_kai` guarda `{"name":"PX_KAI"}` en `av_user`, redirige a `/` y el nav muestra `PX_KAI ▾`.
- [ ] "JUGAR COMO INVITADO" redirige a `/` y el nav muestra "Iniciar Sesión".
- [ ] Hacer clic en `PX_KAI ▾` cierra la sesión (borra `av_user`).
- [ ] La sesión sobrevive a recargar la página.
- [ ] En ancho ≤ 768 px el nav muestra el botón `≡`; al pulsarlo se abre el panel con los enlaces y el backdrop lo cierra.
- [ ] El link activo del nav está resaltado: Biblioteca en `/`, `/juegos/*` y `/jugar/*`; Salón de la Fama en `/salon`.
- [ ] Con `localStorage` bloqueado, ninguna pantalla lanza excepciones (simplemente no persiste).

---

## Decisiones tomadas y descartadas

- **Sí:** rutas reales del App Router. URLs compartibles, mejor encaje con Server Components y `generateStaticParams`.
- **No:** SPA con hash como el template. Va contra el App Router y complica Cache Components.
- **Sí:** Server Components para las páginas y Client Components solo donde hay estado o `localStorage` (Nav, Library, Leaderboard, GamePlayer, HallOfFame, AuthForm). Reduce JS enviado al cliente.
- **Sí:** reproductor simulado con timer, pausa y modal, como el template. Valida el flujo completo jugar → guardar → ver en tabla sin escribir ningún juego.
- **No:** reproductor estático. No permitiría probar el modal ni el guardado.
- **Sí:** `localStorage` con claves `av_user` y `av_scores` (mismas del template) y puntajes guardados visibles en Detalle y Salón. Da una sensación de producto sin backend.
- **No:** cookies + Server Actions. Sobreingeniería para un MVP visual y choca con Cache Components.
- **No:** solo estado en memoria. La sesión se perdería al navegar con recarga.
- **Sí:** puntajes mock con semilla determinista (no `Math.random`). Evita hydration mismatch entre servidor y cliente.
- **Sí:** pestaña del Salón en estado local (`useState`), no en query param. Evita `searchParams` dinámico bajo Cache Components; si se quiere enlazar una pestaña, va en otro spec.
- **Sí:** fila "TU MEJOR MARCA" calculada desde `av_scores` real del usuario; si no tiene marca, "SIN MARCA AÚN". Se descarta el valor inventado del template (`rows[5].score - 2400`) porque contradice los puntajes guardados.
- **Sí:** incluir menú móvil, botones sociales visuales, créditos fijos y animaciones, a petición del usuario.
- **Sí:** `Nav` y `Footer` en `app/layout.tsx`, no repetidos por página.
- **Sí:** copiar clases y estructura HTML del template tal cual para reutilizar `app/globals.css` sin cambios (salvo ajustes mínimos que el port requiera).

---

## Riesgos identificados

| Riesgo | Mitigación |
| --- | --- |
| Leer `localStorage` en render rompe SSR o causa hydration mismatch | Leer solo tras el montaje (`useSyncExternalStore` con snapshot de servidor `null`) y renderizar el estado "sin sesión" hasta entonces. |
| Cache Components falla el build por acceso dinámico (`params`, `localStorage`) | `params` se espera con `await` dentro de páginas con `generateStaticParams`; consultar `node_modules/next/dist/docs/` antes de escribir cada página, según `CLAUDE.md`. |
| Parpadeo del nav (muestra "Iniciar Sesión" y luego `PX_KAI`) al hidratar | Aceptado en el MVP; se puede ocultar el botón hasta que el Provider monte si molesta visualmente. |
| El timer del Reproductor sigue corriendo al salir de la pantalla | Limpiar el `setInterval` en el cleanup del `useEffect`. |
| Clases CSS del template ausentes en `globals.css` | Cotejar cada clase usada con `app/globals.css` durante el paso en que se usa; añadir solo las que falten. |
| `localStorage` desactivado o lleno | `try/catch` en toda lectura/escritura; la app funciona sin persistir. |

---

## Lo que **no** está en este spec

- Ningún juego jugable (ni lógica, ni controles, ni colisiones).
- Backend, API de puntuaciones o autenticación real (incluido OAuth).
- Créditos con lógica real.
- Tests automatizados.
- Internacionalización.
- Cambios de diseño respecto al template.

Cada uno de esos puntos, si se aborda, va en su propio spec.
