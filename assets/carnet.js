const KEY='dragonballogy-carnet-v1',LEGACY='dragonballogie-reading-v1';
const $=id=>document.getElementById(id);
const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
function read(){try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');return {progress:x.progress&&typeof x.progress==='object'?x.progress:{},marks:Array.isArray(x.marks)?x.marks:[],hint:!!x.hint,side:x.side==='right'?'right':'left'};}catch{return {progress:{},marks:[],hint:false,side:'left'};}}
function write(x){try{localStorage.setItem(KEY,JSON.stringify(x));return true;}catch{return false;}}
function legacy(){try{return JSON.parse(localStorage.getItem(LEGACY)||'{}');}catch{return {};}}
function saveFavorite(id){try{const s=legacy();const items=Array.isArray(s.saved)?s.saved:[];s.saved=items.includes(id)?items.filter(x=>x!==id):[...items,id];localStorage.setItem(LEGACY,JSON.stringify(s));return true;}catch{return false;}}
function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
function btn(text,fn,cls){const b=el('button',text,cls);b.type='button';b.addEventListener('click',fn);return b;}
function link(text,url,cls){const a=el('a',text,cls);a.href=url;return a;}
function style(){if(document.querySelector('link[data-carnet]'))return;const l=el('link');l.rel='stylesheet';l.href='/assets/carnet.css?v=8';l.dataset.carnet='';document.head.append(l);}
function catalog(){return window.__dbArticles||[...document.querySelectorAll('.db-article[data-article]')].map(c=>({n:c.dataset.article,t:c.querySelector('h3').textContent,u:c.querySelector('h3 a').getAttribute('href')}));}
function getEntries(){const s=read(),old=legacy().last;if(old&&typeof old.id==='string'&&Number.isFinite(old.y)&&!s.progress[old.id])s.progress[old.id]={y:old.y,section:'Dernière position',updated:0};return s;}
function targetUrl(a,mark){return a.u+(mark?'#jalon='+encodeURIComponent(mark.id):'#reprendre');}
function when(t){return t?new Date(t).toLocaleDateString('fr-FR',{day:'numeric',month:'short'}):'';}
function removeMark(id){const s=read();s.marks=s.marks.filter(m=>m.id!==id);return write(s);}
function removeProgress(id){const s=read();delete s.progress[id];try{const l=legacy();if(l.last?.id===id){l.last=null;localStorage.setItem(LEGACY,JSON.stringify(l));}}catch{}return write(s);}
function renderNotebook(root,{article=null,jump=null,onChange=()=>{}}={}){
 const s=getEntries(),all=catalog(),list=el('div',undefined,'cn-list');root.replaceChildren();const entries=all.filter(a=>!article||a.n===article.n).map(a=>({a,p:s.progress[a.n],marks:s.marks.filter(m=>m.article===a.n).sort((a,b)=>b.updated-a.updated)})).filter(x=>x.p||x.marks.length).sort((a,b)=>Math.max(b.p?.updated||0,...b.marks.map(m=>m.updated||0))-Math.max(a.p?.updated||0,...a.marks.map(m=>m.updated||0)));
 if(!entries.length){root.append(el('p',article?'Aucun jalon ici pour le moment. Ajoute un marque-page pour retrouver ce passage.':'Tes lectures et tes marque-pages apparaîtront ici dès que tu commenceras à lire.','cn-muted'));return;}
 function action(label,a,pos,mark){return article?btn(label,()=>jump(pos),'cn-jump'):link(label,targetUrl(a,mark),'cn-jump');}
 for(const {a,p,marks} of entries){const group=el('div',undefined,'cn-group');group.append(el('h3',a.t));if(p){const item=el('div',undefined,'cn-item');const info=el('div',undefined,'cn-info');info.append(el('small','REPRISE AUTOMATIQUE'),el('strong',p.section||'Dernière position'));if(p.excerpt)info.append(el('span',p.excerpt,'cn-excerpt'));if(Number.isFinite(p.percent))info.append(el('span',p.percent+' % du dossier'+(p.updated?' · '+when(p.updated):''),'cn-muted'));const actions=el('div',undefined,'cn-actions');actions.append(action('Reprendre →',a,p,null),btn('Effacer',()=>{if(removeProgress(a.n)){renderNotebook(root,{article,jump,onChange});onChange();}},'cn-delete'));item.append(info,actions);group.append(item);}
 for(const m of marks){const item=el('div',undefined,'cn-item cn-mark');const info=el('div',undefined,'cn-info');info.append(el('small','MARQUE-PAGE · '+when(m.updated)),el('strong',m.name||m.section||'Passage enregistré'));if(m.name&&m.section&&m.name!==m.section)info.append(el('span',m.section,'cn-muted'));if(m.excerpt)info.append(el('span',m.excerpt,'cn-excerpt'));const actions=el('div',undefined,'cn-actions');actions.append(action('Retrouver →',a,m,m),btn('Supprimer',()=>{if(removeMark(m.id)){renderNotebook(root,{article,jump,onChange});onChange();}},'cn-delete'));item.append(info,actions);group.append(item);}
 list.append(group);}
 root.append(list);
}
export function mountHomeNotebook(){const root=$('db-resume');if(!root||root.dataset.carnet)return;style();root.dataset.carnet='true';root.hidden=false;root.classList.add('cn-home');const head=el('div',undefined,'cn-head'),title=el('div');title.append(el('p','TON CARNET DE LECTURE','cn-kicker'),el('h2','Reprendre mes lectures'));head.append(title);const details=el('details');const summary=el('summary','Mes lectures et marque-pages');const content=el('div');details.append(summary,content);root.replaceChildren(head,el('p','Lis à ton rythme. Retrouve tes passages, sans compte et sans limite de durée imposée.','cn-muted'),details);function refresh(){renderNotebook(content,{onChange:refresh});const s=getEntries();const count=Object.keys(s.progress).length,marks=s.marks.length;summary.textContent=count+' lecture'+(count!==1?'s':'')+' · '+marks+' marque-page'+(marks!==1?'s':'');if(count||marks)details.open=true;}refresh();window.addEventListener('pageshow',refresh);window.addEventListener('storage',refresh);}
export function mountReadingTools(article,bar){
 if(!article||!bar||$('db-reading-tools'))return;style();
 const main=document.querySelector('main.article-body,main.article-wrap,main.wrap,main,article')||document.body;
 const root=el('div',undefined,'cn-tools');root.id='db-reading-tools';root.setAttribute('aria-label','Outils de lecture');bar.insertAdjacentElement('afterend',root);
 const note=el('p','','cn-status');note.setAttribute('role','status');
 const favorite=btn('☆ Favori',()=>{if(saveFavorite(article.n)){updateFavorite();note.textContent='Favoris mis à jour.';}else note.textContent='Stockage indisponible.';});
 function updateFavorite(){const on=(legacy().saved||[]).includes(article.n);favorite.textContent=on?'★ Favori enregistré':'☆ Favori';favorite.setAttribute('aria-pressed',String(on));}
 const share=btn('Copier le lien',async()=>{try{await navigator.clipboard.writeText(location.origin+article.u);note.textContent='Lien copié.';}catch{note.textContent='Copie automatique indisponible.';}});
 const floating=el('aside',undefined,'cn-floating');floating.classList.toggle('cn-right',read().side==='right');floating.setAttribute('aria-label','Carnet de lecture');
 const trigger=btn('▣ Carnet',()=>open(!panel.hidden),'cn-trigger');trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-controls','cn-panel');
 const panel=el('div',undefined,'cn-panel');panel.id='cn-panel';panel.hidden=true;const panelHead=el('div',undefined,'cn-panel-head');const side=btn('Changer de côté',()=>{const s=read();s.side=floating.classList.contains('cn-right')?'left':'right';floating.classList.toggle('cn-right',s.side==='right');write(s);},'cn-delete');panelHead.append(el('strong','Mon carnet'),side,btn('Fermer',()=>open(true),'cn-delete'));const progressLabel=el('p','','cn-muted'),add=btn('＋ Marquer ce passage',()=>startMark(),'cn-primary');const form=el('form');form.hidden=true;const context=el('p','','cn-muted');const label=el('label','Nom du marque-page (facultatif)');const input=el('input');input.maxLength=100;input.placeholder='Ex. Exemple de Cell';label.append(input);const submit=el('button','Enregistrer');submit.type='submit';submit.className='cn-primary';form.append(context,label,submit,btn('Annuler',()=>{form.hidden=true;},'cn-delete'));const list=el('div');panel.append(panelHead,progressLabel,add,form,list,link('Toutes mes lectures →','/#db-resume','cn-jump'));floating.append(trigger,panel);document.body.append(floating);
 const info=el('div',undefined,'cn-tip');info.append(el('span','Le savais-tu ? Tu peux reprendre chaque article ou poser plusieurs marque-pages.'),btn('Compris',()=>{info.hidden=true;const s=read();s.hint=true;write(s);},'cn-delete'));info.hidden=read().hint;root.append(link('Bibliothèque','/#sommaire'),favorite,share,link('Commentaires ↓','#commentaires'),btn('▣ Mon carnet',()=>open(false)),note,info);updateFavorite();
 let pending=null,restoring=false,ready=false,dirty=false,scheduled=0,suppressUntil=0;
 const isText=n=>!n.closest('.side,.rail,.fil,.mfil,.dbz-cta,.dbc,nav,footer,aside,#db-reading-tools')&&clean(n.textContent).length>=15&&n.getClientRects().length>0;
 function blocks(){return [...main.querySelectorAll('h1,h2,h3,h4,p,li,blockquote,figcaption')].filter(isText);}
 function textPosition(block,targetY){
 if(!block)return null;const walker=document.createTreeWalker(block,NodeFilter.SHOW_TEXT);let node,index=0,best=null;
 while((node=walker.nextNode())){const len=node.length;if(!len)continue;
 try{const range=document.createRange();range.selectNodeContents(node);const bounds=range.getBoundingClientRect();
 if(bounds.height&&bounds.bottom>=targetY&&bounds.top<=targetY+70){let low=0,high=len-1;
 while(low<high){const mid=Math.floor((low+high)/2);range.setStart(node,mid);range.setEnd(node,mid+1);const r=range.getBoundingClientRect();if(r.bottom<targetY)low=mid+1;else high=mid;}
 range.setStart(node,low);range.setEnd(node,low+1);const r=range.getBoundingClientRect();if(r.height){best={char:index+low,excerpt:clean(block.textContent.slice(index+low)).slice(0,110)};break;}}
 }catch{}index+=len;
 }return best;
 }
 function charTop(block,offset){if(!Number.isInteger(offset)||offset<0)return null;const walker=document.createTreeWalker(block,NodeFilter.SHOW_TEXT);let node,left=offset;while((node=walker.nextNode())){if(left<node.length){try{const r=document.createRange();r.setStart(node,left);r.setEnd(node,left+1);const rect=r.getBoundingClientRect();return rect.height?rect.top:null;}catch{return null;}}left-=node.length;}return null;}
 function capture(){
 const y=window.scrollY,top=Math.min(135,window.innerHeight*.3),all=blocks(),headings=all.filter(n=>/^H[1-4]$/.test(n.tagName));let current=null;
 for(const b of all){const r=b.getBoundingClientRect();if(r.bottom>=top&&r.top<=window.innerHeight*.85){current=b;break;}}
 const heading=[...headings].reverse().find(h=>h.getBoundingClientRect().top<=top+20)||headings[0];const section=clean(heading?.textContent)||article.t;
 const max=Math.max(1,main.getBoundingClientRect().height-window.innerHeight);const begin=main.getBoundingClientRect().top+y;
 const percent=Math.round(Math.max(0,Math.min(100,(y-begin)/max*100)));
 const r=current?.getBoundingClientRect(),point=textPosition(current,top);return {y:Math.round(y),percent,section:section.slice(0,180),headingId:heading?.id||'',headingText:clean(heading?.textContent).slice(0,220),quote:clean(current?.textContent).slice(0,200),excerpt:point?.excerpt||clean(current?.textContent).slice(0,110),char:point?.char??null,blockIndex:current?all.indexOf(current):-1,offset:r?Math.max(0,Math.min(1,(top-r.top)/Math.max(1,r.height))):0,updated:Date.now()};
 }
 function locate(pos){const all=blocks();let match=null;if(pos.quote){match=all.find(b=>clean(b.textContent).slice(0,200)===pos.quote);if(!match)match=all.find(b=>clean(b.textContent).startsWith(pos.quote.slice(0,60)));}
 if(match){const r=match.getBoundingClientRect(),line=charTop(match,pos.char);return Math.max(0,window.scrollY+(line??(r.top+r.height*(pos.offset||0)))-Math.min(135,window.innerHeight*.3));}
 const h=pos.headingId&&document.getElementById(pos.headingId)||all.find(b=>/^H[1-4]$/.test(b.tagName)&&clean(b.textContent).slice(0,220)===pos.headingText);if(h)return Math.max(0,window.scrollY+h.getBoundingClientRect().top-100);
 if(Number.isFinite(pos.percent)){const r=main.getBoundingClientRect();return Math.max(0,window.scrollY+r.top+Math.max(0,r.height-window.innerHeight)*pos.percent/100);}
 return Math.max(0,Number(pos.y)||0);
 }
 function jump(pos){if(!pos)return;restoring=true;suppressUntil=Date.now()+1300;window.scrollTo({top:locate(pos),behavior:'instant'});setTimeout(()=>{window.scrollTo({top:locate(pos),behavior:'instant'});restoring=false;},200);open(true);note.textContent='Passage retrouvé.';}
 function redraw(){const s=getEntries();const count=s.marks.filter(m=>m.article===article.n).length;trigger.textContent='▣ Carnet'+(count?' · '+count:'');renderNotebook(list,{article,jump,onChange:redraw});progressLabel.textContent='Dans ce dossier · '+capture().percent+' % parcourus';}
 function open(close){panel.hidden=close;trigger.setAttribute('aria-expanded',String(!close));if(!close){persist();redraw();}}
 function startMark(){pending=capture();context.textContent=pending.section+(pending.excerpt?' — '+pending.excerpt:'');input.value='';form.hidden=false;input.focus();}
 form.addEventListener('submit',e=>{e.preventDefault();if(!pending)return;const s=read();if(s.marks.length>=200){progressLabel.textContent='Le carnet contient déjà 200 marque-pages. Supprime un ancien jalon.';return;}const id=globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2);s.marks.push({...pending,id,article:article.n,name:clean(input.value).slice(0,100)||pending.section});if(write(s)){form.hidden=true;pending=null;redraw();progressLabel.textContent='Marque-page enregistré.';}else progressLabel.textContent='Impossible d’enregistrer ce marque-page.';});
 function persist(){if(!ready||!dirty||restoring||Date.now()<suppressUntil||window.scrollY<100)return;const s=read();s.progress[article.n]=capture();if(write(s)){dirty=false;}}
 function track(){if(!ready||restoring||Date.now()<suppressUntil)return;dirty=true;if(!scheduled){scheduled=setTimeout(()=>{scheduled=0;persist();},750);}}
 window.addEventListener('scroll',track,{passive:true});window.addEventListener('pagehide',persist);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')persist();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){open(true);trigger.focus();}});
 window.addEventListener('storage',()=>{updateFavorite();if(!panel.hidden)redraw();});
 function start(){const hash=location.hash,s=getEntries();if(hash==='#reprendre')jump(s.progress[article.n]);else if(hash.startsWith('#jalon=')){let id;try{id=decodeURIComponent(hash.slice(7));}catch{}jump(s.marks.find(m=>m.article===article.n&&m.id===id));}ready=true;redraw();}
 if(document.readyState==='complete')start();else {start();const savedHash=location.hash;window.addEventListener('load',()=>{if(!dirty&&location.hash===savedHash&&(savedHash==='#reprendre'||savedHash.startsWith('#jalon=')))start();},{once:true});}
}
