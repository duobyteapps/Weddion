import { View } from "react-native";

import { MyInvitationCard } from "@/components/invitations/my/MyInvitationCard";
import { UserInvitation } from "@/types/invitation";

type Props = {
  invitations: UserInvitation[];
  onEditPress: (invitation: UserInvitation) => void;
  onSharePress: (invitation: UserInvitation) => void;
  onDeletePress: (invitation: UserInvitation) => void;
  onMenuPress?: (invitation: UserInvitation) => void;
};

export function MyInvitationsList({
  invitations,
  onEditPress,
  onSharePress,
  onDeletePress,
  onMenuPress,
}: Props) {
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
    </View>
  );
}
