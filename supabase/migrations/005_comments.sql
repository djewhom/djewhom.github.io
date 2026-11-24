create table public.academy_comments (
 id uuid primary key default gen_random_uuid(),
 article_key text not null check(article_key in ('01','02','03','04','05','06','07')),
 parent_id uuid references public.academy_comments(id) on delete cascade,
 author_id uuid not null references auth.users(id) on delete cascade,
 author_name text not null,
 body text not null check(char_length(btrim(body)) between 1 and 2500),
 status text not null default 'pending' check(status in ('pending','approved','rejected','hidden')),
 created_at timestamptz not null default now(),
 published_at timestamptz,
 reviewer_id uuid references auth.users(id) on delete set null
);
alter table public.academy_comments enable row level security;
revoke all on public.academy_comments from public,anon,authenticated;
grant select(id,article_key,parent_id,author_name,body,created_at,published_at) on public.academy_comments to anon,authenticated;
create policy "Approved comments readable" on public.academy_comments for select to anon,authenticated using(status='approved');
create index academy_comments_feed on public.academy_comments(published_at desc,id) where status='approved';
create index academy_comments_article on public.academy_comments(article_key,published_at,id) where status='approved';
create index academy_comments_author on public.academy_comments(author_id,created_at desc);
create index academy_comments_parent on public.academy_comments(parent_id);
create index academy_comments_queue on public.academy_comments(created_at,id) where status='pending';

create function db_internal.comment_submit(p_article text,p_parent uuid,p_body text) returns uuid
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); name text; result uuid;
begin
 if actor is null or not exists(select 1 from auth.sessions s where s.user_id=actor and s.id::text=(select auth.jwt()->>'session_id') and (s.not_after is null or s.not_after>now())) then raise exception 'Connexion requise' using errcode='42501'; end if;
 select pseudo into name from public.db_profiles where id=actor for update;
 if not found then raise exception 'Profil requis' using errcode='42501'; end if;
 if (select count(*) from public.academy_comments where author_id=actor and created_at>now()-interval '1 hour')>=10 then raise exception 'Limite de commentaires atteinte'; end if;
 if p_parent is not null then
 perform 1 from public.academy_comments where id=p_parent and article_key=p_article and status='approved' and parent_id is null for update;
 if not found then raise exception 'Réponse indisponible'; end if;
 end if;
 insert into public.academy_comments(article_key,parent_id,author_id,author_name,body) values(p_article,p_parent,actor,name,btrim(p_body)) returning id into result;
 return result;
end $$;
create function db_internal.comment_queue(p_offset integer default 0) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 if db_internal.staff_role() is null then raise exception 'Accès interdit' using errcode='42501'; end if;
 select jsonb_build_object('items',coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb)) into result from (
 select id,article_key,parent_id,author_name,body,status,created_at from public.academy_comments where status='pending' order by created_at,id limit 30 offset greatest(0,coalesce(p_offset,0))) x;
 return result;
end $$;
create function db_internal.comment_moderate(p_id uuid,p_decision text) returns void
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); target public.academy_comments%rowtype;
begin
 perform 1 from public.db_profiles where id=actor for update;
 if db_internal.staff_role() is null or p_decision is null or p_decision not in ('approved','rejected','hidden') then raise exception 'Accès interdit' using errcode='42501'; end if;
 select * into target from public.academy_comments where id=p_id for update;
 if not found or (p_decision='hidden' and target.status<>'approved') or (p_decision<>'hidden' and target.status<>'pending') then raise exception 'Commentaire déjà traité'; end if;
 if p_decision='approved' and target.parent_id is not null then
 perform 1 from public.academy_comments where id=target.parent_id and status='approved' for update nowait;
 if not found then raise exception 'Commentaire parent indisponible'; end if;
 end if;
 update public.academy_comments set status=p_decision,reviewer_id=actor,published_at=case when p_decision='approved' then now() else published_at end where id=p_id;
 if p_decision='hidden' then update public.academy_comments set status='hidden',reviewer_id=actor where parent_id=p_id and status in ('approved','pending'); end if;
end $$;
revoke all on function db_internal.comment_submit(text,uuid,text),db_internal.comment_queue(integer),db_internal.comment_moderate(uuid,text) from public,anon,authenticated;
grant execute on function db_internal.comment_submit(text,uuid,text),db_internal.comment_queue(integer),db_internal.comment_moderate(uuid,text) to authenticated;
create function public.academy_comment_submit(p_article text,p_parent uuid,p_body text) returns uuid language sql security invoker set search_path='' as $$select db_internal.comment_submit(p_article,p_parent,p_body)$$;
create function public.academy_comment_queue(p_offset integer default 0) returns jsonb language sql stable security invoker set search_path='' as $$select db_internal.comment_queue(p_offset)$$;
create function public.academy_comment_moderate(p_id uuid,p_decision text) returns void language sql security invoker set search_path='' as $$select db_internal.comment_moderate(p_id,p_decision)$$;
revoke all on function public.academy_comment_submit(text,uuid,text),public.academy_comment_queue(integer),public.academy_comment_moderate(uuid,text) from public,anon,authenticated;
grant execute on function public.academy_comment_submit(text,uuid,text),public.academy_comment_queue(integer),public.academy_comment_moderate(uuid,text) to authenticated;
