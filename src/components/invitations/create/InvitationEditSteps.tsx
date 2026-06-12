import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";

type Props = {
  activeStep: 1 | 2 | 3;
};

const steps = [
  { id: 1, title: "Düzenle" },
  { id: 2, title: "Önizle" },
  { id: 3, title: "Paylaş" },
] as const;

export function InvitationEditSteps({ activeStep }: Props) {
  return (
    <View className="mt-4 flex-row items-center justify-center">
      {steps.map((step, index) => {
        const isActive = step.id === activeStep;

        return (
          <View key={step.id} className="flex-row items-center">
            <View
              className={`h-8 w-8 items-center justify-center rounded-full ${
                isActive ? "bg-primary" : "bg-primarySoft"
              }`}
            >
              <AppText
                variant="captionStrong"
                className={isActive ? "text-white" : "text-primaryDark"}
              >
                {step.id}
              </AppText>
            </View>

            <AppText
              variant="captionStrong"
              className={`ml-2 ${
                isActive ? "text-primaryDark" : "text-textMuted"
              }`}
            >
              {step.title}
            </AppText>

            {index !== steps.length - 1 ? (
              <View className="mx-3 h-[1px] w-8 bg-border" />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
