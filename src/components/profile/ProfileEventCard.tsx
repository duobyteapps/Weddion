// src/components/profile/ProfileEventCard.tsx

import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";
import { UserInvitation } from "@/types/invitation";
import { Ionicons } from "@expo/vector-icons";
import {
  GestureResponderEvent,
  Image,
  ImageSourcePropType,
  Pressable,
  View,
} from "react-native";
import { AppCard } from "../ui/AppCard";

type ProfileEventCardProps = {
  invitation?: UserInvitation | null;
  onPress?: () => void;
  onPressInvitationGallery?: (invitation: UserInvitation) => void;
};

function formatDate(date?: string | null) {
  if (!date) return "Tarih eklenmedi";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}

function getInvitationTitle(invitation?: UserInvitation | null) {
  if (!invitation) return "Henüz davetin yok";

  const brideName = invitation.bride_name ?? "";
  const groomName = invitation.groom_name ?? "";
  const title = `${brideName} & ${groomName}`.trim();

  if (title === "&") {
    return "İsimsiz Davetiye";
  }

  return `${title} Davetiyesi`;
}

function getInvitationLocation(invitation?: UserInvitation | null) {
  if (!invitation) return "İlk davetini oluştur";

  return (
    invitation.venue_name || invitation.venue_location || "Mekan eklenmedi"
  );
}

function getInvitationImageSource(
  invitation?: UserInvitation | null,
): ImageSourcePropType {
  if (invitation?.invitation_image_url) {
    return { uri: invitation.invitation_image_url };
  }

  return require("@/assets/images/lavender-wedding-invitation.png");
}

export function ProfileEventCard({
  invitation,
  onPress,
  onPressInvitationGallery,
}: ProfileEventCardProps) {
  const handlePressInvitationTitle = (event: GestureResponderEvent) => {
    event.stopPropagation();

    if (!invitation) return;

    onPressInvitationGallery?.(invitation);
  };

  return (
    <AppCard>
      <Pressable onPress={onPress}>
        <View className="mb-5 flex-row items-center justify-between">
          <AppText variant="serifTitle" className="text-textDark">
            Davetlerim
          </AppText>

          <View className="flex-row items-center">
            <AppText variant="captionStrong" className="mr-2 !text-[10px]">
              Tümünü Gör
            </AppText>

            <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
          </View>
        </View>

        <View className="flex-row items-center">
          <Image
            source={getInvitationImageSource(invitation)}
            className="h-28 w-24 rounded-2xl"
            resizeMode="cover"
          />

          <View className="ml-3 flex-1">
            <Pressable
              disabled={!invitation}
              onPress={handlePressInvitationTitle}
              hitSlop={8}
            >
              <AppText variant="serifSubtitle" className=" text-textDark">
                {getInvitationTitle(invitation)}
              </AppText>
            </Pressable>

            <View className="mt-3 flex-row items-center">
              <Ionicons
                name="calendar-outline"
                size={18}
                color={Colors.textLight}
              />

              <AppText variant="body" className="ml-2">
                {invitation
                  ? formatDate(invitation.event_date)
                  : "Davet oluştur"}
              </AppText>
            </View>

            <View className="mt-2 flex-row items-center">
              <Ionicons
                name="location-outline"
                size={18}
                color={Colors.textLight}
              />

              <AppText variant="body" className="ml-2">
                {getInvitationLocation(invitation)}
              </AppText>
            </View>
          </View>
        </View>
      </Pressable>
    </AppCard>
  );
}
