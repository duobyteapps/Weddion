import { AppAccordion } from "@/components/ui/AppAccordion";
import { AppText } from "@/components/ui/AppText";
import { AppCard } from "../ui/AppCard";

export const supportFAQItems = [
  {
    question: "Davetiye nasıl oluşturulur?",
    answer:
      "Ana sayfada bulunan oluştur butonuna dokunarak yeni bir davetiye hazırlamaya başlayabilirsiniz.",
  },
  {
    question: "Oluşturduğum davetiyeleri nereden görebilirim?",
    answer:
      "Davetiyeler sekmesinden daha önce oluşturduğunuz tüm davetiyeleri görüntüleyebilirsiniz.",
  },
  {
    question: "Davetiye bilgilerimi değiştirebilir miyim?",
    answer:
      "Evet, davetiye detay sayfasından davetiye bilgilerinizi istediğiniz zaman düzenleyebilirsiniz.",
  },
  {
    question: "Misafir listesi nasıl oluşturulur?",
    answer:
      "Misafirler sekmesinden davetinize katılacak kişileri ekleyebilir ve listenizi kolayca yönetebilirsiniz.",
  },
  {
    question: "Profil bilgilerimi nasıl güncellerim?",
    answer:
      "Profil sayfasındaki Kişisel Bilgiler bölümünden ad, soyad, telefon ve doğum tarihi bilgilerinizi güncelleyebilirsiniz.",
  },
  {
    question: "Şifremi nasıl değiştirebilirim?",
    answer:
      "Profil sayfasındaki Şifre ve Güvenlik bölümünden mevcut şifrenizi güvenli şekilde değiştirebilirsiniz.",
  },
  {
    question: "Bildirim ayarlarımı değiştirebilir miyim?",
    answer:
      "Evet, Bildirim Ayarları bölümünden e-posta ve SMS bildirim tercihlerinizi düzenleyebilirsiniz.",
  },
  {
    question: "Hesabımı nasıl silebilirim?",
    answer:
      "Profil sayfasında yer alan Profilimi ve Bilgilerimi Sil seçeneği ile hesabınızı silebilirsiniz.",
  },
] as const;

export function SupportFAQ() {
  return (
    <>
      <AppText variant="serifTitle" className="mb-3 mt-4">
        Sık Sorulan Sorular
      </AppText>
      <AppCard>
        {supportFAQItems.map((item, index) => {
          const isLast = index === supportFAQItems.length - 1;

          return (
            <AppAccordion
              key={item.question}
              title={item.question}
              showDivider={!isLast}
            >
              <AppText variant="caption" className="text-muted">
                {item.answer}
              </AppText>
            </AppAccordion>
          );
        })}
      </AppCard>
    </>
  );
}
