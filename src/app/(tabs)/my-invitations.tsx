import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";

import { ScreenHeader } from "@/components/common/ScreenHeader";
import { CreateInvitationListCard } from "@/components/invitations/my/CreateInvitationListCard";
import { MyInvitationsHero } from "@/components/invitations/my/MyInvitationsHero";
import { MyInvitationsList } from "@/components/invitations/my/MyInvitationsList";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { getCurrentUserInvitations } from "@/services/invitationService";
import { UserInvitation } from "@/types/invitation";

function getInvitationRouteParams(invitation: UserInvitation) {
  return {
    templateId: invitation.template_id,
    invitationId: invitation.id,
    shareSlug: invitation.share_slug,
    invitationImageUrl: invitation.invitation_image_url ?? "",

    brideName: invitation.bride_name,
    groomName: invitation.groom_name,
    brideParents: invitation.bride_parents ?? "",
    groomParents: invitation.groom_parents ?? "",
    brideSurname: invitation.bride_surname ?? "",
    groomSurname: invitation.groom_surname ?? "",
    date: invitation.event_date,
    time: invitation.event_time ?? "",
    description: invitation.description ?? "",
    venueName: invitation.venue_name ?? "",
    venueLocation: invitation.venue_location ?? "",
  };
}

export default function MyInvitationsScreen() {
  const [invitations, setInvitations] = useState<UserInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchInvitations();
  }, []);

  async function fetchInvitations() {
    try {
      setLoading(true);
      const data = await getCurrentUserInvitations();
      setInvitations(data);
    } catch (error) {
      console.log("Davetiyeler alınamadı:", error);

      Alert.alert(
        "Davetiyeler alınamadı",
        "Davetiyeler yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    try {
      setRefreshing(true);
      const data = await getCurrentUserInvitations();
      setInvitations(data);
    } catch (error) {
      console.log("Davetiyeler yenilenemedi:", error);
    } finally {
      setRefreshing(false);
    }
  }

  function handleCreateInvitation() {
    router.push("/invitation-select");
  }

  function handleEditInvitation(invitation: UserInvitation) {
    router.push({
      pathname: "/invitation-flow/[templateId]/edit",
      params: getInvitationRouteParams(invitation),
    });
  }

  function handleShareInvitation(invitation: UserInvitation) {
    router.push({
      pathname: "/invitation-flow/[templateId]/share",
      params: getInvitationRouteParams(invitation),
    });
  }

  function handleMenuPress(invitation: UserInvitation) {
    Alert.alert(
      "Davetiye İşlemleri",
      `${invitation.bride_name} & ${invitation.groom_name} davetiyesi için işlemler daha sonra aktif edilecek.`,
    );
  }

  if (loading) {
    return (
      <ScreenContainer className="bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#A875D1" />
          <AppText className="mt-3">Davetiyeleriniz hazırlanıyor...</AppText>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#A875D1"
          />
        }
      >
        <ScreenHeader
          title="Davetlerim"
          description="Oluşturduğunuz tüm davetleri buradan görüntüleyebilirsiniz."
        />

        <MyInvitationsHero />

        <MyInvitationsList
          invitations={invitations}
          onEditPress={handleEditInvitation}
          onSharePress={handleShareInvitation}
          onMenuPress={handleMenuPress}
        />

        <CreateInvitationListCard onPress={handleCreateInvitation} />
      </ScrollView>
    </ScreenContainer>
  );
}
