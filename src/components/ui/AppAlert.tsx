import { createContext, ReactNode, useContext, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  Modal,
  StyleSheet,
  View,
} from "react-native";

import { AppButton } from "./AppButton";
import { AppText } from "./AppText";

type AlertType = "success" | "error" | "warning" | "info";

type AlertOptions = {
  title: string;
  message: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

type AlertContextValue = {
  showAlert: (options: AlertOptions) => void;
};

const AlertContext = createContext<AlertContextValue | null>(null);

const alertStyles: Record<
  AlertType,
  {
    icon: ImageSourcePropType;
  }
> = {
  success: {
    icon: require("@/assets/images/alert-icons/success.png"),
  },
  error: {
    icon: require("@/assets/images/alert-icons/error.png"),
  },
  warning: {
    icon: require("@/assets/images/alert-icons/warning.png"),
  },
  info: {
    icon: require("@/assets/images/alert-icons/info.png"),
  },
};

export function AppAlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<AlertOptions | null>(null);

  const closeAlert = (action?: "confirm" | "cancel") => {
    const callback = action === "confirm" ? alert?.onConfirm : alert?.onCancel;

    setAlert(null);

    setTimeout(() => {
      callback?.();
    }, 150);
  };

  const type = alert?.type ?? "info";
  const style = alertStyles[type];
  const hasCancelButton = !!alert?.cancelText || !!alert?.onCancel;

  return (
    <AlertContext.Provider value={{ showAlert: setAlert }}>
      {children}

      <Modal
        visible={!!alert}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => closeAlert("cancel")}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Image
              source={require("@/assets/images/backgrounds/alert-flower.png")}
              style={styles.flower}
              resizeMode="contain"
            />

            <Image source={style.icon} style={styles.alertIcon} />

            <AppText variant="subtitle" className="mb-3 text-center text-text">
              {alert?.title}
            </AppText>

            <AppText
              variant="body"
              className="mb-8 text-center leading-7 text-textMuted"
            >
              {alert?.message}
            </AppText>

            {hasCancelButton ? (
              <View style={styles.buttonRow}>
                <View style={styles.buttonWrapper}>
                  <AppButton
                    title={alert?.cancelText ?? "İptal"}
                    variant="ghost"
                    onPress={() => closeAlert("cancel")}
                  />
                </View>

                <View style={styles.buttonWrapper}>
                  <AppButton
                    title={alert?.confirmText ?? "Tamam"}
                    onPress={() => closeAlert("confirm")}
                  />
                </View>
              </View>
            ) : (
              <AppButton
                title={alert?.confirmText ?? "Tamam"}
                onPress={() => closeAlert("confirm")}
              />
            )}
          </View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
}

export function useAppAlert() {
  const context = useContext(AlertContext);

  if (!context) {
    throw new Error("useAppAlert, AppAlertProvider içinde kullanılmalı.");
  }

  return context;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "#E8DFF1",
    paddingHorizontal: 28,
    paddingTop: 34,
    paddingBottom: 28,
    overflow: "hidden",
  },
  flower: {
    position: "absolute",
    right: -20,
    top: -8,
    width: 130,
    height: 130,
    opacity: 0.6,
  },
  alertIcon: {
    width: 96,
    height: 96,
    alignSelf: "center",
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  buttonWrapper: {
    flex: 1,
  },
});
