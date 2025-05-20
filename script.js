const map = L.map('map').setView([23.81, 90.41], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

function searchPlace() {
  const query = document.getElementById("searchBox").value;

  // Step 1: Get coordinates using Nominatim
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
    .then(res => res.json())
    .then(locations => {
      if (locations.length === 0) {
        alert("Location not found.");
        return;
      }

      const place = locations[0];
      const lat = place.lat;
      const lon = place.lon;

      map.setView([lat, lon], 13);

      // Step 2: Search Halal places using Overpass API
      const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];node["cuisine"="halal"](around:10000,${lat},${lon});out;`;

      fetch(overpassUrl)
        .then(res => res.json())
        .then(data => {
          // Clear old markers and sidebar
          document.getElementById("sidebar").innerHTML = "";
          data.elements.forEach((place) => {
            const marker = L.marker([place.lat, place.lon]).addTo(map);
            const name = place.tags.name || "Halal place";
            marker.bindPopup(name);

            // Add to sidebar
            const div = document.createElement("div");
            div.textContent = name;
            document.getElementById("sidebar").appendChild(div);
          });

          if (data.elements.length === 0) {
            const msg = document.createElement("div");
            msg.textContent = "No Halal places found.";
            document.getElementById("sidebar").appendChild(msg);
          }
        });
    });
}

// Dark Mode
function toggleDarkMode() {
  document.body.classList.toggle("dark");
}
