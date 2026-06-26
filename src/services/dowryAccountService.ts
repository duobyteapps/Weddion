import { supabase } from "@/lib/supabase";
import {
  DowryAccount,
  DowryAccountMember,
  DowryAccountMemberTableRow,
  DowryAccountTableRow,
} from "@/types/dowry";

function mapDowryAccount(row: DowryAccountTableRow): DowryAccount {
  return {
    id: row.id,
    title: row.title,
    ownerUserId: row.owner_user_id,
    inviteCode: row.invite_code,
    role: row.role,
    status: row.status,
    memberCount: Number(row.member_count ?? 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapDowryAccountMember(
  row: DowryAccountMemberTableRow,
): DowryAccountMember {
  return {
    id: row.id,
    dowryAccountId: row.dowry_account_id,
    userId: row.user_id,
    firstName: row.first_name,
    lastName: row.last_name,
    displayName: row.display_name,
    role: row.role,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getMyDowryAccounts(): Promise<DowryAccount[]> {
  const { data, error } = await supabase.rpc("get_my_dowry_accounts");

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as DowryAccountTableRow[]).map(mapDowryAccount);
}

export async function getOrCreateMyDefaultDowryAccount(): Promise<DowryAccount> {
  const { data, error } = await supabase.rpc(
    "get_or_create_my_default_dowry_account",
  );

  if (error) {
    throw new Error(error.message);
  }

  const account = ((data ?? []) as DowryAccountTableRow[])[0];

  if (!account) {
    throw new Error("Çeyiz hesabı bulunamadı.");
  }

  return mapDowryAccount(account);
}

export async function joinDowryAccountByCode(
  inviteCode: string,
): Promise<DowryAccount> {
  const normalizedInviteCode = inviteCode.trim().toUpperCase();

  if (normalizedInviteCode.length < 4) {
    throw new Error("Geçerli bir davet kodu girin.");
  }

  const { data, error } = await supabase.rpc("join_dowry_account_by_code", {
    p_invite_code: normalizedInviteCode,
  });

  if (error) {
    throw new Error(error.message);
  }

  const account = ((data ?? []) as DowryAccountTableRow[])[0];

  if (!account) {
    throw new Error("Çeyiz hesabına katılma işlemi tamamlanamadı.");
  }

  return mapDowryAccount(account);
}

export async function refreshDowryInviteCode(
  dowryAccountId: string,
): Promise<DowryAccount> {
  const { data, error } = await supabase.rpc("refresh_dowry_invite_code", {
    p_dowry_account_id: dowryAccountId,
  });

  if (error) {
    throw new Error(error.message);
  }

  const account = ((data ?? []) as DowryAccountTableRow[])[0];

  if (!account) {
    throw new Error("Davet kodu yenilenemedi.");
  }

  return mapDowryAccount(account);
}

export async function updateDowryAccountTitle({
  dowryAccountId,
  title,
}: {
  dowryAccountId: string;
  title: string;
}): Promise<DowryAccount> {
  const { data, error } = await supabase.rpc("update_dowry_account_title", {
    p_dowry_account_id: dowryAccountId,
    p_title: title.trim(),
  });

  if (error) {
    throw new Error(error.message);
  }

  const account = ((data ?? []) as DowryAccountTableRow[])[0];

  if (!account) {
    throw new Error("Çeyiz hesabı adı güncellenemedi.");
  }

  return mapDowryAccount(account);
}

export async function getDowryAccountMembers(
  dowryAccountId: string,
): Promise<DowryAccountMember[]> {
  const { data, error } = await supabase.rpc("get_dowry_account_members", {
    p_dowry_account_id: dowryAccountId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as DowryAccountMemberTableRow[]).map(
    mapDowryAccountMember,
  );
}

export async function removeDowryAccountMember({
  dowryAccountId,
  memberUserId,
}: {
  dowryAccountId: string;
  memberUserId: string;
}): Promise<void> {
  const { error } = await supabase.rpc("remove_dowry_account_member", {
    p_dowry_account_id: dowryAccountId,
    p_member_user_id: memberUserId,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function leaveDowryAccount(dowryAccountId: string): Promise<void> {
  const { error } = await supabase.rpc("leave_dowry_account", {
    p_dowry_account_id: dowryAccountId,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function archiveDowryAccount(
  dowryAccountId: string,
): Promise<void> {
  const { error } = await supabase.rpc("archive_dowry_account", {
    p_dowry_account_id: dowryAccountId,
  });

  if (error) {
    throw new Error(error.message);
  }
}
