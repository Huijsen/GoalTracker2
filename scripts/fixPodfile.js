// scripts/fixPodfile.js
const fs = require('fs');
const path = require('path');

const podfilePath = path.join(__dirname, '../ios/Podfile');
let podfile = fs.readFileSync(podfilePath, 'utf8');

// Als het al bestaat → niets doen
if (podfile.includes('use_modular_headers!')) {
  console.log('Podfile bevat al use_modular_headers!, niets te wijzigen');
  process.exit(0);
}

// Voeg use_modular_headers! DIRECT NA platform regel toe
podfile = podfile.replace(
  /(platform :ios, ['"][0-9.]+['"])/,
  `$1\nuse_modular_headers!`
);

// Extra fallback: als dit mislukt, zet het bovenaan het Podfile
if (!podfile.includes('use_modular_headers!')) {
  podfile = `use_modular_headers!\n${podfile}`;
}

fs.writeFileSync(podfilePath, podfile);
console.log('✔ Podfile updated: use_modular_headers! toegevoegd');
