import { ComponentProps } from "react";

import { AppInput } from "@/components/ui/AppInput";
import { formatTimeInput } from "@/utils/timeValidation";

type AppTimeInputProps = Omit<
  ComponentProps<typeof AppInput>,
  "value" | "onChangeText" | "keyboardType" | "maxLength"
> & {
  value: string;
  onChangeText: (value: string) => void;
};

export function AppTimeInput({
  value,
  onChangeText,
  placeholder = "19:00",
  size = "compact",
  inputClassName = "text-textDark",
  ...props
}: AppTimeInputProps) {
  function handleChangeText(text: string) {
    const formattedTime = formatTimeInput(text);

    onChangeText(formattedTime);
  }

  return (
    <AppInput
      {...props}
      value={value}
      onChangeText={handleChangeText}
      placeholder={placeholder}
      maxLength={5}
      size={size}
      inputClassName={inputClassName}
      keyboardType="number-pad"
    />
  );
}
