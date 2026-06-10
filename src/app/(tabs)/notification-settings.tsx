import { useState } from "react";
import { ScrollView } from "react-native";

import { AppSwitchCard } from "@/components/common/AppSwitchCard";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { NotificationChannelsCard } from "@/components/profile/notification-settings/NotificationChannelsCard";
import { NotificationHeroCard } from "@/components/profile/notification-settings/NotificationHeroCard";
import { ScreenContainer } from "@/components/ui/ScreenContainer";

export default function NotificationSettingsScreen() {
  const [allNotifications, setAllNotifications] = useState(true);
  const [appNotifications, setAppNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [systemNotifications, setSystemNotifications] = useState(true);

  function handleAllNotifications(value: boolean) {
    setAllNotifications(value);
    setAppNotifications(value);
    setEmailNotifications(value);
    setSmsNotifications(value);
    setSystemNotifications(value);
  }

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32"
      >
        <ScreenHeader
          title="Bildirim Ayarları"
          description="Hangi bildirimleri almak istediğinizi yönetin."
        />

        <NotificationHeroCard />

        <AppSwitchCard
          title="Tüm Bildirimler"
          description="Tüm bildirimleri aç veya kapat"
          value={allNotifications}
          onValueChange={handleAllNotifications}
        />

        <NotificationChannelsCard
          appNotifications={appNotifications}
          emailNotifications={emailNotifications}
          smsNotifications={smsNotifications}
          systemNotifications={systemNotifications}
          onChangeAppNotifications={setAppNotifications}
          onChangeEmailNotifications={setEmailNotifications}
          onChangeSmsNotifications={setSmsNotifications}
          onChangeSystemNotifications={setSystemNotifications}
        />
      </ScrollView>
    </ScreenContainer>
  );
}
