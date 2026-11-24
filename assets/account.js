import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './account-config.js';
const $=id=>document.getElementById(id);
const show=(id,visible)=>{$(id).hidden=!visible;};
const notice=message=>{$('status').textContent=message;};
let client,mode='signin',recovery=false;
const roleNames={member:'Membre de l’académie',contributor:'Rédacteur / contributeur',admin:'Administrateur',owner:'Fondateur'};
function setMode(next){mode=next;show('pseudo-row',next==='signup');$('pseudo').required=next==='signup';show('password-row',next!=='reset');$('password').required=next!=='reset';$('password').autocomplete=next==='signup'?'new-password':'current-password';$('auth-title').textContent={signin:'Connexion',signup:'Créer mon compte',reset:'Réinitialiser mon mot de passe'}[next];$('auth-submit').textContent={signin:'Se connecter',signup:'Créer mon compte',reset:'Envoyer le lien'}[next];document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===next)));}
function busy(form,value){form.querySelectorAll('button,input').forEach(el=>el.disabled=value);}
async function render(session){resetStaff();show('auth',!session&&!recovery);show('recovery',recovery);show('profile',!!session&&!recovery);if(recovery||!session)return;const {data,error}=await client.from('db_profiles').select('pseudo,role').eq('id',session.user.id).single();if(error||!data){notice('Profil indisponible. Contacte un administrateur.');$('profile-name').textContent='Profil indisponible';$('profile-role').textContent='';$('edit-pseudo').value='';return;}$('profile-name').textContent=data.pseudo;$('edit-pseudo').value=data.pseudo;$('profile-role').textContent=roleNames[data.role]||roleNames.member;notice('Bienvenue dans ton espace personnel.');if(['owner','admin'].includes(data.role)){staffActor={id:session.user.id,role:data.role};show('staff-panel',true);$('staff-description').textContent=data.role==='owner'?'Tu peux gérer tous les rôles, sauf celui de fondateur.':'Tu peux gérer les membres et les contributeurs. Le fondateur nomme les administrateurs.';loadStaff();}}
async function start(){if(!SUPABASE_URL||!SUPABASE_PUBLISHABLE_KEY){notice('Prototype : les comptes ne sont pas encore activés.');return;}try{const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.1/+esm');client=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{flowType:"pkce"}});setMode('signin');client.auth.onAuthStateChange((event,session)=>{if(event==='PASSWORD_RECOVERY')recovery=true;if(event==='SIGNED_OUT')recovery=false;setTimeout(()=>render(session).catch(()=>notice('Impossible de charger le profil.')),0);});const {error}=await client.auth.getSession();if(error)throw error;notice('Connecte-toi avec GitHub pour rejoindre l’académie.');}catch{notice('Service de connexion indisponible. Réessaie plus tard.');}}
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{setMode(b.dataset.mode);notice('');}));
$('auth-form').addEventListener('submit',async e=>{e.preventDefault();if(!client)return;const form=e.currentTarget;const email=$('email').value.trim(),password=$('password').value,pseudo=$('pseudo').value.trim();busy(form,true);try{const redirectTo=location.origin+'/compte.html';let result;if(mode==='signup'){result=await client.auth.signUp({email,password,options:{data:{pseudo},emailRedirectTo:redirectTo}});if(!result.error&&!result.data.session)notice('Consulte tes e-mails pour confirmer ton inscription.');}else if(mode==='reset'){result=await client.auth.resetPasswordForEmail(email,{redirectTo});if(!result.error)notice('Si ce compte existe, un lien sera envoyé.');}else result=await client.auth.signInWithPassword({email,password});if(result.error)notice('Opération impossible. Vérifie tes informations ou réessaie plus tard.');}catch{notice('Erreur de connexion. Réessaie plus tard.');}finally{busy(form,false);$('password').value='';}});
$('recovery-form').addEventListener('submit',async e=>{e.preventDefault();if(!client||!recovery)return;busy(e.currentTarget,true);try{const {error}=await client.auth.updateUser({password:$('new-password').value});if(error){notice('Impossible de modifier le mot de passe.');return;}recovery=false;$('new-password').value='';const {data}=await client.auth.getSession();await render(data.session);notice('Mot de passe modifié.');}catch{notice('Erreur de connexion.');}finally{busy($('recovery-form'),false);}});
$('profile-form').addEventListener('submit',async e=>{e.preventDefault();if(!client)return;busy(e.currentTarget,true);try{const {data:{user}}=await client.auth.getUser();if(!user)throw new Error();const pseudo=$('edit-pseudo').value.trim();const {error}=await client.from('db_profiles').update({pseudo}).eq('id',user.id).select('id').single();if(error)throw error;$('profile-name').textContent=pseudo;notice('Pseudo enregistré.');}catch{notice('Impossible d’enregistrer le pseudo.');}finally{busy($('profile-form'),false);}});
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

start();