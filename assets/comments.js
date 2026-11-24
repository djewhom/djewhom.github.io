import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './account-config.js';
const fields='id,article_key,parent_id,author_name,body,created_at,published_at';
function node(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
function button(label,fn){const b=node('button',label);b.type='button';b.addEventListener('click',fn);return b;}
function date(x){return new Date(x).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'});}
function link(label,url){const a=node('a',label);a.href=url;return a;}
function status(root){const p=node('p','','dbc-status');p.setAttribute('role','status');root.append(p);return p;}
function styles(){if(document.getElementById('dbc-style'))return;const l=document.createElement('link');l.id='dbc-style';l.rel='stylesheet';l.href='/assets/comments.css?v=5';document.head.append(l);}
async function connect(auth=true){const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.1/+esm');return createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{flowType:'pkce',detectSessionInUrl:false,persistSession:auth,autoRefreshToken:auth,...(!auth?{storageKey:'dragonballogy-public-feed'}:{})}});}
export async function mountComments(root,article){
 styles();root.classList.add('dbc');root.id='commentaires';
 root.append(node('p','DÉBATS & RÉACTIONS','dbc-kicker'),node('h2','L’espace des lecteurs'),node('p','Une question, une objection, un éclairage ? Échange avec la communauté. Les commentaires sont vérifiés par l’équipe avant publication.','dbc-muted'));
 const note=status(root),compose=node('div'),list=node('div'),pager=node('div',undefined,'dbc-actions');root.append(compose,list,pager);
 let client,user=null,staff=false,parent=null,offset=0,more=false,generation=0,authGeneration=0;
 const previous=button('Précédent',()=>{offset=Math.max(0,offset-20);load();}),next=button('Suivant',()=>{if(more){offset+=20;load();}});pager.append(previous,next);
 const form=node('form'),replyLabel=node('p','','dbc-muted'),cancel=button('Annuler la réponse',()=>{parent=null;replyLabel.textContent='Nouveau commentaire';cancel.hidden=true;});
 const body=node('textarea');body.required=true;body.maxLength=2500;body.rows=4;body.placeholder='Ton commentaire…';body.setAttribute('aria-label','Ton commentaire');
 const send=node('button','Envoyer pour validation');send.type='submit';form.append(replyLabel,cancel,body,node('p','Ton pseudo et ton texte seront visibles publiquement après validation. Ne publie pas de données personnelles.','dbc-muted'),send);
 function showCompose(){compose.replaceChildren();if(user){compose.append(form);replyLabel.textContent='Nouveau commentaire';cancel.hidden=true;parent=null;}else{compose.append(node('p','Connecte-toi pour participer.'),link('Rejoindre Mon académie','/compte.html'));}}
 async function load(){const g=++generation;previous.disabled=next.disabled=true;note.textContent='Chargement des commentaires…';
 try{const {data,error}=await client.from('academy_comments').select(fields).eq('article_key',article.n).order('published_at',{ascending:false}).order('id',{ascending:false}).range(offset,offset+19);if(g!==generation)return;if(error)throw error;
 if(!data.length&&offset>0){offset=Math.max(0,offset-20);return load();}
 list.replaceChildren();more=data.length===20;const names=new Map(data.map(c=>[c.id,c.author_name]));
 for(const item of data){const card=node('div',undefined,'dbc-comment'+(item.parent_id?' dbc-reply':''));card.id='comment-'+item.id;
 card.append(node('strong',item.author_name),node('span',' · '+date(item.published_at),'dbc-muted'));
 if(item.parent_id){const a=link('↳ Réponse'+(names.has(item.parent_id)?' à '+names.get(item.parent_id):' à un commentaire'),'#comment-'+item.parent_id);a.className='dbc-muted dbc-parent';card.append(a);}
 card.append(node('div',item.body,'dbc-copy'));const actions=node('div',undefined,'dbc-actions');
 if(user&&!item.parent_id)actions.append(button('Répondre',()=>{parent=item.id;replyLabel.textContent='Réponse à '+item.author_name;cancel.hidden=false;form.scrollIntoView({block:'center'});body.focus();}));
 if(staff)actions.append(button('Masquer',async e=>{if(!window.confirm('Masquer ce commentaire et ses réponses ?'))return;const b=e.currentTarget;b.disabled=true;try{const {error}=await client.rpc('academy_comment_moderate',{p_id:item.id,p_decision:'hidden'});if(error)throw error;await load();}catch{note.textContent='Impossible de masquer ce commentaire.';b.disabled=false;}}));
 card.append(actions);list.append(card);}
 if(!data.length)list.append(node('p','Aucun commentaire publié. Lance la discussion !','dbc-muted'));
 previous.disabled=offset===0;next.disabled=!more;note.textContent='';
 if(location.hash.startsWith('#comment-'))document.getElementById(location.hash.slice(1))?.scrollIntoView({block:'center'});
 }catch{if(g===generation){note.textContent='Commentaires indisponibles pour le moment.';list.replaceChildren();}}}
 form.addEventListener('submit',async e=>{e.preventDefault();if(!user||!body.value.trim())return;send.disabled=true;try{const {error}=await client.rpc('academy_comment_submit',{p_article:article.n,p_parent:parent,p_body:body.value.trim()});if(error)throw error;body.value='';parent=null;replyLabel.textContent='Nouveau commentaire';cancel.hidden=true;note.textContent='Commentaire envoyé ! Il apparaîtra après validation.';}catch{note.textContent='Envoi impossible. Vérifie ta connexion, ou réessaie plus tard (10 commentaires par heure maximum).';}finally{send.disabled=false;}});
 try{client=await connect();const {data}=await client.auth.getSession();async function authChanged(session){const g=++authGeneration;user=session?.user||null;staff=false;showCompose();if(user){const {data}=await client.from('db_profiles').select('role').eq('id',user.id).single();if(g!==authGeneration)return;staff=['owner','admin'].includes(data?.role);}load();}
 await authChanged(data?.session);client.auth.onAuthStateChange((event,session)=>{if((session?.user?.id||null)!==(user?.id||null))setTimeout(()=>authChanged(session),0);});}catch{note.textContent='Service de commentaires indisponible.';}
}
export async function mountActivity(root,articles){
 styles();root.classList.add('dbc');root.append(node('p','LA COMMUNAUTÉ','dbc-kicker'),node('h2','La vie de Dragonballogie'));
 const note=status(root);try{const client=await connect(false);const {data,count,error}=await client.from('academy_comments').select(fields,{count:'exact'}).order('published_at',{ascending:false}).order('id',{ascending:false}).limit(5);if(error)throw error;note.textContent=(count||0)+' commentaire(s) publié(s) sur le site';const live=document.getElementById('db-live-count');if(live)live.textContent=(count||0)>0?count+' commentaire'+(count===1?' publié':'s publiés')+' · Voir les échanges':'Les premiers débats n’attendent que vous !';const byKey=new Map(articles.map(a=>[a.n,a]));
 if(!data.length)root.append(node('p','Les premiers débats n’attendent que vous !','dbc-muted'));
 for(const c of data){const a=byKey.get(c.article_key);if(!a)continue;const item=node('div',undefined,'dbc-comment');item.append(node('strong',c.author_name),node('span',' · '+date(c.published_at),'dbc-muted'),node('p',c.body.length>180?c.body.slice(0,180)+'…':c.body,'dbc-copy'),link(a.t+' →',a.u+'#comment-'+c.id));root.append(item);}
 root.append(link('Rejoindre l’académie','/compte.html'));
 }catch{note.textContent='Activité indisponible pour le moment.';}
}
export function mountModeration(root,client,articles){
 styles();root.classList.add('dbc');root.replaceChildren(node('p','ÉQUIPE DE DIRECTION','dbc-kicker'),node('h2','Modération des commentaires'));
 const note=status(root),list=node('div'),pager=node('div',undefined,'dbc-actions');let offset=0,more=false,generation=0;const byKey=new Map(articles.map(a=>[a.n,a]));
 const refresh=button('Actualiser',()=>{offset=0;load();}),prev=button('Précédent',()=>{offset=Math.max(0,offset-30);load();}),next=button('Suivant',()=>{if(more){offset+=30;load();}});pager.append(prev,next);root.append(refresh,list,pager);
 async function load(){const g=++generation;note.textContent='Chargement…';prev.disabled=next.disabled=true;try{const {data,error}=await client.rpc('academy_comment_queue',{p_offset:offset});if(g!==generation||!root.isConnected||root.hidden)return;if(error)throw error;const items=data?.items||[];if(!items.length&&offset>0){offset=Math.max(0,offset-30);return load();}list.replaceChildren();more=items.length===30;
 for(const c of items){const item=node('div',undefined,'dbc-comment'),a=byKey.get(c.article_key);item.append(node('strong',c.author_name),node('span',' · '+date(c.created_at),'dbc-muted'));if(a)item.append(node('p',a.t+(c.parent_id?' · Réponse':''),'dbc-muted'),link('Voir l’article',a.u+'#commentaires'));item.append(node('div',c.body,'dbc-copy'));const actions=node('div',undefined,'dbc-actions');
 for(const [decision,label] of [['approved','Approuver'],['rejected','Refuser']])actions.append(button(label,async()=>{if(!window.confirm(label+' ce commentaire ?'))return;actions.querySelectorAll('button').forEach(b=>b.disabled=true);try{const {error}=await client.rpc('academy_comment_moderate',{p_id:c.id,p_decision:decision});if(error)throw error;await load();}catch{note.textContent='Décision impossible. Actualise la liste.';actions.querySelectorAll('button').forEach(b=>b.disabled=false);}}));item.append(actions);list.append(item);}
 note.textContent=items.length?items.length+' commentaire(s) à examiner sur cette page.':'Aucun commentaire en attente.';prev.disabled=offset===0;next.disabled=!more;
 }catch{if(g===generation){note.textContent='Modération inaccessible.';list.replaceChildren();}}}
 load();
 return ()=>{generation++;root.replaceChildren();};
}
