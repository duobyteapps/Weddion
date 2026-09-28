import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { usePaginatedData } from "@/hooks/usePaginatedData";
import { supabase } from "@/lib/supabase";
import {
  deleteGuestPhoto,
  getGalleryAccountPhotoUsage,
  getGuestPhotosByInvitation,
  GUEST_PHOTO_PAGE_SIZE,
  type GalleryAccountPhotoUsage,
} from "@/services/guestPhotoService";
import {
  downloadImagesToGallery,
  downloadImageToGallery,
} from "@/services/imageDownloadService";
import { SESSION_EXPIRED_MESSAGE } from "@/services/sessionService";
import { InvitationGuestPhoto, UserInvitation } from "@/types/invitation";

type GalleryPhotos = ComponentProps<typeof GalleryPhotoGrid>["photos"];

type GalleryPhoto = GalleryPhotos[number];

type GalleryAccessRole = "owner" | "partner";

type GalleryAccessibleInvitation = UserInvitation & {
  owner_user_id?: string | null;
  access_role?: GalleryAccessRole;
  gallery_partner_invite_code?: string | null;
  gallery_partner_invite_enabled?: boolean | null;
};

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

function parseEventDate(date?: string | null) {
  const dateValue = date?.trim();

  if (!dateValue) {
    return null;
  }

  const isoDateMatch = dateValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch;

    const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));

    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  const turkishDateMatch = dateValue.match(
    /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/,
  );

  if (turkishDateMatch) {
    const [, day, month, year] = turkishDateMatch;

    const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));

    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  const parsedDate = new Date(dateValue);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function formatEventDate(date?: string | null) {
  const dateValue = date?.trim();

  if (!dateValue) {
    return "Tarih belirtilmedi";
  }

  const parsedDate = parseEventDate(dateValue);

  if (!parsedDate) {
    return dateValue;
  }

  return parsedDate.toLocaleDateString("tr-TR", {
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
    expiresAt: photo.expires_at,
  };
}

export default function GalleryScreen() {
  const { showAlert } = useAppAlert();

  const { invitationId, from } = useLocalSearchParams<{
    invitationId?: string;
    from?: string;
  }>();

  const [invitations, setInvitations] = useState<GalleryAccessibleInvitation[]>(
    [],
  );

  const [selectedInvitationId, setSelectedInvitationId] = useState<string>();

  const [loadingInvitations, setLoadingInvitations] = useState(true);

  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);

  const [downloadingPhotoId, setDownloadingPhotoId] = useState<string | null>(
    null,
  );

  const [downloadingAllPhotos, setDownloadingAllPhotos] = useState(false);

  const [downloadingSelectedPhotos, setDownloadingSelectedPhotos] =
    useState(false);

  const [deletingSelectedPhotos, setDeletingSelectedPhotos] = useState(false);

  const [accountPhotoUsage, setAccountPhotoUsage] =
    useState<GalleryAccountPhotoUsage | null>(null);

  const [loadingAccountPhotoUsage, setLoadingAccountPhotoUsage] =
    useState(false);

  const isMountedRef = useRef(true);

  /*
   * İlk focus sırasında usePaginatedData zaten
   * ilk sayfayı yüklediği için ikinci kez
   * gereksiz refresh yapmayacağız.
   *
   * Galeriden çıkıp tekrar gelindiğinde ise
   * refresh çalışacak.
   */
  const isFirstGalleryFocusRef = useRef(true);

  const handleServiceError = useCallback(
    (params: {
      error: unknown;
      fallbackTitle: string;
      fallbackMessage: string;
    }) => {
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
    },
    [showAlert],
  );

  const getMyGalleryAccessibleInvitations = useCallback(async () => {
    const { data, error } = await supabase.rpc(
      "get_my_gallery_accessible_invitations",
    );

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as GalleryAccessibleInvitation[];
  }, []);

  const fetchInvitations = useCallback(async () => {
    try {
      if (isMountedRef.current) {
        setLoadingInvitations(true);
      }

      const data = await getMyGalleryAccessibleInvitations();

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
  }, [getMyGalleryAccessibleInvitations, handleServiceError, invitationId]);

  const refreshAccountPhotoUsage = useCallback(async () => {
    if (!selectedInvitationId) {
      if (isMountedRef.current) {
        setAccountPhotoUsage(null);
      }

      return;
    }

    try {
      if (isMountedRef.current) {
        setLoadingAccountPhotoUsage(true);
      }

      const usage = await getGalleryAccountPhotoUsage(selectedInvitationId);

      if (!isMountedRef.current) {
        return;
      }

      setAccountPhotoUsage(usage);
    } catch (error) {
      console.log("Fotoğraf kullanım bilgisi alınamadı:", error);

      if (isMountedRef.current) {
        setAccountPhotoUsage(null);
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingAccountPhotoUsage(false);
      }
    }
  }, [selectedInvitationId]);

  useEffect(() => {
    isMountedRef.current = true;

    fetchInvitations();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchInvitations]);

  useEffect(() => {
    if (!selectedInvitationId) {
      setAccountPhotoUsage(null);
      return;
    }

    void refreshAccountPhotoUsage();
  }, [selectedInvitationId, refreshAccountPhotoUsage]);

  const fetchGuestPhotoPage = useCallback(
    async ({ page, pageSize }: { page: number; pageSize: number }) => {
      if (!selectedInvitationId) {
        return [];
      }

      const data = await getGuestPhotosByInvitation({
        invitationId: selectedInvitationId,
        page,
        pageSize,
      });

      return data.filter((photo) => Boolean(photo.public_url));
    },
    [selectedInvitationId],
  );

  const handleGuestPhotoLoadError = useCallback(
    (error: unknown) => {
      console.log("Galeri fotoğrafları alınamadı:", error);

      handleServiceError({
        error,
        fallbackTitle: "Fotoğraflar alınamadı",
        fallbackMessage:
          "Misafir fotoğrafları yüklenirken bir hata oluştu. Lütfen tekrar deneyin.",
      });
    },
    [handleServiceError],
  );

  const {
    items: guestPhotos,
    setItems: setGuestPhotos,
    loadingInitial: loadingPhotos,
    loadingMore: loadingMorePhotos,
    hasMore: hasMorePhotos,
    refresh: refreshGuestPhotos,
    loadMore: handleLoadMorePhotos,
  } = usePaginatedData<InvitationGuestPhoto>({
    pageSize: GUEST_PHOTO_PAGE_SIZE,
    enabled: Boolean(selectedInvitationId),
    dependencies: [selectedInvitationId],
    fetchPage: fetchGuestPhotoPage,
    onError: handleGuestPhotoLoadError,
  });

  useFocusEffect(
    useCallback(() => {
      if (!selectedInvitationId) {
        return;
      }

      if (isFirstGalleryFocusRef.current) {
        isFirstGalleryFocusRef.current = false;
        return;
      }

      refreshGuestPhotos();

      void refreshAccountPhotoUsage();
    }, [selectedInvitationId, refreshGuestPhotos, refreshAccountPhotoUsage]),
  );

  const photos = useMemo(() => {
    return guestPhotos.map(mapGuestPhotoToGalleryPhoto);
  }, [guestPhotos]);

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
  };

  const handleDownloadPhoto = async (photo: GalleryPhoto) => {
    if (
      downloadingPhotoId ||
      downloadingAllPhotos ||
      downloadingSelectedPhotos
    ) {
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
    if (
      downloadingAllPhotos ||
      downloadingPhotoId ||
      downloadingSelectedPhotos ||
      photos.length === 0
    ) {
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

  const handleDownloadSelectedPhotos = async (
    selectedPhotos: GalleryPhoto[],
  ) => {
    if (
      downloadingAllPhotos ||
      downloadingPhotoId ||
      downloadingSelectedPhotos ||
      selectedPhotos.length === 0
    ) {
      return;
    }

    const imageUris = selectedPhotos
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
      setDownloadingSelectedPhotos(true);

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
      console.log("Seçilen galeri fotoğrafları indirilemedi:", error);

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
        setDownloadingSelectedPhotos(false);
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

          await refreshAccountPhotoUsage();

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

  const handleDeleteSelectedPhotos = async (selectedPhotos: GalleryPhoto[]) => {
    if (deletingSelectedPhotos || selectedPhotos.length === 0) {
      return;
    }

    const selectedPhotoIds = selectedPhotos.map((photo) => photo.id);

    const targetPhotos = guestPhotos.filter((guestPhoto) =>
      selectedPhotoIds.includes(guestPhoto.id),
    );

    if (targetPhotos.length === 0) {
      showAlert({
        type: "error",
        title: "Fotoğraf bulunamadı",
        message: "Silmek istediğiniz fotoğraflar artık mevcut değil.",
        confirmText: "Tamam",
      });

      return;
    }

    showAlert({
      type: "warning",
      title: "Seçilen fotoğraflar silinsin mi?",

      message: `${targetPhotos.length} fotoğraf galeriden ve depolama alanından silinecek. Bu işlem geri alınamaz.`,

      cancelText: "Vazgeç",
      confirmText: "Sil",

      onConfirm: async () => {
        try {
          setDeletingSelectedPhotos(true);

          await Promise.all(
            targetPhotos.map((photo) => deleteGuestPhoto(photo)),
          );

          if (!isMountedRef.current) {
            return;
          }

          const deletedPhotoIds = targetPhotos.map((photo) => photo.id);

          setGuestPhotos((currentPhotos) =>
            currentPhotos.filter(
              (photo) => !deletedPhotoIds.includes(photo.id),
            ),
          );

          await refreshAccountPhotoUsage();

          showAlert({
            type: "success",
            title: "Fotoğraflar silindi",
            message: `${targetPhotos.length} fotoğraf başarıyla silindi.`,
            confirmText: "Tamam",
          });
        } catch (error) {
          console.log("Seçilen galeri fotoğrafları silinemedi:", error);

          handleServiceError({
            error,
            fallbackTitle: "Silme başarısız",
            fallbackMessage:
              "Fotoğraflar silinirken bir hata oluştu. Lütfen tekrar deneyin.",
          });
        } finally {
          if (isMountedRef.current) {
            setDeletingSelectedPhotos(false);
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

            <View className="mb-4 rounded-[20px] border border-primary/15 bg-white px-4 py-4">
              <View className="flex-row items-center justify-between">
                <AppText variant="body" className="font-semibold text-textDark">
                  Fotoğraf kullanımı
                </AppText>

                {loadingAccountPhotoUsage ? (
                  <ActivityIndicator size="small" />
                ) : accountPhotoUsage ? (
                  <AppText
                    variant="body"
                    className="font-semibold text-primary"
                  >
                    {accountPhotoUsage.activePhotoCount}/
                    {accountPhotoUsage.photoLimit}
                  </AppText>
                ) : null}
              </View>

              {accountPhotoUsage ? (
                <AppText className="mt-1 text-[13px] text-textMuted">
                  {accountPhotoUsage.remainingPhotoCount > 0
                    ? `${accountPhotoUsage.remainingPhotoCount} fotoğraf yükleme hakkınız kaldı.`
                    : "Fotoğraf yükleme limitine ulaştınız."}
                </AppText>
              ) : null}
            </View>

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
                  onDownloadPhoto={handleDownloadPhoto}
                  onDownloadAllPhotos={handleDownloadAllPhotos}
                  onDownloadSelectedPhotos={handleDownloadSelectedPhotos}
                  onDeleteSelectedPhotos={handleDeleteSelectedPhotos}
                  downloadAllLoading={downloadingAllPhotos}
                  downloadSelectedLoading={downloadingSelectedPhotos}
                  deleteSelectedLoading={deletingSelectedPhotos}
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
