import { AuthHeader } from "@/components/auth/AuthHeader";
import { AppBackButton } from "@/components/ui/AppBackButton";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";

const CODE_LENGTH = 6;

export default function GuestPhotoAccessScreen() {
  const router = useRouter();

  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [activeInputIndex, setActiveInputIndex] = useState<number | null>(null);

  const eventCode = code.join("");

  function handleChangeCode(value: string, index: number) {
    const normalizedValue = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const lastCharacter = normalizedValue.slice(-1);

    const nextCode = [...code];
    const wasEmpty = !nextCode[index];

    nextCode[index] = lastCharacter;
    setCode(nextCode);

    if (lastCharacter && wasEmpty && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(key: string, index: number) {
    if (key !== "Backspace") {
      return;
    }

    if (code[index]) {
      const nextCode = [...code];
      nextCode[index] = "";
      setCode(nextCode);
      return;
    }

    if (index > 0) {
      inputRefs.current[index - 1]?.focus();

      const nextCode = [...code];
      nextCode[index - 1] = "";
      setCode(nextCode);
    }
  }

  function handleContinue() {
    const normalizedCode = eventCode.trim();

    if (normalizedCode.length !== CODE_LENGTH) {
      return;
    }

    router.push({
      pathname: "/guest-photo-upload",
      params: { code: normalizedCode },
    });
  }

  function handleQrScan() {
    router.push({
      pathname: "/guest-photo-upload",
      params: { code: "QR" },
    });
  }

  return (
    <ScreenContainer className="bg-background">
      <View className="relative flex-1 px-1 pb-8 pt-4">
        <Image
          source={require("../../assets/images/backgrounds/wedding-floral.png")}
          className="absolute -right-8 top-0 h-44 w-44 opacity-80"
          resizeMode="contain"
        />

        <AppBackButton onPress={() => router.replace("/")} />

        <AuthHeader
          description="Online davetiye ve etkinlik platformu"
          descriptionClassName="mt-3 px-6 text-center text-textMuted"
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View className="flex-1 justify-between">
              <AppCard className="mt-7">
                <View className="flex-row items-center gap-4">
                  <View className="h-14 w-14 items-center justify-center rounded-xl bg-accentLight">
                    <Ionicons name="keypad" size={28} color="#8F63D4" />
                  </View>

                  <View className="flex-1">
                    <AppText variant="serifTitle" className="text-text">
                      Etkinlik Kodunu Gir
                    </AppText>

                    <AppText variant="body" className="mt-2 text-textMuted">
                      Size verilen etkinlik kodunu girerek fotoğraflarınızı
                      yükleyin ve anıları paylaşın.
                    </AppText>
                  </View>
                </View>

                <View className="my-5 h-[1px] bg-border" />

                <AppText variant="subtitle" className="mb-4 text-textLight">
                  Etkinlik Kodu
                </AppText>

                <View className="flex-row gap-3">
                  {code.map((character, index) => {
                    const isActive = activeInputIndex === index;

                    return (
                      <View key={index} className="relative flex-1">
                        <TextInput
                          ref={(ref) => {
                            inputRefs.current[index] = ref;
                          }}
                          value={character}
                          onChangeText={(value) =>
                            handleChangeCode(value, index)
                          }
                          onKeyPress={({ nativeEvent }) =>
                            handleKeyPress(nativeEvent.key, index)
                          }
                          onFocus={() => setActiveInputIndex(index)}
                          onBlur={() => {
                            setActiveInputIndex((currentIndex) =>
                              currentIndex === index ? null : currentIndex,
                            );
                          }}
                          maxLength={1}
                          autoCapitalize="characters"
                          autoCorrect={false}
                          keyboardType="default"
                          textAlign="center"
                          selectTextOnFocus
                          caretHidden
                          selectionColor="#8F63D4"
                          placeholder="-"
                          placeholderTextColor="#BDB3CC"
                          className={`h-[58px] rounded-xl border bg-white text-center font-manropeSemiBold text-xl text-text ${
                            isActive ? "border-primary" : "border-primaryLight"
                          }`}
                        />

                        {isActive && !character ? (
                          <View
                            pointerEvents="none"
                            className="absolute top-[17px] h-6 w-[1px] bg-primary"
                            style={{ left: "50%" }}
                          />
                        ) : null}
                      </View>
                    );
                  })}
                </View>

                <View className="mt-7 gap-3">
                  <AppButton title="Devam Et" onPress={handleContinue} />

                  <Pressable
                    onPress={handleQrScan}
                    className="h-14 flex-row items-center justify-center rounded-xl border border-primaryLight bg-white active:opacity-80"
                  >
                    <Ionicons name="qr-code" size={26} color="#9B6BD3" />

                    <AppText variant="subtitle" className="ml-3 text-primary">
                      QR Kod Okut
                    </AppText>
                  </Pressable>
                </View>
              </AppCard>

              <View className="mt-7 items-center px-5">
                <AppText
                  variant="caption"
                  className="text-center text-textLight"
                >
                  Weddion ile davetiyeler artık daha romantik ve modern.
                </AppText>

                <Image
                  source={require("../../assets/images/wedding-divider.png")}
                  className="mt-3 h-5 w-40 opacity-70"
                  resizeMode="contain"
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ScreenContainer>
  );
}
