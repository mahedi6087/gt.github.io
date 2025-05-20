const map = L.map('map').setView([36.5, 127.8], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

const cityCoords = {
  Seoul: { lat: 37.5665, lon: 126.9780 },
  Busan: { lat: 35.1796, lon: 129.0756 }
};

function loadHalalPlaces(city) {
  const { lat, lon } = cityCoords[city];
  map.setView([lat, lon], 13);

  const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];(
    node["cuisine"="halal"](around:10000,${lat},${lon});
    node["diet:halal"="yes"](around:10000,${lat},${lon});
    node["name"~"halal",i](around:10000,${lat},${lon});
  );out;`;

  fetch(overpassUrl)
    .then(res => res.json())
    .then(data => {
      map.eachLayer(layer => {
        if (layer instanceof L.Marker) map.removeLayer(layer);
      });

      document.getElementById("sidebar").innerHTML = `<strong>Halal places in ${city}:</strong><br><br>`;

      if (data.elements.length === 0) {
        document.getElementById("sidebar").innerHTML += "No Halal places found.";
        return;
      }

      data.elements.forEach(place => {
        const name = place.tags.name || "Unnamed Halal Place";
        const marker = L.marker([place.lat, place.lon]).addTo(map);
        marker.bindPopup(name);

        const entry = document.createElement("div");
        entry.textContent = name;
        document.getElementById("sidebar").appendChild(entry);
      });
    })
    .catch(err => {
      console.error("Error fetching Overpass data:", err);
      alert("Could not load Halal data.");
    });
}
