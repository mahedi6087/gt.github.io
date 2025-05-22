const map = L.map('map').setView([36.5, 127.8], 7);

let lightLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

let darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; CartoDB'
});

const halalIcon = L.icon({
  iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Halal_logo.svg',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});

const messageDiv = document.getElementById('message');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const darkModeToggle = document.getElementById('darkModeToggle');
const resultsDiv = document.getElementById('results');

let markersLayer = L.layerGroup().addTo(map);

darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  if (document.body.classList.contains('dark')) {
    map.removeLayer(lightLayer);
    darkLayer.addTo(map);
    darkModeToggle.textContent = '☀️ Light Mode';
  } else {
    map.removeLayer(darkLayer);
    lightLayer.addTo(map);
    darkModeToggle.textContent = '🌙 Dark Mode';
  }
});

function clearMarkers() {
  markersLayer.clearLayers();
  resultsDiv.innerHTML = "";
}

async function searchLocation(query) {
  messageDiv.textContent = 'Searching location...';
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=kr&limit=1`;
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'HalalFinderApp/1.0 (your.email@example.com)' }
    });
    const data = await response.json();
    if (data.length === 0) {
      messageDiv.textContent = 'Location not found in South Korea.';
      return null;
    }
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      displayName: data[0].display_name
    };
  } catch (err) {
    console.error('Nominatim error:', err);
    messageDiv.textContent = 'Error searching location.';
    return null;
  }
}

async function searchHalalPlaces(lat, lon) {
  messageDiv.textContent = 'Searching halal places nearby...';
  const radius = 10000;
  const query = `
    [out:json][timeout:25];
    (
      node["cuisine"="halal"](around:${radius},${lat},${lon});
      node["diet:halal"="yes"](around:${radius},${lat},${lon});
      node["name"~"halal",i](around:${radius},${lat},${lon});
    );
    out body;
  `;
  const url = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query);
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (!data.elements || data.elements.length === 0) {
      messageDiv.textContent = 'No halal places found nearby.';
      return [];
    }
    return data.elements;
  } catch (err) {
    console.error('Overpass error:', err);
    messageDiv.textContent = 'Error fetching halal places.';
    return [];
  }
}

function addMarkers(places) {
  clearMarkers();
  resultsDiv.innerHTML = "<h3>Halal Places Found:</h3>";
  places.forEach(place => {
    if (!place.lat || !place.lon) return;
    const name = place.tags?.name || 'Unnamed Halal Place';
    const address = place.tags?.["addr:full"] || place.tags?.["addr:street"] || place.tags?.["addr:district"] || "Address not available";

    const marker = L.marker([place.lat, place.lon], { icon: halalIcon })
      .bindPopup(`<b>${name}</b><br>${address}`);
    markersLayer.addLayer(marker);

    const entry = document.createElement("div");
    entry.innerHTML = `<b>${name}</b><br>${address}<br><br>`;
    resultsDiv.appendChild(entry);
  });
}

async function onSearch() {
  const query = searchInput.value.trim();
  if (!query) {
    alert('Please enter a district or city name.');
    return;
  }

  messageDiv.textContent = '';
  clearMarkers();

  const location = await searchLocation(query);
  if (!location) return;

  map.setView([location.lat, location.lon], 13);

  const halalPlaces = await searchHalalPlaces(location.lat, location.lon);
  addMarkers(halalPlaces);

  if (halalPlaces.length > 0) {
    messageDiv.textContent = `Found ${halalPlaces.length} halal place(s) near ${location.displayName}.`;
  }
}

searchBtn.addEventListener('click', onSearch);
searchInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') onSearch();
});
