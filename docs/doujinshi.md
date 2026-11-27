# Mangas de fans (doujinshi) : liseuse et publication

Pages : `/fanart-doujinshi.html` (bibliothèque, sous-catégorie du Fan art) et `/fanart-liseuse.html?o=<slug>&t=<tome>` (liseuse).
Fichiers : `doujinshi/catalogue.json`, `doujinshi/<slug>/oeuvre.json`, `doujinshi/<slug>/tome-N/001.webp…`.

## Ce que l'auteur doit envoyer
Un **fichier zip par tome**, avec :
- les pages **dans l'ordre**, une image par page (`.jpg`, `.png` ou `.webp`), nommées avec des numéros : `001.jpg`, `002.jpg`… (`page1`, `page2`, `page10` sont aussi classées correctement) ;
- la **couverture en première page** ;
- pages en **portrait**, environ 1200 à 1600 px de haut ; si deux pages sont fusionnées en une seule image, le préciser ;
- idéalement moins de 100 Mo par zip ;
- dans le message : titre de l'œuvre, nom ou pseudo à afficher, **numéro du tome**, un résumé de 1 à 2 phrases, le **sens de lecture** (japonais de droite à gauche ou occidental), et son **accord** pour la publication sur Dragonballogie (sans but lucratif, retrait possible sur simple demande).

## Comment ça arrive sur le site
L'auteur envoie le zip à Dje (Discord ou e-mail). Dje le dépose dans la conversation avec Claude (ou le place dans le dépôt), avec les infos ci-dessus. Claude lance :

```
python3 tools/importer-doujinshi.py tome1.zip --slug nom-de-l-oeuvre --titre "Titre" \
    --auteur "Pseudo" --tome 1 --resume "Résumé." --sens rtl
```
L'outil trie les pages, les convertit en WebP (hauteur max 1600 px), crée la couverture, met à jour le catalogue, puis on publie sur GitHub (une seule fois par tome ; relancer la commande remplace le tome).
Un tome de 40 pages pèse environ 4 à 8 Mo une fois converti. Le dépôt dépasse déjà 160 Mo : éviter les zips de plus de 150 pages et ne pas déposer les zips eux-mêmes dans le dépôt.

## La liseuse
Lecture page par page ou en double page (ordinateur), sens japonais ou occidental, ajustement à la largeur, plein écran, curseur de pages, reprise automatique à la dernière page lue, clavier (flèches, espace, F), balayage et touches sur mobile. À la fin d'un tome : tome suivant, relecture, Discord. Un lecteur connecté qui termine un tome gagne les points « lecture » de l'académie.

## Droits
Œuvres de fans publiées avec l'accord écrit de l'auteur (un message Discord suffit, à conserver). Ce mélange de Dragon Ball et d'un autre univers (ex. Wakfu, © Ankama) reste une œuvre dérivée : mention non lucrative sur la bibliothèque, retrait rapide en cas de demande d'un ayant droit.
