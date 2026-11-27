-- Académie : grades pédagogiques et points. Version d'essai : barèmes et seuils modifiables, points réinitialisables.
-- Les points sont décidés par PostgreSQL : le navigateur ne peut demander que des actions autorisées, une fois par référence, avec plafond quotidien.
begin;
create table db_internal.grade_levels (
  rank integer primary key check (rank >= 1),
  name text not null,
  min_points integer not null unique check (min_points >= 0),
  tagline text not null default ''
);
create table db_internal.point_rules (
  kind text primary key,
  points integer not null check (points > 0),
  daily_cap integer check (daily_cap is null or daily_cap > 0),
  client_allowed boolean not null default false,
  label text not null
);
create table db_internal.point_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null references db_internal.point_rules(kind),
  ref text not null check (char_length(ref) between 1 and 120),
  points integer not null,
  created_at timestamptz not null default now(),
  unique (user_id, kind, ref)
);
create index point_events_user_idx on db_internal.point_events (user_id, created_at desc);
alter table db_internal.grade_levels enable row level security;
alter table db_internal.point_rules enable row level security;
alter table db_internal.point_events enable row level security;
revoke all on db_internal.grade_levels, db_internal.point_rules, db_internal.point_events from public, anon, authenticated;

insert into db_internal.grade_levels(rank,name,min_points,tagline) values
 (1,'Badaud',0,'Tu passais par là.'),
 (2,'École de la Tortue',40,'Premier entraînement.'),
 (3,'Ruban rouge',100,'Tu t''engages.'),
 (4,'Tour Karin',200,'L''ascension commence.'),
 (5,'Sanctuaire',350,'Tu rencontres Dieu.'),
 (6,'Kaiô',550,'Le chemin du Serpent est derrière toi.'),
 (7,'Super Saiyan',800,'Quelque chose s''est éveillé.'),
 (8,'Salle de l''Esprit et du Temps',1100,'Une année en un jour.'),
 (9,'Super Saiyan 2',1500,'Au-delà du premier palier.');
insert into db_internal.point_rules(kind,points,daily_cap,client_allowed,label) values
 ('signup',20,null,false,'Inscription à l''académie'),
 ('read',15,60,true,'Lire un dossier jusqu''au bout (une fois par dossier)'),
 ('prediction',10,30,true,'Tenter une prédiction avant la scène (une fois par dossier)'),
 ('comment',5,15,false,'Commentaire approuvé par la modération');

-- Attribution interne : une fois par (utilisateur, type, référence), avec plafond par jour.
create function db_internal.points_add(p_user uuid, p_kind text, p_ref text) returns integer
language plpgsql security definer set search_path = '' as $$
declare r db_internal.point_rules%rowtype; today integer; give integer;
begin
  select * into r from db_internal.point_rules where kind = p_kind;
  if not found or p_user is null or p_ref is null then return 0; end if;
  if not exists (select 1 from public.db_profiles where id = p_user) then return 0; end if;
  give := r.points;
  if r.daily_cap is not null then
    select coalesce(sum(points),0) into today from db_internal.point_events
      where user_id = p_user and kind = p_kind and created_at >= date_trunc('day', now());
    give := least(r.points, greatest(0, r.daily_cap - today));
  end if;
  if give <= 0 then return 0; end if;
  insert into db_internal.point_events(user_id,kind,ref,points) values (p_user,p_kind,left(p_ref,120),give)
    on conflict (user_id,kind,ref) do nothing;
  if not found then return 0; end if;
  return give;
end $$;

create function db_internal.progress(p_user uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare earned integer; bal integer; cur db_internal.grade_levels%rowtype; nxt db_internal.grade_levels%rowtype;
begin
  select coalesce(sum(points) filter (where points > 0),0), coalesce(sum(points),0) into earned, bal
    from db_internal.point_events where user_id = p_user;
  select * into cur from db_internal.grade_levels where min_points <= earned order by rank desc limit 1;
  select * into nxt from db_internal.grade_levels where rank = cur.rank + 1;
  return jsonb_build_object(
    'earned', earned, 'balance', bal,
    'grade', jsonb_build_object('rank',cur.rank,'name',cur.name,'tagline',cur.tagline,'min',cur.min_points),
    'next', case when nxt.rank is null then null else jsonb_build_object('rank',nxt.rank,'name',nxt.name,'min',nxt.min_points) end,
    'grades', (select coalesce(jsonb_agg(jsonb_build_object('rank',rank,'name',name,'min',min_points) order by rank),'[]'::jsonb) from db_internal.grade_levels),
    'rules', (select coalesce(jsonb_agg(jsonb_build_object('kind',kind,'points',points,'cap',daily_cap,'label',label) order by points desc, kind),'[]'::jsonb) from db_internal.point_rules),
    'recent', (select coalesce(jsonb_agg(jsonb_build_object('kind',kind,'points',points,'at',created_at) order by created_at desc),'[]'::jsonb)
               from (select kind,points,created_at from db_internal.point_events where user_id = p_user order by created_at desc limit 8) e));
end $$;

create function db_internal.award(p_kind text, p_ref text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid(); give integer; ref text := btrim(coalesce(p_ref,''));
begin
  if actor is null then raise exception 'Connexion requise' using errcode='42501'; end if;
  if not exists (select 1 from db_internal.point_rules where kind = p_kind and client_allowed) then
    raise exception 'Action non autorisée' using errcode='42501';
  end if;
  if ref !~ '^/[A-Za-z0-9_./~-]{1,100}$' or ref like '%..%' then raise exception 'Référence invalide' using errcode='22023'; end if;
  ref := regexp_replace(regexp_replace(ref, 'index\.html$', ''), '/+$', '') || '/';
  give := db_internal.points_add(actor, p_kind, ref);
  return jsonb_build_object('granted', give) || db_internal.progress(actor);
end $$;

create function db_internal.my_progress() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Connexion requise' using errcode='42501'; end if;
  return db_internal.progress(auth.uid());
end $$;

-- Réinitialisation réservée au fondateur : efface les points puis redonne le bonus d'inscription.
create function db_internal.points_reset() returns void
language plpgsql security definer set search_path = '' as $$
declare u uuid;
begin
  if db_internal.staff_role() is distinct from 'owner' then raise exception 'Réservé au fondateur' using errcode='42501'; end if;
  delete from db_internal.point_events where true;
  for u in select id from public.db_profiles loop perform db_internal.points_add(u,'signup','-'); end loop;
end $$;

-- Déclencheurs : l'inscription et l'approbation d'un commentaire rapportent des points sans passer par le navigateur.
create function db_internal.trg_points_signup() returns trigger language plpgsql security definer set search_path = '' as $$
begin perform db_internal.points_add(new.id,'signup','-'); return new; end $$;
create trigger db_points_signup after insert on public.db_profiles for each row execute function db_internal.trg_points_signup();
create function db_internal.trg_points_comment() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'approved' and old.status is distinct from 'approved' then perform db_internal.points_add(new.author_id,'comment',new.id::text); end if;
  return new;
end $$;
create trigger db_points_comment after update of status on public.academy_comments for each row execute function db_internal.trg_points_comment();

do $$ declare u uuid; begin for u in select id from public.db_profiles loop perform db_internal.points_add(u,'signup','-'); end loop; end $$;

create function public.academy_award(p_kind text, p_ref text) returns jsonb language sql security invoker set search_path = '' as $$ select db_internal.award(p_kind,p_ref) $$;
create function public.academy_progress() returns jsonb language sql stable security invoker set search_path = '' as $$ select db_internal.my_progress() $$;
create function public.academy_points_reset() returns void language sql security invoker set search_path = '' as $$ select db_internal.points_reset() $$;
revoke all on function db_internal.points_add(uuid,text,text), db_internal.progress(uuid), db_internal.trg_points_signup(), db_internal.trg_points_comment() from public, anon, authenticated;
revoke all on function db_internal.award(text,text), db_internal.my_progress(), db_internal.points_reset(), public.academy_award(text,text), public.academy_progress(), public.academy_points_reset() from public, anon, authenticated;
grant execute on function db_internal.award(text,text), db_internal.my_progress(), db_internal.points_reset(), public.academy_award(text,text), public.academy_progress(), public.academy_points_reset() to authenticated;
commit;
