const { withSettingsGradle } = require('@expo/config-plugins');

// Gradle 9 melarang rootProject.name diawali/akhiri '.'
// (nama aplikasi "Langkah." menghasilkan 'Langkah.').
// Buang titik hanya untuk nama proyek Gradle — label launcher tetap "Langkah.".
module.exports = function withSafeGradleProjectName(config) {
  return withSettingsGradle(config, (mod) => {
    mod.modResults.contents = mod.modResults.contents.replace(
      /rootProject\.name\s*=\s*(['"])([^'"]*)\1/,
      (whole, quote, name) => whole.replace(name, name.replace(/^\.+|\.+$/g, '')),
    );
    return mod;
  });
};
