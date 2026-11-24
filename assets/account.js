import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './account-config.js';
const $=id=>document.getElementById(id);
const show=(id,visible)=>{$(id).hidden=!visible;};
const notice=message=>{$('status').textContent=message;};
let client,mode='signin',recovery=false;
const roleNames={member:'Membre de l’académie',contributor:'Rédacteur / contributeur',admin:'Administrateur',owner:'Fondateur'};
function setMode(next){mode=next;show('pseudo-row',next==='signup');$('pseudo').required=next==='signup';show('password-row',next!=='reset');$('password').required=next!=='reset';$('password').autocomplete=next==='signup'?'new-password':'current-password';$('auth-title').textContent={signin:'Connexion',signup:'Créer mon compte',reset:'Réinitialiser mon mot de passe'}[next];$('auth-submit').textContent={signin:'Se connecter',signup:'Créer mon compte',reset:'Envoyer le lien'}[next];document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===next)));}
function busy(form,value){form.querySelectorAll('button,input,textarea,select').forEach(el=>el.disabled=value);}
let renderGeneration=0;
async function render(session){const renderId=++renderGeneration;resetStaff();resetEditorial();show('auth',!session&&!recovery);show('recovery',recovery);show('profile',!!session&&!recovery);if(recovery||!session)return;const {data,error}=await client.from('db_profiles').select('pseudo,role,bio,specialties').eq('id',session.user.id).single();if(renderId!==renderGeneration)return;if(error||!data){notice('Profil indisponible. Contacte un administrateur.');$('profile-name').textContent='Profil indisponible';$('profile-role').textContent='';$('edit-pseudo').value='';return;}$('profile-name').textContent=data.pseudo;$('edit-pseudo').value=data.pseudo;$('edit-bio').value=data.bio||'';$('edit-specialties').value=data.specialties||'';$('profile-role').textContent=roleNames[data.role]||roleNames.member;notice('Bienvenue dans ton espace personnel.');if(['owner','admin','contributor'].includes(data.role)){editorialActor={id:session.user.id,role:data.role};show('editorial-panel',true);show('editorial-queue',['owner','admin'].includes(data.role));loadEditorial();}if(['owner','admin'].includes(data.role)){staffActor={id:session.user.id,role:data.role};show('staff-panel',true);$('staff-description').textContent=data.role==='owner'?'Tu peux gérer tous les rôles, sauf celui de fondateur.':'Tu peux gérer les membres et les contributeurs. Le fondateur nomme les administrateurs.';loadStaff();}}
async function start(){if(!SUPABASE_URL||!SUPABASE_PUBLISHABLE_KEY){notice('Prototype : les comptes ne sont pas encore activés.');return;}try{const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.1/+esm');client=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{flowType:"pkce"}});setMode('signin');client.auth.onAuthStateChange((event,session)=>{if(event==='PASSWORD_RECOVERY')recovery=true;if(event==='SIGNED_OUT')recovery=false;setTimeout(()=>render(session).catch(()=>notice('Impossible de charger le profil.')),0);});const {error}=await client.auth.getSession();if(error)throw error;notice('Connecte-toi avec GitHub pour rejoindre l’académie.');}catch{notice('Service de connexion indisponible. Réessaie plus tard.');}}
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{setMode(b.dataset.mode);notice('');}));
$('auth-form').addEventListener('submit',async e=>{e.preventDefault();if(!client)return;const form=e.currentTarget;const email=$('email').value.trim(),password=$('password').value,pseudo=$('pseudo').value.trim();busy(form,true);try{const redirectTo=location.origin+'/compte.html';let result;if(mode==='signup'){result=await client.auth.signUp({email,password,options:{data:{pseudo},emailRedirectTo:redirectTo}});if(!result.error&&!result.data.session)notice('Consulte tes e-mails pour confirmer ton inscription.');}else if(mode==='reset'){result=await client.auth.resetPasswordForEmail(email,{redirectTo});if(!result.error)notice('Si ce compte existe, un lien sera envoyé.');}else result=await client.auth.signInWithPassword({email,password});if(result.error)notice('Opération impossible. Vérifie tes informations ou réessaie plus tard.');}catch{notice('Erreur de connexion. Réessaie plus tard.');}finally{busy(form,false);$('password').value='';}});
$('recovery-form').addEventListener('submit',async e=>{e.preventDefault();if(!client||!recovery)return;busy(e.currentTarget,true);try{const {error}=await client.auth.updateUser({password:$('new-password').value});if(error){notice('Impossible de modifier le mot de passe.');return;}recovery=false;$('new-password').value='';const {data}=await client.auth.getSession();await render(data.session);notice('Mot de passe modifié.');}catch{notice('Erreur de connexion.');}finally{busy($('recovery-form'),false);}});
$('profile-form').addEventListener('submit',async e=>{e.preventDefault();if(!client)return;busy(e.currentTarget,true);try{const {data:{user}}=await client.auth.getUser();if(!user)throw new Error();const pseudo=$('edit-pseudo').value.trim();const {error}=await client.from('db_profiles').update({pseudo,bio:$('edit-bio').value.trim(),specialties:$('edit-specialties').value.trim()}).eq('id',user.id).select('id').single();if(error)throw error;$('profile-name').textContent=pseudo;notice('Profil enregistré.');}catch{notice('Impossible d’enregistrer le profil.');}finally{busy($('profile-form'),false);}});
$('logout').addEventListener('click',async()=>{if(!client)return;try{const {error}=await client.auth.signOut();if(error)throw error;notice('Tu es déconnecté.');}catch{notice('Déconnexion impossible. Réessaie.');}});
$('github-login').addEventListener('click',async()=>{if(!client)return;const b=$('github-login');b.disabled=true;try{const {error}=await client.auth.signInWithOAuth({provider:'github',options:{redirectTo:'https://dragonballogy.com/compte.html'}});if(error)throw error;}catch{notice('Connexion GitHub indisponible. Réessaie ou contacte le fondateur.');b.disabled=false;}});
let staffActor=null, staffOffset=0, staffTotal=0, staffGeneration=0;
const staffStatus=t=>{$('staff-status').textContent=t;};
function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
function resetStaff(){staffGeneration++;staffActor=null;staffOffset=0;staffTotal=0;show('staff-panel',false);for(const id of ['staff-members','staff-history','staff-counts'])$(id).replaceChildren();$('staff-search').value='';staffStatus('');}
function roleText(role){return roleNames[role]||role;}
function fmtDate(value){return new Date(value).toLocaleDateString('fr-FR');}
async function loadStaff(){
 if(!staffActor||!client)return;
 const generation=++staffGeneration, actor=staffActor;
 staffStatus('Chargement des membres…');$('staff-prev').disabled=true;$('staff-next').disabled=true;
 try{
 const {data,error}=await client.rpc('academy_staff_dashboard',{p_search:$('staff-search').value.trim(),p_offset:staffOffset});
 if(generation!==staffGeneration||actor!==staffActor)return;
 if(error||!data)throw error||new Error();
 staffTotal=Number(data.total)||0;
 if(staffOffset>=staffTotal&&staffOffset>0){staffOffset=Math.max(0,Math.floor((staffTotal-1)/50)*50);return loadStaff();}
 $('staff-counts').replaceChildren();
 const counts=data.counts||{};
 for(const [name,val] of [['Inscrits',Object.values(counts).reduce((s,n)=>s+Number(n),0)],['Membres',counts.member||0],['Rédacteurs',counts.contributor||0],['Direction',Number(counts.admin||0)+Number(counts.owner||0)]]){
 const box=el('div');box.append(el('small',name),el('strong',String(val)));$('staff-counts').append(box);
 }
 $('staff-members').replaceChildren();
 for(const m of data.members||[]){
 const row=el('div',undefined,'staff-member'), info=el('div',undefined,'staff-info');
 info.append(el('strong',m.pseudo),el('span',roleText(m.role)+' · Depuis le '+fmtDate(m.created_at),'hint'));row.append(info);
 const editable=m.id!==actor.id&&m.role!=='owner'&&(actor.role==='owner'||m.role!=='admin');
 if(editable){
 const controls=el('div',undefined,'staff-controls'), select=el('select');select.setAttribute('aria-label','Rôle de '+m.pseudo);
 for(const r of actor.role==='owner'?['member','contributor','admin']:['member','contributor']){const o=el('option',roleText(r));o.value=r;select.append(o);}select.value=m.role;
 const save=el('button','Valider');save.type='button';save.disabled=true;select.addEventListener('change',()=>save.disabled=select.value===m.role);
 save.addEventListener('click',async()=>{
 if(actor!==staffActor)return;
 const next=select.value;if(next===m.role||!window.confirm('Attribuer à '+m.pseudo+' le rôle '+roleText(next)+' ?'))return;
 select.disabled=true;save.disabled=true;
 try{const {error}=await client.rpc('academy_staff_set_role',{p_target:m.id,p_expected:m.role,p_new:next});if(error)throw error;if(actor===staffActor){await loadStaff();staffStatus('Rôle enregistré.');}}
 catch{if(actor===staffActor)staffStatus('Modification refusée ou indisponible. Actualise la liste.');select.disabled=false;save.disabled=false;}
 });
 controls.append(select,save);row.append(controls);
 }else row.append(el('span',m.id===actor.id?'Ton compte':'Rôle protégé','hint'));
 $('staff-members').append(row);
 }
 if(!data.members?.length)$('staff-members').append(el('p','Aucun membre trouvé.','hint'));
 $('staff-history').replaceChildren();
 for(const h of data.history||[])$('staff-history').append(el('p',fmtDate(h.created_at)+' · '+h.actor+' : '+h.target+' — '+roleText(h.old_role)+' → '+roleText(h.new_role),'hint'));
 if(!data.history?.length)$('staff-history').append(el('p','Aucun changement depuis l’ouverture du panneau.','hint'));
 $('staff-prev').disabled=staffOffset===0;$('staff-next').disabled=staffOffset+50>=staffTotal;
 $('staff-page').textContent=staffTotal?(staffOffset+1)+'–'+Math.min(staffOffset+50,staffTotal)+' / '+staffTotal:'0 résultat';
 staffStatus(staffTotal+' membre(s) trouvé(s).');
 }catch{if(generation===staffGeneration){$('staff-members').replaceChildren();$('staff-history').replaceChildren();$('staff-counts').replaceChildren();staffStatus('Administration inaccessible. Actualise la page ou reconnecte-toi.');}}
}
$('staff-search-form').addEventListener('submit',e=>{e.preventDefault();staffOffset=0;loadStaff();});
$('staff-refresh').addEventListener('click',()=>loadStaff());
$('staff-prev').addEventListener('click',()=>{staffOffset=Math.max(0,staffOffset-50);loadStaff();});
$('staff-next').addEventListener('click',()=>{if(staffOffset+50<staffTotal){staffOffset+=50;loadStaff();}});

let editorialActor=null, editorialGeneration=0, editorialQueue=false, editorialOffset=0, editorialEditing=null, editorialMore=false;
const editorialStatus=t=>{$('editorial-status').textContent=t;};
const editorialKinds={article:'Article',opinion:'Éclairage complémentaire',correction:'Correction'};
const editorialStatuses={draft:'Brouillon',submitted:'En attente de validation',changes:'Corrections demandées',approved:'Validé (non publié)',rejected:'Refusé'};
function resetEditorial(){editorialGeneration++;editorialActor=null;editorialQueue=false;editorialOffset=0;editorialEditing=null;editorialMore=false;show('editorial-panel',false);show('editorial-form',false);$('editorial-list').replaceChildren();$('editorial-form').reset();editorialStatus('');}
function openEditorial(item=null){editorialEditing=item;const f=$('editorial-form');f.reset();$('editorial-form-title').textContent=item?'Modifier la contribution':'Nouvelle contribution';$('editorial-kind').value=item?.kind||'article';$('editorial-title').value=item?.title||'';$('editorial-target').value=item?.target_article||'';$('editorial-body').value=item?.body||'';show('editorial-form',true);f.scrollIntoView({block:'nearest'});}
async function loadEditorial(){
 if(!editorialActor||!client)return;
 const actor=editorialActor,generation=++editorialGeneration,queue=editorialQueue;
 $('editorial-mine').classList.toggle('secondary',queue);$('editorial-queue').classList.toggle('secondary',!queue);
 $('editorial-prev').disabled=true;$('editorial-next').disabled=true;
 editorialStatus('Chargement…');
 try{
 const {data,error}=await client.rpc('academy_editorial_list',{p_queue:queue,p_offset:editorialOffset});
 if(generation!==editorialGeneration||actor!==editorialActor)return;
 if(error||!data)throw error||new Error();
 const items=data.items||[];editorialMore=items.length===20;
 if(!items.length&&editorialOffset>0){editorialOffset=Math.max(0,editorialOffset-20);return loadEditorial();}
 const list=$('editorial-list');list.replaceChildren();
 for(const item of items){
 const card=el('details',undefined,'editorial-item'), summary=el('summary',item.title+' — '+editorialStatuses[item.status]);card.append(summary);
 card.append(el('p',editorialKinds[item.kind]+' · '+item.author+' · '+fmtDate(item.updated_at),'hint'));
 if(item.target_article)card.append(el('p','Article concerné : '+item.target_article,'hint'));
 card.append(el('div',item.body,'editorial-text'));
 if(item.feedback)card.append(el('p','Retour de la direction : '+item.feedback,'editorial-feedback'));
 if(!queue&&['draft','changes'].includes(item.status)){
 const edit=el('button','Modifier');edit.type='button';edit.addEventListener('click',()=>openEditorial(item));card.append(edit);
 }
 if(queue&&item.author_id!==actor.id){
 const review=el('textarea');review.rows=3;review.maxLength=2000;review.placeholder='Retour au rédacteur (obligatoire pour une correction ou un refus)';review.setAttribute('aria-label','Retour au rédacteur');
 const controls=el('div',undefined,'editorial-tabs');
 for(const [decision,label] of [['approved','Valider'],['changes','Demander une correction'],['rejected','Refuser']]){
 const b=el('button',label,decision==='approved'?'':'secondary');b.type='button';
 b.addEventListener('click',async()=>{
 if(actor!==editorialActor)return;
 if(decision!=='approved'&&!review.value.trim()){editorialStatus('Indique un motif.');review.focus();return;}
 if(!window.confirm(label+' : '+item.title+' ?'))return;
 const buttons=controls.querySelectorAll('button');buttons.forEach(x=>x.disabled=true);
 try{const {error}=await client.rpc('academy_editorial_review',{p_id:item.id,p_revision:item.revision,p_decision:decision,p_feedback:review.value.trim()});if(error)throw error;if(actor===editorialActor){await loadEditorial();editorialStatus('Décision enregistrée.');}}
 catch{if(actor===editorialActor)editorialStatus('Décision refusée ou version obsolète. Actualise la liste.');buttons.forEach(x=>x.disabled=false);}
 });controls.append(b);
 }card.append(review,controls);
 }else if(queue)card.append(el('p','Un autre administrateur doit examiner ton texte.','hint'));
 list.append(card);
 }
 if(!items.length)list.append(el('p',queue?'Aucun texte à modérer.':'Aucune contribution. Crée ton premier texte !','hint'));
 $('editorial-page').textContent=items.length?(editorialOffset+1)+'–'+(editorialOffset+items.length):'0';
 $('editorial-prev').disabled=editorialOffset===0;$('editorial-next').disabled=!editorialMore;
 editorialStatus(queue?'Contributions à examiner.':'Tes contributions.');
 }catch{if(generation===editorialGeneration){$('editorial-list').replaceChildren();editorialStatus('Bureau indisponible. Réessaie ou reconnecte-toi.');}}
}
function changeEditorialTab(queue){if(!$('editorial-form').hidden&&!window.confirm('Fermer le formulaire ? Les modifications non enregistrées seront perdues.'))return;show('editorial-form',false);editorialEditing=null;editorialQueue=queue;editorialOffset=0;loadEditorial();}
$('editorial-mine').addEventListener('click',()=>changeEditorialTab(false));
$('editorial-queue').addEventListener('click',()=>changeEditorialTab(true));
$('editorial-new').addEventListener('click',()=>{if(!$('editorial-form').hidden&&!window.confirm('Abandonner les modifications non enregistrées ?'))return;openEditorial();});
$('editorial-cancel').addEventListener('click',()=>{if(window.confirm('Fermer sans enregistrer les modifications ?')){show('editorial-form',false);editorialEditing=null;}});
$('editorial-prev').addEventListener('click',()=>{editorialOffset=Math.max(0,editorialOffset-20);loadEditorial();});
$('editorial-next').addEventListener('click',()=>{if(editorialMore){editorialOffset+=20;loadEditorial();}});
$('editorial-form').addEventListener('submit',async e=>{
 e.preventDefault();if(!editorialActor||!client)return;
 const actor=editorialActor,form=e.currentTarget,submit=e.submitter?.value==='submit',kind=$('editorial-kind').value,target=$('editorial-target').value.trim();
 if(kind!=='article'&&!target){editorialStatus('Indique l’article concerné.');$('editorial-target').focus();return;}
 if(submit&&!window.confirm('Envoyer ce texte à la direction pour validation ?'))return;
 const payload={p_id:editorialEditing?.id||null,p_revision:editorialEditing?.revision||null,p_kind:kind,p_title:$('editorial-title').value.trim(),p_target:target,p_body:$('editorial-body').value.trim(),p_submit:submit};
 busy(form,true);
 try{const {error}=await client.rpc('academy_editorial_save',payload);if(error)throw error;if(actor===editorialActor){show('editorial-form',false);form.reset();editorialEditing=null;editorialQueue=false;editorialOffset=0;await loadEditorial();editorialStatus(submit?'Contribution envoyée.':'Brouillon enregistré.');}}
 catch{if(actor===editorialActor)editorialStatus('Enregistrement impossible. Vérifie les champs ou actualise la liste.');}
 finally{busy(form,false);}
});

start();
