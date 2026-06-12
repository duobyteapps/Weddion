import { useState } from "react";
import { Alert, ScrollView, View } from "react-native";

import { InvitationEditFormSection } from "@/components/invitations/create/InvitationEditFormSection";
import { InvitationEditSteps } from "@/components/invitations/create/InvitationEditSteps";
import { InvitationPreviewCard } from "@/components/invitations/create/InvitationPreviewCard";
import { ScreenContainer } from "@/components/ui/ScreenContainer";

export default function InvitationFlowEditScreen() {
  const [names, setNames] = useState("Nisa & Onur");
  const [date, setDate] = useState("22 AĞUSTOS 2026");
  const [time, setTime] = useState("CUMARTESİ | 19.00");
  const [description, setDescription] = useState(
    "Bu özel günümüzde\nsizleri de aramızda görmekten\nmutluluk duyarız.",
  );
  const [venueName, setVenueName] = useState("FOUR SEASONS HOTEL");
  const [venueLocation, setVenueLocation] = useState("Beşiktaş, İstanbul");

  function handleSave() {
    Alert.alert("Başarılı", "Davetiye bilgileriniz kaydedildi.");
  }

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 pb-8"
      >
        <InvitationEditSteps activeStep={1} />

        <View className="mt-5">
          <InvitationPreviewCard
            names={names}
            date={date}
            time={time}
            description={description}
            venueName={venueName}
            venueLocation={venueLocation}
          />
        </View>

        <View className="mt-5">
          <InvitationEditFormSection
            names={names}
            date={date}
            time={time}
            description={description}
            venueName={venueName}
            venueLocation={venueLocation}
            onChangeNames={setNames}
            onChangeDate={setDate}
            onChangeTime={setTime}
            onChangeDescription={setDescription}
            onChangeVenueName={setVenueName}
            onChangeVenueLocation={setVenueLocation}
            onSave={handleSave}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
