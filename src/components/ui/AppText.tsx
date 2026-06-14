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
  | "serifSubtitle";

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
    title: "font-manropeBold text-[24px] leading-[30px] text-text",
    subtitle: "font-manropeSemiBold text-[16px] leading-[22px] text-text",
    body: "font-manrope text-[9px] leading-[18px] text-textMuted",
    caption: "font-manropeMedium text-[11px] leading-[16px] text-textLight",
    captionStrong:
      "font-manropeExtraBold text-[12px] leading-[16px] text-primaryDark",
    link: "font-manropeSemiBold text-[12px] leading-[18px] text-primary",
    serifTitle: "font-cormorantBold text-[24px] leading-[18px] text-text",
    serifSubtitle: "font-cormorantBold text-[18px] leading-[24px] text-text",
  };

  return (
    <Text className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </Text>
  );
}
