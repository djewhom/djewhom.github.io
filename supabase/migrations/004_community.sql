alter table public.db_profiles add column avatar_style text not null default 'orange' check(avatar_style in ('orange','blue','green','purple','red','silver')), add column directory_opt_in boolean not null default false;
grant update(avatar_style,directory_opt_in) on public.db_profiles to authenticated;
create table public.academy_announcements (
 id uuid primary key default gen_random_uuid(),
 author_id uuid default auth.uid() references auth.users(id) on delete set null,
 title text not null check(char_length(btrim(title)) between 3 and 120),
 body text not null check(char_length(btrim(body)) between 1 and 4000),
 audience text not null default 'all' check(audience in ('all','team')),
 archived boolean not null default false,
 created_at timestamptz not null default now()
);
alter table public.academy_announcements enable row level security;
revoke all on public.academy_announcements from public,anon,authenticated;
grant select(id,title,body,audience,archived,created_at) on public.academy_announcements to authenticated;
grant insert(title,body,audience),update(archived) on public.academy_announcements to authenticated;
create policy "Read announcements" on public.academy_announcements for select to authenticated using (
 exists(select 1 from public.db_profiles p where p.id=(select auth.uid()) and ((not archived and (audience='all' or p.role in ('owner','admin','contributor'))) or p.role in ('owner','admin')))
);
create policy "Staff publish announcements" on public.academy_announcements for insert to authenticated with check (
 author_id=(select auth.uid()) and not archived and exists(select 1 from public.db_profiles p where p.id=(select auth.uid()) and p.role in ('owner','admin'))
);
create policy "Staff archive announcements" on public.academy_announcements for update to authenticated using (
 exists(select 1 from public.db_profiles p where p.id=(select auth.uid()) and p.role in ('owner','admin'))
) with check (
 exists(select 1 from public.db_profiles p where p.id=(select auth.uid()) and p.role in ('owner','admin'))
);
create index academy_announcements_date on public.academy_announcements(archived,created_at desc);
create function db_internal.community_directory(p_search text,p_offset integer) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 if auth.uid() is null or not exists(select 1 from public.db_profiles p where p.id=auth.uid()) or not exists(select 1 from auth.sessions s where s.user_id=auth.uid() and s.id::text=(select auth.jwt()->>'session_id') and (s.not_after is null or s.not_after>now())) then raise exception 'Accès réservé aux membres' using errcode='42501'; end if;
 select jsonb_build_object('items',coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb)) into result from (
 select pseudo,role,bio,specialties,avatar_style from public.db_profiles
 where directory_opt_in and position(lower(left(coalesce(p_search,''),40)) in lower(pseudo))>0
 order by lower(pseudo),id limit 30 offset greatest(0,coalesce(p_offset,0))
 ) x;
 return result;
end $$;
revoke all on function db_internal.community_directory(text,integer) from public,anon,authenticated;
grant execute on function db_internal.community_directory(text,integer) to authenticated;
create function public.academy_directory(p_search text default '',p_offset integer default 0) returns jsonb language sql stable security invoker set search_path='' as $$select db_internal.community_directory(p_search,p_offset)$$;
revoke all on function public.academy_directory(text,integer) from public,anon,authenticated;
grant execute on function public.academy_directory(text,integer) to authenticated;
