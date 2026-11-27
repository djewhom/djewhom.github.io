// Univers de navigation : aucun compte ni service tiers nécessaire.
const entries=[
 {id:'capsule',name:'Capsule Corporation',label:'Quartier général',sub:'Ton point de départ',desc:'Explore les dossiers, retrouve tes lectures et découvre les nouveautés de l’académie.',href:'/',color:'#62cbff',symbol:'C',x:50,y:50},
 {id:'temple',name:'Le palais céleste',label:'Cursus',sub:'L’apprentissage',desc:'Un parcours initiatique en six modules pour apprendre à analyser les récits.',href:'/cursus.html',color:'#f7c875',symbol:'修',x:50,y:11},
 {id:'namek',name:'Namek',label:'Arc Freezer',sub:'Survie et récit',desc:'Explore les dossiers sur Namek, Freezer et la construction du récit.',href:'/univers.html?salon=namek',color:'#8ee1a0',symbol:'✧',x:85,y:27},
 {id:'gero',name:'Laboratoire Gero',label:'Arc Cell',sub:'Les coulisses de la création',desc:'Observe les androïdes et les mécanismes de réécriture comme dans un laboratoire narratif.',href:'/univers.html?salon=gero',color:'#f28a83',symbol:'RR',x:85,y:66},
 {id:'kaioshin',name:'Royaume des Kaioshins',label:'Arc Boo',sub:'Magie et rapports de puissance',desc:'Explore les analyses de l’arc Boo, entre magie, transformations et continuité.',href:'/univers.html?salon=kaioshin',color:'#d4a8ff',symbol:'✦',x:50,y:88},
 {id:'archives',name:'Les grandes archives',label:'Méthode & retcon',sub:'Les fondations',desc:'Les outils de lecture, les retcons et la distinction des différents registres narratifs.',href:'/univers.html?salon=archives',color:'#f2ba75',symbol:'▤',x:15,y:66},
 {id:'galerie',name:'La galerie vivante',label:'Communauté',sub:'Créations et échanges',desc:'Retrouve le fan art et les discussions qui donnent vie à Dragonballogie.',href:'/fanart.html',color:'#ffac63',symbol:'✎',x:15,y:27},
 {id:'bureau',name:'Mon terminal',label:'Mon académie',sub:'Ton espace personnel',desc:'Ton profil, tes contributions, tes annonces et tes outils de travail.',href:'/compte.html',color:'#b3a4ff',symbol:'★',x:50,y:50}
];
const lookup=id=>entries.find(e=>e.id===id);
const articles=[
 {n:'01',world:'archives',t:'Les 3 cercles de lecture',d:'Cohérence interne, intention de l’auteur et contexte de production.',u:'/Les-3-cercles-de-lectures/article-3cercles_7.html'},
 {n:'02',world:'archives',t:'Qu’est-ce qu’un retcon ?',d:'Le tisserand à l’œuvre : comprendre les reprises narratives.',u:'/Article-Retcon/article-retcon.html',img:'/Article-Retcon/images/illu-ouverture-tisserand.jpg'},
 {n:'03',world:'namek',t:'Dragon Ball devait s’arrêter à Freezer',d:'Interroger les indices narratifs et la construction de l’arc Freezer.',u:'/La-vraie-fin-de-DB/'},
 {n:'04',world:'gero',t:'L’énigme C-16',d:'Enquête sur le rôle de l’androïde et la réécriture de l’arc.',u:'/article-c16.html',img:'/files/images/c16-hero.jpg'},
 {n:'05',world:'kaioshin',t:'Goku SSJ3 vs Gros Buu',d:'Relire la mise en scène du combat et les rapports de puissance.',u:'/Goku-SSJ3-vs-gros-Buu/',img:'/Goku-SSJ3-vs-gros-Buu/images/01-domination-initiale.jpg'},
 {n:'06',world:'kaioshin',t:'Pourquoi Ultra Buu existe-t-il ?',d:'Étudier le chaînon entre Super Buu et Kid Buu.',u:'/Pourquoi-Ultra-Buu-existe-t-il-/',img:'/Pourquoi-Ultra-Buu-existe-t-il-/ultra_buu_1.png'},
 {n:'07',world:'kaioshin',t:'Super Buu vs Kid Buu',d:'Comparer ce que le manga établit sur leur puissance.',u:'/Super-Buu-vs-Kid-Buu/article-superbuu-vs-kidbuu.html',img:'/Super-Buu-vs-Kid-Buu/Super%20buu%20vs%20kid%20buu/panel-combat-ssj3.jpg'},
 {n:'08',world:'namek',t:'Super Saiyan : de la légende aux paliers de puissance',d:'De la légende aux seuils de progression : relire les transformations dans leur ordre d’écriture.',u:'/Article-Super-Saiyan/',img:'/Article-Super-Saiyan/images/couverture.webp'}
];
function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
function a(text,href,cls){const n=el('a',text,cls);n.href=href;return n;}
function skin(node,id){node.dataset.world=id;}
function scene(id){const n=el('div',undefined,'du-scene');n.setAttribute('aria-hidden','true');skin(n,id);return n;}
function ensureStyle(){if(document.querySelector('link[data-du]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='/assets/univers.css?v=12';l.dataset.du='';document.head.append(l);}
function radar(root){
 root.replaceChildren();root.classList.add('du-explore');const head=el('div',undefined,'du-explore-head');const heading=el('div');heading.append(el('p','RADAR D’EXPLORATION','du-eyebrow'),el('h2','Choisis ta destination'));head.append(heading,a('Tous les dossiers ↗','/#sommaire','du-text-link'));root.append(head);
 const layout=el('div',undefined,'du-layout'),map=el('div',undefined,'du-radar'),screen=el('div',undefined,'du-screen');
 const grid=el('div',undefined,'du-grid');grid.setAttribute('aria-hidden','true');map.append(grid);
 const sweep=el('div',undefined,'du-sweep');sweep.setAttribute('aria-hidden','true');map.append(sweep);
 const nodes=entries.filter(e=>e.id!=='bureau');const buttons=[];
 function choose(e,focus=false){screen.replaceChildren();skin(screen,e.id);const art=scene(e.id);const content=el('div',undefined,'du-screen-copy');content.append(el('p',e.label.toUpperCase(),'du-eyebrow'),el('h3',e.name),el('p',e.desc),a(e.id==='capsule'?'Retour à l’accueil →':'Entrer dans cet univers →',e.href,'du-portal-link'));screen.append(art,content);for(const b of buttons){const selected=b.dataset.destination===e.id;b.setAttribute('aria-pressed',String(selected));if(focus&&selected)b.focus();}}
 for(const e of nodes){const b=el('button',undefined,'du-point');b.type='button';b.dataset.destination=e.id;b.style.setProperty('--point',e.color);b.style.left=e.x+'%';b.style.top=e.y+'%';b.setAttribute('aria-label',e.name);b.setAttribute('aria-pressed','false');b.append(el('span',e.symbol,'du-point-icon'),el('span',e.id==='capsule'?'QG':e.id==='archives'?'Archives':e.id==='temple'?'Temple':e.id==='kaioshin'?'Kaioshin':e.id==='gero'?'Labo Gero':e.id==='galerie'?'Galerie':'Namek','du-point-label'));b.addEventListener('click',()=>choose(e));buttons.push(b);map.append(b);}
 layout.append(map,screen);root.append(layout);const links=el('div',undefined,'du-destinations');for(const e of entries){if(e.id==='capsule')continue;const link=a(e.label,e.href,'du-destination');link.style.setProperty('--point',e.color);link.prepend(el('span',e.symbol,'du-mini-symbol'));links.append(link);}root.append(links);choose(lookup('capsule'));
}
function worldPage(root){
 const id=new URLSearchParams(location.search).get('salon');const e=lookup(id);
 if(!e||!articles.some(x=>x.world===id)){root.append(el('h1','Explorer les univers'),el('p','Choisis un salon pour découvrir ses dossiers.'),a('Retour au radar','/#exploration','du-portal-link'));return;}
 document.title=e.name+' — Dragonballogie';skin(document.body,e.id);
 const hero=el('section',undefined,'du-world-hero');skin(hero,e.id);hero.append(scene(e.id));const copy=el('div',undefined,'du-world-copy');copy.append(a('← Radar d’exploration','/#exploration','du-back'),el('p',e.label.toUpperCase(),'du-eyebrow'),el('h1',e.name),el('p',e.desc));hero.append(copy);root.append(hero);
 const wrap=el('section',undefined,'du-world-library');wrap.append(el('p','DOSSIERS DE CET UNIVERS','du-eyebrow'),el('h2','À explorer'));const cards=el('div',undefined,'du-world-cards');
 for(const item of articles.filter(x=>x.world===id)){const card=a('',item.u,'du-world-card');skin(card,id);const visual=el('div',undefined,'du-card-visual');if(item.img){const img=el('img');img.src=item.img;img.alt='';img.loading='lazy';img.addEventListener('error',()=>img.remove());visual.append(img);}else visual.append(scene(id));visual.append(el('span',item.n,'du-card-num'));const info=el('div',undefined,'du-card-copy');info.append(el('h3',item.t),el('p',item.d),el('span','Lire le dossier ↗','du-card-link'));card.append(visual,info);cards.append(card);}wrap.append(cards);root.append(wrap);const others=el('section',undefined,'du-explore');radar(others);root.append(others);
}
function pageIdentity(page,article){
 const id=page==='cursus'?'temple':page==='fanart'?'galerie':location.pathname.toLowerCase()==='/compte.html'?'bureau':article?articles.find(x=>x.n===article.n)?.world:null;
 if(!id)return;
 const e=lookup(id);skin(document.body,id);
 // Ne pas recolorer le texte ou les illustrations des articles existants.
 if(article){const bar=document.querySelector('.sn-bar');if(!bar)return;const crumb=el('div',undefined,'du-article-strip');skin(crumb,id);const inner=el('div',undefined,'du-article-strip-inner');inner.append(a('Exploration','/#exploration'),el('span','/'),a(e.name,e.href));crumb.append(inner);bar.insertAdjacentElement('afterend',crumb);}
}
function decorateHero(page){const id=page==='accueil'?'capsule':page==='cursus'?'temple':page==='fanart'?'galerie':location.pathname.toLowerCase()==='/compte.html'?'bureau':null;if(!id)return;const hero=document.querySelector(id==='capsule'?'.db-cover':id==='bureau'?'.academy-hero':'.hero');if(hero&&!hero.querySelector('.du-hero-decor')){const art=scene(id);art.classList.add('du-hero-decor');hero.prepend(art);hero.classList.add('du-decorated');}}
export function mountUnivers(page,article){ensureStyle();decorateHero(page);const root=document.getElementById('exploration');if(root&&!root.dataset.ready){root.dataset.ready='true';radar(root);}const world=document.getElementById('du-world');if(world&&!world.dataset.ready){world.dataset.ready='true';worldPage(world);}pageIdentity(page,article);}
