
revoke execute on function public.cleanup_expired_guest_photos() from public, anon, authenticated;
revoke execute on function public.cleanup_inactive_dowry_records() from public, anon, authenticated;
revoke execute on function public.hard_delete_dowry_account(uuid) from public, anon, authenticated;
revoke execute on function public.get_or_create_personal_dowry_account_for_user(uuid) from public, anon, authenticated;
revoke execute on function public.create_app_notification_if_allowed(uuid,text,text,text,uuid,uuid,integer) from public, anon, authenticated;

revoke execute on function public.delete_inactive_dowry_account_trigger() from public, anon, authenticated;
revoke execute on function public.delete_removed_dowry_member_trigger() from public, anon, authenticated;
revoke execute on function public.enforce_guest_photo_account_limit() from public, anon, authenticated;
revoke execute on function public.enforce_user_invitation_limit() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_new_user_role() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
;
