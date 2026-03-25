# Prochaines etapes

## P0 - Critique (cette semaine)

### Dashboard de performance
Reproduire le tableau de performance type screenshot BP :
- Budget vs Actuel par pays (FR, BE, IT, DE, PL, CEE)
- Vues : Yearly (YTD), Monthly (MTD), Weekly (WTD), Growth (R4W)
- Selecteurs : semaine et mois (defaut = courant)
- Donnees budgetaires depuis la table `bp_rows` + donnees reelles depuis `orders`

### Sync automatique Google Sheets -> Supabase
- Creer un service account Google Cloud
- Partager les Google Sheets avec le service account
- API route `/api/sync` : fetch Google Sheets API -> upsert Supabase
- Vercel Cron Job : declenche `/api/sync` tous les jours a 6h
- Config dans `vercel.json` : `{ "crons": [{ "path": "/api/sync", "schedule": "0 6 * * *" }] }`

---

## P1 - Important (2 semaines)

### Fiche vendeur detaillee
- Graphique evolution CA mensuel (Recharts LineChart)
- Liste des commandes du vendeur (lien vers /commandes)
- Arbre hierarchique : recruiter -> manager -> sales leader
- KPIs individuels : CA moyen/mois, frequence commandes, panier moyen

### Amelioration page Commandes
- Detail commande avec liste des produits (necessite nouvelle table `order_items`)
- Statistiques par type de commande (Meeting Sale, Direct Sale, Web Sale)

### Filtrage serveur leads
- Ajouter `?country=XX&status=XX` a l'API leads quand le dataset grossira
- Meme pattern que sellers

---

## P2 - Nice to have (1 mois)

### Pages a implementer
- **Produits** : catalogue produit, CA par reference, tendance de vente
- **Stocks** : niveaux de stock par entrepot/pays
- **Compensations** : calcul commissions (necessite regles metier)
- **Approvisionnement** : suivi fournisseurs, delais
- **Logistique** : suivi livraisons, taux de retour

### Fonctionnalites transverses
- Export CSV/Excel depuis chaque tableau
- Loading skeletons (au lieu de "chargement...")
- Breadcrumbs / navigation entre pages liees
- Filtres persistants dans l'URL (query params)
- Comparaison N vs N-1 sur les KPIs

---

## P3 - Future (3 mois)

### Securite
- Authentification Supabase (email/password ou SSO)
- Roles : Admin, Country Manager, Sales Leader, Viewer
- RLS par pays : un Country Manager ne voit que son pays
- Audit log des connexions

### Notifications
- Alertes email/Slack pour leads non traites > 48h
- Alertes churn : vendeurs passant en "Churn Emergency"
- Resume hebdomadaire par pays

### Mobile
- PWA (service worker, install prompt)
- Layout mobile optimise pour les tableaux
- Touch-friendly filters

### Data
- Supabase Realtime pour updates live
- Historique des changements de statut vendeur
- Aggregations materialisees (views PostgreSQL) pour performance

---

## Dependances externes

| Besoin | Service | Statut |
|--------|---------|--------|
| Google Sheets API | Google Cloud Console | A configurer (service account) |
| Supabase upgrade | Si > 500MB ou > 50K requetes/mois | A monitorer |
| Vercel Pro | Si > 100GB bandwidth ou cron < 1h | Free tier OK pour l'instant |
| Domaine custom | Optionnel (actuellement .vercel.app) | Pas prioritaire |
