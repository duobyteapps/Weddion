import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import {
  ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Share,
  View,
} from "react-native";

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
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { usePaginatedData } from "@/hooks/usePaginatedData";
import { supabase } from "@/lib/supabase";
import {
  deleteGuestPhoto,
  getGuestPhotosByInvitation,
  GUEST_PHOTO_PAGE_SIZE,
} from "@/services/guestPhotoService";
import {
  downloadImagesToGallery,
  downloadImageToGallery,
} from "@/services/imageDownloadService";
import { SESSION_EXPIRED_MESSAGE } from "@/services/sessionService";
import { InvitationGuestPhoto, UserInvitation } from "@/types/invitation";

const MAX_GUEST_PHOTOS_PER_INVITATION = 100;

type GalleryPhotos = ComponentProps<typeof GalleryPhotoGrid>["photos"];
type GalleryPhoto = GalleryPhotos[number];

type GalleryAccessRole = "owner" | "partner";

type GalleryAccessibleInvitation = UserInvitation & {
  owner_user_id?: string | null;
  access_role?: GalleryAccessRole;
  gallery_partner_invite_code?: string | null;
  gallery_partner_invite_enabled?: boolean | null;
};

type GalleryPartner = {
  id: string;
  invitationId: string;
  partnerUserId: string;
  role: "partner";
  status: "active" | "removed" | "left";
  createdAt: string;
};

type GalleryPartnerRequest = {
  id: string;
  invitationId: string;
  requesterUserId: string;
  requesterDisplayName: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
  createdAt: string;
};

type GalleryPartnerRow = {
  id: string;
  invitation_id: string;
  partner_user_id: string;
  role: "partner";
  status: "active" | "removed" | "left";
  created_at: string;
};

type GalleryPartnerRequestRow = {
  id: string;
  invitation_id: string;
  requester_user_id: string;
  requester_display_name: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
  created_at: string;
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

function mapGalleryPartner(row: GalleryPartnerRow): GalleryPartner {
  return {
    id: row.id,
    invitationId: row.invitation_id,
    partnerUserId: row.partner_user_id,
    role: row.role,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapGalleryPartnerRequest(
  row: GalleryPartnerRequestRow,
): GalleryPartnerRequest {
  return {
    id: row.id,
    invitationId: row.invitation_id,
    requesterUserId: row.requester_user_id,
    requesterDisplayName: row.requester_display_name,
    status: row.status,
    createdAt: row.created_at,
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
  const [galleryPartner, setGalleryPartner] = useState<GalleryPartner | null>(
    null,
  );
  const [galleryPartnerRequests, setGalleryPartnerRequests] = useState<
    GalleryPartnerRequest[]
  >([]);
  const [loadingPartnerAccess, setLoadingPartnerAccess] = useState(false);
  const [refreshingPartnerCode, setRefreshingPartnerCode] = useState(false);
  const [approvingPartnerRequestId, setApprovingPartnerRequestId] = useState<
    string | null
  >(null);
  const [rejectingPartnerRequestId, setRejectingPartnerRequestId] = useState<
    string | null
  >(null);
  const [removingGalleryPartner, setRemovingGalleryPartner] = useState(false);
  const [leavingGallery, setLeavingGallery] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const [downloadingPhotoId, setDownloadingPhotoId] = useState<string | null>(
    null,
  );
  const [downloadingAllPhotos, setDownloadingAllPhotos] = useState(false);
  const [downloadingSelectedPhotos, setDownloadingSelectedPhotos] =
    useState(false);
  const [deletingSelectedPhotos, setDeletingSelectedPhotos] = useState(false);

  const isMountedRef = useRef(true);

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

  async function getMyGalleryAccessibleInvitations() {
    const { data, error } = await supabase.rpc(
      "get_my_gallery_accessible_invitations",
    );

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as GalleryAccessibleInvitation[];
  }

  async function getGalleryPartner(invitationId: string) {
    const { data, error } = await supabase.rpc("get_gallery_partner", {
      target_invitation_id: invitationId,
    });

    if (error) {
      throw new Error(error.message);
    }

    const partner = ((data ?? []) as GalleryPartnerRow[])[0];

    return partner ? mapGalleryPartner(partner) : null;
  }

  async function getPendingGalleryPartnerRequests(invitationId: string) {
    const { data, error } = await supabase.rpc(
      "get_pending_gallery_partner_requests",
      {
        target_invitation_id: invitationId,
      },
    );

    if (error) {
      throw new Error(error.message);
    }

    return ((data ?? []) as GalleryPartnerRequestRow[]).map(
      mapGalleryPartnerRequest,
    );
  }

  async function approveGalleryPartnerRequest(requestId: string) {
    const { error } = await supabase.rpc("approve_gallery_partner_request", {
      target_request_id: requestId,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async function rejectGalleryPartnerRequest(requestId: string) {
    const { error } = await supabase.rpc("reject_gallery_partner_request", {
      target_request_id: requestId,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async function removeGalleryPartner(params: {
    invitationId: string;
    partnerUserId: string;
  }) {
    const { error } = await supabase.rpc("remove_gallery_partner", {
      target_invitation_id: params.invitationId,
      target_partner_user_id: params.partnerUserId,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async function leaveGalleryPartnerAccess(invitationId: string) {
    const { error } = await supabase.rpc("leave_gallery_partner_access", {
      target_invitation_id: invitationId,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async function refreshGalleryPartnerInviteCode(invitationId: string) {
    const { data, error } = await supabase.rpc(
      "refresh_gallery_partner_invite_code",
      {
        target_invitation_id: invitationId,
      },
    );

    if (error) {
      throw new Error(error.message);
    }

    return data as {
      success: boolean;
      code: string;
      message?: string;
    };
  }

  useEffect(() => {
    isMountedRef.current = true;
    fetchInvitations();

    return () => {
      isMountedRef.current = false;
    };
  }, [invitationId]);

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

  const {
    items: guestPhotos,
    setItems: setGuestPhotos,
    loadingInitial: loadingPhotos,
    loadingMore: loadingMorePhotos,
    hasMore: hasMorePhotos,
    loadMore: handleLoadMorePhotos,
  } = usePaginatedData<InvitationGuestPhoto>({
    pageSize: GUEST_PHOTO_PAGE_SIZE,
    enabled: Boolean(selectedInvitationId),
    dependencies: [selectedInvitationId],
    fetchPage: fetchGuestPhotoPage,
    onError: (error) => {
      console.log("Galeri fotoğrafları alınamadı:", error);

      handleServiceError({
        error,
        fallbackTitle: "Fotoğraflar alınamadı",
        fallbackMessage:
          "Misafir fotoğrafları yüklenirken bir hata oluştu. Lütfen tekrar deneyin.",
      });
    },
  });

  const photos = useMemo(() => {
    return guestPhotos.map(mapGuestPhotoToGalleryPhoto);
  }, [guestPhotos]);

  const fetchInvitations = async () => {
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
        setGalleryPartner(null);
        setGalleryPartnerRequests([]);
      }
    } catch (error) {
      console.log("Galeri davetiyeleri alınamadı:", error);

      if (isMountedRef.current) {
        setInvitations([]);
        setSelectedInvitationId(undefined);
        setGalleryPartner(null);
        setGalleryPartnerRequests([]);
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
  const selectedAccessRole = selectedInvitation?.access_role ?? "owner";
  const isSelectedInvitationOwner = selectedAccessRole === "owner";
  const isSelectedInvitationPartner = selectedAccessRole === "partner";

  useEffect(() => {
    if (!selectedInvitationId || !selectedInvitation) {
      setGalleryPartner(null);
      setGalleryPartnerRequests([]);
      return;
    }

    fetchGalleryPartnerAccess(selectedInvitationId, selectedInvitation);
  }, [selectedInvitationId, selectedInvitation?.access_role]);

  const fetchGalleryPartnerAccess = async (
    targetInvitationId: string,
    targetInvitation: GalleryAccessibleInvitation,
  ) => {
    try {
      setLoadingPartnerAccess(true);

      const partner = await getGalleryPartner(targetInvitationId);

      if (!isMountedRef.current) {
        return;
      }

      setGalleryPartner(partner);

      if (targetInvitation.access_role === "owner") {
        const requests =
          partner === null
            ? await getPendingGalleryPartnerRequests(targetInvitationId)
            : [];

        if (!isMountedRef.current) {
          return;
        }

        setGalleryPartnerRequests(requests);
      } else {
        setGalleryPartnerRequests([]);
      }
    } catch (error) {
      console.log("Galeri partner bilgileri alınamadı:", error);

      if (isMountedRef.current) {
        setGalleryPartner(null);
        setGalleryPartnerRequests([]);
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingPartnerAccess(false);
      }
    }
  };

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

  const handleCopyGalleryPartnerCode = async () => {
    const code = selectedInvitation?.gallery_partner_invite_code;

    if (!code || galleryPartner) {
      return;
    }

    await Clipboard.setStringAsync(code);

    showAlert({
      type: "success",
      title: "Kod Kopyalandı",
      message: "Galeri ortak kodu panoya kopyalandı.",
      confirmText: "Tamam",
    });
  };

  const handleShareGalleryPartnerCode = async () => {
    const code = selectedInvitation?.gallery_partner_invite_code;

    if (!code || galleryPartner) {
      return;
    }

    await Share.share({
      message: `Weddion galeri ortağı olmak için kodum: ${code}`,
    });
  };

  const handleRefreshGalleryPartnerCode = () => {
    if (!selectedInvitation) {
      return;
    }

    showAlert({
      type: "warning",
      title: "Galeri Ortak Kodu Yenilensin mi?",
      message:
        "Mevcut ortak kod geçersiz olur. Yeni kodu partnerinle tekrar paylaşman gerekir.",
      cancelText: "Vazgeç",
      confirmText: "Yenile",
      onConfirm: async () => {
        try {
          setRefreshingPartnerCode(true);

          await refreshGalleryPartnerInviteCode(selectedInvitation.id);
          await fetchInvitations();

          showAlert({
            type: "success",
            title: "Kod Yenilendi",
            message: "Yeni galeri ortak kodu oluşturuldu.",
            confirmText: "Tamam",
          });
        } catch (error) {
          console.log("Galeri ortak kodu yenilenemedi:", error);

          handleServiceError({
            error,
            fallbackTitle: "Kod Yenilenemedi",
            fallbackMessage:
              "Galeri ortak kodu yenilenirken bir hata oluştu. Lütfen tekrar deneyin.",
          });
        } finally {
          if (isMountedRef.current) {
            setRefreshingPartnerCode(false);
          }
        }
      },
    });
  };

  const handleApproveGalleryPartnerRequest = (
    request: GalleryPartnerRequest,
  ) => {
    showAlert({
      type: "warning",
      title: "Partner Onaylansın mı?",
      message:
        "Bu kişi galeri fotoğraflarını görebilecek, indirebilecek ve silebilecek. Davetiyeyi düzenleyemeyecek.",
      cancelText: "Vazgeç",
      confirmText: "Onayla",
      onConfirm: async () => {
        try {
          setApprovingPartnerRequestId(request.id);

          await approveGalleryPartnerRequest(request.id);

          if (selectedInvitation && selectedInvitationId) {
            await fetchGalleryPartnerAccess(
              selectedInvitationId,
              selectedInvitation,
            );
          }

          showAlert({
            type: "success",
            title: "Partner Onaylandı",
            message: "Galeri partneri başarıyla eklendi.",
            confirmText: "Tamam",
          });
        } catch (error) {
          console.log("Galeri partner isteği onaylanamadı:", error);

          handleServiceError({
            error,
            fallbackTitle: "Onaylama Hatası",
            fallbackMessage:
              "Galeri partner isteği onaylanırken bir hata oluştu. Lütfen tekrar deneyin.",
          });
        } finally {
          if (isMountedRef.current) {
            setApprovingPartnerRequestId(null);
          }
        }
      },
    });
  };

  const handleRejectGalleryPartnerRequest = (
    request: GalleryPartnerRequest,
  ) => {
    showAlert({
      type: "warning",
      title: "Partner İsteği Reddedilsin mi?",
      message: "Bu kişi galeriye partner olarak eklenmeyecek.",
      cancelText: "Vazgeç",
      confirmText: "Reddet",
      onConfirm: async () => {
        try {
          setRejectingPartnerRequestId(request.id);

          await rejectGalleryPartnerRequest(request.id);

          if (selectedInvitation && selectedInvitationId) {
            await fetchGalleryPartnerAccess(
              selectedInvitationId,
              selectedInvitation,
            );
          }

          showAlert({
            type: "success",
            title: "İstek Reddedildi",
            message: "Galeri partner isteği reddedildi.",
            confirmText: "Tamam",
          });
        } catch (error) {
          console.log("Galeri partner isteği reddedilemedi:", error);

          handleServiceError({
            error,
            fallbackTitle: "Reddetme Hatası",
            fallbackMessage:
              "Galeri partner isteği reddedilirken bir hata oluştu. Lütfen tekrar deneyin.",
          });
        } finally {
          if (isMountedRef.current) {
            setRejectingPartnerRequestId(null);
          }
        }
      },
    });
  };

  const handleRemoveGalleryPartner = () => {
    if (!selectedInvitation || !galleryPartner) {
      return;
    }

    showAlert({
      type: "warning",
      title: "Partner Kaldırılsın mı?",
      message:
        "Bu kişi artık galeri fotoğraflarını göremez, indiremez ve silemez.",
      cancelText: "Vazgeç",
      confirmText: "Kaldır",
      onConfirm: async () => {
        try {
          setRemovingGalleryPartner(true);

          await removeGalleryPartner({
            invitationId: selectedInvitation.id,
            partnerUserId: galleryPartner.partnerUserId,
          });

          await fetchGalleryPartnerAccess(
            selectedInvitation.id,
            selectedInvitation,
          );

          showAlert({
            type: "success",
            title: "Partner Kaldırıldı",
            message: "Galeri partnerinin erişimi kaldırıldı.",
            confirmText: "Tamam",
          });
        } catch (error) {
          console.log("Galeri partneri kaldırılamadı:", error);

          handleServiceError({
            error,
            fallbackTitle: "Partner Kaldırılamadı",
            fallbackMessage:
              "Galeri partneri kaldırılırken bir hata oluştu. Lütfen tekrar deneyin.",
          });
        } finally {
          if (isMountedRef.current) {
            setRemovingGalleryPartner(false);
          }
        }
      },
    });
  };

  const handleLeaveGallery = () => {
    if (!selectedInvitation) {
      return;
    }

    showAlert({
      type: "warning",
      title: "Galeriden Çıkılsın mı?",
      message:
        "Bu galeriden çıkarsan fotoğrafları artık göremez, indiremez ve silemezsin.",
      cancelText: "Vazgeç",
      confirmText: "Çık",
      onConfirm: async () => {
        try {
          setLeavingGallery(true);

          await leaveGalleryPartnerAccess(selectedInvitation.id);
          await fetchInvitations();

          showAlert({
            type: "success",
            title: "Galeriden Çıkıldı",
            message: "Galeri erişimin kaldırıldı.",
            confirmText: "Tamam",
          });
        } catch (error) {
          console.log("Galeriden çıkılamadı:", error);

          handleServiceError({
            error,
            fallbackTitle: "Galeriden Çıkılamadı",
            fallbackMessage:
              "Galeriden çıkılırken bir hata oluştu. Lütfen tekrar deneyin.",
          });
        } finally {
          if (isMountedRef.current) {
            setLeavingGallery(false);
          }
        }
      },
    });
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

          showAlert({
            type: "success",
            title: "Fotoğraflar silindi",
            message: `${targetPhotos.length} fotoğraf başarıyla silindi.`,
            confirmText: "Tamam",
          });
        } catch (error) {
          console.log("Seçilen fotoğraflar silinemedi:", error);

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

  function renderGalleryPartnerCard() {
    if (!selectedInvitation) {
      return null;
    }

    if (isSelectedInvitationPartner) {
      return (
        <AppCard className="mt-5">
          <View className="gap-3">
            <View>
              <AppText variant="subtitle" className="text-textDark">
                Galeri Ortağı
              </AppText>

              <AppText className="mt-1 text-textMuted">
                Bu galeriye partner olarak erişiyorsun. Fotoğrafları görebilir,
                indirebilir ve silebilirsin. Davetiyeyi düzenleyemezsin.
              </AppText>
            </View>

            <AppButton
              title="Galeriden Çık"
              variant="ghost"
              loading={leavingGallery}
              onPress={handleLeaveGallery}
            />
          </View>
        </AppCard>
      );
    }

    if (!isSelectedInvitationOwner) {
      return null;
    }

    return (
      <AppCard className="mt-5">
        <View className="gap-4">
          <View>
            <AppText variant="subtitle" className="text-textDark">
              Galeri Ortağı
            </AppText>

            <AppText className="mt-1 text-textMuted">
              Galeriye sadece sen ve onayladığın tek partner erişebilir. Partner
              fotoğrafları görebilir, indirebilir ve silebilir; davetiyeyi
              düzenleyemez.
            </AppText>
          </View>

          {loadingPartnerAccess ? (
            <View className="items-center justify-center py-4">
              <ActivityIndicator />
            </View>
          ) : galleryPartner ? (
            <View className="rounded-2xl border border-border bg-backgroundSoft p-4">
              <AppText variant="captionStrong" className="text-primaryDark">
                Aktif Partner
              </AppText>

              <AppText className="mt-1 text-textMuted">
                Bu galeride şu anda bir partner var. Yeni partner eklemek için
                önce mevcut partneri kaldırmalısın.
              </AppText>

              <AppButton
                title="Partneri Kaldır"
                variant="ghost"
                className="mt-3"
                loading={removingGalleryPartner}
                onPress={handleRemoveGalleryPartner}
              />
            </View>
          ) : (
            <View className="rounded-2xl border border-border bg-backgroundSoft p-4">
              <AppText variant="captionStrong" className="text-primaryDark">
                Galeri Ortak Kodu
              </AppText>

              <AppText variant="title" className="mt-1 text-textDark">
                {selectedInvitation.gallery_partner_invite_code ?? "Kod yok"}
              </AppText>

              <AppText className="mt-1 text-textMuted">
                Bu kodu partnerinle paylaş. Kodla istek gönderdiğinde buradan
                onaylayabilirsin.
              </AppText>

              <View className="mt-3 flex-row gap-2">
                <View className="flex-1">
                  <AppButton
                    title="Kopyala"
                    variant="secondary"
                    disabled={!selectedInvitation.gallery_partner_invite_code}
                    onPress={handleCopyGalleryPartnerCode}
                  />
                </View>

                <View className="flex-1">
                  <AppButton
                    title="Paylaş"
                    variant="secondary"
                    disabled={!selectedInvitation.gallery_partner_invite_code}
                    onPress={handleShareGalleryPartnerCode}
                  />
                </View>
              </View>

              <AppButton
                title="Kodu Yenile"
                variant="ghost"
                className="mt-2"
                loading={refreshingPartnerCode}
                onPress={handleRefreshGalleryPartnerCode}
              />
            </View>
          )}

          {!galleryPartner && galleryPartnerRequests.length > 0 ? (
            <View className="gap-3">
              <AppText variant="captionStrong" className="text-primaryDark">
                Bekleyen İstekler
              </AppText>

              {galleryPartnerRequests.map((request) => {
                const requesterName =
                  request.requesterDisplayName?.trim() || "Bir kullanıcı";

                return (
                  <View
                    key={request.id}
                    className="rounded-2xl border border-border bg-white p-4"
                  >
                    <AppText variant="captionStrong" className="text-textDark">
                      {requesterName}
                    </AppText>

                    <AppText className="mt-1 text-textMuted">
                      Galeriye partner olarak erişmek istiyor.
                    </AppText>

                    <View className="mt-3 flex-row gap-2">
                      <View className="flex-1">
                        <AppButton
                          title="Reddet"
                          variant="ghost"
                          loading={rejectingPartnerRequestId === request.id}
                          onPress={() =>
                            handleRejectGalleryPartnerRequest(request)
                          }
                        />
                      </View>

                      <View className="flex-1">
                        <AppButton
                          title="Onayla"
                          loading={approvingPartnerRequestId === request.id}
                          onPress={() =>
                            handleApproveGalleryPartnerRequest(request)
                          }
                        />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : null}
        </View>
      </AppCard>
    );
  }

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

            {renderGalleryPartnerCard()}

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
