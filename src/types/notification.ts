export type NotificationType = "guest_photo" | "system";

export type UserNotification = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  related_invitation_id: string | null;
  related_guest_photo_id: string | null;
  is_read: boolean;
  created_at: string;
};
