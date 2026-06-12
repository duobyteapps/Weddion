export type InvitationTemplate = {
  id: string;
  title: string;
  category: string;
  category_title: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
  is_premium: boolean;
  created_at?: string;
};
