const locations = {
  Atsugi: 'Berlitz Atsugi Language Center',
  Chiba: 'Berlitz Chiba Language Center',
  Chofu: 'Berlitz Chofu Language Center',
  Fujisawa: 'Berlitz Fujisawa Language Center',
  Hamamatsucho: 'Berlitz Hamamatsucho Language Center',
  Ichigaya: 'Berlitz Ichigaya Language Center',
  Ichikawa: 'Berlitz Ichikawa Language Center',
  Ikebukuro: 'Berlitz Ikebukuro Language Center',
  Jiyugaoka: 'Berlitz Jiyugaoka Language Center',
  Kashiwa: 'Berlitz Kashiwa Language Center',
  Kawasaki: 'Berlitz Kawasaki Language Center',
  Kichijoji: 'Berlitz Kichijoji Language Center',
  Meguro: 'Berlitz Meguro Language Center',
  Mizonokuchi: 'Berlitz Mizonokuchi Language Center',
  'Naka-Meguro': 'Berlitz Naka-Meguro Language Center',
  Nakameguro: 'Berlitz Naka-Meguro Language Center',
  Nerima: 'Berlitz Nerima Language Center',
  Ochanomizu: 'Berlitz Ochanomizu Language Center',
  Omiya: 'Berlitz Omiya Language Center',
  Otemachi: 'Berlitz Otemachi Language Center',
  Roppongi: 'Berlitz Roppongi Language Center',
  Sangenjaya: 'Berlitz Sangenjaya Language Centre',
  Seijo: 'Berlitz Seijo Language Center',
  'Shin-Yokohama': 'Berlitz Shin-Yokohama Language Center',
  'Shin-Yurigaoka': 'Berlitz Shin-Yurigaoka Language Center',
  Shinagawa: 'Berlitz Shinagawa Language Center',
  Shinjuku: 'Berlitz Shinjuku Langauge Center',
  Tachikawa: 'Berlitz Tachikawa Language Center',
  'Tama Center': 'Berlitz Tama Center Language Center',
  'Tama Plaza': 'Berlitz Tama Plaza Language Center',
  Ueno: 'Berlitz Ueno Language Center',
  Yokohama: 'Berlitz Yokohama Language Center',
};

function lookupLocation(location) {
  // This function takes the short LC name and looks up the full name which is used in
  // Google Maps and hopefully Apple Maps Allowing for calendar apps to provide map directions
  if (locations[location]) return locations[location];
  return '';
}

export { locations, lookupLocation };
