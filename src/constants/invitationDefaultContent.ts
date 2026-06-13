import { InvitationFormData } from "@/types/invitation";

export const defaultInvitationContent: InvitationFormData = {
  brideName: "Nisa",
  groomName: "Onur",
  brideParents: "Anne - Baba",
  groomParents: "Anne - Baba",
  brideSurname: "Soyad",
  groomSurname: "Soyad",

  // AppDateInput için ISO format kullanıyoruz.
  date: "2026-08-22",

  time: "19.00",
  description:
    "Bu özel günümüzde\nsizleri de aramızda görmekten\nmutluluk duyarız.",
  venueName: "Mekan",
  venueLocation: "Konum",
};
