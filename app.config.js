export default ({ config }) => ({
  ...config,
  name: "GoalTracker",
  slug: "GoalTracker",
  version: "2.0.0",

  plugins: [
    "./app.plugin.cjs",
    "expo-font"
  ],

  icon: "./assets/icons/icon.png", // generiek app icon

  ios: {
    ...config.ios,
    bundleIdentifier: "casper.goaltracker.V2",
    buildNumber: "1",
    supportsTablet: true,
    icon: "./assets/icons/icon-1024.png",
    infoPlist: {
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
});
