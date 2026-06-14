export type InvitationTemplate = {
  id: string;
  title: string;
  category: string;
  category_title: string;
  image_url: string;
  editable_image_url?: string | null;
  content_image_url?: string | null;
  generated_image_url?: string | null;
  is_active: boolean;
  sort_order: number;
  is_premium: boolean;
  created_at?: string;
};

export type InvitationFormData = {
  brideName: string;
  groomName: string;
  brideParents: string;
  groomParents: string;
  brideSurname: string;
  groomSurname: string;
  date: string;
  time: string;
  description: string;
  venueName: string;
  venueLocation: string;
};

export type UserInvitationStatus = "draft" | "ready" | "shared";

export type UserInvitation = {
  id: string;
  user_id: string;
  template_id: string;

  bride_name: string;
  groom_name: string;
  bride_parents: string | null;
  groom_parents: string | null;
  bride_surname: string | null;
  groom_surname: string | null;

  event_date: string;
  event_time: string | null;
  description: string | null;
  venue_name: string | null;
  venue_location: string | null;

  invitation_image_url: string | null;
  invitation_image_path: string | null;

  status: UserInvitationStatus;
  share_slug: string;

  guest_upload_code: string | null;
  guest_upload_slug: string | null;
  guest_upload_enabled: boolean;
  guest_upload_expires_at: string | null;
  guest_upload_qr_value: string | null;

  created_at: string;
  updated_at: string;
};

export type InvitationGuestPhotoStatus = "pending" | "approved" | "rejected";

export type InvitationGuestPhoto = {
  id: string;
  invitation_id: string;

  storage_path: string;
  public_url: string | null;

  guest_name: string | null;
  guest_note: string | null;

  upload_code: string;
  status: InvitationGuestPhotoStatus;

  created_at: string;
};

export type GuestInvitationAccess = {
  id: string;
  bride_name: string;
  groom_name: string;
  event_date: string | null;
  event_time: string | null;
  venue_name: string | null;
  guest_upload_code: string;
  guest_upload_slug: string;
  guest_upload_enabled: boolean;
};

export type CreateUserInvitationPayload = {
  templateId: string;
  formData: InvitationFormData;
  status?: UserInvitationStatus;
  capturedImageUri?: string | null;
};

export type UpdateUserInvitationPayload = {
  invitationId: string;
  templateId: string;
  formData: InvitationFormData;
  status?: UserInvitationStatus;
  capturedImageUri?: string | null;
};
