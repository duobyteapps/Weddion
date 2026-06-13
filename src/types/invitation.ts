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
