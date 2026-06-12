// src/app/(tabs)/my-invitations.tsx

import { ScreenHeader } from "@/components/common/ScreenHeader";
import { EmptyMyInvitations } from "@/components/invitations/my/EmptyMyInvitations";
import { MyInvitationsHero } from "@/components/invitations/my/MyInvitationsHero";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ScrollView } from "react-native";

export default function MyInvitationsScreen() {
  const handleCreateInvitation = () => {
    // router.push("/create");
  };
  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32"
      >
        <ScreenHeader
          title="Davetiyelerim"
          description="Oluşturduğunuz tüm davetiyeleri buradan görüntüleyebilirsiniz."
        />
        <MyInvitationsHero />
        <EmptyMyInvitations onCreatePress={handleCreateInvitation} />
      </ScrollView>
    </ScreenContainer>
  );
}
