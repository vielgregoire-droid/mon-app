# Decisions techniques

## Architecture

| Decision | Choix | Pourquoi | Date |
|----------|-------|----------|------|
| Framework | Next.js 15 App Router | SSR/CSR flexible, API routes integrees, deploy Vercel natif | Mars 2026 |
| Rendering | `"use client"` partout | Dashboards interactifs (filtres, tri, pagination), pas de SEO necessaire | Mars 2026 |
| Database | Supabase PostgreSQL | Free tier genereux, API REST auto, RLS, heberge en EU | Mars 2026 |
| Styling | Tailwind CSS 4 custom | Rapid prototyping, theme Tupperware integre dans @theme | Mars 2026 |
| Charts | Recharts | Leger, React natif, suffisant pour bar/line charts | Mars 2026 |

## Data

| Decision | Choix | Pourquoi |
|----------|-------|----------|
| Stockage | Supabase (pas JSON files) | JSON = 77MB dans le repo, trop lourd pour Vercel. Supabase = filtrage serveur |
| Pipeline vendeurs | Pre-calcule dans scripts rebuild | Evite de recalculer a chaque requete, logique metier complexe |
| Mapping DB -> TS | snake_case -> camelCase dans queries.ts | DB convention PostgreSQL, TS convention JS. Un seul point de mapping |
| Filtrage | Serveur (sellers, orders) + Client (leads, bp, promo) | Gros datasets filtre cote DB, petits datasets charges en entier |
| Pagination Supabase | 1000 rows/page via fetchAll() | Limite par defaut Supabase = 1000, on pagine pour recuperer tout |

## Segmentation vendeurs

| Groupe | Statut | Condition | Couleur |
|--------|--------|-----------|---------|
| < 3 mois | Onboarding Urgent | < 14j, 0 vente | Rouge |
| < 3 mois | En Risque | 14-30j, 0 vente | Orange |
| < 3 mois | Critique | 30-90j, 0 vente | Jaune |
| < 3 mois | Activated | 1ere vente < 3 mois | Cyan |
| > 3 mois | Active | Vente < 1 mois | Vert |
| > 3 mois | Churn Rescue | 1-3 mois sans vente | Orange |
| > 3 mois | Churn Emergency | 3-6 mois sans vente | Rouge |
| > 3 mois | Dead | 6+ mois sans vente | Gris |
| > 3 mois | Jamais vendu | 0 vente depuis inscription | Ardoise |

**IMPORTANT :** Ces seuils sont valides metier. Ne pas modifier sans autorisation.

## Choses volontairement NON faites

| Quoi | Pourquoi |
|------|----------|
| SSR / Server Components pour les pages | Les dashboards sont 100% interactifs, SSR n'apporte rien |
| ORM (Prisma, Drizzle) | Supabase JS client suffit, moins de complexite |
| State management (Redux, Zustand) | useState + useMemo suffisent, pas de state partage entre pages |
| Component library (shadcn, MUI) | Design Tupperware custom, plus simple de faire sur mesure |
| i18n | Application interne FR uniquement pour l'instant |
| Tests E2E | Pas prioritaire a ce stade du prototypage |
| Auth utilisateur | Pas encore necessaire en phase de dev, a ajouter avant prod reelle |
| Cache / SWR / React Query | Les donnees ne changent pas en temps reel, fetch simple suffit |
