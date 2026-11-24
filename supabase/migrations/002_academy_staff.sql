-- Administration de l'académie : les droits sont contrôlés par PostgreSQL.
create table db_internal.role_history (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  target_id uuid references auth.users(id) on delete set null,
  old_role text not null,
  new_role text not null,
  created_at timestamptz not null default now()
);
alter table db_internal.role_history enable row level security;
revoke all on db_internal.role_history from public, anon, authenticated;
grant usage on schema db_internal to authenticated;

create function db_internal.staff_role() returns text
language sql stable security definer set search_path = '' as $$
  select p.role from public.db_profiles p
  where p.id = (select auth.uid())
    and p.role in ('owner','admin')
    and exists (select 1 from auth.sessions s where s.user_id=p.id
      and s.id::text = (select auth.jwt()->>'session_id')
      and (s.not_after is null or s.not_after > now()))
$$;

create function db_internal.staff_dashboard(p_search text default '', p_offset integer default 0)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare out_data jsonb;
begin
  if db_internal.staff_role() is null then
    raise exception 'Accès réservé à la direction' using errcode='42501';
  end if;
  select jsonb_build_object(
    'members',coalesce((select jsonb_agg(to_jsonb(x)) from (
      select p.id,p.pseudo,p.role,p.created_at from public.db_profiles p
      where position(lower(left(coalesce(p_search,''),40)) in lower(p.pseudo)) > 0
      order by p.created_at desc,p.id limit 50 offset greatest(0,coalesce(p_offset,0))
    ) x),'[]'::jsonb),
    'total',(select count(*) from public.db_profiles p where position(lower(left(coalesce(p_search,''),40)) in lower(p.pseudo)) > 0),
    'counts',(select coalesce(jsonb_object_agg(x.role,x.n),'{}'::jsonb) from (select role,count(*) n from public.db_profiles group by role) x),
    'history',coalesce((select jsonb_agg(to_jsonb(h)) from (
      select coalesce(a.pseudo,'Compte supprimé') as actor, coalesce(t.pseudo,'Compte supprimé') as target,
             r.old_role,r.new_role,r.created_at
      from db_internal.role_history r left join public.db_profiles a on a.id=r.actor_id
      left join public.db_profiles t on t.id=r.target_id order by r.id desc limit 20
    ) h),'[]'::jsonb)
  ) into out_data;
  return out_data;
end $$;

create function db_internal.staff_set_role(p_target uuid,p_expected text,p_new text) returns void
language plpgsql security definer set search_path = '' as $$
declare caller text; previous text; actor uuid := auth.uid();
begin
  if actor is null or p_target is null or actor=p_target or p_new is null
     or p_new not in ('member','contributor','admin') then
    raise exception 'Modification interdite' using errcode='42501';
  end if;
  -- Serialize changes to the actor and target, including concurrent demotions.
  perform 1 from public.db_profiles where id in (actor,p_target) order by id for update;
  caller := db_internal.staff_role();
  if caller is null then raise exception 'Accès réservé à la direction' using errcode='42501'; end if;
  select role into previous from public.db_profiles where id=p_target;
  if previous is null or previous='owner' or (caller='admin' and (previous='admin' or p_new='admin')) then
    raise exception 'Modification interdite' using errcode='42501';
  end if;
  if previous is distinct from p_expected then raise exception 'Le rôle a changé. Actualise la liste.' using errcode='40001'; end if;
  if previous=p_new then return; end if;
  update public.db_profiles set role=p_new where id=p_target;
  insert into db_internal.role_history(actor_id,target_id,old_role,new_role) values(actor,p_target,previous,p_new);
end $$;

revoke all on function db_internal.staff_role(), db_internal.staff_dashboard(text,integer), db_internal.staff_set_role(uuid,text,text) from public,anon,authenticated;
grant execute on function db_internal.staff_dashboard(text,integer), db_internal.staff_set_role(uuid,text,text) to authenticated;

create function public.academy_staff_dashboard(p_search text default '',p_offset integer default 0)
returns jsonb language sql stable security invoker set search_path = '' as $$
 select db_internal.staff_dashboard(p_search,p_offset)
$$;
create function public.academy_staff_set_role(p_target uuid,p_expected text,p_new text)
returns void language sql security invoker set search_path = '' as $$
 select db_internal.staff_set_role(p_target,p_expected,p_new)
$$;
revoke all on function public.academy_staff_dashboard(text,integer),public.academy_staff_set_role(uuid,text,text) from public,anon,authenticated;
grant execute on function public.academy_staff_dashboard(text,integer),public.academy_staff_set_role(uuid,text,text) to authenticated;
