import type { UserInvitation } from "@/types/invitation";

export type GalleryAccessRole = "owner" | "partner";

export type GalleryAccessibleInvitation = UserInvitation & {
  owner_user_id?: string | null;
  access_role?: GalleryAccessRole;
  gallery_partner_invite_code?: string | null;
  gallery_partner_invite_enabled?: boolean | null;

  owner_display_name?: string | null;
  partner_user_id?: string | null;
  partner_display_name?: string | null;
};

export type GalleryPartner = {
  id: string;
  invitationId: string;
  partnerUserId: string;
  displayName?: string | null;
  role: "partner";
  status: "active" | "removed" | "left";
  createdAt: string;
};

export type GalleryPartnerRequest = {
  id: string;
  invitationId: string;
  requesterUserId: string;
  requesterDisplayName: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
  createdAt: string;
};
