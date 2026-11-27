# Rôles et accès — marche à suivre

## Les quatre niveaux
| Rôle | Ce qu'il peut faire | Salle de contrôle |
|---|---|---|
| Membre | Compte de l'académie, parcours personnel | non |
| Rédacteur (contributor) | Proposer des textes en relecture | Rédaction, banque d'images |
| Administrateur (admin) | Modérer, publier des annonces, nommer des membres et rédacteurs | + modération, annonces, membres, carnet de bord, statistiques |
| Fondateur (owner) | Tout, dont nommer ou retirer des administrateurs | + nomination des administrateurs |

Les droits sont appliqués par la base Supabase (RLS et fonctions SQL), jamais par le navigateur. La salle de contrôle `/equipe.html` ne fait qu'orienter ; elle est en `noindex`, hors sitemap et non liée sur le site.

## Devenir fondateur (une seule fois)
1. Se connecter sur https://dragonballogy.com/compte.html (GitHub). Un profil « membre » est créé.
2. Dans Supabase : Authentication > Users, copier l'UUID du compte.
3. SQL Editor : `update public.db_profiles set role='owner' where id='UUID_DU_COMPTE';`

## Donner un accès à quelqu'un d'autre
1. La personne se connecte sur compte.html (compte GitHub) : elle devient membre.
2. Le fondateur ouvre `/equipe.html` > Membres & rôles, cherche son pseudo et choisit le rôle.
   - Le fondateur peut attribuer membre, rédacteur ou administrateur.
   - Un administrateur peut seulement passer un membre en rédacteur (et inversement), et ne peut pas toucher aux autres administrateurs.
   - Chaque changement est enregistré dans l'historique.
3. Si le panneau ne fonctionne pas : SQL Editor, `update public.db_profiles set role='contributor' where id='UUID';` (ou `'admin'`).

## À savoir
- Tant que l'authentification GitHub est ouverte, n'importe quel détenteur d'un compte GitHub peut créer un compte **membre**. Il n'obtient jamais de rôle sans action d'un administrateur.
- Ne jamais mettre de clé `service_role` ou de secret dans le dépôt (il est public).
- Retirer un accès : repasser la personne en `member` depuis Membres & rôles.

## Grades pédagogiques et points (migration 006)
Deux notions distinctes : le **rôle** (membre, rédacteur, administrateur, fondateur) et le **grade académique** (pédagogique), calculé d'après les points.

- Grades d'essai : Badaud (0), École de la Tortue (40), Ruban rouge (100), Tour Karin (200), Sanctuaire (350), Kaiô (550), Super Saiyan (800), Salle de l'Esprit et du Temps (1100), Super Saiyan 2 (1500). Table `db_internal.grade_levels`.
- Barème d'essai : inscription +20 ; lecture complète d'un dossier +15 (une fois par dossier, plafond 60/jour) ; prédiction avant la scène +10 (une fois par dossier, plafond 30/jour) ; commentaire approuvé par la modération +5 (plafond 15/jour). Table `db_internal.point_rules`.
- Les points sont accordés par PostgreSQL : le navigateur ne peut demander que « lecture » et « prédiction », une fois par page, avec plafond. Inscription et commentaires passent par des déclencheurs.
- Modifier un barème ou un seuil : `update db_internal.point_rules set points=20 where kind='read';` ou `update db_internal.grade_levels set min_points=60 where rank=2;`
- Réinitialiser tous les points (fondateur connecté) : `select public.academy_points_reset();` ou, dans le SQL Editor, `delete from db_internal.point_events;` puis relancer le bloc d'inscription de la migration.
- Récompenses (à venir) : le solde (`balance`) pourra baisser par des dépenses sans faire baisser le grade, calculé sur les points gagnés (`earned`).
