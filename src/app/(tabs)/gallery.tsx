import { router, useLocalSearchParams } from "expo-router";
import { ComponentProps, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, View } from "react-native";

import { ScreenHeader } from "@/components/common/ScreenHeader";
import { EmptyGalleryNoInvitation } from "@/components/gallery/EmptyGalleryNoInvitation";
import { EmptyGalleryNoPhotos } from "@/components/gallery/EmptyGalleryNoPhotos";
import {
  GalleryEventOption,
  GalleryEventSummaryCard,
} from "@/components/gallery/GalleryEventSummaryCard";
import { GalleryLoadMoreButton } from "@/components/gallery/GalleryLoadMoreButton";
import { GalleryPhotoGrid } from "@/components/gallery/GalleryPhotoGrid";
import { GalleryQrInfoCard } from "@/components/gallery/GalleryQrInfoCard";
import { useAppAlert } from "@/components/ui/AppAlert";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import {
  deleteGuestPhoto,
  getGuestPhotosByInvitation,
  GUEST_PHOTO_PAGE_SIZE,
} from "@/services/guestPhotoService";
import {
  downloadImagesToGallery,
  downloadImageToGallery,
} from "@/services/imageDownloadService";
import { getCurrentUserInvitations } from "@/services/invitationService";
import { SESSION_EXPIRED_MESSAGE } from "@/services/sessionService";
import { InvitationGuestPhoto, UserInvitation } from "@/types/invitation";

const MAX_GUEST_PHOTOS_PER_INVITATION = 200;

type GalleryPhotos = ComponentProps<typeof GalleryPhotoGrid>["photos"];
type GalleryPhoto = GalleryPhotos[number];

function formatEventTitle(invitation: UserInvitation) {
  const invitationName = invitation.invitation_name?.trim();

  if (invitationName) {
    return invitationName;
  }

  const brideName = invitation.bride_name?.trim();
  const groomName = invitation.groom_name?.trim();
  const eventTypeTitle = invitation.invitation_event_types?.title?.trim();

  const coupleName =
    brideName && groomName
      ? `${brideName} & ${groomName}`
      : brideName || groomName || "";

  const fallbackTitle = [coupleName, eventTypeTitle].filter(Boolean).join(" ");

  return fallbackTitle || "İsimsiz Davetiye";
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
  const { invitationId, from } = useLocalSearchParams<{
    invitationId?: string;
    from?: string;
  }>();

  const [invitations, setInvitations] = useState<UserInvitation[]>([]);
  const [selectedInvitationId, setSelectedInvitationId] = useState<string>();
  const [guestPhotos, setGuestPhotos] = useState<InvitationGuestPhoto[]>([]);
  const [photos, setPhotos] = useState<GalleryPhotos>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [photoPage, setPhotoPage] = useState(0);
  const [hasMorePhotos, setHasMorePhotos] = useState(false);
  const [loadingMorePhotos, setLoadingMorePhotos] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const [downloadingPhotoId, setDownloadingPhotoId] = useState<string | null>(
    null,
  );
  const [downloadingAllPhotos, setDownloadingAllPhotos] = useState(false);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    fetchInvitations();

    return () => {
      isMountedRef.current = false;
    };
  }, [invitationId]);

  useEffect(() => {
    if (!selectedInvitationId) {
      setGuestPhotos([]);
      setPhotos([]);
      setPhotoPage(0);
      setHasMorePhotos(false);
      return;
    }

    setPhotoPage(0);
    setHasMorePhotos(false);
    fetchPhotos(selectedInvitationId, 0);
  }, [selectedInvitationId]);

  function handleServiceError(params: {
    error: unknown;
    fallbackTitle: string;
    fallbackMessage: string;
  }) {
    const message =
      params.error instanceof Error
        ? params.error.message
        : params.fallbackMessage;

    const isSessionExpired = message === SESSION_EXPIRED_MESSAGE;

    showAlert({
      title: isSessionExpired ? "Oturum Süresi Doldu" : params.fallbackTitle,
      message,
      type: isSessionExpired ? "warning" : "error",
      confirmText: isSessionExpired ? "Giriş Yap" : "Tamam",
      onConfirm: () => {
        if (isSessionExpired) {
          router.replace("/auth/login");
        }
      },
    });
  }

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
        const routeInvitationId =
          typeof invitationId === "string" ? invitationId : undefined;

        const invitationFromRoute = routeInvitationId
          ? data.find((invitation) => invitation.id === routeInvitationId)
          : undefined;

        setSelectedInvitationId(invitationFromRoute?.id ?? data[0].id);
      } else {
        setSelectedInvitationId(undefined);
      }
    } catch (error) {
      console.log("Galeri davetiyeleri alınamadı:", error);

      if (isMountedRef.current) {
        setInvitations([]);
        setSelectedInvitationId(undefined);
      }

      handleServiceError({
        error,
        fallbackTitle: "Davetler alınamadı",
        fallbackMessage:
          "Davetler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.",
      });
    } finally {
      if (isMountedRef.current) {
        setLoadingInvitations(false);
      }
    }
  };

  const fetchPhotos = async (targetInvitationId: string, nextPage = 0) => {
    try {
      if (isMountedRef.current) {
        if (nextPage === 0) {
          setLoadingPhotos(true);
        } else {
          setLoadingMorePhotos(true);
        }
      }

      const data = await getGuestPhotosByInvitation({
        invitationId: targetInvitationId,
        page: nextPage,
        pageSize: GUEST_PHOTO_PAGE_SIZE,
      });

      if (!isMountedRef.current) {
        return;
      }

      const visibleGuestPhotos = data.filter((photo) =>
        Boolean(photo.public_url),
      );

      const galleryPhotos = visibleGuestPhotos.map(mapGuestPhotoToGalleryPhoto);

      if (nextPage === 0) {
        setGuestPhotos(visibleGuestPhotos);
        setPhotos(galleryPhotos);
      } else {
        setGuestPhotos((currentPhotos) => [
          ...currentPhotos,
          ...visibleGuestPhotos,
        ]);

        setPhotos((currentPhotos) => [...currentPhotos, ...galleryPhotos]);
      }

      setPhotoPage(nextPage);
      setHasMorePhotos(data.length === GUEST_PHOTO_PAGE_SIZE);
    } catch (error) {
      console.log("Galeri fotoğrafları alınamadı:", error);

      if (isMountedRef.current && nextPage === 0) {
        setGuestPhotos([]);
        setPhotos([]);
        setPhotoPage(0);
        setHasMorePhotos(false);
      }

      handleServiceError({
        error,
        fallbackTitle: "Fotoğraflar alınamadı",
        fallbackMessage:
          "Misafir fotoğrafları yüklenirken bir hata oluştu. Lütfen tekrar deneyin.",
      });
    } finally {
      if (isMountedRef.current) {
        if (nextPage === 0) {
          setLoadingPhotos(false);
        } else {
          setLoadingMorePhotos(false);
        }
      }
    }
  };

  const handleLoadMorePhotos = () => {
    if (
      !selectedInvitationId ||
      loadingPhotos ||
      loadingMorePhotos ||
      !hasMorePhotos
    ) {
      return;
    }

    fetchPhotos(selectedInvitationId, photoPage + 1);
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

  const handleDownloadPhoto = async (photo: GalleryPhoto) => {
    if (downloadingPhotoId || downloadingAllPhotos) {
      return;
    }

    if (!photo.imageUrl) {
      showAlert({
        type: "warning",
        title: "Fotoğraf bulunamadı",
        message: "İndirilecek fotoğraf bağlantısı bulunamadı.",
        confirmText: "Tamam",
      });

      return;
    }

    try {
      setDownloadingPhotoId(photo.id);

      await downloadImageToGallery({
        imageUri: photo.imageUrl,
        fileNamePrefix: `weddion-galeri-${
          selectedInvitation?.bride_name ?? "misafir"
        }-${selectedInvitation?.groom_name ?? "fotograf"}`,
      });

      showAlert({
        type: "success",
        title: "Fotoğraf indirildi",
        message:
          Platform.OS === "ios"
            ? "Fotoğraf, Fotoğraflar uygulamasına kaydedildi."
            : "Fotoğraf galerinize kaydedildi.",
        confirmText: "Tamam",
      });
    } catch (error) {
      console.log(
        "Galeri fotoğrafı indirilemedi:",
        error,
        "photoImageUrl:",
        photo.imageUrl?.slice(0, 120),
      );

      const message =
        error instanceof Error && error.message === "GALLERY_PERMISSION_DENIED"
          ? "Fotoğrafı galeriye kaydedebilmek için fotoğraf ekleme izni vermelisiniz. Ayarlar > Weddion > Fotoğraflar kısmından erişimi açın."
          : "Fotoğraf galeriye kaydedilemedi. Fotoğraf iznini ve görsel bağlantısını kontrol edip tekrar deneyin.";

      showAlert({
        type: "error",
        title: "İndirme başarısız",
        message,
        confirmText: "Tamam",
      });
    } finally {
      if (isMountedRef.current) {
        setDownloadingPhotoId(null);
      }
    }
  };

  const handleDownloadAllPhotos = async () => {
    if (downloadingAllPhotos || downloadingPhotoId || photos.length === 0) {
      return;
    }

    const imageUris = photos
      .map((photo) => photo.imageUrl)
      .filter((imageUrl): imageUrl is string => Boolean(imageUrl));

    if (imageUris.length === 0) {
      showAlert({
        type: "warning",
        title: "Fotoğraf bulunamadı",
        message: "İndirilecek fotoğraf bağlantısı bulunamadı.",
        confirmText: "Tamam",
      });

      return;
    }

    try {
      setDownloadingAllPhotos(true);

      const downloadedUris = await downloadImagesToGallery({
        imageUris,
        fileNamePrefix: `weddion-galeri-${
          selectedInvitation?.bride_name ?? "misafir"
        }-${selectedInvitation?.groom_name ?? "fotograf"}`,
      });

      showAlert({
        type: "success",
        title: "Fotoğraflar indirildi",
        message:
          Platform.OS === "ios"
            ? `${downloadedUris.length} fotoğraf Fotoğraflar uygulamasına kaydedildi.`
            : `${downloadedUris.length} fotoğraf galerinize kaydedildi.`,
        confirmText: "Tamam",
      });
    } catch (error) {
      console.log("Tüm galeri fotoğrafları indirilemedi:", error);

      const message =
        error instanceof Error && error.message === "GALLERY_PERMISSION_DENIED"
          ? "Fotoğrafları galeriye kaydedebilmek için fotoğraf ekleme izni vermelisiniz. Ayarlar > Weddion > Fotoğraflar kısmından erişimi açın."
          : "Fotoğraflar galeriye kaydedilemedi. Fotoğraf iznini ve görsel bağlantılarını kontrol edip tekrar deneyin.";

      showAlert({
        type: "error",
        title: "Toplu indirme başarısız",
        message,
        confirmText: "Tamam",
      });
    } finally {
      if (isMountedRef.current) {
        setDownloadingAllPhotos(false);
      }
    }
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

          handleServiceError({
            error,
            fallbackTitle: "Silme başarısız",
            fallbackMessage:
              "Fotoğraf silinirken bir hata oluştu. Lütfen tekrar deneyin.",
          });
        } finally {
          if (isMountedRef.current) {
            setDeletingPhotoId(null);
          }
        }
      },
    });
  };

  const handleGalleryBackPress = () => {
    if (from === "my-invitations") {
      router.replace("/my-invitations");
      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/home");
  };

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-10"
      >
        <ScreenHeader
          title="Galeri"
          description="Davetlerinizin fotoğraflarını yönetin."
          onBackPress={handleGalleryBackPress}
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
              <>
                <GalleryPhotoGrid
                  photos={photos}
                  photoCount={photos.length}
                  photoLimit={MAX_GUEST_PHOTOS_PER_INVITATION}
                  onDownloadPhoto={handleDownloadPhoto}
                  onDownloadAllPhotos={handleDownloadAllPhotos}
                  downloadAllLoading={downloadingAllPhotos}
                  onDeletePhoto={handleDeletePhoto}
                />

                {hasMorePhotos ? (
                  <GalleryLoadMoreButton
                    isLoading={loadingMorePhotos}
                    onPress={handleLoadMorePhotos}
                  />
                ) : null}
              </>
            ) : (
              <EmptyGalleryNoPhotos onPressShareQrCode={handlePressQrCode} />
            )}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
