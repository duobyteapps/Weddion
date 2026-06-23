import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";

export function DowryPromoCard() {
  return (
    <AppCard className="mt-5 overflow-hidden bg-primary/10">
      <View className="flex-row items-start gap-4">
        <View className="h-16 w-16 items-center justify-center rounded-3xl bg-white/80">
          <Ionicons name="gift-outline" size={30} color="#B895C8" />
        </View>

        <View className="flex-1">
          <AppText variant="subtitle" className="text-textDark">
            Çeyiz Listenizi Hazırlayın
          </AppText>

          <AppText className="mt-2 text-sm leading-5 text-textMuted">
            Düğün hazırlıklarınızı daha düzenli takip edin. Eksiklerinizi oda
            oda planlayın, aldıklarınızı işaretleyin ve listenizi kolayca
            yönetin.
          </AppText>
        </View>
      </View>

      <View className="mt-5 rounded-2xl bg-white/70 p-4">
        <View className="flex-row items-center gap-3">
          <Ionicons name="bed-outline" size={20} color="#B895C8" />
          <AppText className="flex-1 text-sm text-textDark">
            Yatak odası, mutfak, banyo ve salon ürünlerini ayrı ayrı takip edin.
          </AppText>
        </View>

        <View className="mt-3 flex-row items-center gap-3">
          <Ionicons name="checkmark-circle-outline" size={20} color="#B895C8" />
          <AppText className="flex-1 text-sm text-textDark">
            Tamamlanan ürünleri işaretleyerek eksiklerinizi hızlıca görün.
          </AppText>
        </View>

        <View className="mt-3 flex-row items-center gap-3">
          <Ionicons name="list-outline" size={20} color="#B895C8" />
          <AppText className="flex-1 text-sm text-textDark">
            Kendi özel çeyiz listenizi oluşturup dilediğiniz zaman güncelleyin.
          </AppText>
        </View>
      </View>

      <AppButton
        title="Çeyiz Listesine Git"
        className="mt-5"
        onPress={() => router.push("/(tabs)/dowry/dowry")}
      />
    </AppCard>
  );
}
