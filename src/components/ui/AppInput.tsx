import { TextInput, TextInputProps, View } from "react-native";

import { AppText } from "./AppText";

type AppInputSize = "default" | "compact";

type AppInputProps = TextInputProps & {
  label?: string;
  error?: string;
  className?: string;
  inputClassName?: string;
  size?: AppInputSize;
};

export function AppInput({
  label,
  error,
  className = "",
  inputClassName = "",
  placeholderTextColor = "#817A90",
  size = "default",
  ...props
}: AppInputProps) {
  const inputSizeClass =
    size === "compact"
      ? "h-[46px] rounded-[14px] text-[14px]"
      : "h-[52px] rounded-2xl text-[15px]";

  return (
    <View className={`gap-1.5 ${className}`}>
      {label ? (
        <AppText variant="caption" className="text-textMuted">
          {label}
        </AppText>
      ) : null}

      <TextInput
        placeholderTextColor={placeholderTextColor}
        className={`
          ${inputSizeClass}
          border
          bg-surfaceLight
          px-4
          font-manrope
          text-text
          ${error ? "border-red-500" : "border-border"}
          ${inputClassName}
        `}
        {...props}
      />

      {error ? (
        <AppText variant="caption" className="text-red-500">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
