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
import { useAppAlert } from "@/components/ui/AppAlert";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import {
  deleteGuestPhoto,
  getGuestPhotosByInvitation,
} from "@/services/guestPhotoService";
import { getCurrentUserInvitations } from "@/services/invitationService";
import { InvitationGuestPhoto, UserInvitation } from "@/types/invitation";

type GalleryPhotos = ComponentProps<typeof GalleryPhotoGrid>["photos"];
type GalleryPhoto = GalleryPhotos[number];

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
): GalleryPhoto {
  return {
    id: photo.id,
    imageUrl: photo.public_url ?? "",
    createdAt: photo.created_at,
  };
}

export default function GalleryScreen() {
  const { showAlert } = useAppAlert();

  const [invitations, setInvitations] = useState<UserInvitation[]>([]);
  const [selectedInvitationId, setSelectedInvitationId] = useState<string>();
  const [guestPhotos, setGuestPhotos] = useState<InvitationGuestPhoto[]>([]);
  const [photos, setPhotos] = useState<GalleryPhotos>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);

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
      setGuestPhotos([]);
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

      showAlert({
        type: "error",
        title: "Davetler alınamadı",
        message: "Davetler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.",
        confirmText: "Tamam",
      });
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

      const visibleGuestPhotos = data.filter((photo) =>
        Boolean(photo.public_url),
      );

      const galleryPhotos = visibleGuestPhotos.map(mapGuestPhotoToGalleryPhoto);

      setGuestPhotos(visibleGuestPhotos);
      setPhotos(galleryPhotos);
    } catch (error) {
      console.log("Galeri fotoğrafları alınamadı:", error);

      if (isMountedRef.current) {
        setGuestPhotos([]);
        setPhotos([]);
      }

      showAlert({
        type: "error",
        title: "Fotoğraflar alınamadı",
        message:
          "Misafir fotoğrafları yüklenirken bir hata oluştu. Lütfen tekrar deneyin.",
        confirmText: "Tamam",
      });
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

  const removePhotoFromState = (photoId: string) => {
    setGuestPhotos((currentPhotos) =>
      currentPhotos.filter((photo) => photo.id !== photoId),
    );

    setPhotos((currentPhotos) =>
      currentPhotos.filter((photo) => photo.id !== photoId),
    );
  };

  const handleDeletePhoto = (photo: GalleryPhoto) => {
    const targetPhoto = guestPhotos.find(
      (guestPhoto) => guestPhoto.id === photo.id,
    );

    if (!targetPhoto) {
      showAlert({
        type: "error",
        title: "Fotoğraf bulunamadı",
        message: "Silmek istediğiniz fotoğraf artık mevcut değil.",
        confirmText: "Tamam",
      });

      return;
    }

    showAlert({
      type: "warning",
      title: "Fotoğraf silinsin mi?",
      message:
        "Bu fotoğraf galeriden ve depolama alanından silinecek. Bu işlem geri alınamaz.",
      cancelText: "Vazgeç",
      confirmText: "Sil",
      onConfirm: async () => {
        try {
          setDeletingPhotoId(targetPhoto.id);

          await deleteGuestPhoto(targetPhoto);

          if (!isMountedRef.current) {
            return;
          }

          removePhotoFromState(targetPhoto.id);

          showAlert({
            type: "success",
            title: "Fotoğraf silindi",
            message: "Misafir fotoğrafı başarıyla silindi.",
            confirmText: "Tamam",
          });
        } catch (error) {
          console.log("Fotoğraf silinemedi:", error);

          showAlert({
            type: "error",
            title: "Silme başarısız",
            message:
              "Fotoğraf silinirken bir hata oluştu. Lütfen tekrar deneyin.",
            confirmText: "Tamam",
          });
        } finally {
          if (isMountedRef.current) {
            setDeletingPhotoId(null);
          }
        }
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
              <GalleryPhotoGrid
                photos={photos}
                onDeletePhoto={handleDeletePhoto}
              />
            ) : (
              <EmptyGalleryNoPhotos onPressShareQrCode={handlePressQrCode} />
            )}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
