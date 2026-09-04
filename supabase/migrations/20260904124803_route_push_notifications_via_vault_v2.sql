
drop trigger if exists "send-push-notification"
on public.app_notifications;

create or replace function public.invoke_send_push_notification_v2()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  webhook_key text;
begin
  select decrypted_secret
  into webhook_key
  from vault.decrypted_secrets
  where name = 'push_webhook_secret_key'
  limit 1;

  if webhook_key is null then
    raise warning 'push_webhook_secret_key bulunamadı.';
    return new;
  end if;

  perform net.http_post(
    url :=
      'https://raujjmbbfzdpsmpyirty.supabase.co/functions/v1/send-push-notification-v2',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', webhook_key
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', TG_TABLE_NAME,
      'schema', TG_TABLE_SCHEMA,
      'record', to_jsonb(new),
      'old_record', null
    ),
    timeout_milliseconds := 5000
  );

  return new;
end;
$$;

revoke execute
on function public.invoke_send_push_notification_v2()
from public, anon, authenticated;

create trigger "send-push-notification"
after insert on public.app_notifications
for each row
execute function public.invoke_send_push_notification_v2();
;
