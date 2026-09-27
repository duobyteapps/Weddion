-- =========================================================
-- Weddion Guest Photo Security Hardening
-- =========================================================

-- ---------------------------------------------------------
-- 1. upload_guest_photo_record
--    - Sadece service_role çağırabilsin
--    - Fotoğraflar 7 gün sonra expire olsun
-- ---------------------------------------------------------

create or replace function public.upload_guest_photo_record(
  target_invitation_id uuid,
  target_upload_code text,
  target_storage_path text
)
returns public.invitation_guest_photos
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  invitation_record public.user_invitations;
  created_photo public.invitation_guest_photos;
begin
  select *
  into invitation_record
  from public.user_invitations
  where id = target_invitation_id
    and guest_upload_code = upper(trim(target_upload_code))
    and coalesce(guest_upload_enabled, false) = true
    and (
      guest_upload_expires_at is null
      or guest_upload_expires_at > now()
    )
  limit 1;

  if invitation_record.id is null then
    raise exception
      'Davet bulunamadı, yükleme kodu geçersiz veya fotoğraf yükleme kapalı.';
  end if;

  insert into public.invitation_guest_photos (
    invitation_id,
    storage_path,
    upload_code,
    status,
    created_at,
    expires_at
  )
  values (
    target_invitation_id,
    target_storage_path,
    upper(trim(target_upload_code)),
    'pending',
    now(),
    now() + interval '7 days'
  )
  returning *
  into created_photo;

  return created_photo;
end;
$function$;

revoke execute
on function public.upload_guest_photo_record(uuid, text, text)
from public;

revoke execute
on function public.upload_guest_photo_record(uuid, text, text)
from anon;

revoke execute
on function public.upload_guest_photo_record(uuid, text, text)
from authenticated;

grant execute
on function public.upload_guest_photo_record(uuid, text, text)
to service_role;


-- ---------------------------------------------------------
-- 2. Eski create_guest_photo_notification
--    Client tarafından çağrılamasın
-- ---------------------------------------------------------

revoke execute
on function public.create_guest_photo_notification(
  uuid,
  uuid,
  text,
  uuid
)
from public;

revoke execute
on function public.create_guest_photo_notification(
  uuid,
  uuid,
  text,
  uuid
)
from anon;

revoke execute
on function public.create_guest_photo_notification(
  uuid,
  uuid,
  text,
  uuid
)
from authenticated;

grant execute
on function public.create_guest_photo_notification(
  uuid,
  uuid,
  text,
  uuid
)
to service_role;


-- ---------------------------------------------------------
-- 3. create_guest_photo_upload_notification
--    - Gerçek fotoğraf kaydı zorunlu
--    - Aynı fotoğraf için tekrar bildirim engeli
--    - Maksimum 20 fotoğraf
--    - Client doğrudan çağıramaz
-- ---------------------------------------------------------

create or replace function public.create_guest_photo_upload_notification(
  target_invitation_id uuid,
  target_upload_code text,
  target_photo_count integer,
  target_first_photo_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  invitation_record public.user_invitations;
  first_photo public.invitation_guest_photos;
  safe_photo_count integer;
  actual_recent_count integer;
  notification_title text;
  notification_message text;
  notification_id uuid;
begin
  safe_photo_count :=
    greatest(coalesce(target_photo_count, 1), 1);

  if safe_photo_count > 20 then
    raise exception 'Geçersiz fotoğraf sayısı.';
  end if;

  if target_first_photo_id is null then
    raise exception 'İlk fotoğraf kaydı zorunludur.';
  end if;

  select *
  into invitation_record
  from public.user_invitations
  where id = target_invitation_id
    and guest_upload_code = upper(trim(target_upload_code))
    and coalesce(guest_upload_enabled, false) = true
    and (
      guest_upload_expires_at is null
      or guest_upload_expires_at > now()
    )
  limit 1;

  if invitation_record.id is null then
    raise exception
      'Davet bulunamadı, yükleme kodu geçersiz veya fotoğraf yükleme kapalı.';
  end if;

  select *
  into first_photo
  from public.invitation_guest_photos
  where id = target_first_photo_id
    and invitation_id = target_invitation_id
    and upload_code = upper(trim(target_upload_code))
  limit 1;

  if first_photo.id is null then
    raise exception
      'Bildirim için geçerli bir fotoğraf kaydı bulunamadı.';
  end if;

  /*
   * Aynı ilk fotoğraf üzerinden daha önce bildirim
   * oluşturulduysa yeni bildirim üretme.
   */
  select id
  into notification_id
  from public.app_notifications
  where type = 'guest_photo'
    and related_invitation_id = target_invitation_id
    and related_guest_photo_id = target_first_photo_id
  order by created_at desc
  limit 1;

  if notification_id is not null then
    return notification_id;
  end if;

  /*
   * Client'ın söylediği fotoğraf sayısını
   * gerçek DB kayıtlarıyla sınırla.
   */
  select count(*)::integer
  into actual_recent_count
  from public.invitation_guest_photos
  where invitation_id = target_invitation_id
    and upload_code = upper(trim(target_upload_code))
    and created_at >= first_photo.created_at
    and created_at <= now()
    and created_at <=
      first_photo.created_at + interval '10 minutes';

  if safe_photo_count > actual_recent_count then
    raise exception
      'Bildirim fotoğraf sayısı doğrulanamadı.';
  end if;

  notification_title :=
    case
      when safe_photo_count > 1 then
        safe_photo_count || ' yeni fotoğraf yüklendi'
      else
        'Yeni fotoğraf yüklendi'
    end;

  notification_message :=
    case
      when safe_photo_count > 1 then
        'Galerine ' ||
        safe_photo_count ||
        ' yeni fotoğraf eklendi.'
      else
        'Galerine yeni bir fotoğraf eklendi.'
    end;

  select public.create_app_notification_if_allowed(
    p_user_id :=
      invitation_record.user_id,

    p_type :=
      'guest_photo',

    p_title :=
      notification_title,

    p_message :=
      notification_message,

    p_related_invitation_id :=
      target_invitation_id,

    p_related_guest_photo_id :=
      target_first_photo_id,

    p_photo_count :=
      safe_photo_count
  )
  into notification_id;

  return notification_id;
end;
$function$;

revoke execute
on function public.create_guest_photo_upload_notification(
  uuid,
  text,
  integer,
  uuid
)
from public;

revoke execute
on function public.create_guest_photo_upload_notification(
  uuid,
  text,
  integer,
  uuid
)
from anon;

revoke execute
on function public.create_guest_photo_upload_notification(
  uuid,
  text,
  integer,
  uuid
)
from authenticated;

grant execute
on function public.create_guest_photo_upload_notification(
  uuid,
  text,
  integer,
  uuid
)
to service_role;

drop function if exists public.can_guest_upload_to_invitation(uuid);

-- ---------------------------------------------------------
-- 5. Eski direct guest insert yolunu kaldır
-- ---------------------------------------------------------

drop policy if exists "Guests can insert photos with valid code"
on public.invitation_guest_photos;

drop function if exists public.can_guest_insert_photo(uuid, text);

drop function if exists public.join_dowry_account_by_code(text);