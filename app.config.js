export default ({ config }) => ({
  ...config,
  name: "GoalTracker",
  slug: "GoalTracker",
  version: "2.0.0",

  plugins: [
    "./app.plugin.cjs",
    "expo-font"
  ],

  icon: "./assets/icons/icon.png", // generiek

  ios: {
    ...config.ios,
    bundleIdentifier: "casper.goaltracker.V2",
    buildNumber: "1",
    supportsTablet: true,
    icon: "./assets/icons/icon.png", // klein icon, 1024x1024 mag, EAS resize
    infoPlist: {
      CFBundleIconName: "AppIcon",        // ✅ Nodig voor iOS 11+
      ITSAppUsesNonExemptEncryption: false,
    },
  },

  android: {
    package: "casper.goaltracker.V2",
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: "./assets/icons/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
  },

  extra: {
    eas: {
      projectId: "b37e6859-a0d6-4481-b9ec-027725387425"
    }
  }
});
