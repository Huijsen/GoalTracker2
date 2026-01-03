# GoalTracker2: Full MacOS Deployment & EAS Build Documentation

This document outlines the end-to-end process for setting up, configuring, and deploying the GoalTracker2 application using Expo, EAS, and GitHub CLI on a MacOS (Apple Silicon) environment.

---

## 1. Initial Local Project Setup

To begin, we clone the repository and prepare the Node environment.

```bash
# Clone the repository
user@mac:~/dev $ git clone https://github.com/oke1234/GoalTracker2
user@mac:~/dev $ cd GoalTracker2

# Install dependencies and resolve security vulnerabilities
user@mac:~/GoalTracker2 $ npm install
user@mac:~/GoalTracker2 $ npm audit fix
user@mac:~/GoalTracker2 $ npm cache clean --force

# Start the Expo development server with a clean cache
user@mac:~/GoalTracker2 $ npx expo start -c
```

> **Note:** During the first start, you may see version warnings (e.g., SDK 54.0.13 vs 54.0.30). It is recommended to update these packages for best compatibility.

---

## 2. GitHub Security & CLI Configuration

To enable secure pushing and forking, we configure SSH keys and the GitHub CLI.

### 2.1 SSH Key Generation

```bash
user@mac:~/.ssh $ ssh-keygen -t ed25519 -C "your-email@gmail.com"
# Overwrite existing keys if necessary and add the .pub key to GitHub Settings
user@mac:~/.ssh $ bbedit id_ed25519.pub
```

### 2.2 GitHub CLI Authentication

We use `gh` for automated forking and repository management.

```bash
user@mac:~/GoalTracker2 $ brew install gh
user@mac:~/GoalTracker2 $ gh auth login
# Follow the prompts: Select GitHub.com > SSH > Upload your public key > Browser Login
# Use the one-time code provided in the terminal (e.g., 6754-AF7E)
```

---

## 3. Repository Forking & Remote Syncing

Create a personal fork to manage your own production builds.

```bash
# Fork the original repo to your account
user@mac:~/GoalTracker2 $ gh repo fork oke1234/GoalTracker2 --clone=true --remote=true

# Configure remotes: 'origin' for your fork, 'upstream' for the original source
user@mac:~/GoalTracker2 $ git remote add upstream https://github.com/oke1234/GoalTracker2.git
user@mac:~/GoalTracker2 $ git remote set-url origin git@github.com:YourUsername/GoalTracker2.git
user@mac:~/GoalTracker2 $ git fetch upstream
```

---

## 4. System Environment Hardening

For successful native builds on Apple Silicon, your shell environment (`.zshrc`) must be strictly configured for ARM64 and specific Ruby/Java versions.

### 4.1 Shell Configuration (`~/.zshrc`)

```bash
# Force ARM64 shell
if [ "$(uname -m)" != "arm64" ]; then
    exec /usr/bin/arch -arm64 /bin/zsh --login
fi

# Ruby & CocoaPods paths
export GEM_HOME="$HOME/.gem/ruby/3.2.0"
export PATH="$GEM_HOME/bin:/usr/local/opt/ruby@3.2/bin:$PATH"

# Java Home for Android
export JAVA_HOME=/usr/local/opt/openjdk@17
```

### 4.2 Version Verification

Use a verification script (`check_versions.sh`) to ensure all tools are detected:
*   **Node:** v20.x
*   **Ruby:** 3.2.9
*   **CocoaPods:** 1.16.2
*   **Fastlane:** Latest

---

## 5. App Configuration & Asset Management

Before building, we must update the application metadata and icons.

### 5.1 `app.config.js` vs `app.json`

We transition to `app.config.js` to allow dynamic configuration. This file contains the Bundle Identifier and EAS Project ID.

```javascript
export default ({ config }) => ({
  ...config,
  name: "GoalTracker",
  ios: {
    bundleIdentifier: "casper.goaltracker.V2",
    buildNumber: "1",
    icon: "./assets/icons/icon-1024.png"
  },
  android: {
    package: "casper.goaltracker.V2",
    versionCode: 1
  },
  extra: {
    eas: { projectId: "b37e6859-a0d6-4481-b9ec-027725387425" }
  }
});
```

### 5.2 Icon Assets

Icons must be placed in `assets/icons/`:
*   **icon.png:** General icon
*   **icon-1024.png:** High-resolution marketing icon
*   **adaptive-icon.png:** Foreground for Android

---

## 6. Native Customization (Podfile & Plugins)

Because this project uses native modules, we use a "Dangerous Modification" plugin and a fix script to patch the iOS Podfile.

### 6.1 `app.plugin.cjs`

This file automatically injects the following into the Podfile during the Expo Prebuild process:

```ruby
use_frameworks! :linkage => :dynamic
```

### 6.2 `scripts/fixPodfile.js`

A fallback script to ensure `use_modular_headers!` is applied correctly, which prevents build failures with certain React Native libraries.

---

## 7. The Prebuild & Native Build Process

### 7.1 Running Prebuild

Generates the `ios` and `android` folders.

```bash
user@mac:~/GoalTracker2 $ npx expo prebuild --platform ios
user@mac:~/GoalTracker2 $ npx expo-doctor # Verify project health
```

### 7.2 iOS Native Adjustments

If manual intervention is needed in the `ios/Podfile`:

```bash
user@mac:~/GoalTracker2/ios $ rm -rf Pods Podfile.lock
user@mac:~/GoalTracker2/ios $ pod install --repo-update
```

> **Crucial:** Ensure `use_frameworks! :linkage => :static` is set if using RN Firebase.

---

## 8. EAS Build for Production

Uploads the project to Expo servers for a remote build.

```bash
user@mac:~/GoalTracker2 $ eas build -p ios
```

### ⚠️ Critical Warning: Bundle Identifier Conflict
If a native `ios/` folder exists, EAS Build ignores the value in `app.config.js`.

**The Fix:**
Open `ios/GoalTracker.xcodeproj` and update the Bundle Identifier in the **General** tab to match your ID (`casper.goaltracker.V2`). Commit before running the build again.

---

## 9. App Store Submission

Submit the binary to App Store Connect:

```bash
user@mac:~/GoalTracker2 $ eas submit -p ios
# Select the latest build
# Provide Apple ID credentials and sync certificates
```

---

## Final Visual Documentation

*   **App Store Connect Dashboard:** [Insert Image/Link]
*   **TestFlight Status:** [Insert Image/Link]
*   **Expo Submission Confirmation:** [Insert Image/Link]

---

## Summary of Key Commands

| Action | Command |
| :--- | :--- |
| **Clean Start** | `npx expo start -c` |
| **Verify Environment** | `./check_versions.sh` |
| **Generate Native Code** | `npx expo prebuild` |
| **Production Build** | `eas build -p ios --profile production` |
| **Submit to Apple** | `eas submit -p ios` |