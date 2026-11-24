# Espace Dragonballogie — v1 (non publié)

Cette branche prépare les comptes. Aucun compte réel avant configuration et tests.

1. Créer un projet Supabase de test, choisir une région UE.
2. Activer Email Auth avec confirmation e-mail, configurer un mot de passe minimal de 12 caractères et les limites anti-abus. Configurer un service SMTP pour les invitations/confirmations avant ouverture publique.
3. Dans SQL Editor, exécuter supabase/migrations/001_db_profiles.sql. Vérifier les permissions avec deux comptes de test : chacun lit son propre profil, modifie son pseudo mais pas son rôle.
4. Dans Authentication > URL Configuration, définir le Site URL et autoriser uniquement les URL de redirection exactes nécessaires (en production https://dragonballogy.com/compte.html ; pour le test une URL HTTPS dédiée). 
5. Renseigner assets/account-config.js avec l'URL du projet et la clé publishable, jamais la clé secrète ni service_role.
6. Prévisualiser la branche en HTTPS, tester inscription, confirmation, connexion, déconnexion, récupération, changement de pseudo, navigation mobile et permissions. Ne pas fusionner avant validation.
7. Pour le fondateur et les contributeurs, attribuer les rôles via SQL Editor après vérification de l'UUID Auth. L'interface d'administration n'est pas encore implémentée. Aucun accès d'administration ne doit être fondé seulement sur un affichage côté navigateur.
8. Avant l'ouverture publique : ajouter politique de confidentialité, contact et suppression de compte, vérifier les conditions de traitement des données, le fournisseur de courriel et les protections contre les abus.

Le grade académique est indépendant du rôle. Le suivi de cursus et les examens ne sont pas encore implémentés. Les contributions, les encadrés d'avis et la modération feront l'objet de migrations et politiques d'accès dédiées. Les articles restent publics. Ne pas enregistrer de jetons privés dans GitHub.
