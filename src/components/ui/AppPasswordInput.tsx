import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, TextInput, TextInputProps, View } from "react-native";

import { Colors } from "@/constants/Colors";
import { AppText } from "./AppText";

type AppPasswordInputSize = "default" | "compact";

type AppPasswordInputProps = TextInputProps & {
  label?: string;
  error?: string;
  className?: string;
  inputClassName?: string;
  size?: AppPasswordInputSize;
};

export function AppPasswordInput({
  label,
  error,
  className = "",
  inputClassName = "",
  placeholderTextColor = "#817A90",
  size = "default",
  ...props
}: AppPasswordInputProps) {
  const [visible, setVisible] = useState(false);

  const inputSizeClass =
    size === "compact" ? "h-12 rounded-xl" : "h-12 rounded-xl";

  return (
    <View className={`gap-1.5 ${className}`}>
      {label ? (
        <AppText variant="caption" className="text-textMuted">
          {label}
        </AppText>
      ) : null}

      <View
        className={`
          ${inputSizeClass}
          flex-row
          items-center
          border
          bg-surfaceLight
          px-4
          ${error ? "border-red-500" : "border-border"}
        `}
      >
        <TextInput
          placeholderTextColor={placeholderTextColor}
          secureTextEntry={!visible}
          autoCapitalize="none"
          className={`
            flex-1
            pr-3
            font-manrope
            text-text
            ${inputClassName}
          `}
          {...props}
        />

        <Pressable onPress={() => setVisible((prev) => !prev)}>
          <Ionicons
            name={visible ? "eye-off-outline" : "eye-outline"}
            size={22}
            color={Colors.textLight}
          />
        </Pressable>
      </View>

      {error ? (
        <AppText variant="caption" className="text-red-500">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
