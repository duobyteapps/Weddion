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
    title: "font-manropeBold text-[32px] leading-[40px] text-text",
    subtitle: "font-manropeSemiBold text-xl leading-7 text-text",
    body: "font-manrope text-[14px] leading-[22px] text-textMuted",
    caption: "font-manropeMedium text-[13px] leading-[18px] text-textLight",
    captionStrong:
      "font-manropeExtraBold text-[13px] leading-[18px] text-primaryDark",
    link: "font-manropeSemiBold text-sm leading-5 text-primary",

    serifTitle: "font-cormorantBold text-[25px] leading-[30px] text-text",
    serifSubtitle: "font-cormorantBold text-[18px] leading-[25px] text-text",
  };

  return (
    <Text className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </Text>
  );
}
