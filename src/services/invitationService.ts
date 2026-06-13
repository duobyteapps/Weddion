import { supabase } from "@/lib/supabase";
import {
  CreateUserInvitationPayload,
  UpdateUserInvitationPayload,
  UserInvitation,
} from "@/types/invitation";

const INVITATION_IMAGES_BUCKET = "invitation-images";

function cleanText(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getBase64FromDataUri(dataUri: string) {
  const parts = dataUri.split(",");

  if (parts.length < 2) {
    throw new Error("Davetiye görsel formatı geçersiz.");
  }

  return parts[1];
}

function base64ToArrayBuffer(base64: string) {
  const binaryString = globalThis.atob(base64);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);

  for (let index = 0; index < length; index += 1) {
    bytes[index] = binaryString.charCodeAt(index);
  }

  return bytes.buffer;
}

async function uploadInvitationImage(params: {
  userId: string;
  invitationId: string;
  capturedImageUri: string;
}) {
  const base64 = getBase64FromDataUri(params.capturedImageUri);
  const arrayBuffer = base64ToArrayBuffer(base64);

  const imagePath = `${params.userId}/${params.invitationId}/invitation.png`;

  const { error: uploadError } = await supabase.storage
    .from(INVITATION_IMAGES_BUCKET)
    .upload(imagePath, arrayBuffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  return {
    imagePath,
  };
}

async function createSignedInvitationImageUrl(imagePath: string) {
  const { data, error } = await supabase.storage
    .from(INVITATION_IMAGES_BUCKET)
    .createSignedUrl(imagePath, 60 * 60);

  if (error) {
    throw new Error(error.message);
  }

  return data.signedUrl;
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
