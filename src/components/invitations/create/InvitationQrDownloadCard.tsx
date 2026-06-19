import { forwardRef } from "react";
import { ImageBackground, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

import { AppText } from "@/components/ui/AppText";

const qrShareTemplate = require("../../../../assets/images/qr-share-template.png");

type Props = {
  qrValue: string;
  brideName: string;
  groomName: string;
  guestUploadCode?: string | null;
};

export const InvitationQrDownloadCard = forwardRef<View, Props>(
  ({ qrValue, brideName, groomName, guestUploadCode }, ref) => {
    return (
      <View
        ref={ref}
        collapsable={false}
        style={{
          width: 1200,
          height: 900,
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
        }}
      >
        <ImageBackground
          source={qrShareTemplate}
          resizeMode="cover"
          style={{
            width: 1200,
            height: 900,
          }}
        >
          <View style={{ flex: 1 }}>
            <View
              style={{
                position: "absolute",
                top: 175,
                left: 0,
                right: 0,
                alignItems: "center",
                paddingHorizontal: 64,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <AppText
                  variant="invitationNames"
                  className="text-center !text-[72px] leading-[80px] text-[#765092]"
                >
                  {brideName}
                </AppText>

                <AppText
                  variant="invitationNames"
                  className="mx-10 text-center !text-[72px] leading-[80px] text-[#8E63AF]"
                >
                  &
                </AppText>

                <AppText
                  variant="invitationNames"
                  className="text-center !text-[72px] leading-[80px] text-[#765092]"
                >
                  {groomName}
                </AppText>
              </View>
            </View>

            <View
              style={{
                position: "absolute",
                top: 275,
                left: 0,
                right: 0,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 30,
                  backgroundColor: "transparent",
                  padding: 24,
                }}
              >
                <QRCode
                  value={qrValue}
                  size={250}
                  color="#2B2133"
                  backgroundColor="transparent"
                />
              </View>
            </View>

            {!!guestUploadCode && (
              <View
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 95,
                  alignItems: "center",
                  paddingHorizontal: 20,
                }}
              >
                <AppText variant="invitationMeta" className="!text-[22px]">
                  Davet Kodu
                </AppText>

                <AppText
                  variant="captionStrong"
                  className="!text-[28px] !font-manropeSemiBold"
                  style={{
                    letterSpacing: 4,
                  }}
                >
                  {guestUploadCode}
                </AppText>
              </View>
            )}
          </View>
        </ImageBackground>
      </View>
    );
  },
);

InvitationQrDownloadCard.displayName = "InvitationQrDownloadCard";
