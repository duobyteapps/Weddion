REVOKE EXECUTE ON FUNCTION public.approve_dowry_account_join_request(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.approve_dowry_account_join_request(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.approve_gallery_partner_request(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.approve_gallery_partner_request(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.archive_dowry_account(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.archive_dowry_account(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.can_manage_invitation_gallery(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_manage_invitation_gallery(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.create_dowry_item(text,text,text,integer,numeric,boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_dowry_item(text,text,text,integer,numeric,boolean) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.delete_dowry_item(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_dowry_item(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.generate_dowry_invite_code() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.generate_dowry_invite_code() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_active_dowry_account_id_for_user(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_active_dowry_account_id_for_user(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_dowry_account_members(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_dowry_account_members(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_dowry_category_item_counts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_dowry_category_item_counts() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_gallery_partner(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_gallery_partner(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_my_dowry_accounts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_dowry_accounts() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_my_gallery_accessible_invitations() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_gallery_accessible_invitations() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_or_create_my_default_dowry_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_or_create_my_default_dowry_account() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_pending_dowry_join_requests(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_pending_dowry_join_requests(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_pending_gallery_partner_requests(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_pending_gallery_partner_requests(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_user_dowry_category_budgets() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_dowry_category_budgets() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_user_dowry_items(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_dowry_items(text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_user_dowry_subcategories(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_dowry_subcategories(text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_dowry_account_member(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_dowry_account_member(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_dowry_account_owner(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_dowry_account_owner(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.join_dowry_account_by_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.join_dowry_account_by_code(text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.leave_dowry_account(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.leave_dowry_account(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.leave_gallery_partner_access(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.leave_gallery_partner_access(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.refresh_dowry_invite_code(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.refresh_dowry_invite_code(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.refresh_gallery_partner_invite_code(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.refresh_gallery_partner_invite_code(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.reject_dowry_account_join_request(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reject_dowry_account_join_request(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.reject_gallery_partner_request(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reject_gallery_partner_request(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.remove_dowry_account_member(uuid,uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.remove_dowry_account_member(uuid,uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.remove_gallery_partner(uuid,uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.remove_gallery_partner(uuid,uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.request_dowry_account_join_by_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.request_dowry_account_join_by_code(text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.request_gallery_partner_access_by_code(text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.request_gallery_partner_access_by_code(text,text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.sync_user_dowry_subcategories(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sync_user_dowry_subcategories(text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.toggle_dowry_item_completed(uuid,boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.toggle_dowry_item_completed(uuid,boolean) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.update_dowry_account_title(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_dowry_account_title(uuid,text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.update_dowry_item(uuid,text,text,integer,numeric,boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_dowry_item(uuid,text,text,integer,numeric,boolean) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.upsert_dowry_category_budget(text,numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.upsert_dowry_category_budget(text,numeric) TO authenticated;;
