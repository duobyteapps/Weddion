import { Pressable, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppIconBox } from "@/components/ui/AppIconBox";
import { AppText } from "@/components/ui/AppText";
import type {
  GalleryAccessibleInvitation,
  GalleryPartner,
} from "@/types/galleryPartner";

type Props = {
  selectedInvitation: GalleryAccessibleInvitation | null;
  partner: GalleryPartner | null;
  isOwner: boolean;
  removingPartner: boolean;
  onRemovePartner: () => void;
};

const OWNER_COLOR = "#8FAF8B";
const MEMBER_COLOR = "#C9B37E";

function getMemberDisplayName(...values: Array<string | null | undefined>) {
  const displayName = values
    .map((value) => value?.trim())
    .find((value) => Boolean(value));

  return displayName ?? "İsim bilgisi yok";
}

export function GalleryPartnerMembersCard({
  selectedInvitation,
  partner,
  isOwner,
  removingPartner,
  onRemovePartner,
}: Props) {
  if (!selectedInvitation) {
    return null;
  }

  const members = [
    {
      id: "owner",
      role: "owner",
      title: "Hesap Sahibi",
      displayName: getMemberDisplayName(selectedInvitation.owner_display_name),
    },
    ...(partner || selectedInvitation.partner_user_id
      ? [
          {
            id:
              selectedInvitation.partner_user_id ??
              partner?.partnerUserId ??
              "partner",
            role: "partner",
            title: "Galeri Ortağı",
            displayName: getMemberDisplayName(
              selectedInvitation.partner_display_name,
              partner?.displayName,
            ),
          },
        ]
      : []),
  ];

  return (
    <AppCard className="mt-5">
      <AppText variant="subtitle" className="mb-4 text-textDark">
        Galeri Ortakları
      </AppText>

      {members.map((member, index) => {
        const memberIsOwner = member.role === "owner";
        const memberIsPartner = member.role === "partner";
        const isLast = index === members.length - 1;
        const roleColor = memberIsOwner ? OWNER_COLOR : MEMBER_COLOR;

        return (
          <View
            key={member.id}
            className={`flex-row items-center ${
              isLast ? "pb-0" : "border-b border-borderSoft pb-3"
            } ${index === 0 ? "" : "pt-3"}`}
          >
            <AppIconBox
              icon={memberIsOwner ? "person" : "people-outline"}
              size={19}
              className="mr-3 h-10 w-10 bg-primaryLight"
            />

            <View className="flex-1">
              <AppText variant="captionStrong">{member.title}</AppText>

              <AppText variant="caption" className="mt-1">
                {member.displayName}
              </AppText>
            </View>

            <View className="items-end">
              <View
                className="rounded-full px-3 py-1"
                style={{ backgroundColor: `${roleColor}18` }}
              >
                <AppText variant="captionStrong" style={{ color: roleColor }}>
                  {memberIsOwner ? "Sahip" : "Ortak"}
                </AppText>
              </View>

              {isOwner && memberIsPartner ? (
                <Pressable
                  onPress={onRemovePartner}
                  disabled={removingPartner}
                  className="mt-2 rounded-full bg-white px-3 py-2"
                >
                  <AppText variant="captionStrong" className="text-error">
                    {removingPartner ? "Çıkarılıyor..." : "Çıkar"}
                  </AppText>
                </Pressable>
              ) : null}
            </View>
          </View>
        );
      })}
    </AppCard>
  );
}
