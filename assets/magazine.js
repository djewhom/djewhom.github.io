const KEY='dragonballogie-reading-v1';
function state(){try{const s=JSON.parse(localStorage.getItem(KEY)||'{}');return {saved:Array.isArray(s.saved)?s.saved.filter(x=>typeof x==='string'):[],last:s.last&&typeof s.last==='object'?s.last:null};}catch{return {saved:[],last:null};}}
function store(s){try{localStorage.setItem(KEY,JSON.stringify(s));return true;}catch{return false;}}
function toggle(n){const s=state();s.saved=s.saved.includes(n)?s.saved.filter(x=>x!==n):[...s.saved,n];return store(s);}
function n(tag,text,cls){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;}
function button(text,handler){const b=n('button',text);b.type='button';b.addEventListener('click',handler);return b;}
function normalized(s){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
function home(){
 const cards=[...document.querySelectorAll('.db-article[data-article]')];if(!cards.length)return;
 const controls=document.getElementById('db-library-controls'),query=document.getElementById('db-query'),result=document.getElementById('db-result'),empty=document.getElementById('db-empty'),resume=document.getElementById('db-resume');let filter='all';
 controls.hidden=false;result.hidden=false;
 function refresh(){
 const s=state(),q=normalized(query.value.trim());let count=0;
 for(const card of cards){const id=card.dataset.article,b=card.querySelector('[data-save]'),saved=s.saved.includes(id),title=card.querySelector('h3').textContent;b.hidden=false;b.setAttribute('aria-pressed',String(saved));b.setAttribute('aria-label',(saved?'Retirer ':'Ajouter ')+title+' '+(saved?'des favoris':'aux favoris'));b.querySelector('span').textContent=saved?'Enregistré':'Favori';const ok=normalized(card.textContent).includes(q)&&(filter==='all'||(filter==='saved'?saved:card.dataset.category===filter));card.hidden=!ok;if(ok)count++;}
 document.querySelectorAll('[data-group]').forEach(g=>g.hidden=![...g.querySelectorAll('.db-article')].some(c=>!c.hidden));
 result.textContent=count+' dossier'+(count===1?'':'s')+' affiché'+(count===1?'':'s');empty.hidden=count!==0;
 document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filter)));
 }
 function showResume(){if(resume.dataset.carnet)return;resume.replaceChildren();const last=state().last;const card=last&&cards.find(c=>c.dataset.article===last.id);resume.hidden=!card;if(!card)return;const box=n('div',undefined,'db-resume-card');const info=n('div');info.append(n('strong','Reprendre ma lecture'));const a=n('a',card.querySelector('h3').textContent);a.href=card.querySelector('h3 a').getAttribute('href')+'#reprendre';info.append(a);box.append(info,button('Effacer',()=>{const s=state();s.last=null;store(s);showResume();}));resume.append(box);}
 query.addEventListener('input',refresh);document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;refresh();}));for(const c of cards){const b=c.querySelector('[data-save]');b.addEventListener('click',()=>{if(toggle(c.dataset.article))refresh();else result.textContent='Impossible d’enregistrer les favoris dans ce navigateur.';});}
 document.getElementById('db-reset').addEventListener('click',()=>{filter='all';query.value='';refresh();});
 const gallery=document.getElementById('db-discord-gallery');gallery.addEventListener('toggle',()=>{if(!gallery.open||gallery.dataset.loaded)return;gallery.dataset.loaded='true';const widget=document.createElement('widgetbot');widget.setAttribute('server','1450574915014234154');widget.setAttribute('channel','1570470471798104195');widget.setAttribute('width','100%');widget.setAttribute('height','360');document.getElementById('db-gallery-embed').append(widget);const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/@widgetbot/html-embed';script.async=true;script.onerror=()=>{document.getElementById('db-gallery-embed').textContent='Galerie indisponible. Utilise le lien Fan art.';};document.body.append(script);});
 window.addEventListener('pageshow',()=>{refresh();showResume();});window.addEventListener('storage',()=>{refresh();showResume();});refresh();showResume();
}
export function mountReadingTools(article,bar){
 if(!article||!bar||document.getElementById('db-reading-tools'))return;
 const style=document.createElement('style');style.textContent='.db-reading-tools{box-sizing:border-box;max-width:1100px;margin:12px auto;padding:0 16px;display:flex;gap:8px;align-items:center;justify-content:center;flex-wrap:wrap;font:500 13px/1.4 system-ui,sans-serif}.db-reading-tools button,.db-reading-tools a{background:#fff6e6;color:#0a1f4d;border:1px solid #cbbda8;border-radius:8px;min-height:37px;padding:8px 12px;text-decoration:none;cursor:pointer;font:inherit}.db-reading-tools button[aria-pressed=true]{background:#ffc531;border-color:#c47d17}.db-reading-tools button:focus-visible,.db-reading-tools a:focus-visible{outline:3px solid #f5821f;outline-offset:2px}.db-reading-tools p{margin:0;color:inherit;font-size:12px}.db-reading-tools [hidden]{display:none!important}@media print{.db-reading-tools{display:none!important}}';document.head.append(style);
 const root=n('div',undefined,'db-reading-tools');root.id='db-reading-tools';root.setAttribute('aria-label','Outils de lecture');bar.insertAdjacentElement('afterend',root);
 const note=n('p','');note.setAttribute('role','status');
 const save=button('☆ Favori',()=>{if(toggle(article.n)){update();note.textContent='Favoris mis à jour sur cet appareil.';}else note.textContent='Stockage local indisponible.';});
 function update(){const active=state().saved.includes(article.n);save.textContent=active?'★ Dans mes favoris':'☆ Ajouter aux favoris';save.setAttribute('aria-pressed',String(active));}
 const comments=n('a','Commentaires ↓');comments.href='#commentaires';
 const library=n('a','Bibliothèque');library.href='/#sommaire';
 const share=button('Copier le lien',async()=>{try{await navigator.clipboard.writeText(location.origin+article.u);note.textContent='Lien copié.';}catch{note.textContent='La copie automatique est indisponible.';}});
 const resume=button('Reprendre ici',()=>restore());resume.hidden=!(state().last?.id===article.n&&Number.isFinite(state().last?.y)&&state().last.y>100);
 root.append(library,save,share,comments,resume,note);update();
 let moved=false,restoring=false,ready=false;
 function restore(){const last=state().last;if(last?.id!==article.n||!Number.isFinite(last.y))return;restoring=true;window.scrollTo({top:Math.max(0,last.y),behavior:'instant'});setTimeout(()=>{restoring=false;},300);}
 function track(){if(ready&&!restoring&&window.scrollY>100)moved=true;}
 function persist(){if(!moved||restoring)return;const s=state();s.last={id:article.n,y:Math.max(0,Math.round(window.scrollY))};store(s);}
 window.addEventListener('scroll',track,{passive:true});window.addEventListener('pagehide',persist);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')persist();});
 const start=()=>{if(location.hash==='#reprendre')restore();setTimeout(()=>{ready=true;},350);};if(document.readyState==='complete')start();else window.addEventListener('load',start,{once:true});
 window.addEventListener('storage',update);window.addEventListener('pageshow',update);
}
if(document.body.classList.contains('db-magazine'))home();
