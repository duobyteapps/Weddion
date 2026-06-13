import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, Pressable, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { UserInvitation } from "@/types/invitation";

type Props = {
  invitation: UserInvitation;
  onEditPress: (invitation: UserInvitation) => void;
  onSharePress: (invitation: UserInvitation) => void;
  onMenuPress?: (invitation: UserInvitation) => void;
};

function normalizeImageUri(imageUrl?: string | null) {
  if (!imageUrl) {
    return null;
  }

  if (
    imageUrl.startsWith("data:image") ||
    imageUrl.startsWith("file://") ||
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("content://")
  ) {
    return imageUrl;
  }

  return `file://${imageUrl}`;
}

function formatInvitationTitle(invitation: UserInvitation) {
  const brideName = invitation.bride_name?.trim();
  const groomName = invitation.groom_name?.trim();

  if (brideName && groomName) {
    return `${brideName} & ${groomName} Düğün Davetiyesi`;
  }

  return "Düğün Davetiyesi";
}

function formatVenue(invitation: UserInvitation) {
  const venueName = invitation.venue_name?.trim();
  const venueLocation = invitation.venue_location?.trim();

  if (venueName && venueLocation) {
    return `${venueName} - ${venueLocation}`;
  }

  if (venueName) {
    return venueName;
  }

  if (venueLocation) {
    return venueLocation;
  }

  return "Mekan bilgisi eklenmedi";
}

function truncateText(text: string, maxLength = 28) {
  const cleanText = text.trim();

  if (cleanText.length <= maxLength) {
    return cleanText;
  }

  return `${cleanText.slice(0, maxLength).trim()}...`;
}

export function MyInvitationCard({
  invitation,
  onEditPress,
  onSharePress,
}: Props) {
  const imageUri = normalizeImageUri(invitation.invitation_image_url);
  const title = formatInvitationTitle(invitation);
  const venue = formatVenue(invitation);

  return (
    <AppCard noMargin noPadding className="overflow-hidden py-4">
      <View className="flex-row gap-4">
        <View className="h-[126px] w-[126px] overflow-hidden rounded-2xl bg-primaryLight/30">
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              className="h-full w-full"
              resizeMode="cover"
              onError={(error) => {
                console.log(
                  "Davetiyelerim görsel yüklenemedi:",
                  error.nativeEvent,
                );
              }}
            />
          ) : (
            <View className="flex-1 items-center justify-center px-3">
              <MaterialCommunityIcons
                name="image-off-outline"
                size={24}
                color="#A875D1"
              />

              <AppText className="mt-2 text-center text-[10px] text-textMuted">
                Görsel yok
              </AppText>
            </View>
          )}
        </View>

        <View className="flex-1">
          <View className="flex-row items-start justify-between gap-2">
            <AppText
              variant="subtitle"
              numberOfLines={1}
              ellipsizeMode="tail"
              className="flex-1 !text-[12px]"
            >
              {truncateText(title, 25)}
            </AppText>
          </View>

          <View className="mt-3 gap-2">
            <View className="flex-row items-center">
              <View className="mr-2 h-5 w-5 items-center justify-center rounded-full bg-primaryLight/60">
                <Feather name="calendar" size={11} color="#A875D1" />
              </View>

              <AppText
                variant="caption"
                numberOfLines={1}
                className="flex-1 !text-[9px]"
              >
                {invitation.event_date || "Tarih eklenmedi"}
              </AppText>
            </View>

            <View className="flex-row items-center">
              <View className="mr-2 h-5 w-5 items-center justify-center rounded-full bg-primaryLight/60">
                <Feather name="map-pin" size={11} color="#A875D1" />
              </View>

              <AppText
                variant="caption"
                numberOfLines={1}
                className="flex-1 !text-[9px]"
              >
                {venue}
              </AppText>
            </View>
          </View>

          <View className="mt-4 flex-row gap-3">
            <Pressable
              onPress={() => onEditPress(invitation)}
              className="h-9 flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-borderSoft bg-white"
            >
              <Feather name="edit-3" size={13} color="#A875D1" />

              <AppText
                variant="body"
                className="ml-1.5 !text-[10px] text-textMuted"
              >
                Düzenle
              </AppText>
            </Pressable>

            <Pressable
              onPress={() => onSharePress(invitation)}
              className="h-9 flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary"
            >
              <Feather name="share-2" size={13} color="#FFFFFF" />

              <AppText
                variant="body"
                className="ml-1.5 !text-[10px] text-white"
              >
                Paylaş
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </AppCard>
  );
}
