-- FuNPaY v2.18: KYC ও অ্যাডমিন অ্যাপের সংযোগ (v2.17 এর কাজও এতে আছে, তাই v2.17 আলাদা চালাতে হবে না)
-- Supabase > SQL Editor এ পুরোটা পেস্ট করে একবার Run দিন (আবার চালালেও সমস্যা নেই)।
--
-- আগে শুধু update-v2.15.sql (অ্যাডমিন অ্যাপের ডাটাবেস) চালানো থাকতে হবে। update-v2.17.sql চালিয়ে থাকলেও সমস্যা নেই, এটা মিলিয়ে নেবে।
--
-- এটা যা ঠিক করে:
--   * admins: v2.17 এ নাম/level ছিল না, v2.15 এ note ছিল না। দুটোই একসঙ্গে রাখে।
--   * notices: দুই ফাইলে দুই রকম টেবিল ছিল (user_id বনাম target_id), তাই v2.15 এর পরে v2.17 চালালে ভুল আসত। এক করে দেয়।
--   * ইউজার অ্যাপ নোটিশ পড়তে পারত না (অ্যাডমিন ছাড়া কারো পড়ার নিয়ম ছিল না), সেটা চালু করে।
--   * KYC একসেপ্ট/বাতিল অডিট লগে ওঠে।
--   * KYC তালিকায় নাম/নম্বর/NID দিয়ে খোঁজা যায়।

-- ০) আগের ধাপ চালানো আছে কিনা দেখে নেওয়া
do $$
begin
  if to_regprocedure('public._audit(text,text,jsonb)') is null or to_regclass('public.audit_log') is null
     or to_regprocedure('public._is_admin()') is null or to_regclass('public.admins') is null then
    raise exception 'আগে update-v2.15.sql চালান (অ্যাডমিন সিস্টেম নেই)';
  end if;
end $$;

-- ১) প্রোফাইলে KYC অবস্থা
alter table public.profiles add column if not exists kyc_status text not null default 'approved';
alter table public.profiles add column if not exists kyc_reason text;
alter table public.profiles alter column kyc_status set default 'none';
alter table public.profiles drop constraint if exists profiles_kyc_status_chk;
alter table public.profiles add constraint profiles_kyc_status_chk check (kyc_status in ('none','pending','approved','rejected'));

-- ২) KYC আবেদন
create table if not exists public.kyc_requests (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  phone text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  name text, father_name text, dob text, nid_no text, address text,
  front_path text, back_path text, selfie_path text,
  reject_reason text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists kyc_status_idx on public.kyc_requests(status, created_at desc);
create index if not exists kyc_user_idx on public.kyc_requests(user_id, created_at desc);
create unique index if not exists kyc_nid_approved on public.kyc_requests(nid_no) where status = 'approved';
alter table public.kyc_requests enable row level security;
-- কোনো policy নেই: অ্যাপ সরাসরি পড়তে পারে না। শুধু নিচের ফাংশন দিয়ে চলে।


-- ৩) অ্যাডমিন তালিকা: দুই ফাইলের কলাম একসঙ্গে
alter table public.admins add column if not exists name text not null default '';
alter table public.admins add column if not exists level text not null default 'staff';
alter table public.admins add column if not exists created_at timestamptz not null default now();
alter table public.admins add column if not exists note text;
alter table public.admins drop constraint if exists admins_level_check;
alter table public.admins add constraint admins_level_check check (level in ('owner', 'staff'));

-- শুধু v2.17 এর নিয়মে (note দিয়ে) অ্যাডমিন বানালে কেউই owner থাকে না। সেক্ষেত্রে সবচেয়ে পুরনো অ্যাডমিনকে owner করা হয়।
update public.admins set level = 'owner'
 where user_id = (select a.user_id from public.admins a order by a.created_at, a.user_id limit 1)
   and not exists (select 1 from public.admins x where x.level = 'owner');

create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists(select 1 from public.admins where user_id = auth.uid());
$$;

-- ৪) নোটিশ: দুই রকম টেবিল এক করা
create table if not exists public.notices (
  id serial primary key,
  title text not null,
  body text not null default '',
  kind text not null default 'info',
  popup boolean not null default false,
  audience text not null default 'all',
  target_id uuid references public.profiles(id) on delete cascade,
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.notices add column if not exists popup boolean not null default false;
alter table public.notices add column if not exists audience text not null default 'all';
alter table public.notices add column if not exists target_id uuid references public.profiles(id) on delete cascade;
alter table public.notices add column if not exists active boolean not null default true;
alter table public.notices add column if not exists starts_at timestamptz;
alter table public.notices add column if not exists ends_at timestamptz;

-- v2.17 এর পুরনো নোটিশ (user_id) থাকলে target_id তে সরিয়ে নেওয়া
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'notices' and column_name = 'user_id') then
    update public.notices set target_id = user_id where target_id is null;
    drop policy if exists "own notices" on public.notices;
    alter table public.notices drop column user_id;
  end if;
end $$;

alter table public.notices drop constraint if exists notices_kind_check;
alter table public.notices add constraint notices_kind_check
  check (kind in ('info', 'success', 'warn', 'offer', 'kyc_ok', 'kyc_no'));
alter table public.notices drop constraint if exists notices_audience_check;
alter table public.notices add constraint notices_audience_check
  check (audience in ('all', 'user', 'agent', 'merchant'));
create index if not exists notices_target_idx on public.notices(target_id, id desc);
alter table public.notices enable row level security;

-- ইউজার অ্যাপ নোটিশ পড়ে: নিজের নোটিশ + সবার/নিজের ধরনের নোটিশ (শুধু চালু ও মেয়াদের ভেতরে)
create or replace function public._my_role() returns text
language sql stable security definer set search_path = public as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'user');
$$;
revoke execute on function public._my_role() from public, anon;
grant execute on function public._my_role() to authenticated;

drop policy if exists "user read notices" on public.notices;
create policy "user read notices" on public.notices for select to authenticated using (
  active
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at > now())
  and (target_id = auth.uid() or (target_id is null and (audience = 'all' or audience = public._my_role())))
);
-- অ্যাডমিন সব নোটিশ দেখে/বদলায়: v2.15 এর "admin notices" নিয়মটাই কাজ করে, তাই ওটা নিশ্চিত করা
drop policy if exists "admin notices" on public.notices;
create policy "admin notices" on public.notices for all using (public._is_admin()) with check (public._is_admin());

-- অডিট: KYC এর স্বয়ংক্রিয় নোটিশ আলাদা করে লগে ওঠে না (KYC সিদ্ধান্ত নিজেই লগ হয়), তাই লগ ভরে যায় না
create or replace function public._audit_trg() returns trigger
language plpgsql security definer set search_path = public as $$
declare r jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
begin
  if tg_table_name = 'notices' and (r->>'kind') in ('kyc_ok', 'kyc_no') then return null; end if;
  perform public._audit(lower(tg_op) || ' ' || tg_table_name, coalesce(r->>'id', ''), r);
  return null;
end $$;
drop trigger if exists audit_notices on public.notices;
create trigger audit_notices after insert or update or delete on public.notices
  for each row execute function public._audit_trg();

-- ৫) ছবির জন্য প্রাইভেট স্টোরেজ (kyc)। ইউজার শুধু নিজের ফোল্ডারে ছবি তুলতে পারে, অ্যাডমিন সব দেখতে পারে
insert into storage.buckets (id, name, public) values ('kyc', 'kyc', false) on conflict (id) do nothing;
drop policy if exists "kyc upload own" on storage.objects;
create policy "kyc upload own" on storage.objects for insert to authenticated
  with check (bucket_id = 'kyc' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "kyc read own" on storage.objects;
create policy "kyc read own" on storage.objects for select to authenticated
  using (bucket_id = 'kyc' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "kyc admin read" on storage.objects;
create policy "kyc admin read" on storage.objects for select to authenticated
  using (bucket_id = 'kyc' and public.is_admin());

-- ৬) ইউজারের আবেদন জমা
create or replace function public.submit_kyc(
  p_name text, p_father text, p_dob text, p_nid text, p_addr text,
  p_front text, p_back text, p_selfie text
) returns bigint
language plpgsql security definer set search_path = public as $$
declare me public.profiles; nid text; rid bigint; pre text;
begin
  if auth.uid() is null then raise exception 'AUTH'; end if;
  select * into me from public.profiles where id = auth.uid() for update;
  if not found then raise exception 'AUTH'; end if;
  if me.kyc_status not in ('none', 'rejected') then raise exception 'KYCSTATE'; end if;
  nid := regexp_replace(coalesce(p_nid, ''), '\D', '', 'g');
  if length(nid) not in (10, 13, 17) then raise exception 'BADNID'; end if;
  if length(trim(coalesce(p_name, ''))) < 2 or length(trim(coalesce(p_father, ''))) < 2
     or length(trim(coalesce(p_dob, ''))) < 6 or length(trim(coalesce(p_addr, ''))) < 4 then
    raise exception 'BADDATA';
  end if;
  pre := auth.uid()::text || '/';
  if left(coalesce(p_front, ''), length(pre)) <> pre or left(coalesce(p_back, ''), length(pre)) <> pre
     or left(coalesce(p_selfie, ''), length(pre)) <> pre then
    raise exception 'BADDATA';
  end if;
  if exists(select 1 from public.kyc_requests where nid_no = nid and status in ('pending', 'approved') and user_id <> auth.uid()) then
    raise exception 'NIDUSED';
  end if;
  insert into public.kyc_requests(user_id, phone, name, father_name, dob, nid_no, address, front_path, back_path, selfie_path)
  values (auth.uid(), me.phone, left(trim(p_name), 80), left(trim(p_father), 80), left(trim(p_dob), 30), nid, left(trim(p_addr), 250), p_front, p_back, p_selfie)
  returning id into rid;
  update public.profiles set kyc_status = 'pending', kyc_reason = null where id = auth.uid();
  return rid;
end $$;


-- ৭) KYC ফাংশন (অ্যাডমিন অ্যাপের জন্য)
-- তালিকা: নাম/নম্বর/NID দিয়ে খোঁজার সুবিধা সহ। পুরনো ৩-প্যারামিটারের ফাংশন সরিয়ে নতুনটা বসানো হচ্ছে (দুটো থাকলে ডাক গুলিয়ে যায়)
drop function if exists public.admin_kyc_list(text, int, int);
drop function if exists public.admin_kyc_list(text, int, int, text);
create or replace function public.admin_kyc_list(p_status text default 'pending', p_limit int default 50, p_offset int default 0, p_q text default null)
returns table(id bigint, user_id uuid, phone text, status text, name text, father_name text, dob text, nid_no text, address text,
              reject_reason text, created_at timestamptz, reviewed_at timestamptz)
language plpgsql security definer set search_path = public as $$
declare q text := nullif(trim(coalesce(p_q, '')), '');
begin
  if not public._is_admin() then raise exception 'NOADMIN'; end if;
  if coalesce(p_status, 'pending') not in ('pending', 'approved', 'rejected', 'all') then raise exception 'BADSTATUS'; end if;
  return query
    select k.id, k.user_id, k.phone, k.status, k.name, k.father_name, k.dob, k.nid_no, k.address, k.reject_reason, k.created_at, k.reviewed_at
    from public.kyc_requests k
    where (coalesce(p_status, 'pending') = 'all' or k.status = coalesce(p_status, 'pending'))
      and (q is null or k.phone like '%' || q || '%' or k.nid_no like '%' || q || '%' or k.name ilike '%' || q || '%')
    order by (case when k.status = 'pending' then 0 else 1 end), k.created_at desc
    limit least(greatest(coalesce(p_limit, 50), 1), 200) offset greatest(coalesce(p_offset, 0), 0);
end $$;

-- একটি আবেদনের পুরো তথ্য। সঙ্গে: আগে কতবার বাতিল হয়েছে, কে সিদ্ধান্ত দিয়েছে
drop function if exists public.admin_kyc_get(bigint);
create or replace function public.admin_kyc_get(p_id bigint)
returns table(id bigint, user_id uuid, phone text, status text, name text, father_name text, dob text, nid_no text, address text,
              front_path text, back_path text, selfie_path text, reject_reason text, created_at timestamptz, reviewed_at timestamptz,
              reviewer text, prev_rejects int)
language plpgsql security definer set search_path = public as $$
begin
  if not public._is_admin() then raise exception 'NOADMIN'; end if;
  return query
    select k.id, k.user_id, k.phone, k.status, k.name, k.father_name, k.dob, k.nid_no, k.address,
           k.front_path, k.back_path, k.selfie_path, k.reject_reason, k.created_at, k.reviewed_at,
           (select a.name from public.admins a where a.user_id = k.reviewed_by),
           (select count(*)::int from public.kyc_requests x where x.user_id = k.user_id and x.id <> k.id and x.status = 'rejected')
    from public.kyc_requests k where k.id = p_id;
end $$;

-- একসেপ্ট / বাতিল: ইউজারের মেসেজ বক্সে নোটিশ যায়, অডিট লগে ওঠে। ফেরত দেয় ইউজারের নম্বর
create or replace function public.admin_kyc_decide(p_id bigint, p_approve boolean, p_reason text default null)
returns text
language plpgsql security definer set search_path = public as $$
declare k public.kyc_requests; why text;
begin
  if not public._is_admin() then raise exception 'NOADMIN'; end if;
  select * into k from public.kyc_requests where id = p_id for update;
  if not found then raise exception 'NOREQ'; end if;
  if k.status <> 'pending' then raise exception 'DONE'; end if;
  why := left(trim(coalesce(p_reason, '')), 200);
  if not p_approve and why = '' then raise exception 'NEEDREASON'; end if;
  if p_approve and exists(select 1 from public.kyc_requests x where x.nid_no = k.nid_no and x.status = 'approved' and x.id <> k.id) then
    raise exception 'NIDUSED';
  end if;
  update public.kyc_requests
     set status = case when p_approve then 'approved' else 'rejected' end,
         reject_reason = case when p_approve then null else why end,
         reviewed_by = auth.uid(), reviewed_at = now()
   where id = k.id;
  update public.profiles
     set kyc_status = case when p_approve then 'approved' else 'rejected' end,
         kyc_reason = case when p_approve then null else why end
   where id = k.user_id;
  if p_approve then
    insert into public.notices(target_id, audience, kind, title, body)
    values (k.user_id, 'all', 'kyc_ok', 'KYC একসেপ্ট হয়েছে', 'আপনার পরিচয় যাচাই সম্পন্ন হয়েছে। অ্যাকাউন্ট এখন চালু।');
  else
    insert into public.notices(target_id, audience, kind, title, body)
    values (k.user_id, 'all', 'kyc_no', 'KYC বাতিল হয়েছে', 'কারণ: ' || why || '। তথ্য ও ছবি ঠিক করে আবার জমা দিন।');
  end if;
  perform public._audit(case when p_approve then 'kyc approve' else 'kyc reject' end, k.phone,
                        jsonb_build_object('id', k.id, 'reason', nullif(why, '')));
  return k.phone;
end $$;

-- ব্যাজের সংখ্যা (আগের মতোই)
create or replace function public.admin_kyc_counts()
returns table(pending bigint, approved bigint, rejected bigint)
language plpgsql security definer set search_path = public as $$
begin
  if not public._is_admin() then raise exception 'NOADMIN'; end if;
  return query select
    count(*) filter (where k.status = 'pending'), count(*) filter (where k.status = 'approved'), count(*) filter (where k.status = 'rejected')
  from public.kyc_requests k;
end $$;

revoke execute on function public.admin_kyc_list(text, int, int, text) from public, anon;
revoke execute on function public.admin_kyc_get(bigint) from public, anon;
revoke execute on function public.admin_kyc_decide(bigint, boolean, text) from public, anon;
revoke execute on function public.admin_kyc_counts() from public, anon;
grant execute on function public.admin_kyc_list(text, int, int, text) to authenticated;
grant execute on function public.admin_kyc_get(bigint) to authenticated;
grant execute on function public.admin_kyc_decide(bigint, boolean, text) to authenticated;
grant execute on function public.admin_kyc_counts() to authenticated;


-- ৮) KYC ছাড়া টাকা খরচ বন্ধ (সার্ভারেই আটকায়, অ্যাপ বাইপাস করলেও কাজ করবে)
create or replace function public._kyc_gate() returns trigger
language plpgsql as $$
begin
  if new.balance < old.balance and old.kyc_status <> 'approved' then
    raise exception 'KYC';
  end if;
  return new;
end $$;
drop trigger if exists kyc_gate on public.profiles;
create trigger kyc_gate before update of balance on public.profiles
  for each row execute function public._kyc_gate();


-- ইউজার অ্যাপের ফাংশনের অনুমতি
revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.submit_kyc(text, text, text, text, text, text, text, text) from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.submit_kyc(text, text, text, text, text, text, text, text) to authenticated;

notify pgrst, 'reload schema';
