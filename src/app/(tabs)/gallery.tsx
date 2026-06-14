import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

import { ScreenHeader } from "@/components/common/ScreenHeader";
import { EmptyGalleryNoInvitation } from "@/components/gallery/EmptyGalleryNoInvitation";
import { EmptyGalleryNoPhotos } from "@/components/gallery/EmptyGalleryNoPhotos";
import {
  GalleryEventOption,
  GalleryEventSummaryCard,
} from "@/components/gallery/GalleryEventSummaryCard";
import { GalleryQrInfoCard } from "@/components/gallery/GalleryQrInfoCard";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { getCurrentUserInvitations } from "@/services/invitationService";
import { UserInvitation } from "@/types/invitation";

function formatEventTitle(invitation: UserInvitation) {
  const brideName = invitation.bride_name ?? "";
  const groomName = invitation.groom_name ?? "";

  const title = `${brideName} & ${groomName}`.trim();

  if (title === "&") {
    return "İsimsiz Davetiye";
  }

  return title;
}

function formatEventDate(date?: string | null) {
  if (!date) {
    return "Tarih belirtilmedi";
  }

  return new Date(date).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function GalleryScreen() {
  const [invitations, setInvitations] = useState<UserInvitation[]>([]);
  const [selectedInvitationId, setSelectedInvitationId] = useState<string>();
  const [loadingInvitations, setLoadingInvitations] = useState(true);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoadingInvitations(true);

      const data = await getCurrentUserInvitations();

      setInvitations(data);

      if (data.length > 0) {
        setSelectedInvitationId(data[0].id);
      }
    } catch (error) {
      console.log("Galeri davetiyeleri alınamadı:", error);
    } finally {
      setLoadingInvitations(false);
    }
  };

  const eventOptions: GalleryEventOption[] = useMemo(() => {
    return invitations.map((invitation) => ({
      id: invitation.id,
      title: formatEventTitle(invitation),
      date: formatEventDate(invitation.event_date),
    }));
  }, [invitations]);

  const hasInvitation = eventOptions.length > 0;

  const handleCreateInvitation = () => {
    router.push("/invitation-select");
  };

  const handlePressQrCode = () => {
    console.log("QR kod görüntüle:", selectedInvitationId);
  };

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32"
      >
        <ScreenHeader
          title="Galeri"
          description="Davetlerinizin fotoğraflarını yönetin."
        />

        {loadingInvitations ? (
          <View className="mt-10 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : !hasInvitation ? (
          <EmptyGalleryNoInvitation onCreatePress={handleCreateInvitation} />
        ) : (
          <>
            <GalleryEventSummaryCard
              events={eventOptions}
              selectedEventId={selectedInvitationId}
              onChangeEvent={setSelectedInvitationId}
            />

            <GalleryQrInfoCard onPressQrCode={handlePressQrCode} />

            <EmptyGalleryNoPhotos onPressShareQrCode={handlePressQrCode} />
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
