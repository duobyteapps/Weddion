import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { View } from "react-native";

const sections = [
  {
    title: "1. Veri Sorumlusu",
    text: "Kişisel verileriniz Weddion Teknoloji A.Ş. tarafından 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında işlenmektedir.",
  },
  {
    title: "2. İşlenen Kişisel Veriler",
    text: "Uygulamayı kullanmanız sırasında ad, soyad, e-posta adresi, telefon numarası, profil bilgileri, davetiye bilgileri, misafir listesi, etkinlik bilgileri, fotoğraf ve iletişim tercihleri gibi veriler işlenmektedir.",
  },
  {
    title: "3. Verilerin İşlenme Amaçları",
    text: "Kişisel verileriniz; hesabınızın oluşturulması ve yönetilmesi, davetiye ve etkinlik işlemlerinin yürütülmesi, misafir listesi ve katılım bilgilerinin yönetilmesi, bildirimlerin gönderilmesi, kullanıcı deneyiminin geliştirilmesi, destek taleplerinin yanıtlanması ve yasal yükümlülüklerin yerine getirilmesi amacıyla işlenmektedir.",
  },
  {
    title: "4. Verilerin Aktarılması",
    text: "Kişisel verileriniz, hizmetin sunulması amacıyla gerekli olan durumlarda altyapı, barındırma, e-posta, bildirim, analiz ve teknik destek hizmeti sağlayıcılarıyla paylaşılabilir. Yasal zorunluluk halinde yetkili kamu kurum ve kuruluşlarına aktarılabilir.",
  },
  {
    title: "5. Toplama Yöntemi ve Hukuki Sebep",
    text: "Verileriniz; uygulama içindeki formlar, üyelik işlemleri, davetiye oluşturma adımları, misafir listesi işlemleri ve teknik sistem kayıtları aracılığıyla elektronik ortamda toplanır. Bu veriler; sözleşmenin kurulması veya ifası, hukuki yükümlülüklerin yerine getirilmesi, meşru menfaat ve gerekli hallerde açık rızanız hukuki sebebine dayanılarak işlenmektedir.",
  },
  {
    title: "6. Kişisel Verilerin Güvenliği",
    text: "Kişisel verileriniz, yetkisiz erişime, kayba, kötüye kullanıma ve izinsiz paylaşmaya karşı korunmak için gerekli teknik ve idari tedbirler alınarak saklanmaktadır.",
  },
  {
    title: "7. Haklarınız",
    text: "KVKK kapsamında kişisel verilerinizle ilgili; verilerinize erişme, düzeltilmesini isteme, silinmesini isteme, işleme faaliyetlerine itiraz etme ve diğer yasal haklarınızı kullanabilirsiniz.",
  },
  {
    title: "8. Başvuru",
    text: "KVKK kapsamındaki taleplerinizi kvkk@weddion.com adresinden bize iletebilirsiniz. Talepleriniz mevzuatta öngörülen süreler içinde değerlendirilir.",
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
