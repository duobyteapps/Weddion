import { AppSwitchCard } from "@/components/common/AppSwitchCard";
import { AppText } from "@/components/ui/AppText";

type NotificationChannelsCardProps = {
  appNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  systemNotifications: boolean;
  onChangeAppNotifications: (value: boolean) => void;
  onChangeEmailNotifications: (value: boolean) => void;
  onChangeSmsNotifications: (value: boolean) => void;
  onChangeSystemNotifications: (value: boolean) => void;
};

export function NotificationChannelsCard({
  appNotifications,
  emailNotifications,
  smsNotifications,
  systemNotifications,
  onChangeAppNotifications,
  onChangeEmailNotifications,
  onChangeSmsNotifications,
  onChangeSystemNotifications,
}: NotificationChannelsCardProps) {
  return (
    <>
      <AppText variant="serifTitle" className="mb-3 mt-4">
        Bildirim Kanalları
      </AppText>

      <AppSwitchCard
        icon="phone-portrait-outline"
        title="Uygulama İçi Bildirimler"
        description="Uygulama içindeki bildirimleri alın."
        value={appNotifications}
        onValueChange={onChangeAppNotifications}
      />

      <AppSwitchCard
        icon="mail-outline"
        title="E-posta Bildirimleri"
        description="E-posta ile bildirim almak için açın."
        value={emailNotifications}
        onValueChange={onChangeEmailNotifications}
      />

      <AppSwitchCard
        icon="chatbubbles-outline"
        title="SMS Bildirimleri"
        description="SMS ile bildirim almak için açın."
        value={smsNotifications}
        onValueChange={onChangeSmsNotifications}
      />

      <AppSwitchCard
        icon="notifications-outline"
        title="Sistem Bildirimleri"
        description="Cihazınızın bildirim merkezinde gösterim."
        value={systemNotifications}
        onValueChange={onChangeSystemNotifications}
      />
    </>
  );
}
