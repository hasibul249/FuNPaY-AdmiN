-- FuNPaY v2.15: অ্যাডমিন সিস্টেম (Supabase > SQL Editor এ পুরোটা পেস্ট করে একবার Run দিন, আবার চালালেও সমস্যা নেই)
-- আগে update-v2.13.sql (এবং OTP ব্যবহার করলে update-otp.sql) চালানো থাকতে হবে। আবার চালালেও সমস্যা নেই।
-- এতে আছে: অ্যাডমিন তালিকা, ইউজার সাসপেন্ড/বন্ধ, রক্ষণাবেক্ষণ মোড, ব্যানার, নোটিশ, কুপন নিয়ন্ত্রণ, অডিট লগ

-- ১) প্রোফাইল: অ্যাকাউন্টের অবস্থা + ভবিষ্যতের মার্চেন্ট রোল
alter table public.profiles add column if not exists status text not null default 'active';
alter table public.profiles add column if not exists status_reason text;
alter table public.profiles add column if not exists status_at timestamptz;
alter table public.profiles add column if not exists admin_note text;
alter table public.profiles drop constraint if exists profiles_status_chk;
alter table public.profiles add constraint profiles_status_chk check (status in ('active','suspended','closed'));
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('user','agent','merchant'));

-- ২) অ্যাডমিন তালিকা (অ্যাডমিন হয় Supabase Authentication এর আলাদা ইমেইল/পাসওয়ার্ড অ্যাকাউন্ট, সাধারণ ইউজার নয়)
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  level text not null default 'staff' check (level in ('owner','staff')),
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public._is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.admins where user_id = auth.uid());
$$;
create or replace function public._is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.admins where user_id = auth.uid() and level = 'owner');
$$;

-- অ্যাডমিনের জন্য খোলা অ্যাকাউন্টে প্রোফাইল বানানো হবে না (শুধু সঠিক ১১ ডিজিট নম্বর থাকলেই ইউজার প্রোফাইল হয়)
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare ph text := coalesce(new.raw_user_meta_data->>'phone', '');
begin
  if ph !~ '^01[0-9]{9}$' then return new; end if;
  insert into public.profiles(id, phone, name, balance)
  values (new.id, ph, left(coalesce(new.raw_user_meta_data->>'name', ''), 20), 150);
  insert into public.user_coupons(user_id, coupon_id)
  select new.id, id from public.coupons where code = 'WELCOME'
  on conflict do nothing;
  return new;
end $$;

-- ৩) অ্যাপের সেটিংস (রক্ষণাবেক্ষণ মোড)
create table if not exists public.app_settings (
  key text primary key,
  val jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.app_settings enable row level security;
insert into public.app_settings(key, val)
values ('maintenance', '{"on":false,"title":"","message":"","eta":null}')
on conflict (key) do nothing;

-- ৪) ব্যানার (হোম পেজের স্লাইডার)
create table if not exists public.banners (
  id serial primary key,
  tag text not null default '',
  title text not null,
  sub text not null default '',
  btn text not null default '',
  action text not null default 'none' check (action in ('none','add','rech','send','pay','cash','bill','coupons','link')),
  link text not null default '',
  theme smallint not null default 0,
  icon text not null default 'gift',
  audience text not null default 'all' check (audience in ('all','user','agent','merchant')),
  sort int not null default 0,
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.banners enable row level security;

-- আগের তিনটি ব্যানার প্রথমবার নিজে বসে যাবে (পরে অ্যাডমিন অ্যাপ থেকে বদলাতে/মুছতে পারবেন)
insert into public.banners(tag, title, sub, btn, action, theme, icon, sort)
select * from (values
  ('অ্যাড মানি অফার', 'প্রথম অ্যাড মানিতে ৫% ক্যাশব্যাক', 'ব্যাংক বা কার্ড থেকে টাকা যোগ করুন', 'অ্যাড মানি', 'add', 0::smallint, 'pct', 1),
  ('রিচার্জ অফার', 'মোবাইল রিচার্জে ১০ টাকা বোনাস', 'যেকোনো অপারেটরে, প্রতি রিচার্জে', 'রিচার্জ করুন', 'rech', 1::smallint, 'phone', 2),
  ('রেফার অফার', 'বন্ধুকে ইনভাইট করুন, পান ৫০ টাকা', 'বন্ধু প্রথম লেনদেন করলেই', '', 'none', 2::smallint, 'gift', 3)
) v(tag, title, sub, btn, action, theme, icon, sort)
where not exists (select 1 from public.banners);

-- ৫) নোটিশ (ইনবক্সের নোটিফিকেশনে দেখায়, চাইলে পপআপও)
create table if not exists public.notices (
  id serial primary key,
  title text not null,
  body text not null default '',
  kind text not null default 'info' check (kind in ('info','success','warn','offer')),
  popup boolean not null default false,
  audience text not null default 'all' check (audience in ('all','user','agent','merchant')),
  target_id uuid references public.profiles(id) on delete cascade,
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.notices enable row level security;

-- ৬) অডিট লগ (অ্যাডমিন কে কী করেছে)
create table if not exists public.audit_log (
  id bigserial primary key,
  admin_id uuid,
  admin_name text,
  action text not null,
  target text,
  detail jsonb,
  created_at timestamptz not null default now()
);
alter table public.audit_log enable row level security;

create or replace function public._audit(p_action text, p_target text, p_detail jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare an text;
begin
  if auth.uid() is null then return; end if;
  select name into an from public.admins where user_id = auth.uid();
  insert into public.audit_log(admin_id, admin_name, action, target, detail) values (auth.uid(), an, p_action, p_target, p_detail);
end $$;

create or replace function public._audit_trg() returns trigger
language plpgsql security definer set search_path = public as $$
declare r jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
begin
  perform public._audit(lower(tg_op) || ' ' || tg_table_name, coalesce(r->>'id', ''), r);
  return null;
end $$;
drop trigger if exists audit_banners on public.banners;
create trigger audit_banners after insert or update or delete on public.banners for each row execute function public._audit_trg();
drop trigger if exists audit_notices on public.notices;
create trigger audit_notices after insert or update or delete on public.notices for each row execute function public._audit_trg();
drop trigger if exists audit_coupons on public.coupons;
create trigger audit_coupons after insert or update or delete on public.coupons for each row execute function public._audit_trg();

-- ৭) অ্যাডমিনের পড়া/লেখার অনুমতি (সাধারণ ইউজার এগুলো কিছুই দেখতে পায় না)
drop policy if exists "admin read profiles" on public.profiles;
create policy "admin read profiles" on public.profiles for select using (public._is_admin());
drop policy if exists "admin read tx" on public.transactions;
create policy "admin read tx" on public.transactions for select using (public._is_admin());
drop policy if exists "admin read uc" on public.user_coupons;
create policy "admin read uc" on public.user_coupons for select using (public._is_admin());
drop policy if exists "admin coupons" on public.coupons;
create policy "admin coupons" on public.coupons for all using (public._is_admin()) with check (public._is_admin());
drop policy if exists "admin banners" on public.banners;
create policy "admin banners" on public.banners for all using (public._is_admin()) with check (public._is_admin());
drop policy if exists "admin notices" on public.notices;
create policy "admin notices" on public.notices for all using (public._is_admin()) with check (public._is_admin());
drop policy if exists "owner audit" on public.audit_log;
create policy "owner audit" on public.audit_log for select using (public._is_owner());
drop policy if exists "owner admins" on public.admins;
create policy "owner admins" on public.admins for select using (public._is_owner());

-- ৮) টাকার লেনদেনে পাহারা: রক্ষণাবেক্ষণ চললে বা সাসপেন্ড/বন্ধ অ্যাকাউন্টে ব্যালেন্স বদলাবে না (সার্ভারেই আটকায়, অ্যাপ বদলালেও কাজ হবে না)
create or replace function public._guard_balance() returns trigger
language plpgsql security definer set search_path = public as $$
declare m jsonb;
begin
  if new.balance is not distinct from old.balance then return new; end if;
  if coalesce(current_setting('fp.bypass', true), '') = '1' then return new; end if;
  select val into m from public.app_settings where key = 'maintenance';
  if coalesce((m->>'on')::boolean, false) then raise exception 'MAINT'; end if;
  if old.status <> 'active' or new.status <> 'active' then raise exception 'SUSP'; end if;
  return new;
end $$;
drop trigger if exists guard_balance on public.profiles;
create trigger guard_balance before update of balance on public.profiles
  for each row execute function public._guard_balance();

-- ৯) অ্যাপের জন্য: রক্ষণাবেক্ষণ + ব্যানার + নোটিশ (লগইনের আগেও চলে, তাই রক্ষণাবেক্ষণ বার্তা সবাই দেখে)
create or replace function public.app_status() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare r text := 'anon'; m jsonb; b jsonb; n jsonb;
begin
  if auth.uid() is not null then
    select role into r from public.profiles where id = auth.uid();
    r := coalesce(r, 'user');
  end if;
  select val into m from public.app_settings where key = 'maintenance';
  select coalesce(jsonb_agg(to_jsonb(x) order by x.sort, x.id), '[]'::jsonb) into b from (
    select id, tag, title, sub, btn, action, link, theme, icon, sort from public.banners
    where active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now())
      and (audience = 'all' or audience = r)
  ) x;
  select coalesce(jsonb_agg(to_jsonb(y) order by y.id desc), '[]'::jsonb) into n from (
    select id, title, body, kind, popup, created_at from public.notices
    where active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now())
      and (audience = 'all' or audience = r) and (target_id is null or target_id = auth.uid())
    order by id desc limit 30
  ) y;
  return jsonb_build_object('maint', coalesce(m, '{}'::jsonb), 'banners', b, 'notices', n, 'now', now());
end $$;
grant execute on function public.app_status() to anon, authenticated;

-- ১০) অ্যাডমিন ফাংশন (প্রতিটির ভেতরে অ্যাডমিন কিনা যাচাই হয়)
create or replace function public.admin_me() returns jsonb
language plpgsql security definer set search_path = public as $$
declare a public.admins;
begin
  select * into a from public.admins where user_id = auth.uid();
  if not found then raise exception 'NOADMIN'; end if;
  return jsonb_build_object('id', a.user_id, 'name', a.name, 'level', a.level);
end $$;

create or replace function public.admin_stats() returns jsonb
language plpgsql security definer set search_path = public as $$
declare d date := (now() at time zone 'Asia/Dhaka')::date; r jsonb; s jsonb;
begin
  if not public._is_admin() then raise exception 'NOADMIN'; end if;
  select coalesce(jsonb_agg(jsonb_build_object('d', g::date, 'n', n, 'amt', amt) order by g), '[]'::jsonb) into s from (
    select gs g, count(t.id)::int n, coalesce(sum(t.amount), 0) amt
    from generate_series((d - 6)::timestamp, d::timestamp, interval '1 day') gs
    left join public.transactions t on (t.created_at at time zone 'Asia/Dhaka')::date = gs::date and t.type <> 'add'
    group by gs
  ) q;
  select jsonb_build_object(
    'users', (select count(*) from public.profiles where role = 'user'),
    'agents', (select count(*) from public.profiles where role = 'agent'),
    'merchants', (select count(*) from public.profiles where role = 'merchant'),
    'suspended', (select count(*) from public.profiles where status = 'suspended'),
    'closed', (select count(*) from public.profiles where status = 'closed'),
    'balance', (select coalesce(sum(balance), 0) from public.profiles),
    'new_today', (select count(*) from public.profiles where (created_at at time zone 'Asia/Dhaka')::date = d),
    'tx_today', (select count(*) from public.transactions where (created_at at time zone 'Asia/Dhaka')::date = d and type <> 'add'),
    'vol_today', (select coalesce(sum(amount), 0) from public.transactions where (created_at at time zone 'Asia/Dhaka')::date = d and type <> 'add'),
    'tx_total', (select count(*) from public.transactions where type <> 'add'),
    'days', s
  ) into r;
  return r;
end $$;

create or replace function public.admin_set_status(p_id uuid, p_status text, p_reason text default '') returns void
language plpgsql security definer set search_path = public as $$
declare p public.profiles;
begin
  if not public._is_admin() then raise exception 'NOADMIN'; end if;
  if p_status not in ('active','suspended','closed') then raise exception 'BADSTATUS'; end if;
  if p_status = 'closed' and not public._is_owner() then raise exception 'NEEDOWNER'; end if;
  update public.profiles set status = p_status, status_reason = nullif(trim(coalesce(p_reason, '')), ''), status_at = now()
   where id = p_id returning * into p;
  if not found then raise exception 'NOUSER'; end if;
  perform public._audit('status ' || p_status, p.phone, jsonb_build_object('reason', p_reason, 'balance', p.balance));
end $$;

create or replace function public.admin_set_role(p_id uuid, p_role text) returns void
language plpgsql security definer set search_path = public as $$
declare p public.profiles;
begin
  if not public._is_owner() then raise exception 'NEEDOWNER'; end if;
  if p_role not in ('user','agent','merchant') then raise exception 'BADROLE'; end if;
  update public.profiles set role = p_role where id = p_id returning * into p;
  if not found then raise exception 'NOUSER'; end if;
  perform public._audit('role ' || p_role, p.phone, null);
end $$;

create or replace function public.admin_set_note(p_id uuid, p_note text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public._is_admin() then raise exception 'NOADMIN'; end if;
  update public.profiles set admin_note = nullif(trim(coalesce(p_note, '')), '') where id = p_id;
  if not found then raise exception 'NOUSER'; end if;
end $$;

-- কুপন দেওয়া: p_target = 'all' | 'user' | 'agent' | 'merchant' | ১১ ডিজিট নম্বর। ফেরত দেয় কতজন নতুন পেলেন
create or replace function public.admin_give_coupon(p_coupon int, p_target text) returns int
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if not public._is_admin() then raise exception 'NOADMIN'; end if;
  if not exists(select 1 from public.coupons where id = p_coupon) then raise exception 'BADCODE'; end if;
  if p_target ~ '^01[0-9]{9}$' then
    insert into public.user_coupons(user_id, coupon_id) select id, p_coupon from public.profiles where phone = p_target and status <> 'closed' on conflict do nothing;
  elsif p_target = 'all' then
    insert into public.user_coupons(user_id, coupon_id) select id, p_coupon from public.profiles where status <> 'closed' on conflict do nothing;
  elsif p_target in ('user','agent','merchant') then
    insert into public.user_coupons(user_id, coupon_id) select id, p_coupon from public.profiles where role = p_target and status <> 'closed' on conflict do nothing;
  else raise exception 'BADTARGET'; end if;
  get diagnostics n = row_count;
  perform public._audit('give coupon', p_coupon::text, jsonb_build_object('target', p_target, 'count', n));
  return n;
end $$;

create or replace function public.admin_coupon_stats() returns table(coupon_id int, given int, used int)
language plpgsql security definer set search_path = public as $$
begin
  if not public._is_admin() then raise exception 'NOADMIN'; end if;
  return query select u.coupon_id, count(*)::int, count(u.used_at)::int from public.user_coupons u group by u.coupon_id;
end $$;

-- রক্ষণাবেক্ষণ চালু/বন্ধ (শুধু owner)
create or replace function public.admin_set_maintenance(p_on boolean, p_title text, p_message text, p_eta timestamptz) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public._is_owner() then raise exception 'NEEDOWNER'; end if;
  insert into public.app_settings(key, val, updated_at)
  values ('maintenance', jsonb_build_object('on', p_on, 'title', coalesce(p_title, ''), 'message', coalesce(p_message, ''), 'eta', p_eta, 'since', case when p_on then now() else null end), now())
  on conflict (key) do update set val = excluded.val, updated_at = now();
  perform public._audit('maintenance ' || case when p_on then 'on' else 'off' end, null, jsonb_build_object('title', p_title, 'message', p_message, 'eta', p_eta));
end $$;

create or replace function public.admin_list() returns table(user_id uuid, name text, level text, email text, created_at timestamptz)
language plpgsql security definer set search_path = public as $$
begin
  if not public._is_owner() then raise exception 'NEEDOWNER'; end if;
  return query select a.user_id, a.name, a.level, u.email::text, a.created_at from public.admins a join auth.users u on u.id = a.user_id order by a.created_at;
end $$;

create or replace function public.admin_add(p_email text, p_name text, p_level text) returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid;
begin
  if not public._is_owner() then raise exception 'NEEDOWNER'; end if;
  if p_level not in ('owner','staff') then raise exception 'BADROLE'; end if;
  select id into uid from auth.users where lower(email) = lower(trim(p_email));
  if uid is null then raise exception 'NOUSER'; end if;
  insert into public.admins(user_id, name, level) values (uid, left(coalesce(p_name, ''), 30), p_level)
  on conflict (user_id) do update set name = excluded.name, level = excluded.level;
  perform public._audit('admin add ' || p_level, lower(trim(p_email)), null);
end $$;

create or replace function public.admin_remove(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public._is_owner() then raise exception 'NEEDOWNER'; end if;
  if p_id = auth.uid() then raise exception 'SELF'; end if;
  delete from public.admins where user_id = p_id;
  perform public._audit('admin remove', p_id::text, null);
end $$;

-- সাধারণ ইউজার বা লগইন ছাড়া কেউ অ্যাডমিন ফাংশন চালাতে পারবে না
revoke execute on function public.admin_me() from public, anon;
revoke execute on function public.admin_stats() from public, anon;
revoke execute on function public.admin_set_status(uuid, text, text) from public, anon;
revoke execute on function public.admin_set_role(uuid, text) from public, anon;
revoke execute on function public.admin_set_note(uuid, text) from public, anon;
revoke execute on function public.admin_give_coupon(int, text) from public, anon;
revoke execute on function public.admin_coupon_stats() from public, anon;
revoke execute on function public.admin_set_maintenance(boolean, text, text, timestamptz) from public, anon;
revoke execute on function public.admin_list() from public, anon;
revoke execute on function public.admin_add(text, text, text) from public, anon;
revoke execute on function public.admin_remove(uuid) from public, anon;
grant execute on function public.admin_me() to authenticated;
grant execute on function public.admin_stats() to authenticated;
grant execute on function public.admin_set_status(uuid, text, text) to authenticated;
grant execute on function public.admin_set_role(uuid, text) to authenticated;
grant execute on function public.admin_set_note(uuid, text) to authenticated;
grant execute on function public.admin_give_coupon(int, text) to authenticated;
grant execute on function public.admin_coupon_stats() to authenticated;
grant execute on function public.admin_set_maintenance(boolean, text, text, timestamptz) to authenticated;
grant execute on function public.admin_list() to authenticated;
grant execute on function public.admin_add(text, text, text) to authenticated;
grant execute on function public.admin_remove(uuid) to authenticated;
revoke execute on function public._audit(text, text, jsonb) from public, anon, authenticated;

-- প্রথম অ্যাডমিন (owner) বানানো:
-- ক) (OTP চালু থাকলে শুধু) নম্বর-যাচাইয়ের নিয়ম এক মুহূর্তের জন্য বন্ধ করুন, নইলে ড্যাশবোর্ডে ইউজার বানানো আটকাবে:
--      alter table auth.users disable trigger a_require_verified_phone;
-- খ) Supabase > Authentication > Users > Add user: ইমেইল + পাসওয়ার্ড দিন, "Auto Confirm User" টিক দিন।
-- গ) সঙ্গে সঙ্গে নিয়মটা আবার চালু করুন (এটা ভুলবেন না):
--      alter table auth.users enable trigger a_require_verified_phone;
-- ঘ) নিচের লাইনে নিজের ইমেইল বসিয়ে আলাদা করে Run করুন:
--   insert into public.admins(user_id, name, level)
--   select id, 'আমি', 'owner' from auth.users where email = 'আপনার@ইমেইল.com';

notify pgrst, 'reload schema';
