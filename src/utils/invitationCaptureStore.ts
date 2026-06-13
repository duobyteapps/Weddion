let capturedInvitationImageUri: string | null = null;

export function setCapturedInvitationImageUri(uri: string | null) {
  capturedInvitationImageUri = uri;
}

export function getCapturedInvitationImageUri() {
  return capturedInvitationImageUri;
}

export function clearCapturedInvitationImageUri() {
  capturedInvitationImageUri = null;
}
