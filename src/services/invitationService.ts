import { supabase } from "@/lib/supabase";
import {
  deleteR2Object,
  getR2SignedUrl,
  uploadImageToR2,
} from "@/services/r2ImageService";
import {
  CreateUserInvitationPayload,
  UpdateUserInvitationPayload,
  UserInvitation,
} from "@/types/invitation";

function cleanText(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

async function uploadInvitationImage(params: {
  userId: string;
  invitationId: string;
  capturedImageUri: string;
}) {
  const imagePath = `invitations/${params.userId}/${params.invitationId}/invitation.png`;

  await uploadImageToR2({
    imageUri: params.capturedImageUri,
    key: imagePath,
    contentType: "image/png",
  });

  return {
    imagePath,
  };
}

async function createSignedInvitationImageUrl(imagePath: string) {
  return getR2SignedUrl(imagePath);
}

async function deleteGuestPhotosForInvitation(invitationId: string) {
  const { data: guestPhotos, error: guestPhotosError } = await supabase
    .from("invitation_guest_photos")
    .select("id, storage_path")
    .eq("invitation_id", invitationId);

  if (guestPhotosError) {
    throw new Error(guestPhotosError.message);
  }

  const storagePaths = (guestPhotos ?? [])
    .map((photo) => photo.storage_path)
    .filter(Boolean);

  if (storagePaths.length > 0) {
    await Promise.all(
      storagePaths.map(async (storagePath) => {
        await deleteR2Object(storagePath);
      }),
    );
  }

  const { error: rowsDeleteError } = await supabase
    .from("invitation_guest_photos")
    .delete()
    .eq("invitation_id", invitationId);

  if (rowsDeleteError) {
    throw new Error(rowsDeleteError.message);
  }
}

export async function createUserInvitation(
  payload: CreateUserInvitationPayload,
): Promise<UserInvitation> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    throw new Error("Davetiye kaydetmek için oturum açmalısınız.");
  }

  const { formData } = payload;

  const { data: createdInvitation, error: createError } = await supabase
    .from("user_invitations")
    .insert({
      user_id: user.id,
      template_id: payload.templateId,

      bride_name: formData.brideName.trim(),
      groom_name: formData.groomName.trim(),
      bride_parents: cleanText(formData.brideParents),
      groom_parents: cleanText(formData.groomParents),
      bride_surname: cleanText(formData.brideSurname),
      groom_surname: cleanText(formData.groomSurname),

      event_date: formData.date.trim(),
      event_time: cleanText(formData.time),
      description: cleanText(formData.description),
      venue_name: cleanText(formData.venueName),
      venue_location: cleanText(formData.venueLocation),

      status: payload.status ?? "ready",
      invitation_image_url: null,
      invitation_image_path: null,
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (createError) {
    throw new Error(createError.message);
  }

  if (!payload.capturedImageUri) {
    return createdInvitation as UserInvitation;
  }

  const uploadedImage = await uploadInvitationImage({
    userId: user.id,
    invitationId: createdInvitation.id,
    capturedImageUri: payload.capturedImageUri,
  });

  const { data: updatedInvitation, error: updateError } = await supabase
    .from("user_invitations")
    .update({
      invitation_image_path: uploadedImage.imagePath,
      invitation_image_url: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", createdInvitation.id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (updateError) {
    try {
      await deleteR2Object(uploadedImage.imagePath);
    } catch (deleteError) {
      console.log("R2 invitation image rollback delete failed:", deleteError);
    }

    throw new Error(updateError.message);
  }

  const signedImageUrl = await createSignedInvitationImageUrl(
    uploadedImage.imagePath,
  );

  return {
    ...(updatedInvitation as UserInvitation),
    invitation_image_url: signedImageUrl,
  };
}

export async function updateUserInvitation(
  payload: UpdateUserInvitationPayload,
): Promise<UserInvitation> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    throw new Error("Davetiye güncellemek için oturum açmalısınız.");
  }

  const { formData } = payload;

  const updatePayload: Record<string, string | null> = {
    template_id: payload.templateId,

    bride_name: formData.brideName.trim(),
    groom_name: formData.groomName.trim(),
    bride_parents: cleanText(formData.brideParents),
    groom_parents: cleanText(formData.groomParents),
    bride_surname: cleanText(formData.brideSurname),
    groom_surname: cleanText(formData.groomSurname),

    event_date: formData.date.trim(),
    event_time: cleanText(formData.time),
    description: cleanText(formData.description),
    venue_name: cleanText(formData.venueName),
    venue_location: cleanText(formData.venueLocation),

    status: payload.status ?? "ready",
    updated_at: new Date().toISOString(),
  };

  if (payload.capturedImageUri) {
    const uploadedImage = await uploadInvitationImage({
      userId: user.id,
      invitationId: payload.invitationId,
      capturedImageUri: payload.capturedImageUri,
    });

    updatePayload.invitation_image_path = uploadedImage.imagePath;
    updatePayload.invitation_image_url = null;
  }

  const { data: updatedInvitation, error: updateError } = await supabase
    .from("user_invitations")
    .update(updatePayload)
    .eq("id", payload.invitationId)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (updateError) {
    if (updatePayload.invitation_image_path) {
      try {
        await deleteR2Object(updatePayload.invitation_image_path);
      } catch (deleteError) {
        console.log("R2 invitation image rollback delete failed:", deleteError);
      }
    }

    throw new Error(updateError.message);
  }

  const invitation = updatedInvitation as UserInvitation;

  if (!invitation.invitation_image_path) {
    return invitation;
  }

  try {
    const signedImageUrl = await createSignedInvitationImageUrl(
      invitation.invitation_image_path,
    );

    return {
      ...invitation,
      invitation_image_url: signedImageUrl,
    };
  } catch {
    return invitation;
  }
}

export async function deleteUserInvitation(
  invitationId: string,
): Promise<void> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    throw new Error("Davetiye silmek için oturum açmalısınız.");
  }

  const { data: invitation, error: findError } = await supabase
    .from("user_invitations")
    .select("id, invitation_image_path")
    .eq("id", invitationId)
    .eq("user_id", user.id)
    .single();

  if (findError) {
    throw new Error(findError.message);
  }

  await deleteGuestPhotosForInvitation(invitationId);

  const { error: deleteError } = await supabase
    .from("user_invitations")
    .delete()
    .eq("id", invitationId)
    .eq("user_id", user.id);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (invitation?.invitation_image_path) {
    await deleteR2Object(invitation.invitation_image_path);
  }
}

export async function getCurrentUserInvitations(): Promise<UserInvitation[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    throw new Error("Oturum bulunamadı.");
  }

  const { data, error } = await supabase
    .from("user_invitations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const invitations = (data ?? []) as UserInvitation[];

  const invitationsWithSignedUrls = await Promise.all(
    invitations.map(async (invitation) => {
      if (!invitation.invitation_image_path) {
        return invitation;
      }

      try {
        const signedImageUrl = await createSignedInvitationImageUrl(
          invitation.invitation_image_path,
        );

        return {
          ...invitation,
          invitation_image_url: signedImageUrl,
        };
      } catch {
        return invitation;
      }
    }),
  );

  return invitationsWithSignedUrls;
}
