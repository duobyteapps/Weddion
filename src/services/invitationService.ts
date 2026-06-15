import { supabase } from "@/lib/supabase";
import {
  deleteR2Object,
  getR2SignedUrl,
  uploadImageToR2,
} from "@/services/r2ImageService";
import { getAuthenticatedUser } from "@/services/sessionService";
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
  const imagePath = `user-invitations/${params.userId}/${params.invitationId}/invitation.png`;

  await uploadImageToR2({
    imageUri: params.capturedImageUri,
    key: imagePath,
    contentType: "image/png",
    requireAuth: true,
  });

  return {
    imagePath,
  };
}

async function createSignedInvitationImageUrl(imagePath: string) {
  return getR2SignedUrl(imagePath, true);
}

async function addSignedImageUrlToInvitation(
  invitation: UserInvitation,
): Promise<UserInvitation> {
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
  } catch (error) {
    console.log("Davetiye signed URL oluşturulamadı:", error);
    return invitation;
  }
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
        await deleteR2Object(storagePath, true);
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
  const user = await getAuthenticatedUser();
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
      updated_at: new Date().toISOString(),
    })
    .eq("id", createdInvitation.id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (updateError) {
    try {
      await deleteR2Object(uploadedImage.imagePath, true);
    } catch (deleteError) {
      console.log("R2 invitation image rollback delete failed:", deleteError);
    }

    throw new Error(updateError.message);
  }

  return addSignedImageUrlToInvitation(updatedInvitation as UserInvitation);
}

export async function updateUserInvitation(
  payload: UpdateUserInvitationPayload,
): Promise<UserInvitation> {
  const user = await getAuthenticatedUser();
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
        await deleteR2Object(updatePayload.invitation_image_path, true);
      } catch (deleteError) {
        console.log("R2 invitation image rollback delete failed:", deleteError);
      }
    }

    throw new Error(updateError.message);
  }

  return addSignedImageUrlToInvitation(updatedInvitation as UserInvitation);
}

export async function deleteUserInvitation(
  invitationId: string,
): Promise<void> {
  const user = await getAuthenticatedUser();

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
    await deleteR2Object(invitation.invitation_image_path, true);
  }
}

export async function getCurrentUserInvitations(): Promise<UserInvitation[]> {
  const user = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("user_invitations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const invitations = (data ?? []) as UserInvitation[];

  return Promise.all(invitations.map(addSignedImageUrlToInvitation));
}

export async function getCurrentUserInvitationCount(): Promise<number> {
  const user = await getAuthenticatedUser();

  const { count, error } = await supabase
    .from("user_invitations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}
