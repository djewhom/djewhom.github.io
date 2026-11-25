
/* DragonBallogy — visionneuse commune, sans dépendance externe. */
const CSS = `
.db-img-zoomable{cursor:zoom-in!important}
.db-img-zoomable:focus-visible{outline:3px solid #f5821f!important;outline-offset:3px}
.db-zoom-tip{box-sizing:border-box;max-width:780px;margin:12px auto;padding:0 16px;text-align:center;color:inherit;font:500 13px/1.5 system-ui,sans-serif;opacity:.85}
.db-zoom-tip svg{vertical-align:-3px;margin-right:5px;width:17px;height:17px}
#db-image-viewer{position:fixed!important;inset:0!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;box-sizing:border-box!important;margin:0!important;padding:0!important;border:0!important;background:#101521!important;color:#fff!important;overflow:hidden!important;font:500 14px/1.4 system-ui,sans-serif!important;z-index:2147483647!important}
#db-image-viewer:not([open]){display:none!important}
#db-image-viewer[open]{display:flex!important;flex-direction:column!important}
#db-image-viewer::backdrop{background:#101521}
#db-image-viewer .db-iv-bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:6px;flex:none;padding:calc(8px + env(safe-area-inset-top,0px)) max(8px,env(safe-area-inset-right,0px)) 8px max(8px,env(safe-area-inset-left,0px));background:#0a1f4d;border-bottom:2px solid #f5821f}
#db-image-viewer .db-iv-title{margin-right:auto;padding:0 5px;font-size:13px;font-weight:700;color:#ffc531}
#db-image-viewer button,#db-image-viewer a.db-iv-original{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;min-width:44px;min-height:44px;padding:5px 10px;border:1px solid #61759b;border-radius:9px;background:#17366b;color:white;font:600 14px/1.2 system-ui,sans-serif;text-decoration:none;cursor:pointer;white-space:nowrap}
#db-image-viewer button:disabled{opacity:.45;cursor:default}
#db-image-viewer button:focus-visible,#db-image-viewer a:focus-visible{outline:3px solid #ffc531;outline-offset:2px}
#db-image-viewer .db-iv-close{background:#f5821f;color:#131c30;border-color:#f5821f;font-size:22px}
#db-image-viewer .db-iv-stage{flex:1;min-height:0;min-width:0;overflow:auto;overscroll-behavior:contain;touch-action:none;cursor:grab;position:relative;display:block;padding:0;background:#101521}
#db-image-viewer .db-iv-stage:active{cursor:grabbing}
#db-image-viewer .db-iv-canvas{box-sizing:border-box;display:flex;align-items:center;justify-content:center;min-width:100%;min-height:100%;width:max-content;height:max-content;padding:12px}
#db-image-viewer .db-iv-img{display:block!important;flex:none;max-width:none!important;max-height:none!important;object-fit:contain!important;box-shadow:none!important;border:0!important;border-radius:0!important;margin:0!important;padding:0!important;user-select:none;-webkit-user-drag:none;background:transparent!important}
#db-image-viewer .db-iv-status{flex:none;padding:7px 12px calc(8px + env(safe-area-inset-bottom,0px));text-align:center;background:#0a1f4d;color:#fff;font-size:12px}
#db-image-viewer .db-iv-caption{display:block;max-height:2.8em;overflow:auto;overflow-wrap:anywhere;margin:0 auto 3px;max-width:1000px}
#db-image-viewer .db-iv-error{padding:24px;color:#fff}
#db-image-viewer [hidden]{display:none!important}
@media(max-width:520px){#db-image-viewer .db-iv-title{display:none}#db-image-viewer .db-iv-bar{gap:4px}#db-image-viewer button,#db-image-viewer a.db-iv-original{padding:5px 8px;font-size:13px}#db-image-viewer .db-iv-close{font-size:22px}}
@media print{.db-zoom-tip,#db-image-viewer{display:none!important}}
`;
const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
const loupe='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5M7 10h6m-3-3v6"/></svg>';
export function mountImageViewer(){
  if(document.getElementById('db-image-viewer'))return;
  const root=document.querySelector('main.article-body,main.article-wrap,main.wrap,main,article');
  if(!root || !window.HTMLDialogElement || typeof HTMLDialogElement.prototype.showModal!=='function')return;
  const originals=[...root.querySelectorAll('img')].filter(img=>img.getAttribute('src')&&!img.matches('[data-no-zoom],[aria-hidden="true"]')&&!img.closest('a,button,[role="button"],.loupe,.lightbox,[data-no-zoom]'));
  const oldButtons=[...root.querySelectorAll('button.zoom[data-src]')].filter(b=>b.querySelector('img'));
  if(!originals.length&&!oldButtons.length)return;
  const style=document.createElement('style');style.textContent=CSS;document.head.append(style);
  const dialog=document.createElement('dialog');dialog.id='db-image-viewer';dialog.setAttribute('aria-label','Visionneuse d’images');
  dialog.innerHTML='<div class="db-iv-bar"><span class="db-iv-title">DRAGONBALLOGY · IMAGE</span><button type="button" data-act="minus" aria-label="Réduire le zoom">−</button><button type="button" data-act="fit" aria-label="Adapter à l’écran">100 %</button><button type="button" data-act="plus" aria-label="Agrandir">+</button><a class="db-iv-original" target="_blank" rel="noopener" aria-label="Ouvrir l’image originale dans un nouvel onglet">Original ↗</a><button type="button" class="db-iv-close" data-act="close" aria-label="Fermer">×</button></div><div class="db-iv-stage" tabindex="0" aria-label="Image agrandie, déplacer pour lire les détails"><div class="db-iv-canvas"><img class="db-iv-img" draggable="false" alt=""><span class="db-iv-error" hidden>Image indisponible.</span></div></div><div class="db-iv-status"><span class="db-iv-caption"></span><span>Molette, boutons + / − ou deux doigts pour zoomer · glisser pour déplacer</span></div>';
  document.body.append(dialog);
  const stage=dialog.querySelector('.db-iv-stage'),picture=dialog.querySelector('.db-iv-img'),caption=dialog.querySelector('.db-iv-caption'),error=dialog.querySelector('.db-iv-error'),fit=dialog.querySelector('[data-act=fit]'),plus=dialog.querySelector('[data-act=plus]'),minus=dialog.querySelector('[data-act=minus]'),close=dialog.querySelector('[data-act=close]'),original=dialog.querySelector('.db-iv-original');
  let trigger=null,priorOverflow='',zoom=1,baseW=0,baseH=0,ready=false,loadToken=0;
  const points=new Map();let gesture=null;
  function metrics(){
    const w=picture.naturalWidth,h=picture.naturalHeight;
    if(!w||!h||!stage.clientWidth||!stage.clientHeight)return false;
    const ratio=Math.min(1,Math.max(1,stage.clientWidth-24)/w,Math.max(1,stage.clientHeight-24)/h);
    baseW=w*ratio;baseH=h*ratio;return true;
  }
  function apply(){
    picture.style.setProperty('width',Math.max(1,baseW*zoom)+'px','important');
    picture.style.setProperty('height',Math.max(1,baseH*zoom)+'px','important');
    fit.textContent=Math.round(zoom*100)+' %';minus.disabled=!ready||zoom<=1;plus.disabled=!ready||zoom>=8;
  }
  function setZoom(next,x=stage.clientWidth/2,y=stage.clientHeight/2){
    if(!ready)return;
    const sr=stage.getBoundingClientRect(),ir=picture.getBoundingClientRect();
    const u=clamp((sr.left+x-ir.left)/Math.max(1,ir.width),0,1),v=clamp((sr.top+y-ir.top)/Math.max(1,ir.height),0,1);
    zoom=clamp(next,1,8);apply();
    const nr=picture.getBoundingClientRect();
    stage.scrollLeft+=nr.left+u*nr.width-sr.left-x;stage.scrollTop+=nr.top+v*nr.height-sr.top-y;
  }
  function opened(){
    if(!dialog.open||!picture.naturalWidth)return;
    ready=metrics();if(!ready)return;picture.hidden=false;error.hidden=true;apply();stage.scrollTop=stage.scrollLeft=0;
  }
  function open(img,element,url){
    if(dialog.open)return;
    const src=url||img.currentSrc||img.src;if(!src)return;
    if(img.complete&&!img.naturalWidth&&!url)return;
    trigger=element;ready=false;zoom=1;points.clear();gesture=null;priorOverflow=document.documentElement.style.overflow;
    caption.textContent=img.alt||'';picture.alt=img.alt||'Image de l’article';error.hidden=true;picture.hidden=true;original.href=src;
    fit.textContent='100 %';plus.disabled=minus.disabled=true;
    document.documentElement.style.overflow='hidden';
    try{dialog.showModal();}catch(e){document.documentElement.style.overflow=priorOverflow;trigger=null;return;}
    const token=++loadToken;picture.onload=()=>{if(token===loadToken)opened();};picture.onerror=()=>{if(token===loadToken&&dialog.open){error.hidden=false;picture.hidden=true;}};
    picture.src=src;if(picture.complete&&picture.naturalWidth)opened();close.focus({preventScroll:true});
  }
  dialog.addEventListener('close',()=>{
    ++loadToken;picture.onload=picture.onerror=null;picture.removeAttribute('src');ready=false;points.clear();gesture=null;
    document.documentElement.style.overflow=priorOverflow;
    if(trigger&&trigger.isConnected)trigger.focus({preventScroll:true});trigger=null;
  });
  close.addEventListener('click',()=>dialog.close());
  plus.addEventListener('click',()=>setZoom(zoom*1.35));
  minus.addEventListener('click',()=>setZoom(zoom/1.35));
  fit.addEventListener('click',()=>{setZoom(1);stage.scrollTop=stage.scrollLeft=0;});
  stage.addEventListener('wheel',e=>{if(!ready)return;e.preventDefault();const r=stage.getBoundingClientRect();setZoom(zoom*Math.exp(-e.deltaY*.002),e.clientX-r.left,e.clientY-r.top);},{passive:false});
  stage.addEventListener('dblclick',e=>{const r=stage.getBoundingClientRect();setZoom(zoom>1?1:2.5,e.clientX-r.left,e.clientY-r.top);});
  function snapshot(){
    const p=[...points.values()];if(p.length>=2)return {distance:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)||1,x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2};
    return p.length?{x:p[0].x,y:p[0].y}:null;
  }
  stage.addEventListener('pointerdown',e=>{if(e.button!==0||!ready)return;points.set(e.pointerId,{x:e.clientX,y:e.clientY});try{stage.setPointerCapture(e.pointerId);}catch{}gesture=snapshot();});
  stage.addEventListener('pointermove',e=>{
    if(!points.has(e.pointerId)||!gesture)return;
    points.set(e.pointerId,{x:e.clientX,y:e.clientY});const next=snapshot();
    if(next.distance&&gesture.distance){const r=stage.getBoundingClientRect();setZoom(zoom*next.distance/gesture.distance,gesture.x-r.left,gesture.y-r.top);}
    stage.scrollLeft-=next.x-gesture.x;stage.scrollTop-=next.y-gesture.y;gesture=next;
  });
  function end(e){points.delete(e.pointerId);gesture=snapshot();}
  ['pointerup','pointercancel','lostpointercapture'].forEach(type=>stage.addEventListener(type,end));
  dialog.addEventListener('keydown',e=>{
    if(e.key==='+'||e.key==='='){e.preventDefault();setZoom(zoom*1.35);}
    else if(e.key==='-'){e.preventDefault();setZoom(zoom/1.35);}
    else if(e.key==='0'){e.preventDefault();setZoom(1);}
  });
  window.addEventListener('resize',()=>{if(dialog.open&&ready&&metrics())apply();});
  originals.forEach(img=>{
    img.classList.add('db-img-zoomable');img.tabIndex=0;img.setAttribute('role','button');img.setAttribute('aria-haspopup','dialog');img.setAttribute('aria-label','Agrandir : '+(img.alt||'image de l’article'));
    if(!img.title)img.title='Cliquer pour agrandir';
    img.addEventListener('click',e=>{e.preventDefault();open(img,img);});
    img.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open(img,img);}});
  });
  oldButtons.forEach(b=>{b.setAttribute('aria-haspopup','dialog');b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();open(b.querySelector('img'),b,b.dataset.src);},true);});
  const tip=document.createElement('p');tip.className='db-zoom-tip';tip.innerHTML=loupe+' Cliquez ou touchez les images pour les agrandir et lire les détails.';
  root.parentNode.insertBefore(tip,root);
}
