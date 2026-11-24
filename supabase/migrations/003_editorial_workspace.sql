alter table public.db_profiles add column bio text not null default '' check(char_length(bio)<=1200), add column specialties text not null default '' check(char_length(specialties)<=200);
grant update(bio,specialties) on public.db_profiles to authenticated;
create table db_internal.editorial_items (
 id uuid primary key default gen_random_uuid(),
 author_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check(kind in ('article','opinion','correction')),
 title text not null check(char_length(btrim(title)) between 3 and 180),
 target_article text not null default '' check(char_length(target_article)<=250),
 body text not null check(char_length(btrim(body)) between 1 and 30000),
 status text not null default 'draft' check(status in ('draft','submitted','changes','approved','rejected')),
 feedback text not null default '' check(char_length(feedback)<=2000),
 reviewer_id uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 revision integer not null default 1
);
alter table db_internal.editorial_items enable row level security;
revoke all on db_internal.editorial_items from public,anon,authenticated;
create index editorial_author_idx on db_internal.editorial_items(author_id,updated_at desc);
create index editorial_queue_idx on db_internal.editorial_items(status,updated_at desc);
create function db_internal.editorial_role() returns text language sql stable security definer set search_path='' as $$
 select p.role from public.db_profiles p where p.id=(select auth.uid()) and p.role in ('owner','admin','contributor') and exists(select 1 from auth.sessions s where s.user_id=p.id and s.id::text=(select auth.jwt()->>'session_id') and (s.not_after is null or s.not_after>now()))
$$;
create function db_internal.editorial_list(p_queue boolean,p_offset integer) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare r text:=db_internal.editorial_role(); result jsonb;
begin
 if r is null or (coalesce(p_queue,false) and r not in ('owner','admin')) then raise exception 'Accès interdit' using errcode='42501'; end if;
 select jsonb_build_object('items',coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb)) into result from (
 select e.id,e.kind,e.title,e.target_article,e.body,e.status,e.feedback,e.revision,e.updated_at,e.author_id,p.pseudo as author
 from db_internal.editorial_items e join public.db_profiles p on p.id=e.author_id
 where (not coalesce(p_queue,false) and e.author_id=auth.uid()) or (coalesce(p_queue,false) and e.status='submitted')
 order by e.updated_at desc,e.id limit 20 offset greatest(0,coalesce(p_offset,0))) x;
 return result;
end $$;
create function db_internal.editorial_save(p_id uuid,p_revision integer,p_kind text,p_title text,p_target text,p_body text,p_submit boolean) returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); item db_internal.editorial_items%rowtype; result uuid;
begin
 perform 1 from public.db_profiles where id=actor for update;
 if db_internal.editorial_role() is null then raise exception 'Accès interdit' using errcode='42501'; end if;
 if p_kind not in ('article','opinion','correction') or (p_kind<>'article' and char_length(btrim(coalesce(p_target,'')))=0) then raise exception 'Article cible requis'; end if;
 if p_id is null then
 insert into db_internal.editorial_items(author_id,kind,title,target_article,body,status) values(actor,p_kind,btrim(p_title),btrim(coalesce(p_target,'')),btrim(p_body),case when p_submit then 'submitted' else 'draft' end) returning id into result;
 else
 select * into item from db_internal.editorial_items where id=p_id and author_id=actor for update;
 if not found or item.status not in ('draft','changes') then raise exception 'Modification interdite' using errcode='42501'; end if;
 if item.revision is distinct from p_revision then raise exception 'Version obsolète' using errcode='40001'; end if;
 update db_internal.editorial_items set kind=p_kind,title=btrim(p_title),target_article=btrim(coalesce(p_target,'')),body=btrim(p_body),status=case when p_submit then 'submitted' else item.status end,revision=revision+1,updated_at=now() where id=p_id returning id into result;
 end if; return result;
end $$;
create function db_internal.editorial_review(p_id uuid,p_revision integer,p_decision text,p_feedback text) returns void language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); item db_internal.editorial_items%rowtype;
begin
 perform 1 from public.db_profiles where id=actor for update;
 if coalesce(db_internal.editorial_role(),'') not in ('owner','admin') or p_decision is null or p_decision not in ('approved','changes','rejected') then raise exception 'Accès interdit' using errcode='42501'; end if;
 select * into item from db_internal.editorial_items where id=p_id for update;
 if not found or item.author_id=actor or item.status<>'submitted' then raise exception 'Validation interdite' using errcode='42501'; end if;
 if item.revision is distinct from p_revision then raise exception 'Version obsolète' using errcode='40001'; end if;
 if p_decision in ('changes','rejected') and btrim(coalesce(p_feedback,''))='' then raise exception 'Un motif est nécessaire'; end if;
 update db_internal.editorial_items set status=p_decision,feedback=btrim(coalesce(p_feedback,'')),reviewer_id=actor,revision=revision+1,updated_at=now() where id=p_id;
end $$;
revoke all on function db_internal.editorial_role(),db_internal.editorial_list(boolean,integer),db_internal.editorial_save(uuid,integer,text,text,text,text,boolean),db_internal.editorial_review(uuid,integer,text,text) from public,anon,authenticated;
grant execute on function db_internal.editorial_list(boolean,integer),db_internal.editorial_save(uuid,integer,text,text,text,text,boolean),db_internal.editorial_review(uuid,integer,text,text) to authenticated;
create function public.academy_editorial_list(p_queue boolean default false,p_offset integer default 0) returns jsonb language sql stable security invoker set search_path='' as $$select db_internal.editorial_list(p_queue,p_offset)$$;
create function public.academy_editorial_save(p_id uuid,p_revision integer,p_kind text,p_title text,p_target text,p_body text,p_submit boolean) returns uuid language sql security invoker set search_path='' as $$select db_internal.editorial_save(p_id,p_revision,p_kind,p_title,p_target,p_body,p_submit)$$;
create function public.academy_editorial_review(p_id uuid,p_revision integer,p_decision text,p_feedback text) returns void language sql security invoker set search_path='' as $$select db_internal.editorial_review(p_id,p_revision,p_decision,p_feedback)$$;
revoke all on function public.academy_editorial_list(boolean,integer),public.academy_editorial_save(uuid,integer,text,text,text,text,boolean),public.academy_editorial_review(uuid,integer,text,text) from public,anon,authenticated;
grant execute on function public.academy_editorial_list(boolean,integer),public.academy_editorial_save(uuid,integer,text,text,text,text,boolean),public.academy_editorial_review(uuid,integer,text,text) to authenticated;
