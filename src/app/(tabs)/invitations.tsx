// src/app/(tabs)/invitations.tsx

import { ScreenHeader } from "@/components/common/ScreenHeader";
import { EmptyInvitations } from "@/components/invitations/EmptyInvitations";
import { InvitationsHero } from "@/components/invitations/InvitationsHero";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ScrollView } from "react-native";

export default function InvitationsScreen() {
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
        <InvitationsHero />
        <EmptyInvitations onCreatePress={handleCreateInvitation} />
      </ScrollView>
    </ScreenContainer>
  );
}
