/* ============================================================
   FAN ART — galerie automatique
   Pour ajouter un dessin : déposer l'image dans le dossier /fanart
   du dépôt GitHub. Nom conseillé :  AAAA-MM-JJ - Pseudo - Titre.jpg
   (ex. « 2026-11-22 - Mika - Goku Yardrat.jpg »).
   Rien d'autre à modifier : le site lit le dossier tout seul.
   ============================================================ */
(function () {
  var API = 'https://api.github.com/repos/djewhom/djewhom.github.io/contents/fanart';
  var IMG = /\.(jpe?g|png|webp|gif)$/i;

  function parse(name) {
    var base = name.replace(/\.[^.]+$/, '');
    var parts = base.split(' - ').map(function (s) { return s.trim(); });
    var date = /^\d{4}-\d{2}-\d{2}$/.test(parts[0]) ? parts.shift() : '';
    return {
      date: date,
      artiste: parts.length > 1 ? parts[0] : '',
      titre: parts.length > 1 ? parts.slice(1).join(' - ') : (parts[0] || ''),
      src: '/fanart/' + encodeURIComponent(name)
    };
  }

  function card(a) {
    var fig = document.createElement('figure');
    fig.className = 'fa-card';
    var link = document.createElement('a');
    link.href = a.src; link.target = '_blank'; link.rel = 'noopener';
    var img = document.createElement('img');
    img.src = a.src; img.loading = 'lazy';
    img.alt = a.titre + (a.artiste ? ' — par ' + a.artiste : '');
    link.appendChild(img);
    var cap = document.createElement('figcaption');
    var t = document.createElement('strong'); t.textContent = a.titre;
    cap.appendChild(t);
    if (a.artiste) { var by = document.createElement('span'); by.textContent = 'par ' + a.artiste; cap.appendChild(by); }
    fig.appendChild(link); fig.appendChild(cap);
    return fig;
  }

  function render(list) {
    document.querySelectorAll('[data-fanart]').forEach(function (box) {
      var max = parseInt(box.getAttribute('data-fanart'), 10) || 0;
      var items = max ? list.slice(0, max) : list;
      box.innerHTML = '';
      if (!items.length) {
        box.innerHTML = '<p class="fa-vide">Les premiers dessins arrivent bientôt ! Poste le tien dans le salon <b>#fan-art</b> du Discord.</p>';
        return;
      }
      items.forEach(function (a) { box.appendChild(card(a)); });
    });
  }

  fetch(API)
    .then(function (r) { return r.ok ? r.json() : []; })
    .then(function (files) {
      var list = (Array.isArray(files) ? files : [])
        .filter(function (f) { return f.type === 'file' && IMG.test(f.name); })
        .map(function (f) { return parse(f.name); })
        .sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
      render(list);
    })
    .catch(function () { render([]); });
})();
