import { AppDivider } from "@/components/ui/AppDivider";
import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

const privacyItems = [
  {
    icon: "person-circle-outline",
    title: "1. Veri Gizliliği",
    text: "Kişisel verileriniz, KVKK kapsamında ve Gizlilik Politikamıza uygun olarak işlenir. Verileriniz; hesap, davetiye, misafir fotoğraf yükleme, bildirim ve destek süreçlerinin yürütülmesi için kullanılır. Hizmetin sunulması için gerekli hallerde teknik hizmet sağlayıcılarıyla sınırlı olarak paylaşılabilir.",
  },
  {
    icon: "server-outline",
    title: "2. Güvenli Saklama",
    text: "Verileriniz, güvenli altyapılar üzerinde saklanır. Yetkisiz erişimlere karşı gerekli teknik ve idari güvenlik önlemleri uygulanır.",
  },
  {
    icon: "shield-checkmark-outline",
    title: "3. Şifreleme ve Koruma",
    text: "Verilerinizin aktarımı ve saklanması sırasında güvenli bağlantılar, erişim kontrolleri ve uygun koruma yöntemleri kullanılır.",
  },
  {
    icon: "person-add-outline",
    title: "4. Erişim Kontrolü",
    text: "Verilerinize erişim, yalnızca hizmetin yürütülmesi, bakım, güvenlik ve destek süreçleri için gerekli yetkilerle sınırlandırılır. Erişim yetkileri düzenli olarak gözden geçirilir.",
  },
  {
    icon: "scale-outline",
    title: "5. Haklarınız",
    text: "KVKK kapsamındaki haklarınızı kullanabilirsiniz. Verilerinize ilişkin erişim, düzeltme, silme ve diğer talepleriniz için bizimle iletişime geçebilirsiniz.",
  },
] as const;

export function PrivacyKvkkContent() {
  return (
    <View>
      {privacyItems.map((item, index) => {
        const isLast = index === privacyItems.length - 1;

        return (
          <View key={item.title}>
            <View className="flex-row gap-5 py-5">
              <View className="h-[40px] w-[40px] items-center justify-center rounded-full bg-primarySoft">
                <Ionicons name={item.icon} size={20} color={Colors.primary} />
              </View>

              <View className="flex-1">
                <AppText variant="captionStrong" className="mb-1">
                  {item.title}
                </AppText>

                <AppText variant="caption">{item.text}</AppText>
              </View>
            </View>

            {!isLast && <AppDivider />}
          </View>
        );
      })}
    </View>
  );
}
