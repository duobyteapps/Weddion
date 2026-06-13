import { View } from "react-native";

import { CreateInvitationListCard } from "@/components/invitations/my/CreateInvitationListCard";
import { EmptyMyInvitations } from "@/components/invitations/my/EmptyMyInvitations";
import { MyInvitationCard } from "@/components/invitations/my/MyInvitationCard";
import { UserInvitation } from "@/types/invitation";

type Props = {
  invitations: UserInvitation[];
  onEditPress: (invitation: UserInvitation) => void;
  onSharePress: (invitation: UserInvitation) => void;
  onDeletePress: (invitation: UserInvitation) => void;
  onCreatePress: () => void;
  onMenuPress?: (invitation: UserInvitation) => void;
};

export function MyInvitationsList({
  invitations,
  onEditPress,
  onSharePress,
  onDeletePress,
  onCreatePress,
  onMenuPress,
}: Props) {
  const hasInvitations = invitations.length > 0;

  if (!hasInvitations) {
    return (
      <View className="mb-6">
        <EmptyMyInvitations onCreatePress={onCreatePress} />
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
          onMenuPress={onMenuPress}
        />
      ))}

      <CreateInvitationListCard onPress={onCreatePress} />
    </View>
  );
}
