import { Pressable, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppIconBox } from "@/components/ui/AppIconBox";
import { AppText } from "@/components/ui/AppText";
import { DowryAccountMember } from "@/types/dowry";

type Props = {
  members: DowryAccountMember[];
  isOwner: boolean;
  onRemoveMember: (member: DowryAccountMember) => void;
};

export function DowryAccountMembersCard({
  members,
  isOwner,
  onRemoveMember,
}: Props) {
  return (
    <AppCard>
      <AppText variant="subtitle" className="mb-4 text-textDark">
        Çeyiz Ortakları
      </AppText>

      {members.map((member, index) => {
        const memberIsOwner = member.role === "owner";
        const isLast = index === members.length - 1;

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
              <AppText variant="captionStrong">
                {memberIsOwner ? "Hesap Sahibi" : "Çeyiz Ortağı"}
              </AppText>

              <AppText variant="caption" className="mt-1">
                {member.displayName ?? "İsim bilgisi yok"}
              </AppText>
            </View>

            {isOwner && !memberIsOwner ? (
              <Pressable
                onPress={() => onRemoveMember(member)}
                className="rounded-full bg-white px-3 py-2"
              >
                <AppText variant="captionStrong" className="text-error">
                  Çıkar
                </AppText>
              </Pressable>
            ) : (
              <View className="rounded-full bg-primaryLight px-3 py-1">
                <AppText variant="captionStrong">
                  {memberIsOwner ? "Sahip" : "Ortak"}
                </AppText>
              </View>
            )}
          </View>
        );
      })}
    </AppCard>
  );
}
