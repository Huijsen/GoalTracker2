#!/bin/bash
# MacExpoConfigFull.sh
# Mac versie om app.config.js, eas.json, Podfile, scripts/fixPodfile.js en package.json naar clipboard te kopiëren

# Bestandslocaties
APP_CONFIG="./app.config.js"
EAS_CONFIG="./eas.json"
POD_FILE="./ios/Podfile"
FIX_POD_SCRIPT="./scripts/fixPodfile.js"
PACKAGE_JSON="./package.json"

# Lees bestanden
APP_CONTENT=$(cat "$APP_CONFIG" 2>/dev/null || echo "app.config.js niet gevonden")
EAS_CONTENT=$(cat "$EAS_CONFIG" 2>/dev/null || echo "eas.json niet gevonden")
POD_CONTENT=$(cat "$POD_FILE" 2>/dev/null || echo "Podfile niet gevonden")
FIX_POD_CONTENT=$(cat "$FIX_POD_SCRIPT" 2>/dev/null || echo "scripts/fixPodfile.js niet gevonden")
PACKAGE_CONTENT=$(cat "$PACKAGE_JSON" 2>/dev/null || echo "package.json niet gevonden")

# Pak belangrijke info (bundleIdentifier en projectId) met macOS grep/sed
BUNDLE_ID=$(grep 'bundleIdentifier' "$APP_CONFIG" | head -n 1 | sed 's/.*bundleIdentifier[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
PROJECT_ID=$(grep 'projectId' "$APP_CONFIG" | head -n 1 | sed 's/.*projectId[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

# Combineer alles
OUTPUT="===== app.config.js =====
$APP_CONTENT

===== eas.json =====
$EAS_CONTENT

===== Podfile =====
$POD_CONTENT

===== scripts/fixPodfile.js =====
$FIX_POD_CONTENT

===== package.json =====
$PACKAGE_CONTENT

===== Belangrijke info =====
Bundle Identifier: $BUNDLE_ID
EAS Project ID: $PROJECT_ID
"

# Kopieer naar macOS clipboard
echo "$OUTPUT" | pbcopy

echo "Alle relevante configuratie (incl. package.json) is gekopieerd naar je clipboard! 😄"
