const APP_VARIANT = process.env.APP_VARIANT;
const isDev = APP_VARIANT === "development";

export default {
  expo: {
    name: isDev ? "Weddion Dev" : "Weddion",
    slug: "Weddion",
    owner: "duobyteapps",
    version: "1.0.14",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: isDev ? "weddion-dev" : "weddion",
    userInterfaceStyle: "automatic",

    ios: {
      icon: "./assets/images/icon.png",
      bundleIdentifier: isDev
        ? "com.duobyteapps.weddion.dev"
        : "com.duobyteapps.weddion",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,

        CFBundleDevelopmentRegion: "tr",
        CFBundleLocalizations: ["tr"],

        NSCameraUsageDescription:
          "Weddion, davetiye QR kodlarını tarayarak misafirlerin davetiyeye erişmesi ve fotoğraf yükleme ekranına yönlendirilmesi için kamera erişimini kullanır.",
      },
    },

    android: {
      package: isDev
        ? "com.duobyteapps.weddion.dev"
        : "com.duobyteapps.weddion",
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
      adaptiveIcon: {
        backgroundColor: "#F7F2FA",
        foregroundImage: "./assets/images/adaptive-icon.png",
      },
      predictiveBackGestureEnabled: false,
      permissions: [
        "android.permission.POST_NOTIFICATIONS",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
      ],

      blockedPermissions: [
        "android.permission.READ_MEDIA_IMAGES",
        "android.permission.READ_MEDIA_VIDEO",
      ],
    },

    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },

    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#F7F2FA",
          android: {
            image: "./assets/images/splash-icon.png",
            imageWidth: 120,
          },
        },
      ],
      "expo-font",
      "expo-image",
      "@react-native-community/datetimepicker",
      [
        "expo-notifications",
        {
          icon: "./assets/images/icon.png",
          color: "#F7F2FA",
          defaultChannel: "default",
        },
      ],
      [
        "expo-media-library",
        {
          photosPermission:
            "Weddion davetiye görsellerinizi fotoğraflarınıza kaydetmek için fotoğraflarınıza erişim ister.",
          savePhotosPermission:
            "Weddion davetiye görsellerinizi galerinize kaydetmek için izin ister.",
          isAccessMediaLocationEnabled: false,
        },
      ],
    ],

    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },

    extra: {
      router: {},
      eas: {
        projectId: "9400f0c8-95d4-4970-bb3a-4d6ba6979978",
      },
    },

    runtimeVersion: {
      policy: "appVersion",
    },

    updates: {
      url: "https://u.expo.dev/9400f0c8-95d4-4970-bb3a-4d6ba6979978",
    },
  },
};
