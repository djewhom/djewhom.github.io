-- Dragonballogie : comptes v1. Exécuter dans un nouveau projet Supabase de test.
begin;
create table public.db_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  pseudo text not null default 'Disciple' check (char_length(btrim(pseudo)) between 2 and 40),
  role text not null default 'member' check (role in ('member','contributor','admin','owner')),
  created_at timestamptz not null default now()
);
alter table public.db_profiles enable row level security;
revoke all on public.db_profiles from public, anon, authenticated;
grant select on public.db_profiles to authenticated;
grant update (pseudo) on public.db_profiles to authenticated;
grant select, insert, update, delete on public.db_profiles to service_role;
create policy "Lire uniquement son profil" on public.db_profiles for select to authenticated using ((select auth.uid()) = id);
create policy "Modifier uniquement son pseudo" on public.db_profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create function public.db_create_profile() returns trigger language plpgsql security definer set search_path = '' as $$
declare nom text;
begin
  nom := btrim(coalesce(new.raw_user_meta_data ->> 'pseudo',''));
  if char_length(nom) < 2 or char_length(nom) > 40 then nom := 'Disciple'; end if;
  insert into public.db_profiles(id,pseudo) values (new.id,nom);
  return new;
end;
$$;
revoke all on function public.db_create_profile() from public, anon, authenticated;
create trigger db_on_auth_user_created after insert on auth.users for each row execute function public.db_create_profile();

insert into public.db_profiles (id) select id from auth.users on conflict (id) do nothing;
commit;

-- Après inscription et validation de l'adresse du propriétaire, exécuter séparément
-- dans le SQL Editor (remplacer UUID_DU_COMPTE par son véritable UUID Auth).
-- update public.db_profiles set role='owner' where id='UUID_DU_COMPTE';
-- Pour un collègue : update public.db_profiles set role='contributor' where id='UUID_DU_COMPTE';
-- Ne jamais attribuer un rôle à partir des métadonnées fournies lors de l'inscription.
-- Les rôles seront utilisés par les futures politiques serveur des contributions et examens.
