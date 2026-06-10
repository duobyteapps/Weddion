import { View, type ViewProps } from "react-native";

type AppCardProps = ViewProps & {
  className?: string;
  noPadding?: boolean;
  noMargin?: boolean;
};

export function AppCard({
  className = "",
  children,
  noPadding = false,
  noMargin = false,
  ...props
}: AppCardProps) {
  return (
    <View
      className={`
        rounded-[18px] border-0 border-border bg-surface px-4
        ${noPadding ? "" : "py-6"}
        ${noMargin ? "" : "mb-6"}
        ${className}
      `}
      {...props}
    >
      {children}
    </View>
  );
}
