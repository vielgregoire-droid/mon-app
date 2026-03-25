# Architecture

## Stack technique

```
Frontend        : Next.js 15.1 / React 19 / TypeScript 5.7
Styling         : Tailwind CSS 4.0 (custom @theme Tupperware)
Charts          : Recharts 3.8
Database        : Supabase PostgreSQL (eu-west-1)
Auth            : Supabase SSR (configure, pas active)
Hosting         : Vercel (auto-deploy depuis main)
Data import     : Scripts Node.js (XLSX + CSV)
```

## Flux de donnees

```
Excel/CSV files
     |
     v  (scripts/rebuild-*.js)
Supabase Tables (6 tables, 165K+ rows)
     |
     v  (src/lib/supabase/queries.ts)
API Routes (/api/*)  <-- filtrage serveur (pays, dates)
     |
     v  (fetch() dans useEffect)
Pages React ("use client")  <-- filtrage client (statut, recherche)
     |
     v
Composants (Table, KpiCard, PipelineBar, Detail panels)
```

## Structure des fichiers

```
src/
  app/
    api/{sellers,orders,leads,bp,top-products,promo-monthly}/route.ts
    {vendeurs,commandes,leads,bp,promotions}/page.tsx     -- pages actives
    {dashboard,stocks,approvisionnement,...}/page.tsx       -- stubs
    layout.tsx                                              -- layout + Sidebar
    globals.css                                             -- theme Tupperware
  components/
    Sidebar.tsx           -- navigation 13 items, 3 sections
    KpiCard.tsx           -- carte metrique
    PipelineBar.tsx       -- visualisation pipeline
    SellerTable.tsx       -- tableau vendeurs
    SellerDetail.tsx      -- panel detail vendeur
    OrderTable.tsx        -- tableau commandes
    OrderDetail.tsx       -- panel detail commande
    OrderStatusBadge.tsx  -- badge statut commande
    StatusBadge.tsx       -- badge statut vendeur
    LeadTable.tsx         -- tableau leads
  lib/
    types.ts              -- interfaces, configs, constantes
    supabase/
      client.ts           -- Supabase browser client
      server.ts           -- Supabase server client (cookies)
      middleware.ts        -- refresh session
      queries.ts           -- fetchSellers, fetchOrders, etc.
```

## Supabase - Schema

### sellers (12K rows)
```sql
id (int PK), environment, first_name, last_name, full_name,
gender, created_at, local_status, standard_status, hierarchy_level,
manager_name, manager_id, sales_leader_name, sales_leader_id,
recruiter_name, recruiter_id, is_active, total_sales, order_count,
first_order_date, last_order_date, pipeline_status,
months_since_creation, months_since_last_order, days_since_creation,
avg_monthly_sales
INDEX: environment, pipeline_status, full_name
```

### orders (150K rows)
```sql
ref (text PK), date, paid_date, environment, seller_id, seller_name,
customer_id, status, order_type, delivery_mode, is_web_order,
total_items, total_quantity, total_amount_incl_tax,
total_discount_incl_tax, total_paid_incl_tax, delivery_amount,
order_week, manager_name, sales_leader_name
INDEX: environment, date, status, seller_id
```

### leads (2K rows)
```sql
id (serial PK), source, first_name, last_name, full_name,
email, phone, city, postal_code, country_raw, country,
intent, motivation, preferred_contact_time, message,
submitted_at, status, days_since_submission
INDEX: country, status
```

### bp_rows (172 rows)
```sql
row (int PK), label, level, is_header, section,
annuals (JSONB), monthly (JSONB)
```

### top_products (500 rows)
```sql
(product_ref, environment) PK, total_qty, total_revenue,
total_discount, total_product_discount, total_order_discount,
order_count, avg_price, discount_rate
```

### promo_monthly (50 rows)
```sql
(environment, month) PK, total_revenue, total_discount,
total_product_discount, total_order_discount, item_count,
order_count, discounted_order_count, discount_rate
```

## Optimisations performance

| Technique | Ou | Impact |
|-----------|-----|--------|
| Filtrage serveur pays | sellers, orders | -80% donnees transferees |
| Filtrage serveur dates | orders | 16K vs 150K rows |
| Pagination Supabase | queries.ts fetchAll() | 1000 rows/requete |
| useMemo | toutes les pages | evite recalculs inutiles |
| Pas de SSR data | pages "use client" | hydration simple |

## Deploiement

```
git push origin main
     |
     v  (webhook GitHub -> Vercel)
Vercel auto-build (next build)
     |
     v
Production: https://mon-app-rose.vercel.app
```

Env vars configurees sur Vercel :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
