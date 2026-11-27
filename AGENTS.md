# AGENTS.md — Carnet de bord commun de Dragonballogy

Ce fichier est lu par **toutes les IA** qui travaillent sur ce site (ChatGPT, Claude…).
Il remplace les explications répétées : avant toute modification, lisez-le en entier.
Après chaque session de travail, ajoutez une ligne au **Journal** (en bas).

Propriétaire et décideur : **Dje** (djewhom). Les IA proposent, Dje tranche.

---

## 1. Règles de travail entre IA

1. **Toujours partir de la dernière version sur GitHub**, jamais d'une copie gardée en mémoire ou dans une conversation. Relire le fichier juste avant de le modifier.
2. **Une seule IA à la fois sur le site.** Si le Journal indique un chantier « en cours » par une autre IA, ne pas toucher aux mêmes fichiers.
3. **Ne pas défaire le travail de l'autre sans le signaler.** Si quelque chose semble faux, l'écrire dans « À vérifier » plutôt que de le réécrire en silence.
4. **Fichiers sensibles (partagés par toutes les pages)** : `assets/site-nav.js`, `style.css`, `sw.js`, `manifest.webmanifest`. Modifications courtes et ciblées, jamais de réécriture complète. Après modification : vérifier la syntaxe (`node --check`) et tester au moins l'accueil + un article.
5. **Aucune clé secrète dans le dépôt** (Supabase service_role, secrets OAuth, mots de passe). Le dépôt est public.
6. Messages de commit en français, clairs (« Ajouter X à Y »). Indiquer l'IA dans le Journal.
7. Le cache de GitHub Pages met ~10 min à se rafraîchir : une modif invisible tout de suite n'est pas forcément ratée.
8. **Cursus, pas blog (décision de Dje, 27/11).** Dragonballogie est un cursus pédagogique d'analyse narrative, non une suite d'articles indépendants. À chaque création ou modification d'article : (a) identifier les liens conceptuels avec les dossiers existants ; (b) prévoir renvois contextuels (« Vous vous souvenez ? »), infobulles pédagogiques, encadrés définissant les notions mobilisées et liens d'approfondissement ; (c) rendre les liens **réciproques** quand c'est pertinent : une étude de cas renvoie aux outils théoriques qu'elle mobilise, et les dossiers théoriques renvoient aux études de cas qui les illustrent ; (d) ne jamais inventer de référence ni de lien vers un article inexistant (vérifier l'URL avant). (e) distinguer **trois fonctions** dans le maillage : *acquérir une notion* (renvoi vers le dossier théorique), *appliquer une notion à une étude de cas*, *croiser plusieurs outils d'analyse* ; (f) **ne pas assimiler systématiquement un ajustement narratif à un retcon** ; tout rapprochement théorique incertain est soumis à la validation de Dje avant publication. Projet à terme : une page « Cursus Dragonballogie » avec carte interactive des notions et des études de cas, parcours conseillé ou navigation libre.
9. **Articles participatifs (décision de Dje, 27/11).** Modèle de référence : le dossier Shin Kikoho. (a) **Hypothèses prédictives** : avant de révéler une scène ou une thèse, poser la question au lecteur (« si vous n’aviez pas vu cette scène, qu’auriez-vous imaginé ? »), puis confronter sa prédiction au récit. (b) **« Magique » est une étiquette provisoire** : un boost ou un nerf « magique » signifie « sans explication trouvée », jamais « incohérence décrétée » ; le dire explicitement, par dépit et non par principe. (c) **Ouverture finale** : terminer le dossier par un bloc invitant le lecteur à proposer une explication interne (premier cercle, lien vers `/Les-3-cercles-de-lectures/article-3cercles_7.html#premier-niveau`), en citant planche ou réplique, et à en discuter (Discord). Le texte de ces blocs est un brouillon de Claude à valider par Dje ; l’extension aux autres articles (C-16, Gotenks, Gros Buu…) attend sa validation.

---

## 2. Identité du site

- **Nom** : Dragonballogie / Dragonballogy — https://dragonballogy.com
- **Esprit** : analyse rigoureuse et narratologique du manga Dragon Ball (« dragonballologie »). Public prioritaire : les lecteurs curieux, les « dragonballogues ».
- **Ton des articles** : on s'adresse au lecteur avec **« vous »**. Argumenter à partir des planches du manga (preuves primaires), distinguer preuve et ressenti.
- **Palette** (définie dans `assets/site-nav.js`) : bleu nuit `#0a1f4d`, bleu `#12357a`, orange `#f5821f`, or `#ffc531`, rouge `#d7261e`. Titres en Oswald.
- **Langue** : français (un sélecteur de traduction existe pour les autres langues).

---

## 3. Hébergement et architecture

- **GitHub Pages**, compte `djewhom`. Domaine chez **OVH** (DNS : A 185.199.108-111.153, CNAME www → djewhom.github.io). Ne pas toucher au fichier `CNAME`.
- **Dépôt principal** `djewhom.github.io` : accueil, cursus, fan art, univers, contact, compte, articles récents.
- **Dépôts séparés par article** (servis sous `dragonballogy.com/<Nom-du-dépôt>/`) :
  - `Les-3-cercles-de-lectures` → `/Les-3-cercles-de-lectures/article-3cercles_7.html`
  - `Article-Retcon` → `/Article-Retcon/article-retcon.html` (+ `Infographie/retcon_anatomie.html`, `images/`)
  - `La-vraie-fin-de-DB`, `Goku-SSJ3-vs-gros-Buu`, `Pourquoi-Ultra-Buu-existe-t-il-`, `Super-Buu-vs-Kid-Buu`
  - Ces pages chargent le script commun via `/assets/site-nav.js` (chemin absolu vers le dépôt principal).
- **Articles dans le dépôt principal** : `article-c16.html`, `Article-Super-Saiyan/`, `Article-Shin-Kikoho/`, `Article-C16-Etreinte/`, `Article-Lecture-Fluide/`.

### Le script commun `assets/site-nav.js`
Chargé par **toutes** les pages : `<script src="/assets/site-nav.js" defer></script>`. Il fournit :
- la barre du haut, le menu des articles, le panneau mobile, la barre de progression, « Haut de page », « Article précédent / suivant » ;
- la liste **`ARTICLES`** : pour publier un nouvel article dans le menu, ajouter **une ligne** ici ;
- `var DISCORD` : **le seul endroit** où changer le lien d'invitation Discord dans la barre (les blocs `<!-- cta-discord -->` en bas de page contiennent aussi le lien) ;
- les compteurs d'événements GoatCounter (`clic-discord`, `lecture-complete`) ;
- le chargement de Clarity (avec consentement), des commentaires, de l'atelier de lecture (`study.js`).

### Autres modules (`assets/`)
`carnet.js/css` (carnet de lecture, marque-pages), `image-viewer.js` (visionneuse d'images), `study.js/css` (atelier : recherche, notes, surlignage, glossaire), `comments.js/css`, `account*.js` (comptes Supabase — **bêta non ouverte**, voir `docs/academy-setup.md`), `magazine.js/css` (habillage accueil), `univers.js/css`.

### Statistiques
- **GoatCounter** : https://dragonballogy.goatcounter.com (visites, provenance, événements).
- **Microsoft Clarity** (consentement explicite, textes masqués).
- **Google Search Console** + `sitemap.xml` (à tenir à jour à chaque nouvelle page publique).

### Communauté
- Discord : https://discord.gg/JxMAuBbpQ (**lien temporaire, expire vers le 23/12** → à remplacer par un lien permanent).
- Fan art : `fanart.html` + `fanart.js` (images du dossier `/fanart`, nom `AAAA-MM-JJ - Pseudo - Titre.jpg`) + salon Discord en direct via WidgetBot. Tout ce qu'affiche WidgetBot est **public**.
- Contact : `contact.html` → dragonballogy.site@gmail.com.

### Cursus (`cursus.html`)
6 modules : 01 Retcons · 02 Timelines · 03 Registres narratifs · 04 Intentions de l'auteur · 05 Continuité · 06 Puissance. Images dans `/cursus/`. Projet : bandeau tiré au hasard parmi plusieurs visuels (`cursus-1.jpg`, `cursus-2.jpg`…).
- C-16 et les trois cercles : ajouter la scène comme exemple appliqué dans l'article « Les 3 cercles de lecture » (analyse transversale, grille des trois cercles ; 1er cercle insuffisant, 2e cercle = intention de l'auteur). Dje redonne l'analyse ; ne pas reformuler les cercles de mémoire.
- Article « C-16 : une sortie honorable ? » (thèse de Dje : deux scènes héroïques en fin d'arc pour compenser un rôle de boss initialement envisagé). Hypothèse d'intention : chercher une source en VO (interview, Daizenshuu) avant de l'affirmer ; sinon la présenter comme lecture cohérente avec le texte.
- Article « Les 3 cercles de lecture » : système de notation visuel pour les exemples appliqués (note /20 + trois jauges : tenue du 1er cercle, clarté de l'intention = 2e cercle, besoin du 3e cercle ; idée d'un point qui se place entre les trois cercles). Exemples en attente : commando Ginyu (Barta), soldes du Super Saiyan, C-16, cas de DB Super (3e cercle), scène de Goku notée 18/20 par Dje. Vote des lecteurs : option à choisir (Discord, Giscus ou base de données). Piloté par Claude (structure) avec ChatGPT pour le visuel.

---

## 4. Répartition des rôles (validée par Dje le 26/11)

Chaque domaine a un **pilote**. Par défaut, Dje adresse la demande au pilote.
Mais Dje peut aussi passer par une seule IA pour tout : dans ce cas, **l'autre IA fait le travail même si ce n'est pas son domaine**, en respectant les choix déjà faits par le pilote, et le signale dans le Journal (« fait hors domaine, à relire par le pilote si besoin »).

### Claude — pilote du code, de la structure et du fond
- **Code du site** : script commun `site-nav.js`, nouvelles fonctionnalités, corrections de bugs, affichage mobile, performances.
- **Intégration des articles** : mise en page HTML, sommaires, infographies interactives, liens entre articles (fil rouge, passerelles du Cursus).
- **Technique sensible** : comptes Supabase, sécurité, consentement et confidentialité, service worker, installation sur téléphone.
- **Référencement technique et statistiques** : sitemap, balises, Search Console, GoatCounter, compteurs d'événements.
- **Fond des articles** : analyse narratologique, argumentation à partir des planches, cohérence avec les conclusions déjà établies du site.
- **Contrôle qualité** : relecture technique de tout ce qui est publié, y compris le travail de ChatGPT.

### ChatGPT — pilote de l'image, du style et de la diffusion
- **Création d'images** : bannières, visuels du Cursus, illustrations de marge, miniatures, fan art d'exemple.
- **Direction artistique** : ambiance visuelle, habillage des pages, propositions de design (Claude les code si besoin).
- **Vidéo et réseaux** : idées et scripts de shorts, accroches, posts Discord/réseaux, titres.
- **Idées rapides** : brainstorm, variantes de titres, textes courts.

### Tâches mixtes (exemple : une nouvelle bannière)
ChatGPT produit l'image → Dje la dépose dans le dépôt → Claude l'intègre et vérifie l'affichage (ordinateur + mobile).

## 5. Chantiers en attente

- Lien Discord permanent à mettre dans `var DISCORD` + tous les blocs `cta-discord`.
- Article Retcon : 3 illustrations de marge (§3 Gyumao et le petit nuage, §6 dragon avec pansements « patch 1/patch 2 », §9 rangée de visages choqués), bannière `images/banner_retcon.jpg`, diptyque du tisserand, numéros de chapitre des scènes du bain et de Yamcha.
- Article « Le canon Z » (registre narratif, image du douanier) à publier, avec passerelles depuis Retcon, 3 cercles et le module 03 du Cursus.
- Bandeau aléatoire du Cursus quand plusieurs visuels seront déposés.

## 6. À vérifier

- `Article-Lecture-Fluide/` n'est pas dans la liste `ARTICLES` ni sur l'accueil : volontaire (brouillon) ou oubli ?
- `sitemap.xml` ne contient pas les articles des dépôts séparés (3 cercles, Retcon, Vraie fin, SSJ3, Ultra Buu, Super vs Kid).

- `Article-C16-Etreinte/` — Relecture de fond à valider avec Dje et Claude : compléter les références de chapitres/pages ; vérifier sur les planches la comparabilité des deux attaques par-derrière et distinguer l’inquiétude visible de Cell de l’intention de se libérer ; distinguer la réparation attestée de l’hypothèse d’une amélioration, sans transformer le silence du récit en preuve. Le schéma reste qualitatif.
- Bandeau de consentement commun : lors du premier test Chrome émulé à 375 px, un débordement horizontal (500 px) a été observé ; non reproduit lors du test suivant. À surveiller sur téléphone réel ; aucun fichier partagé modifié.
- `Article-C16-Etreinte/` — Dje complétera plus tard les numéros de chapitres et de pages ; à lui rappeler (ne pas les inventer). Vérifier alors la légende du diptyque « à quelques chapitres d'écart ».
- **Méthode — vérification en VO** : pour les points où le sens compte (ex. « sans aura » : ki non détectable ou absence de ki ? quel vocabulaire japonais exact ?), comparer la traduction française au texte japonais. Dje fournira le lien du site du manga en japonais ; en attendant, ne pas trancher sur la traduction seule, signaler le doute dans « À vérifier ».

---

## 7. Journal

Format : `JJ/MM — IA — ce qui a été fait (fichiers principaux)`. Ajouter en bas, ne pas effacer.

- 23-24/11 — Claude — Domaine, sommaire d'accueil, fan art + WidgetBot, Cursus, GoatCounter + compteurs, bouton et blocs Discord, habillage de l'article Retcon (ouverture sur la queue de Goku, fil rouge, sommaire mobile, encadrés repliables).
- 24-26/11 — ChatGPT — Univers et salons thématiques, carnet de lecture, visionneuse, atelier de lecture, articles Super Saiyan, Shin Kikoho et Lecture fluide, accueil magazine bleu et or + bannière Shenron, page Contact, sélecteur de langue, Search Console + sitemap, Clarity, préparation des comptes Supabase.
- 26/11 — Claude — Création de ce carnet de bord `AGENTS.md`.
- 26/11 — Claude — Section 4 : répartition des rôles validée par Dje (Claude = code/structure/fond, ChatGPT = image/style/diffusion, chacun peut remplacer l'autre).
- 26/11 — Claude — Article « C-16 : une puissance de circonstance » (dossier Boosts magiques · 02) : `Article-C16-Etreinte/` (6 planches), ligne 10 dans `ARTICLES`, carte d'accueil, sitemap. Gabarit et style repris du Shin Kikoho (ChatGPT). Fond discuté avec Dje ; numéros de chapitres à compléter. Prochain volet prévu : l'étreinte qui retient un adversaire plus fort (cas fournis par Dje).
- 26/11 — Claude — `Article-C16-Etreinte/` : appareil pédagogique à la manière du Retcon (fil « Situation de Cell » dans la colonne de droite, rappels « Vous vous souvenez ? », infobulles `.ce-tip`, notes de marge `.ce-side`, diptyque des visages de Cell, objections repliables, accroche de fin). Styles `ce-*` locaux à la page, rien de partagé modifié. Illustrations de marge à produire par ChatGPT si Dje le souhaite.
- 26/11 — ChatGPT — Relecture artistique et ergonomique de `Article-C16-Etreinte/index.html` : indicateur de scène mobile, fil, infobulles, notes, diptyque, tableau numéroté, graphique adaptatif et objections ; focus et mouvement réduit ; légende du graphique adaptée au mobile. Tests Chrome à 375 et 1366 px sur la première version publiée : 5 infobulles, 3 notes, 3 objections et fil fonctionnels, aucun débordement reproduit. Ajustements d’ancrage et de densité de la colonne effectués ensuite. Fond et scripts inchangés ; fichiers partagés intacts. À relire par Claude pour le contrôle technique et les réserves de fond.
- 26/11 — Claude — Validation finale de l'article C-16 : contrôle technique (HTML sans erreur d'imbrication ni id dupliqué, ancres et 15 liens internes en 200, images chargées, aucune erreur console, commits de ChatGPT bien déployés, mobile 375 px et tablette 768 px sans débordement, pastille de situation de Cell, infobulles, Échap et focus clavier OK). Aucune correction nécessaire, aucune modification de l'argumentation. Réserves éditoriales (références de chapitres/pages, légende du diptyque « à quelques chapitres d'écart », comparabilité des deux attaques par-derrière, argument du silence sur réparation/amélioration) à trancher par Dje.

- 26/11 — ChatGPT — `Article-C16-Etreinte/index.html` : ajout du schéma SVG à deux courbes (Cell 100, C-16 10 → 100 → 10, échelle strictement fictive), trois phases et légende explicite ; ancien graphique à six barres conservé dans un volet repliable. Styles locaux, argumentation et scripts inchangés. Trois illustrations originales WebP prêtes (courbe illustrée, contraste, barrière des règles) : dépôt binaire et intégration encore nécessaires. Contrôle du rendu à faire après publication ; Claude peut relire l’intégration.
- 26/11 — Claude — `Article-C16-Etreinte/` : intégration des trois illustrations de ChatGPT, converties en WebP (`images/illus-contraste.webp`, `illus-barriere.webp`, `illus-courbe.webp`, 170–380 Ko). Diptyque du contraste en §01 après les scènes A/B ; courbe illustrée en pleine largeur juste avant le schéma SVG (conservé, ainsi que le volet des six moments), avec mention « Valeurs fictives » ; barrière des règles dans une note repliable `details.ce-pedago` (fermée par défaut). Styles dans un bloc `ce-illus` séparé, rien de partagé modifié. Vérifié en ligne : images chargées, aucun débordement à 375 px, aucune erreur console, fil et pastille de scène intacts. Illustrations 1 et 2 : personnages très proches de ceux du manga ; la 2 montre une silhouette de Goku enfant qui ne correspond pas à l'idée (aucun lien avec C-16) → à trancher par Dje. Texte des illustrations non relu hors pastille « Valeurs fictives ».
- 26/11 — Claude — `Article-C16-Etreinte/` : les deux images « méta » de Dje (paroi des trois temps, franchissement) remplacent l'ancienne illustration de la barrière (silhouette de Goku enfant, retirée) dans la note repliable `ce-pedago` du §01 : `images/illus-barriere-3temps.webp` et `illus-barriere-passage.webp`, légendes sobres, mention « images symboliques ». Vérifié en ligne à 375 px : chargées, aucun débordement. À vérifier par Dje : la scène représentée (Gotenks Super Saiyan 3 contre Buu, salle de l'Esprit et du Temps) est-elle fidèle au manga ? Les légendes n'affirment aucun épisode précis.
- 26/11 — Claude — `Article-Shin-Kikoho/index.html` §01 : ajout, à la demande de Dje, de l'encadré « Une métaphore pour comprendre le mot « magique » » (texte de Dje repris tel quel : Salle de l'Esprit et du Temps = le récit, ses frontières = ses règles ; l'évasion de Gotenks est une métaphore, pas un exemple de boost magique) avec l'illustration `images/illus-salle-esprit-temps.webp`. Placé après les deux définitions boost/nerf, avant « Dans la scène du Shin Kikoho… ». Style local (`sk-metaphore`), rien d'existant modifié ; vérifié en ligne à 1024 et 375 px. À harmoniser (décision de Dje) : la note repliable « barrière des règles » de l'article C-16 (§01) redit cette idée en plus bref ; elle pourrait renvoyer vers cet encadré.
- 27/11 — Claude — Préparation (branche `preview-gotenks`, non publiée) de l'article « Gotenks SSJ3 vs Super Buu » (texte et illustrations ChatGPT) : `Article-Gotenks-SSJ3/` (fil, notes de marge, infobulles, rappels vers Shin Kikoho / Goku SSJ3 / 3 cercles, CTA Discord), entrée n°11 dans `ARTICLES`, carte Arc Boo dans l'accueil, sitemap. En attente de validation de Dje. À vérifier : transcription japonaise (secondaire), droits des planches, « tome 41 » non confirmé.
- 27/11 — Claude — Préparation (branche `preview-gros-buu-super-buu`, non publiée) de l'article « De Gros Buu à Super Buu » (texte et planches ChatGPT) : `Article-Gros-Buu-Super-Buu/`, entrée n°12 dans `ARTICLES`, carte Arc Boo, sitemap. Fil, notes de marge, infobulles, liens vers 4 articles liés. En attente de relecture de Dje. À vérifier : droits et références des planches, japonais non vérifié, images 01 et 10 de très petite taille, valeurs « 80 % » / niveaux SSJ = illustrations. Correctif : images de l'article Gotenks (hauteur auto).
- 27/11 — Claude — Article « De Gros Buu à Super Buu » : cartes illustrées (cadre parchemin, bandeau bordeaux numéroté dans l'ordre de lecture, badge « Repère illustratif » sur les montages à niveaux SSJ) d'après la direction artistique de ChatGPT. Scans manga et noms de fichiers inchangés ; HD à venir. La planche de référence (générée) n'est pas versionnée.
- 27/11 — Claude — Fond Namek : le décor CSS de l'univers Namek est remplacé par une case du manga (`images/univers/namek.webp`, règle ajoutée en fin de `assets/univers.css`, cache-bust v=8). Visible sur la page `univers.html?salon=namek`, le radar de l'accueil et les vignettes. À vérifier : `univers.html` charge encore site-nav.js?v=11 (les autres pages v=16).
- 27/11 — Claude — Ajout de la règle 8 (cursus pédagogique, liens réciproques) à partir de la consigne de Dje. À faire : passe de réciprocité sur les articles existants (les dossiers Goku SSJ3 vs Gros Buu, Ultra Buu, Super Buu vs Kid Buu sont des dépôts séparés ; Gotenks et Gros Buu → Super Buu pointent vers eux, pas encore l'inverse).
- 27/11 — Claude — Liens réciproques (priorité 1, dépôt principal) : Shin Kikoho → C-16 (note §04, sidebar) et Gotenks (bloc métaphore, sidebar) ; Super Saiyan → La vraie fin de DB (passerelles) ; article C-16 « énigme » → C-16 « puissance de circonstance » (carte latérale). Carte complète des liens : voir aperçu « Carte pédagogique du cursus ». Dépôts séparés : en cours.
- 27/11 — Claude — Liens de priorité 1 appliqués dans les 6 dépôts séparés (blocs « Pour aller plus loin » classés par fonction : acquérir / appliquer / croiser, parcours de l'arc Buu) : Les 3 cercles → Goku SSJ3, Gotenks, Shin Kikoho, Super Saiyan ; Retcon → Goku SSJ3 ; La vraie fin de DB → Super Saiyan ; Goku SSJ3 → Retcon, 3 cercles, Super vs Kid, Gros→Super Buu ; Ultra Buu → Gros→Super Buu, Super vs Kid ; Super vs Kid → Goku SSJ3, Gros→Super Buu, Ultra Buu (aside « Articles liés »). À vérifier : Super-Buu-vs-Kid-Buu contient une copie du fichier dans « Super buu vs kid buu/ » (non modifiée) ; Goku SSJ3 déborde de 15 px en mobile (un SVG, préexistant). Priorités 2 et 3 de la carte : en attente de la validation de Dje.
- 27/11 — Claude — Règle 9 (articles participatifs) + Shin Kikoho : note « Un statut provisoire » (§01) et bloc « À vous de jouer » après la conclusion (lien premier cercle, invitation Discord). Dépôt Les-3-cercles : ancres `#premier-niveau`, `#deuxieme-niveau`, `#troisieme-niveau` ajoutées. Texte à valider par Dje.
