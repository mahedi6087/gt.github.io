async function searchLocation(query) {
  messageDiv.textContent = 'Searching location...';
  const url = `https://nominatim.openstreetmap.fr/search?format=json&q=${encodeURIComponent(query)}&countrycodes=kr&limit=1`;
  try {
    const response = await fetch(url);
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
