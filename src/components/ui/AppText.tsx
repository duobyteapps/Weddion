import { ReactNode } from "react";
import { Text, TextProps } from "react-native";

type AppTextVariant =
  | "title"
  | "subtitle"
  | "body"
  | "caption"
  | "captionStrong"
  | "link"
  | "serifTitle"
  | "serifSubtitle"
  | "invitationNames"
  | "invitationAmpersand"
  | "invitationParents"
  | "invitationMeta"
  | "invitationBody"
  | "invitationVenue"
  | "invitationLocation";

type AppTextProps = TextProps & {
  children: ReactNode;
  variant?: AppTextVariant;
  className?: string;
};

export function AppText({
  children,
  variant = "body",
  className = "",
  ...props
}: AppTextProps) {
  const variants: Record<AppTextVariant, string> = {
    title: "font-manropeBold text-[24px]",
    subtitle: "font-manropeSemiBold text-[16px]",
    body: "font-manrope text-[10px] text-textMuted",
    caption: "font-manropeMedium text-[9px] text-textMuted",
    captionStrong: "font-manropeExtraBold text-[12px] text-primaryDark",
    link: "font-manropeSemiBold text-[12px]",

    serifTitle: "font-cormorantBold text-[24px]",
    serifSubtitle: "font-cormorantBold text-[18px]",

    invitationNames: "font-tangerineBold text-[54px] text-textDark",
    invitationAmpersand: "font-tangerineBold text-[44px] text-textDark",
    invitationParents: "font-cormorantSemiBold text-[13px]",
    invitationMeta: "font-cormorantSemiBold text-[15px] text-textDark",
    invitationBody: "font-cormorantSemiBold text-[14px]  text-textMuted",
    invitationVenue: "font-cormorantBold text-[24px]  text-textDark",
    invitationLocation: "font-cormorantSemiBold text-[13px]  text-textMuted",
  };

  return (
    <Text className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </Text>
  );
}
