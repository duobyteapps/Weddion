import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { View } from "react-native";

const sections = [
  {
    title: "1. Veri Sorumlusu",
    text: "Kişisel verileriniz, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında Weddion uygulamasının sahibi tarafından işlenmektedir. Veri sorumlusu bilgileri ve iletişim kanalları, uygulama içinde kullanıcılarla paylaşılır.",
  },
  {
    title: "2. İşlenen Kişisel Veriler",
    text: "Uygulamayı kullanmanız sırasında ad, soyad, e-posta adresi, telefon numarası, profil fotoğrafı, hesap bilgileri, davetiye bilgileri, etkinlik tarihi ve yeri, gelin-damat ve aile bilgileri, misafir fotoğrafları, misafir adı ve notu, bildirim tercihleri, cihaz türü, push bildirim token bilgisi ve teknik işlem kayıtları işlenebilir.",
  },
  {
    title: "3. Verilerin İşlenme Amaçları",
    text: "Kişisel verileriniz; hesabınızın oluşturulması ve yönetilmesi, davetiye oluşturma ve paylaşma süreçlerinin yürütülmesi, misafir fotoğraf yükleme ve galeri işlemlerinin sağlanması, bildirimlerin gönderilmesi, kullanıcı deneyiminin geliştirilmesi, destek taleplerinin yanıtlanması, güvenliğin sağlanması ve yasal yükümlülüklerin yerine getirilmesi amacıyla işlenmektedir.",
  },
  {
    title: "4. Verilerin Aktarılması",
    text: "Kişisel verileriniz, hizmetin sunulması için gerekli olduğu ölçüde altyapı, barındırma, veri tabanı, görsel depolama, bildirim, e-posta, analiz ve teknik destek hizmeti sağlayıcılarıyla paylaşılabilir. Ayrıca yasal zorunluluk halinde yetkili kamu kurum ve kuruluşlarına aktarılabilir.",
  },
  {
    title: "5. Toplama Yöntemi ve Hukuki Sebep",
    text: "Verileriniz; üyelik işlemleri, profil formları, davetiye oluşturma adımları, misafir fotoğraf yükleme ekranları, bildirim izinleri ve teknik sistem kayıtları aracılığıyla elektronik ortamda toplanır. Bu veriler; sözleşmenin kurulması veya ifası, hukuki yükümlülüklerin yerine getirilmesi, meşru menfaat ve gerekli hallerde açık rızanız hukuki sebebine dayanılarak işlenmektedir.",
  },
  {
    title: "6. Kişisel Verilerin Güvenliği",
    text: "Kişisel verileriniz, yetkisiz erişime, kayba, kötüye kullanıma ve izinsiz paylaşıma karşı gerekli teknik ve idari tedbirler alınarak korunur. Fotoğraf ve görsel içeriklere erişim, güvenli bağlantılar ve yetkilendirme kuralları çerçevesinde sağlanır.",
  },
  {
    title: "7. Saklama Süresi",
    text: "Kişisel verileriniz, uygulama hizmetlerinin sunulması için gerekli süre boyunca ve ilgili mevzuatta öngörülen yasal saklama süreleri kapsamında saklanır. Saklama süresi sona erdiğinde veya işleme amacı ortadan kalktığında veriler silinebilir, yok edilebilir veya anonim hale getirilebilir.",
  },
  {
    title: "8. Haklarınız",
    text: "KVKK kapsamında kişisel verilerinizle ilgili; verilerinizin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme, düzeltilmesini veya silinmesini isteme, işleme faaliyetlerine itiraz etme ve mevzuatta yer alan diğer haklarınızı kullanabilirsiniz.",
  },
  {
    title: "9. Başvuru",
    text: "KVKK kapsamındaki taleplerinizi uygulama içinde yer alan iletişim kanalları veya belirlenen e-posta adresi üzerinden bize iletebilirsiniz. Talepleriniz mevzuatta öngörülen süreler içinde değerlendirilir.",
  },
];

export function PrivacyDisclosureContent() {
  return (
    <AppCard>
      {sections.map((section) => (
        <View key={section.title} className="mb-6">
          <AppText variant="subtitle" className="mb-1 text-[14px]">
            {section.title}
          </AppText>

          <AppText variant="caption">{section.text}</AppText>
        </View>
      ))}
    </AppCard>
  );
}
