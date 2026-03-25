# Tupperware Performance Hub - Project State

## 1. Vision du produit

Application web interne de pilotage de la performance commerciale pour Tupperware Europe. Permet de suivre les vendeurs, commandes, leads, promotions et business plan sur 5 pays (FR, DE, IT, PL, BE).

**Utilisateurs cibles :** Direction commerciale, Country Managers, Sales Leaders
**Objectif :** Centraliser les KPIs, identifier les actions prioritaires (onboarding, churn rescue, leads), suivre le BP.

---

## 2. Architecture actuelle

```
                 Browser
                    |
            +--------------+
            |   Next.js 15  |  (Vercel)
            |   App Router   |
            +--------------+
             /            \
       Pages (CSR)    API Routes
       "use client"   /api/*
             \            /
              +---------+
              | Supabase |  (PostgreSQL)
              | eu-west-1|
              +---------+
```

- **Frontend :** Next.js 15 + React 19 + Tailwind CSS 4
- **Backend :** API Routes Next.js (server-side) -> Supabase
- **Database :** Supabase PostgreSQL (projet `oomsttauqqtghgrxsogb`)
- **Deploy :** Vercel (auto-deploy depuis `main`)
- **Auth :** Supabase SSR middleware (configuré, pas d'auth obligatoire pour l'instant)

Voir [ARCHITECTURE.md](./ARCHITECTURE.md) pour les details.

---

## 3. Schema Supabase

| Table | Rows | PK | Index | Description |
|-------|------|----|-------|-------------|
| `sellers` | 11 999 | `id` (int) | environment, pipeline_status, full_name | Vendeurs avec pipeline calculé |
| `orders` | 150 547 | `ref` (text) | environment, date, status, seller_id | Commandes 5 pays |
| `leads` | 2 024 | `id` (serial) | country, status | Leads CRM recrutement |
| `bp_rows` | 172 | `row` (int) | section | Business Plan hierarchique (annuals/monthly en JSONB) |
| `top_products` | 500 | `(product_ref, environment)` | environment | Top produits par CA |
| `promo_monthly` | 50 | `(environment, month)` | - | Metriques promo mensuelles |

**RLS :** Activé sur toutes les tables, politique SELECT public (lecture seule).
**Script DDL :** `scripts/create-tables.sql`

---

## 4. Variables d'environnement

```env
# Requis (dans .env.local et Vercel)
NEXT_PUBLIC_SUPABASE_URL=https://oomsttauqqtghgrxsogb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...  # anon key (public, lecture seule)

# Optionnel (migration de donnees uniquement, PAS sur Vercel)
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## 5. Routes / Pages existantes

### Pages implementees (6)

| Route | Page | Data Source | Filtres serveur |
|-------|------|-------------|----------------|
| `/vendeurs` | Pipeline vendeurs + KPIs + tableau | `/api/sellers` | environment |
| `/commandes` | Commandes + KPIs + pipeline statuts | `/api/orders` | environment, dateStart, dateEnd |
| `/leads` | Leads CRM + pipeline + KPIs | `/api/leads` | - (client-side) |
| `/bp` | Business Plan 2025-2028 | `/api/bp` | - |
| `/promotions` | Analyse remises + top produits | `/api/top-products` + `/api/promo-monthly` | - |
| `/` | Redirect vers `/vendeurs` | - | - |

### Pages placeholder (8)

| Route | Statut |
|-------|--------|
| `/dashboard` | Stub - "Bientot disponible" |
| `/produits` | Stub |
| `/stocks` | Stub |
| `/approvisionnement` | Stub |
| `/logistique` | Stub |
| `/compensations` | Stub |
| `/support` | Stub |
| `/master` | Stub |

### API Routes (6)

| Endpoint | Methode | Filtres |
|----------|---------|---------|
| `/api/sellers` | GET | `?environment=XX` |
| `/api/orders` | GET | `?environment=XX&dateStart=YYYY-MM-DD&dateEnd=YYYY-MM-DD` |
| `/api/leads` | GET | - |
| `/api/bp` | GET | - |
| `/api/top-products` | GET | - |
| `/api/promo-monthly` | GET | - |

---

## 6. Composants cles

| Composant | Lignes | Role |
|-----------|--------|------|
| `Sidebar.tsx` | 212 | Navigation principale, 3 sections, branding Tupperware |
| `KpiCard.tsx` | ~40 | Carte KPI (icone, valeur, sous-titre, tendance) |
| `PipelineBar.tsx` | 155 | Barre de pipeline avec groupes et filtres interactifs |
| `SellerTable.tsx` | ~180 | Tableau vendeurs triable, paginé (25/page), recherche |
| `SellerDetail.tsx` | ~150 | Panel detail vendeur (slide-in droite) |
| `OrderTable.tsx` | ~170 | Tableau commandes avec recherche et tri |
| `OrderDetail.tsx` | ~120 | Panel detail commande |
| `OrderStatusBadge.tsx` | ~30 | Badge colore statut commande |
| `StatusBadge.tsx` | ~30 | Badge colore statut vendeur |
| `LeadTable.tsx` | ~160 | Tableau leads avec recherche |

---

## 7. Decisions techniques deja prises

Voir [CURRENT_DECISIONS.md](./CURRENT_DECISIONS.md) pour le detail.

**Resume :**
- Next.js App Router (pas Pages Router)
- Toutes les pages sont `"use client"` avec `useEffect` + `fetch` vers les API routes
- Supabase comme DB unique (pas de cache Redis, pas d'ORM)
- Pipeline vendeurs calcule en amont (dans les scripts rebuild) et stocke en DB
- Mapping snake_case DB -> camelCase TS dans `queries.ts`
- Pagination Supabase : 1000 rows par page via `fetchAll()`
- Filtrage serveur pour sellers (pays) et orders (pays + dates)
- Filtrage client pour leads, BP, promotions (petits datasets)
- Design system custom Tupperware (pas de composant library externe)
- Pas d'authentification utilisateur pour l'instant

---

## 8. Ce qu'il ne faut PAS refactorer sans autorisation

1. **Pipeline vendeurs** : La logique de segmentation (9 statuts) a ete validee metier. Ne pas modifier les seuils (14j, 30j, 90j, 3 mois, 6 mois) sans discussion.

2. **Structure Supabase** : Les 6 tables sont en production avec 165K+ lignes. Tout changement de schema necessite un plan de migration.

3. **Mapping camelCase/snake_case** : Les composants attendent du camelCase. Le mapping dans `queries.ts` est le seul point de conversion. Ne pas dupliquer cette logique.

4. **Sidebar navigation** : L'ordre et le groupement des onglets ont ete valides. Ajouter des pages OK, reorganiser demande validation.

5. **Couleurs Tupperware** : Le branding (teals `#0d5c5c`, `#5bbfb5`) est delibere. Ne pas changer pour des couleurs generiques.

6. **Scripts rebuild-*.js** : Ils servent pour l'import initial depuis Excel/CSV. Ils ne sont plus necessaires en routine mais ne pas supprimer (re-import possible).

---

## 9. Backlog priorise

Voir [NEXT_STEPS.md](./NEXT_STEPS.md) pour le detail.

### P0 - Critique
- [ ] Dashboard : tableau de performance type BP screenshot (budget vs actuel par pays, YTD/MTD/WTD)
- [ ] Sync auto Google Sheets -> Supabase (Vercel Cron + Google Sheets API)

### P1 - Important
- [ ] Fiche vendeur complete : historique ventes, graph evolution, commandes associees
- [ ] Page Commandes : vision globale sans filtre pays obligatoire (deja fait)
- [ ] Filtrage serveur pour leads (quand le dataset grossira)

### P2 - Nice to have
- [ ] Produits : catalogue avec performance par produit
- [ ] Stocks : suivi des niveaux de stock
- [ ] Compensations : calcul commissions vendeurs
- [ ] Approvisionnement : suivi supply chain
- [ ] Logistique : suivi livraisons
- [ ] Export CSV/Excel depuis les tableaux
- [ ] Dark mode

### P3 - Future
- [ ] Auth utilisateur (roles : admin, country manager, sales leader)
- [ ] Notifications (alertes churn, leads non traites)
- [ ] Mobile app / PWA
- [ ] API temps reel (Supabase Realtime)

---

## 10. Risques / Zones incompletes

### Risques
| Risque | Severite | Mitigation |
|--------|----------|------------|
| Pas d'auth : toute personne avec l'URL peut voir les donnees | **HAUTE** | Ajouter Supabase Auth + RLS par role |
| Pipeline calcule statiquement : ne se met pas a jour auto | MOYENNE | Cron job ou trigger Supabase |
| Supabase free tier : limites de requetes/storage | MOYENNE | Monitorer usage, upgrader si besoin |
| Donnees vendeurs sensibles (noms, emails) exposees via API | **HAUTE** | Auth obligatoire avant mise en prod reelle |
| Pas de backup automatique des donnees | MOYENNE | Activer Supabase Point-in-Time Recovery |

### Zones incompletes
- **Dashboard** : page stub, pas de KPIs
- **8 pages placeholder** : aucune fonctionnalite
- **Tests** : 1 seul test (home.test.tsx), couverture ~0%
- **Error handling** : les pages affichent des donnees vides si l'API echoue, pas d'UI d'erreur
- **Loading states** : basiques (pas de skeleton loaders)
- **Mobile** : responsive basique mais non teste en profondeur
- **Google Sheets sync** : pas encore implemente
- **Vendeur detail** : pas de graphiques d'evolution des ventes
