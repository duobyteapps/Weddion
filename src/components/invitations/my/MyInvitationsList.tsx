import { View } from "react-native";

import { EmptyMyInvitations } from "@/components/invitations/my/EmptyMyInvitations";
import { JoinGalleryListCard } from "@/components/invitations/my/JoinGalleryListCard";
import { MyInvitationCard } from "@/components/invitations/my/MyInvitationCard";
import { UserInvitation } from "@/types/invitation";

type Props = {
  invitations: UserInvitation[];
  onEditPress: (invitation: UserInvitation) => void;
  onSharePress: (invitation: UserInvitation) => void;
  onDeletePress: (invitation: UserInvitation) => void;
  onOpenGalleryPress?: (invitation: UserInvitation) => void;
  onOpenGalleryAccountManagementPress?: (invitation: UserInvitation) => void;
  onJoinGalleryPress: () => void;
  onCreatePress: () => void;
  onMenuPress?: (invitation: UserInvitation) => void;
};

export function MyInvitationsList({
  invitations,
  onEditPress,
  onSharePress,
  onDeletePress,
  onOpenGalleryPress,
  onOpenGalleryAccountManagementPress,
  onJoinGalleryPress,
  onCreatePress,
  onMenuPress,
}: Props) {
  const hasInvitations = invitations.length > 0;

  if (!hasInvitations) {
    return (
      <View className="mb-6 gap-4">
        <EmptyMyInvitations onCreatePress={onCreatePress} />

        <JoinGalleryListCard onPress={onJoinGalleryPress} />
      </View>
    );
  }

  return (
    <View className="mb-6 gap-4">
      {invitations.map((invitation) => (
        <MyInvitationCard
          key={invitation.id}
          invitation={invitation}
          onEditPress={onEditPress}
          onSharePress={onSharePress}
          onDeletePress={onDeletePress}
          onOpenGalleryPress={onOpenGalleryPress}
          onOpenGalleryAccountManagementPress={
            onOpenGalleryAccountManagementPress
          }
          onMenuPress={onMenuPress}
        />
      ))}

      <JoinGalleryListCard onPress={onJoinGalleryPress} />
    </View>
  );
}
