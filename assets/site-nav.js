/* ══════════════════════════════════════════════════════════════
   Dragonballogie — navigation commune à tout le site
   Une seule ligne à mettre dans chaque page :
     <script src="/assets/site-nav.js" defer></script>
   Ajoute : la barre du haut (Accueil, Articles, Cursus, Fan art),
   la barre de progression de lecture, le bouton « Haut de page »
   et, en bas des articles, « Article précédent / suivant ».
   Pour ajouter un article : une ligne dans ARTICLES ci-dessous.
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__dbNav) return; window.__dbNav = true;

  /* Lien d'invitation Discord (à remplacer ici seulement) */
  var DISCORD = 'https://discord.gg/JxMAuBbpQ';

  var ARTICLES = [
    { g:'La méthode',   n:'01', t:'Les 3 cercles de lecture',                u:'/Les-3-cercles-de-lectures/article-3cercles_7.html', p:'/les-3-cercles-de-lectures/' },
    { g:'La méthode',   n:'02', t:"Qu'est-ce qu'un retcon ?",               u:'/Article-Retcon/article-retcon.html',              p:'/article-retcon/' },
    { g:'Les analyses', n:'03', t:"Dragon Ball devait s'arrêter à Freezer", u:'/La-vraie-fin-de-DB/',                             p:'/la-vraie-fin-de-db/' },
    { g:'Les analyses', n:'04', t:"L'énigme C-16",                          u:'/article-c16.html',                                p:'/article-c16.html' },
    { g:'Les analyses', n:'05', t:'Goku SSJ3 vs Gros Buu',                  u:'/Goku-SSJ3-vs-gros-Buu/',                          p:'/goku-ssj3-vs-gros-buu/' },
    { g:'Les analyses', n:'06', t:'Pourquoi Ultra Buu existe-t-il ?',       u:'/Pourquoi-Ultra-Buu-existe-t-il-/',                p:'/pourquoi-ultra-buu-existe-t-il-/' },
    { g:'Les analyses', n:'07', t:'Super Buu vs Kid Buu',                   u:'/Super-Buu-vs-Kid-Buu/article-superbuu-vs-kidbuu.html', p:'/super-buu-vs-kid-buu/' }
  ];

  var chemin = location.pathname.toLowerCase();
  var accueil = chemin === '/' || chemin === '/index.html';
  var ici = -1;
  ARTICLES.forEach(function(a, i){ if (chemin.indexOf(a.p) === 0) ici = i; });
  var page = accueil ? 'accueil' : chemin.indexOf('/cursus') === 0 ? 'cursus' : chemin.indexOf('/fanart') === 0 ? 'fanart' : ici >= 0 ? 'article' : 'autre';

  window.__dbArticles = ARTICLES.map(function(a){return {n:a.n,t:a.t,u:a.u};});
  /* ---------- styles ---------- */
  var css = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&display=swap');
:root{--sn-h:58px;--sn-bleu:#0a1f4d;--sn-bleu2:#12357a;--sn-orange:#f5821f;--sn-or:#ffc531;--sn-rouge:#d7261e}
html{scroll-padding-top:calc(var(--sn-h) + 16px)}
/* anciennes barres de chaque article : remplacées par la barre commune */
body > .topnav, body > nav.topnav, body > header.topbar, body > header.site-header, body > header.masthead{display:none!important}
.sn-bar{position:sticky;top:0;z-index:1000;height:var(--sn-h);background:var(--sn-bleu);border-bottom:3px solid var(--sn-orange);box-shadow:0 4px 16px rgba(10,31,77,.25);font-family:'Oswald',system-ui,sans-serif}
.sn-in{max-width:1240px;margin:0 auto;height:100%;padding:0 18px;display:flex;align-items:center;gap:8px}
.sn-logo{display:flex;align-items:center;gap:10px;color:#fff;text-decoration:none;font-weight:700;font-size:19px;letter-spacing:1.5px;margin-right:auto;white-space:nowrap}
.sn-logo svg{width:30px;height:30px;flex:none}
.sn-logo b{color:var(--sn-or);font-weight:700}
.sn-liens{display:flex;align-items:center;gap:4px}
.sn-lien,.sn-btn{display:inline-flex;align-items:center;gap:7px;height:38px;padding:0 14px;border-radius:999px;color:#fff;text-decoration:none;font-size:15.5px;font-weight:500;letter-spacing:.3px;background:transparent;border:0;cursor:pointer;font-family:inherit;transition:background .15s,color .15s}
.sn-lien svg,.sn-btn svg{width:17px;height:17px;flex:none}
.sn-lien:hover,.sn-btn:hover,.sn-btn[aria-expanded=true]{background:rgba(255,255,255,.12)}
.sn-lien.actif{background:var(--sn-orange);color:#fff}
.sn-lien.sn-discord{background:transparent;border:1px solid #7186b7;margin-left:6px;font-size:14px}
.sn-lien.sn-discord:hover{background:#4752c4}.sn-account-mobile{display:none}.sn-lien.sn-academy-link{background:#ffc531;color:#0a1f4d;font-weight:600}.sn-lien.sn-academy-link:hover{background:#ffe08a}
.sn-num svg{width:18px;height:18px}
.sn-lien:focus-visible,.sn-btn:focus-visible,.sn-haut:focus-visible,.sn-panneau a:focus-visible{outline:3px solid var(--sn-or);outline-offset:2px}
.sn-panneau{position:absolute;top:calc(var(--sn-h) + 3px);right:18px;width:min(420px,calc(100vw - 24px));background:#fff;border:3px solid var(--sn-orange);border-top:0;border-radius:0 0 16px 16px;box-shadow:0 18px 40px rgba(10,31,77,.3);padding:10px 12px 14px;display:none;max-height:calc(100vh - var(--sn-h) - 20px);overflow:auto}
.sn-panneau.ouvert{display:block}
.sn-g{font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--sn-rouge);margin:10px 6px 4px}
.sn-art{display:flex;align-items:center;gap:12px;padding:8px 8px;border-radius:10px;color:var(--sn-bleu);text-decoration:none;font-size:16px;line-height:1.25}
.sn-art:hover{background:#fff3e3}
.sn-art.actif{background:#fff3e3;outline:2px solid var(--sn-orange)}
.sn-art small{display:block;font-size:11.5px;color:var(--sn-rouge);font-weight:500;letter-spacing:.4px}
.sn-num{flex:none;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font-size:14px;font-weight:700;color:var(--sn-rouge);background:radial-gradient(circle at 35% 30%,#ffe08a 0,var(--sn-or) 25%,var(--sn-orange) 75%);box-shadow:inset -3px -4px 6px rgba(160,60,0,.3)}
.sn-mob{display:none}
.sn-extra{display:none}
.sn-prog{position:absolute;left:0;bottom:-3px;height:3px;width:0;background:var(--sn-or);transition:width .1s linear}
.sn-haut{position:fixed;right:20px;bottom:22px;z-index:999;width:56px;height:56px;border-radius:50%;border:3px solid var(--sn-bleu);cursor:pointer;display:grid;place-items:center;color:var(--sn-bleu);background:radial-gradient(circle at 35% 30%,#ffe08a 0,var(--sn-or) 30%,var(--sn-orange) 78%);box-shadow:0 8px 22px rgba(10,31,77,.35);opacity:0;transform:translateY(14px) scale(.9);pointer-events:none;transition:opacity .25s,transform .25s}
.sn-haut.visible{opacity:1;transform:none;pointer-events:auto}
.sn-haut:hover{transform:translateY(-3px)}
.sn-haut svg{width:24px;height:24px}
.sn-haut span{position:absolute;bottom:-20px;font:600 11px 'Oswald',sans-serif;letter-spacing:.5px;color:var(--sn-bleu);background:rgba(255,255,255,.9);padding:0 6px;border-radius:6px}
.sn-suite{max-width:780px;margin:56px auto 40px;padding:0 20px;font-family:'Oswald',system-ui,sans-serif;position:relative;z-index:2}
.sn-suite h2{font-size:15px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--sn-rouge);margin:0 0 12px;border:0;padding:0}
.sn-suite .sn-grille{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.sn-carte{display:block;padding:16px 18px;border-radius:14px;background:#fff;border:2px solid var(--sn-orange);color:var(--sn-bleu);text-decoration:none;font-size:18px;line-height:1.25;box-shadow:0 6px 18px rgba(10,31,77,.1);transition:transform .15s}
.sn-carte:hover{transform:translateY(-2px)}
.sn-carte small{display:block;font-size:12.5px;color:var(--sn-rouge);letter-spacing:.5px;margin-bottom:4px}
.sn-carte.suiv{text-align:right}
.sn-sommaire{display:block;text-align:center;margin-top:12px;padding:13px;border-radius:999px;background:var(--sn-bleu);color:#fff;text-decoration:none;font-size:16px;letter-spacing:.5px}
.sn-sommaire:hover{background:var(--sn-bleu2)}
/* les marges illustrées et barres collantes des articles passent sous la barre */
.rail .fil{top:calc(var(--sn-h) + 22px)!important}
.mfil{top:calc(var(--sn-h) + 3px)!important}
@media (max-width:1050px){
  .sn-liens{display:none}
  .sn-mob{display:inline-flex;padding:0 9px}
  .sn-account-mobile{display:inline-flex;font-size:14px;padding:0 9px;color:#ffc531;text-decoration:none;white-space:nowrap}
  .sn-in{padding:0 10px;gap:4px}
  .sn-extra{display:block}
  .sn-logo{font-size:17px}
  .sn-panneau{left:8px;right:8px;width:auto}
  .sn-suite .sn-grille{grid-template-columns:1fr}
  .sn-carte.suiv{text-align:left}
  .sn-haut{right:14px;bottom:16px;width:50px;height:50px}
}
@media (max-width:360px){.sn-logo{font-size:14px;gap:4px}.sn-logo svg{width:23px;height:23px}.sn-account-mobile{font-size:12px;padding:0 4px}.sn-btn.sn-mob{font-size:13px;padding:0 5px}}
@media (prefers-reduced-motion:reduce){.sn-haut,.sn-carte,.sn-prog{transition:none}}
@media print{.sn-bar,.sn-haut,.sn-suite{display:none!important}}
`;
  /* icône d'appli et installation sur l'écran d'accueil, sur toutes les pages */
  [['manifest','/manifest.webmanifest'],['icon','/favicon.png'],['apple-touch-icon','/assets/apple-touch-icon.png']].forEach(function(l){
    if (!document.querySelector('link[rel="' + l[0] + '"]')){ var e = document.createElement('link'); e.rel = l[0]; e.href = l[1]; document.head.appendChild(e); }
  });
  if (!document.querySelector('meta[name=theme-color]')){ var tc = document.createElement('meta'); tc.name = 'theme-color'; tc.content = '#0a1f4d'; document.head.appendChild(tc); }
  if ('serviceWorker' in navigator) { try { navigator.serviceWorker.register('/sw.js'); } catch(e){} }

  var st = document.createElement('style'); st.id = 'sn-style'; st.textContent = css;
  document.head.appendChild(st);

  /* ---------- icônes ---------- */
  var IC = {
    boule:'<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="28" fill="#f5821f" stroke="#ffc531" stroke-width="3"/><circle cx="23" cy="22" r="7" fill="#ffe08a" opacity=".8"/><path d="M32 20l3.4 7.6 8.2.7-6.2 5.4 1.9 8L32 37.4l-7.3 4.3 1.9-8-6.2-5.4 8.2-.7z" fill="#d7261e"/></svg>',
    maison:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>',
    livre:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/><path d="M4 21V5"/><path d="M9 7h6"/></svg>',
    chapeau:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/></svg>',
    pinceau:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4l6 6-9 9H5v-6z"/><path d="M12 6l6 6"/></svg>',
    fleche:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
    discord:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.3 5.3A16.8 16.8 0 0015.2 4l-.5 1a15.6 15.6 0 00-5.4 0l-.5-1a16.8 16.8 0 00-4.1 1.3C2.1 9.2 1.4 13 1.7 16.7a17 17 0 005.1 2.6l1.1-1.7a10.9 10.9 0 01-1.7-.8l.4-.3a12 12 0 0010.8 0l.4.3c-.5.3-1.1.6-1.7.8l1.1 1.7a17 17 0 005.1-2.6c.4-4.3-.7-8-3-11.4zM8.7 14.4c-1 0-1.9-.9-1.9-2.1s.8-2.1 1.9-2.1 1.9 1 1.9 2.1-.8 2.1-1.9 2.1zm6.6 0c-1 0-1.9-.9-1.9-2.1s.8-2.1 1.9-2.1 1.9 1 1.9 2.1-.8 2.1-1.9 2.1z"/></svg>',
    menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    haut:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>'
  };

  function lienArticle(a, i){
    return '<a class="sn-art' + (i === ici ? ' actif' : '') + '" href="' + a.u + '"' + (i === ici ? ' aria-current="page"' : '') + '><span class="sn-num">' + a.n + '</span><span>' + (i === ici ? '<small>Vous lisez</small>' : '') + a.t + '</span></a>';
  }
  var listeHTML = '', groupe = '';
  ARTICLES.forEach(function(a, i){
    if (a.g !== groupe){ groupe = a.g; listeHTML += '<div class="sn-g">' + groupe + '</div>'; }
    listeHTML += lienArticle(a, i);
  });

  /* ---------- barre du haut ---------- */
  var bar = document.createElement('header');
  bar.className = 'sn-bar';
  bar.innerHTML =
    '<div class="sn-in">' +
      '<a class="sn-logo" href="/" aria-label="Dragonballogie, accueil">' + IC.boule + '<span>DRAGONBALL<b>OGIE</b></span></a>' +
      '<nav class="sn-liens" aria-label="Navigation du site">' +
        '<a class="sn-lien' + (accueil ? ' actif' : '') + '" href="/">' + IC.maison + 'Accueil</a>' +
        '<button class="sn-btn" type="button" aria-expanded="false" aria-controls="sn-panneau">' + IC.livre + 'Articles' + IC.fleche + '</button>' +
        '<a class="sn-lien' + (page === 'cursus' ? ' actif' : '') + '" href="/cursus.html">' + IC.chapeau + 'Cursus</a>' +
        '<a class="sn-lien' + (page === 'fanart' ? ' actif' : '') + '" href="/fanart.html">' + IC.pinceau + 'Fan art</a>' +
        '<a class="sn-lien sn-academy-link" href="/compte.html">Mon académie</a>' +
        '<a class="sn-lien sn-discord" href="' + DISCORD + '" target="_blank" rel="noopener">' + IC.discord + 'Discord</a>' +
      '</nav>' +
      '<a class="sn-account-mobile" href="/compte.html">Académie</a>' +
      '<button class="sn-btn sn-mob" type="button" aria-expanded="false" aria-controls="sn-panneau">' + IC.menu + 'Menu</button>' +
    '</div>' +
    '<div class="sn-panneau" id="sn-panneau">' +
      '<div class="sn-extra">' +
        '<a class="sn-art" href="/"><span class="sn-num">' + '⌂' + '</span><span>Accueil</span></a>' +
        '<a class="sn-art" href="/cursus.html"><span class="sn-num">✦</span><span>Cursus</span></a>' +
        '<a class="sn-art" href="/fanart.html"><span class="sn-num">✎</span><span>Fan art</span></a>' +
        '<a class="sn-art" href="/compte.html"><span class="sn-num">★</span><span>Mon académie</span></a>' +
        '<a class="sn-art" href="' + DISCORD + '" target="_blank" rel="noopener"><span class="sn-num" style="background:#5865F2;color:#fff;box-shadow:none">' + IC.discord + '</span><span>Rejoindre le Discord</span></a>' +
      '</div>' +
      listeHTML +
    '</div>' +
    (page === 'article' ? '<div class="sn-prog" aria-hidden="true"></div>' : '');
  document.body.insertBefore(bar, document.body.firstChild);
  /* si la page a une marge autour du body, la barre la compense pour rester bord à bord */
  var cs = getComputedStyle(document.body);
  ['Top','Left','Right'].forEach(function(c){ var v = parseFloat(cs['margin' + c]) + parseFloat(cs['padding' + c]); if (v) bar.style['margin' + c] = (-v) + 'px'; });

  var panneau = bar.querySelector('.sn-panneau');
  var boutons = bar.querySelectorAll('.sn-btn');
  function basculer(ouvrir){
    panneau.classList.toggle('ouvert', ouvrir);
    boutons.forEach(function(b){ b.setAttribute('aria-expanded', ouvrir ? 'true' : 'false'); });
  }
  boutons.forEach(function(b){
    b.addEventListener('click', function(e){ e.stopPropagation(); basculer(!panneau.classList.contains('ouvert')); });
  });
  document.addEventListener('click', function(e){ if (!bar.contains(e.target)) basculer(false); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') basculer(false); });

  /* ---------- haut de page + progression ---------- */
  var haut = document.createElement('button');
  haut.className = 'sn-haut'; haut.type = 'button';
  haut.setAttribute('aria-label', 'Revenir en haut de la page');
  haut.innerHTML = IC.haut + '<span>Haut</span>';
  haut.addEventListener('click', function(){ window.scrollTo({ top: 0, behavior: 'smooth' }); });
  document.body.appendChild(haut);
  var prog = bar.querySelector('.sn-prog');
  function surDefilement(){
    var y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
    haut.classList.toggle('visible', y > 600);
    if (prog) prog.style.width = (max > 0 ? Math.min(100, y / max * 100) : 0) + '%';
  }
  window.addEventListener('scroll', surDefilement, { passive: true });
  surDefilement();

  /* ---------- en bas des articles : précédent / suivant ---------- */
  if (page === 'article'){
    var prec = ARTICLES[ici - 1], suiv = ARTICLES[ici + 1];
    var bloc = document.createElement('nav');
    bloc.className = 'sn-suite'; bloc.setAttribute('aria-label', 'Continuer la lecture');
    bloc.innerHTML = '<h2>Continuer la lecture</h2><div class="sn-grille">' +
      (prec ? '<a class="sn-carte" href="' + prec.u + '"><small>← Article précédent</small>' + prec.t + '</a>' : '<span></span>') +
      (suiv ? '<a class="sn-carte suiv" href="' + suiv.u + '"><small>Article suivant →</small>' + suiv.t + '</a>' : '<span></span>') +
      '</div><a class="sn-sommaire" href="/#sommaire">Retour au sommaire de tous les articles</a>';
    var pied = document.querySelector('body > footer, main footer, footer');
    var conteneur = pied && pied.closest('main') ? pied.closest('main') : null;
    if (conteneur) conteneur.parentNode.insertBefore(bloc, conteneur.nextSibling);
    else if (pied) pied.parentNode.insertBefore(bloc, pied);
    else document.body.insertBefore(bloc, haut);
  }
  /* ---------- commentaires et activité communautaire ---------- */
  if (page === 'article' || accueil) {
    var activitySlot = accueil && document.getElementById('db-activity');
    var communityRoot = document.createElement('section');
    if (page === 'article') {communityRoot.id='commentaires';bloc.parentNode.insertBefore(communityRoot, bloc);}
    else if(activitySlot){activitySlot.replaceChildren(communityRoot);}
    else { var anchor = document.querySelector('.dbz-cta, body > footer'); if(anchor) anchor.parentNode.insertBefore(communityRoot,anchor); else document.body.appendChild(communityRoot); }
    import('/assets/comments.js?v=5').then(function(m){
      if(page === 'article') return m.mountComments(communityRoot,ARTICLES[ici]);
      return m.mountActivity(communityRoot,ARTICLES);
    }).catch(function(){communityRoot.textContent='Espace communautaire temporairement indisponible.';});
  }
  if(page === 'article') import('/assets/magazine.js?v=6').then(function(m){m.mountReadingTools(ARTICLES[ici],bar);}).catch(function(){});
  /* ---------- statistiques GoatCounter : lectures complètes + clics Discord ---------- */
  function compter(nom, titre){
    var essais = 0;
    (function go(){
      if (window.goatcounter && window.goatcounter.count){ window.goatcounter.count({ path: nom + ':' + location.pathname, title: titre + ' — ' + document.title, event: true }); }
      else if (essais++ < 20) setTimeout(go, 500);
    })();
  }
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a[href*="discord.gg"]');
    if (a) compter('clic-discord', 'Clic Discord');
  });
  if (page === 'article'){
    var debut = Date.now(), dejaLu = false;
    function verifierFin(){
      if (dejaLu) return;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var part = max > 0 ? window.scrollY / max : 1;
      /* fin atteinte = 85 % de la page défilée, après au moins 90 secondes sur la page */
      if (part >= 0.85 && Date.now() - debut > 90000){ dejaLu = true; compter('lecture-complete', 'Lecture complète'); }
    }
    window.addEventListener('scroll', verifierFin, { passive: true });
  }
})();
