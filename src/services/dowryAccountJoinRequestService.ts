import { supabase } from "@/lib/supabase";
import { DowryJoinRequest, DowryJoinRequestTableRow } from "@/types/dowry";

function mapDowryJoinRequest(row: DowryJoinRequestTableRow): DowryJoinRequest {
  return {
    id: row.id,
    dowryAccountId: row.dowry_account_id,
    requesterUserId: row.requester_user_id,
    requesterDisplayName: row.requester_display_name ?? null,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function requestDowryAccountJoinByCode(
  inviteCode: string,
): Promise<DowryJoinRequest> {
  const normalizedInviteCode = inviteCode.trim().toUpperCase();

  if (normalizedInviteCode.length < 4) {
    throw new Error("Geçerli bir davet kodu girin.");
  }

  const { data, error } = await supabase.rpc(
    "request_dowry_account_join_by_code",
    {
      p_invite_code: normalizedInviteCode,
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  const request = ((data ?? []) as DowryJoinRequestTableRow[])[0];

  if (!request) {
    throw new Error("Katılma isteği oluşturulamadı.");
  }

  return mapDowryJoinRequest(request);
}

export async function getPendingDowryJoinRequests(
  dowryAccountId: string,
): Promise<DowryJoinRequest[]> {
  const { data, error } = await supabase.rpc(
    "get_pending_dowry_join_requests",
    {
      p_dowry_account_id: dowryAccountId,
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as DowryJoinRequestTableRow[]).map(mapDowryJoinRequest);
}

export async function approveDowryAccountJoinRequest(
  requestId: string,
): Promise<void> {
  const { error } = await supabase.rpc("approve_dowry_account_join_request", {
    p_request_id: requestId,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function rejectDowryAccountJoinRequest(
  requestId: string,
): Promise<void> {
  const { error } = await supabase.rpc("reject_dowry_account_join_request", {
    p_request_id: requestId,
  });

  if (error) {
    throw new Error(error.message);
  }
}
