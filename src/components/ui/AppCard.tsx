import { View, type ViewProps } from "react-native";

type AppCardProps = ViewProps & {
  className?: string;
};

export function AppCard({ className = "", children, ...props }: AppCardProps) {
  return (
    <View
      className={`rounded-[18px] border-0 border-border bg-surface px-4 py-6 mb-6 ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}
