-- FuNPaY v2.20: NID-র ছবির সাথে মুখ মেলানো, ৮৫% মিলে অটো একসেপ্ট
-- Supabase > SQL Editor এ পুরোটা পেস্ট করে একবার Run দিন (আবার চালালেও সমস্যা নেই)।
-- আগে update-v2.18-kyc.sql চালানো থাকতে হবে।
--
-- অ্যাপ NID-র মুখ আর সেলফির মুখের ১২৮ সংখ্যার "ছাপ" (descriptor) পাঠায়। সার্ভার নিজে দূরত্ব ও মিল % আবার হিসাব করে।
-- অ্যাপের পাঠানো % এর ওপর ভরসা করা হয় না। অটো একসেপ্ট হয় শুধু যখন সবগুলো মেলে:
--   মিল >= 85%, লাইভনেস পাস (র‍্যান্ডম মুখ ঘোরানো + চোখের পলক + সব ছবিতে একই মুখ), NID অন্য কারো নয়,
--   একই মুখ অন্য অ্যাকাউন্টে নেই, ছবি সত্যিই আপলোড হয়েছে, তথ্য ঠিক।
-- যে কোনোটা না মিললে আবেদন "pending" হয়ে অ্যাডমিনের কাছে যায়, কারণ-চিহ্ন (flags) সহ।

do $$
begin
  if to_regclass('public.kyc_requests') is null or to_regprocedure('public.submit_kyc(text,text,text,text,text,text,text,text)') is null then
    raise exception 'আগে update-v2.18-kyc.sql চালান';
  end if;
end $$;

-- ১) নতুন কলাম
alter table public.kyc_requests add column if not exists match_pct numeric;
alter table public.kyc_requests add column if not exists face_dist double precision;
alter table public.kyc_requests add column if not exists live_ok boolean not null default false;
alter table public.kyc_requests add column if not exists auto_approved boolean not null default false;
alter table public.kyc_requests add column if not exists tries int not null default 1;
alter table public.kyc_requests add column if not exists flags text[] not null default '{}';
alter table public.kyc_requests add column if not exists liveness jsonb;
alter table public.kyc_requests add column if not exists card_desc double precision[];
alter table public.kyc_requests add column if not exists selfie_desc double precision[];
create index if not exists kyc_auto_idx on public.kyc_requests(auto_approved, created_at desc) where auto_approved;

-- ২) দূরত্ব ও মিল % (অ্যাপের হিসাবের সাথে হুবহু এক: ০→১০০, .৩০→৯৮, .৪৫→৮৫, .৬০→৫০, .৮০→১০, ১→০)
create or replace function public._face_dist(a double precision[], b double precision[]) returns double precision
language sql immutable as $$
  select case when a is null or b is null or coalesce(array_length(a, 1), 0) <> 128 or coalesce(array_length(b, 1), 0) <> 128 then null
         else (select sqrt(sum((x - y) * (x - y))) from unnest(a, b) as u(x, y)) end;
$$;
create or replace function public._face_pct(d double precision) returns numeric
language sql immutable as $$
  select case when d is null then null else round((case
    when d <= 0 then 100.0
    when d <= .30 then 100 - (d / .30) * 2
    when d <= .45 then 98 - ((d - .30) / .15) * 13
    when d <= .60 then 85 - ((d - .45) / .15) * 35
    when d <= .80 then 50 - ((d - .60) / .20) * 40
    when d <= 1.0 then 10 - ((d - .80) / .20) * 10
    else 0 end)::numeric, 1) end;
$$;
revoke execute on function public._face_dist(double precision[], double precision[]) from public, anon;
revoke execute on function public._face_pct(double precision) from public, anon;

-- ৩) ইউজারের আবেদন জমা (নতুন)। ফেরত: {id, status, pct, auto}
create or replace function public.submit_kyc2(
  p_name text, p_father text, p_dob text, p_nid text, p_addr text,
  p_front text, p_back text, p_selfie text,
  p_card_desc double precision[], p_selfie_desc double precision[], p_live jsonb, p_tries int, p_mismatch boolean
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  me public.profiles; nid text; rid bigint; pre text;
  d double precision; pct numeric; fl text[] := '{}'; auto boolean; live boolean; swap boolean; tr int;
begin
  if auth.uid() is null then raise exception 'AUTH'; end if;
  select * into me from public.profiles where id = auth.uid() for update;
  if not found then raise exception 'AUTH'; end if;
  if me.kyc_status not in ('none', 'rejected') then raise exception 'KYCSTATE'; end if;
  if (select count(*) from public.kyc_requests where user_id = auth.uid() and created_at > now() - interval '1 day') >= 6 then raise exception 'KYCLIMIT'; end if;
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
  -- তিনটি ছবিই সত্যিই আপলোড হয়েছে কিনা
  if (select count(*) from storage.objects where bucket_id = 'kyc' and name in (p_front, p_back, p_selfie)) < 3 then
    raise exception 'UPLOAD';
  end if;
  if exists(select 1 from public.kyc_requests where nid_no = nid and status in ('pending', 'approved') and user_id <> auth.uid()) then
    raise exception 'NIDUSED';
  end if;

  -- মিল: সার্ভার নিজে হিসাব করে
  d := public._face_dist(p_card_desc, p_selfie_desc);
  pct := public._face_pct(d);
  live := coalesce((p_live ->> 'ok')::boolean, false);
  swap := coalesce((p_live ->> 'swap_ok')::boolean, false);
  tr := least(greatest(coalesce(p_tries, 1), 1), 9);

  if pct is null then fl := fl || 'nodesc';
  else
    if d < 0.02 then fl := fl || 'identical'; end if;                    -- দুই ছাপ হুবহু এক হলে সন্দেহজনক (নকল ডেটা)
    if pct < 85 then fl := fl || 'lowmatch'; end if;
  end if;
  if not live then fl := fl || 'nolive'; end if;
  if live and not swap then fl := fl || 'swap'; end if;
  if coalesce((p_live ->> 'mode'), '') = 'manual' then fl := fl || 'manual'; end if;
  if coalesce((p_live ->> 'rs')::int, 0) >= 2 then fl := fl || 'livetimeout'; end if;
  if coalesce((p_live ->> 'ms')::int, 0) between 1 and 3500 then fl := fl || 'toofast'; end if;   -- ৪টি ধাপ ৩.৫ সেকেন্ডের কমে হওয়া মানুষের পক্ষে প্রায় অসম্ভব
  if coalesce(array_length(p_selfie_desc, 1), 0) = 128 and exists(
       select 1 from public.kyc_requests x
        where x.user_id <> auth.uid() and x.status in ('pending', 'approved') and x.selfie_desc is not null
          and public._face_dist(x.selfie_desc, p_selfie_desc) < 0.45) then
    fl := fl || 'dupface';                                               -- একই মুখ অন্য অ্যাকাউন্টে আছে
  end if;
  auto := cardinality(fl) = 0;

  insert into public.kyc_requests(user_id, phone, name, father_name, dob, nid_no, address, front_path, back_path, selfie_path,
                                  status, match_pct, face_dist, live_ok, auto_approved, tries, flags, liveness, card_desc, selfie_desc,
                                  reviewed_at)
  values (auth.uid(), me.phone, left(trim(p_name), 80), left(trim(p_father), 80), left(trim(p_dob), 30), nid, left(trim(p_addr), 250), p_front, p_back, p_selfie,
          case when auto then 'approved' else 'pending' end, pct, d, live and swap, auto, tr, fl,
          jsonb_build_object('ord', p_live -> 'ord', 'ms', p_live -> 'ms', 'rs', p_live -> 'rs', 'mode', p_live -> 'mode',
                             'swap_n', p_live -> 'swap_n', 'swap_max', p_live -> 'swap_max', 'app_pct', p_live -> 'pct', 'app_state', p_live -> 'st'),
          case when coalesce(array_length(p_card_desc, 1), 0) = 128 then p_card_desc end,
          case when coalesce(array_length(p_selfie_desc, 1), 0) = 128 then p_selfie_desc end,
          case when auto then now() end)
  returning id into rid;

  update public.profiles set kyc_status = case when auto then 'approved' else 'pending' end, kyc_reason = null where id = auth.uid();

  if auto then
    insert into public.notices(target_id, audience, kind, title, body)
    values (auth.uid(), 'all', 'kyc_ok', 'KYC একসেপ্ট হয়েছে', 'NID-র ছবির সাথে মুখ মিলেছে (' || pct::text || '%)। অ্যাকাউন্ট এখন চালু।');
    perform public._audit('kyc auto-approve', me.phone, jsonb_build_object('id', rid, 'pct', pct, 'dist', d));
  end if;
  return jsonb_build_object('id', rid, 'status', case when auto then 'approved' else 'pending' end, 'pct', pct, 'auto', auto, 'flags', to_jsonb(fl));
end $$;

revoke execute on function public.submit_kyc2(text, text, text, text, text, text, text, text, double precision[], double precision[], jsonb, int, boolean) from public, anon;
grant execute on function public.submit_kyc2(text, text, text, text, text, text, text, text, double precision[], double precision[], jsonb, int, boolean) to authenticated;

-- ৪) পুরনো submit_kyc (ছবি ছাড়া ছাপ) আর অটো একসেপ্ট করে না, শুধু pending করে অ্যাডমিনের কাছে পাঠায়, তাই অপরিবর্তিত রাখা হলো।

-- ৫) অ্যাডমিন অ্যাপের জন্য: তালিকা ও বিস্তারিতে মিল %, লাইভনেস, অটো একসেপ্ট, চিহ্ন (flags) যোগ
drop function if exists public.admin_kyc_list(text, int, int, text);
create or replace function public.admin_kyc_list(p_status text default 'pending', p_limit int default 50, p_offset int default 0, p_q text default null)
returns table(id bigint, user_id uuid, phone text, status text, name text, father_name text, dob text, nid_no text, address text,
              reject_reason text, created_at timestamptz, reviewed_at timestamptz,
              match_pct numeric, live_ok boolean, auto_approved boolean, flags text[], tries int)
language plpgsql security definer set search_path = public as $$
declare q text := nullif(trim(coalesce(p_q, '')), '');
begin
  if not public._is_admin() then raise exception 'NOADMIN'; end if;
  if coalesce(p_status, 'pending') not in ('pending', 'approved', 'rejected', 'all', 'auto') then raise exception 'BADSTATUS'; end if;
  return query
    select k.id, k.user_id, k.phone, k.status, k.name, k.father_name, k.dob, k.nid_no, k.address, k.reject_reason, k.created_at, k.reviewed_at,
           k.match_pct, k.live_ok, k.auto_approved, k.flags, k.tries
    from public.kyc_requests k
    where (case when coalesce(p_status, 'pending') = 'all' then true
                when p_status = 'auto' then k.auto_approved and k.status = 'approved'
                else k.status = coalesce(p_status, 'pending') end)
      and (q is null or k.phone like '%' || q || '%' or k.nid_no like '%' || q || '%' or k.name ilike '%' || q || '%')
    order by (case when k.status = 'pending' then 0 else 1 end), k.created_at desc
    limit least(greatest(coalesce(p_limit, 50), 1), 200) offset greatest(coalesce(p_offset, 0), 0);
end $$;

drop function if exists public.admin_kyc_get(bigint);
create or replace function public.admin_kyc_get(p_id bigint)
returns table(id bigint, user_id uuid, phone text, status text, name text, father_name text, dob text, nid_no text, address text,
              front_path text, back_path text, selfie_path text, reject_reason text, created_at timestamptz, reviewed_at timestamptz,
              reviewer text, prev_rejects int,
              match_pct numeric, live_ok boolean, auto_approved boolean, flags text[], tries int, liveness jsonb)
language plpgsql security definer set search_path = public as $$
begin
  if not public._is_admin() then raise exception 'NOADMIN'; end if;
  return query
    select k.id, k.user_id, k.phone, k.status, k.name, k.father_name, k.dob, k.nid_no, k.address,
           k.front_path, k.back_path, k.selfie_path, k.reject_reason, k.created_at, k.reviewed_at,
           (select a.name from public.admins a where a.user_id = k.reviewed_by),
           (select count(*)::int from public.kyc_requests x where x.user_id = k.user_id and x.id <> k.id and x.status = 'rejected'),
           k.match_pct, k.live_ok, k.auto_approved, k.flags, k.tries, k.liveness
    from public.kyc_requests k where k.id = p_id;
end $$;

-- অটো একসেপ্ট হওয়া আবেদন অ্যাডমিন চাইলে পরে বাতিল করতে পারে (ভুল বা সন্দেহ হলে)। ইউজার আবার আবেদন করতে পারবে, টাকা খরচ আবার বন্ধ হবে
create or replace function public.admin_kyc_revoke(p_id bigint, p_reason text)
returns text
language plpgsql security definer set search_path = public as $$
declare k public.kyc_requests; why text := left(trim(coalesce(p_reason, '')), 200);
begin
  if not public._is_admin() then raise exception 'NOADMIN'; end if;
  if why = '' then raise exception 'NEEDREASON'; end if;
  select * into k from public.kyc_requests where id = p_id for update;
  if not found then raise exception 'NOREQ'; end if;
  if k.status <> 'approved' then raise exception 'DONE'; end if;
  update public.kyc_requests set status = 'rejected', reject_reason = why, reviewed_by = auth.uid(), reviewed_at = now() where id = k.id;
  update public.profiles set kyc_status = 'rejected', kyc_reason = why where id = k.user_id;
  insert into public.notices(target_id, audience, kind, title, body)
  values (k.user_id, 'all', 'kyc_no', 'KYC বাতিল হয়েছে', 'কারণ: ' || why || '। তথ্য ও ছবি ঠিক করে আবার জমা দিন।');
  perform public._audit('kyc revoke', k.phone, jsonb_build_object('id', k.id, 'reason', why, 'was_auto', k.auto_approved));
  return k.phone;
end $$;

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
revoke execute on function public.admin_kyc_revoke(bigint, text) from public, anon;
grant execute on function public.admin_kyc_list(text, int, int, text) to authenticated;
grant execute on function public.admin_kyc_get(bigint) to authenticated;
grant execute on function public.admin_kyc_revoke(bigint, text) to authenticated;

notify pgrst, 'reload schema';
