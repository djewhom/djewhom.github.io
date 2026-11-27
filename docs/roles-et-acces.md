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
