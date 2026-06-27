import { supabase } from "@/lib/supabase";
import type {
  GalleryAccessibleInvitation,
  GalleryPartner,
  GalleryPartnerRequest,
  GalleryPartnerRequestTableRow,
  GalleryPartnerTableRow,
} from "@/types/invitation";

function normalizeGalleryPartnerCode(code: string) {
  return code.trim().toUpperCase();
}

function normalizeDisplayName(value?: string | null) {
  const displayName = value?.trim();

  return displayName && displayName.length > 0 ? displayName : null;
}

function mapGalleryPartner(row: GalleryPartnerTableRow): GalleryPartner {
  return {
    id: row.id,
    invitationId: row.invitation_id,
    partnerUserId: row.partner_user_id,
    displayName: normalizeDisplayName(row.partner_display_name),
    role: row.role,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapGalleryPartnerRequest(
  row: GalleryPartnerRequestTableRow,
): GalleryPartnerRequest {
  return {
    id: row.id,
    invitationId: row.invitation_id,
    requesterUserId: row.requester_user_id,
    requesterDisplayName: normalizeDisplayName(row.requester_display_name),
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapGalleryAccessibleInvitation(
  row: GalleryAccessibleInvitation,
): GalleryAccessibleInvitation {
  return {
    ...row,
    owner_display_name: normalizeDisplayName(row.owner_display_name),
    partner_user_id: row.partner_user_id ?? null,
    partner_display_name: normalizeDisplayName(row.partner_display_name),
  };
}

export async function requestGalleryPartnerAccessByCode({
  code,
  displayName,
}: {
  code: string;
  displayName?: string | null;
}) {
  const normalizedCode = normalizeGalleryPartnerCode(code);

  if (normalizedCode.length < 4) {
    throw new Error("Geçerli bir galeri ortak kodu girin.");
  }

  const { data, error } = await supabase.rpc(
    "request_gallery_partner_access_by_code",
    {
      target_code: normalizedCode,
      display_name: normalizeDisplayName(displayName),
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getPendingGalleryPartnerRequests(
  invitationId: string,
): Promise<GalleryPartnerRequest[]> {
  const { data, error } = await supabase.rpc(
    "get_pending_gallery_partner_requests",
    {
      target_invitation_id: invitationId,
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as GalleryPartnerRequestTableRow[]).map(
    mapGalleryPartnerRequest,
  );
}

export async function approveGalleryPartnerRequest(requestId: string) {
  const { error } = await supabase.rpc("approve_gallery_partner_request", {
    target_request_id: requestId,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function rejectGalleryPartnerRequest(requestId: string) {
  const { error } = await supabase.rpc("reject_gallery_partner_request", {
    target_request_id: requestId,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function getGalleryPartner(
  invitationId: string,
): Promise<GalleryPartner | null> {
  const { data, error } = await supabase.rpc("get_gallery_partner", {
    target_invitation_id: invitationId,
  });

  if (error) {
    throw new Error(error.message);
  }

  const partner = ((data ?? []) as GalleryPartnerTableRow[])[0];

  return partner ? mapGalleryPartner(partner) : null;
}

export async function removeGalleryPartner({
  invitationId,
  partnerUserId,
}: {
  invitationId: string;
  partnerUserId: string;
}) {
  const { error } = await supabase.rpc("remove_gallery_partner", {
    target_invitation_id: invitationId,
    target_partner_user_id: partnerUserId,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function leaveGalleryPartnerAccess(invitationId: string) {
  const { error } = await supabase.rpc("leave_gallery_partner_access", {
    target_invitation_id: invitationId,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function refreshGalleryPartnerInviteCode(invitationId: string) {
  const { data, error } = await supabase.rpc(
    "refresh_gallery_partner_invite_code",
    {
      target_invitation_id: invitationId,
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  return data as {
    success: boolean;
    code: string;
    message?: string;
  };
}

export async function getMyGalleryAccessibleInvitations(): Promise<
  GalleryAccessibleInvitation[]
> {
  const { data, error } = await supabase.rpc(
    "get_my_gallery_accessible_invitations",
  );

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as GalleryAccessibleInvitation[]).map(
    mapGalleryAccessibleInvitation,
  );
}
