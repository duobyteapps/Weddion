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

  status: UserInvitationStatus;
  share_slug: string;

  created_at: string;
  updated_at: string;
};

export type CreateUserInvitationPayload = {
  templateId: string;
  formData: InvitationFormData;
  status?: UserInvitationStatus;
};
