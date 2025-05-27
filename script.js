function findHalalPlaces(location) {
  clearMarkers();
  const service = new google.maps.places.PlacesService(map);
  service.nearbySearch(
    {
      location: location,
      radius: 5000,
      type: ["restaurant", "food", "grocery_or_supermarket"]
    },
    (results, status) => {
      document.getElementById("results").innerHTML = "";
      if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
        const halalKeywords = ["halal", "muslim", "islam", "arab", "turk", "bangla", "biryani", "indian", "pakistan"];

        results.forEach((place) => {
          const name = place.name.toLowerCase();
          const isHalal = halalKeywords.some(keyword => name.includes(keyword));

          if (isHalal) {
            const marker = new google.maps.Marker({
              map: map,
              position: place.geometry.location,
              icon: {
                url: "https://cdn-icons-png.flaticon.com/512/1048/1048318.png",
                scaledSize: new google.maps.Size(32, 32),
              },
              title: place.name,
            });
            markers.push(marker);

            const placeCard = document.createElement("div");
            placeCard.className = "place-card";
            placeCard.innerHTML = `
              <div class="place-name">${place.name}</div>
              <div>${place.vicinity}</div>
            `;
            document.getElementById("results").appendChild(placeCard);
          }
        });
      } else {
        document.getElementById("results").innerHTML = "<p>No Halal places found in this area.</p>";
      }
    }
  );
}
