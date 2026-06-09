import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  Text,
} from "react-native";

type AppButtonVariant = "primary" | "secondary" | "ghost";

type AppButtonProps = PressableProps & {
  title: string;
  variant?: AppButtonVariant;
  loading?: boolean;
  className?: string;
};

export function AppButton({
  title,
  variant = "primary",
  loading = false,
  disabled,
  className = "",
  ...props
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  const buttonVariants: Record<AppButtonVariant, string> = {
    primary: "bg-primary border-primary",
    secondary: "bg-primaryLight border-primaryLight",
    ghost: "bg-transparent border-border",
  };

  const textVariants: Record<AppButtonVariant, string> = {
    primary: "text-white",
    secondary: "text-text",
    ghost: "text-text",
  };

  const indicatorColor: Record<AppButtonVariant, string> = {
    primary: "#FFFFFF",
    secondary: "#3D3046",
    ghost: "#3D3046",
  };

  return (
    <Pressable
      disabled={isDisabled}
      className={`
        ${className.includes("h-") ? "" : "h-12"}
        items-center
        justify-center
        rounded-xl
        border
        px-5
        ${buttonVariants[variant]}
        ${isDisabled ? "opacity-70" : "active:opacity-80"}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={indicatorColor[variant]} />
      ) : (
        <Text
          className={`
            font-manropeSemiBold
            ${textVariants[variant]}
          `}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
