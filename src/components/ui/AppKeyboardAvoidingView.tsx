import { PropsWithChildren } from "react";

import {
  KeyboardAvoidingView,
  Platform,
  StyleProp,
  ViewStyle,
} from "react-native";

type AppKeyboardAvoidingViewProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  keyboardVerticalOffset?: number;
}>;

export default function AppKeyboardAvoidingView({
  children,
  style,
  keyboardVerticalOffset = 0,
}: AppKeyboardAvoidingViewProps) {
  return (
    <KeyboardAvoidingView
      style={[{ flex: 1 }, style]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      {children}
    </KeyboardAvoidingView>
  );
}
