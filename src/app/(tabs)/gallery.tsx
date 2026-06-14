import { router } from "expo-router";
import { ComponentProps, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

import { ScreenHeader } from "@/components/common/ScreenHeader";
import { EmptyGalleryNoInvitation } from "@/components/gallery/EmptyGalleryNoInvitation";
import { EmptyGalleryNoPhotos } from "@/components/gallery/EmptyGalleryNoPhotos";
import {
  GalleryEventOption,
  GalleryEventSummaryCard,
} from "@/components/gallery/GalleryEventSummaryCard";
import { GalleryPhotoGrid } from "@/components/gallery/GalleryPhotoGrid";
import { GalleryQrInfoCard } from "@/components/gallery/GalleryQrInfoCard";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { getGuestPhotosByInvitation } from "@/services/guestPhotoService";
import { getCurrentUserInvitations } from "@/services/invitationService";
import { InvitationGuestPhoto, UserInvitation } from "@/types/invitation";

type GalleryPhotos = ComponentProps<typeof GalleryPhotoGrid>["photos"];

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

function mapGuestPhotoToGalleryPhoto(
  photo: InvitationGuestPhoto,
): GalleryPhotos[number] {
  return {
    id: photo.id,
    imageUrl: photo.public_url ?? "",
    createdAt: photo.created_at,
  };
}

export default function GalleryScreen() {
  const [invitations, setInvitations] = useState<UserInvitation[]>([]);
  const [selectedInvitationId, setSelectedInvitationId] = useState<string>();
  const [photos, setPhotos] = useState<GalleryPhotos>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    fetchInvitations();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedInvitationId) {
      setPhotos([]);
      return;
    }

    fetchPhotos(selectedInvitationId);
  }, [selectedInvitationId]);

  const fetchInvitations = async () => {
    try {
      if (isMountedRef.current) {
        setLoadingInvitations(true);
      }

      const data = await getCurrentUserInvitations();

      if (!isMountedRef.current) {
        return;
      }

      setInvitations(data);

      if (data.length > 0) {
        setSelectedInvitationId(data[0].id);
      }
    } catch (error) {
      console.log("Galeri davetiyeleri alınamadı:", error);
    } finally {
      if (isMountedRef.current) {
        setLoadingInvitations(false);
      }
    }
  };

  const fetchPhotos = async (invitationId: string) => {
    try {
      if (isMountedRef.current) {
        setLoadingPhotos(true);
      }

      const data = await getGuestPhotosByInvitation(invitationId);

      if (!isMountedRef.current) {
        return;
      }

      const galleryPhotos = data
        .filter((photo) => Boolean(photo.public_url))
        .map(mapGuestPhotoToGalleryPhoto);

      setPhotos(galleryPhotos);
    } catch (error) {
      console.log("Galeri fotoğrafları alınamadı:", error);

      if (isMountedRef.current) {
        setPhotos([]);
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingPhotos(false);
      }
    }
  };

  const eventOptions: GalleryEventOption[] = useMemo(() => {
    return invitations.map((invitation) => ({
      id: invitation.id,
      title: formatEventTitle(invitation),
      date: formatEventDate(invitation.event_date),
    }));
  }, [invitations]);

  const selectedInvitation = useMemo(() => {
    return invitations.find(
      (invitation) => invitation.id === selectedInvitationId,
    );
  }, [invitations, selectedInvitationId]);

  const hasInvitation = eventOptions.length > 0;
  const hasPhotos = photos.length > 0;

  const handleCreateInvitation = () => {
    router.push("/invitation-select");
  };

  const handlePressQrCode = () => {
    if (!selectedInvitation) {
      return;
    }

    router.push({
      pathname: "/invitation-flow/[templateId]/share",
      params: {
        templateId: selectedInvitation.template_id,
        invitationId: selectedInvitation.id,
        shareSlug: selectedInvitation.share_slug ?? "",
        invitationImageUrl: selectedInvitation.invitation_image_url ?? "",

        guestUploadCode: selectedInvitation.guest_upload_code ?? "",
        guestUploadSlug: selectedInvitation.guest_upload_slug ?? "",
        guestUploadQrValue: selectedInvitation.guest_upload_qr_value ?? "",

        brideName: selectedInvitation.bride_name,
        groomName: selectedInvitation.groom_name,
        brideParents: selectedInvitation.bride_parents ?? "",
        groomParents: selectedInvitation.groom_parents ?? "",
        brideSurname: selectedInvitation.bride_surname ?? "",
        groomSurname: selectedInvitation.groom_surname ?? "",
        date: selectedInvitation.event_date,
        time: selectedInvitation.event_time ?? "",
        description: selectedInvitation.description ?? "",
        venueName: selectedInvitation.venue_name ?? "",
        venueLocation: selectedInvitation.venue_location ?? "",
      },
    });
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

            {loadingPhotos ? (
              <View className="mt-10 items-center justify-center">
                <ActivityIndicator />
              </View>
            ) : hasPhotos ? (
              <GalleryPhotoGrid photos={photos} />
            ) : (
              <EmptyGalleryNoPhotos onPressShareQrCode={handlePressQrCode} />
            )}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
