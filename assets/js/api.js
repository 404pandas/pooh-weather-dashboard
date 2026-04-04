// api.js
// All network requests live here. The call chain for a typical search is:
//   fetchCoords()  →  fetchWeather()  →  renderItems()
// For the location button it's:
//   fetchCoordsFromLatLon()  →  fetchWeather()  →  renderItems()

// ── Weather data ──────────────────────────────────────────────────────────────

// Fetches the 5-day / 3-hour forecast for a known lat/lon pair,
// then hands the data to renderItems().
function fetchWeather(location) {
  var apiURL = weatherAPIurl + "/data/2.5/forecast"
             + "?lat=" + location.lat
             + "&lon=" + location.lon
             + "&units=imperial"           // temperatures arrive in °F
             + "&appid=" + weatherAPIkey;

  fetch(apiURL)
    .then(function (response) { return response.json(); })
    .then(function (data) {
      renderItems(location.name, data);
    })
    .catch(function (err) {
      console.error(err);
      hideLoader();
      showError("Network error. Check your connection and try again.");
    });
}

// ── Forward geocoding ─────────────────────────────────────────────────────────

// Turns a city-name string into coordinates, then calls fetchWeather().
// If the API returns an empty array the city wasn't found — we show an error
// instead of trying to continue with undefined data.
function fetchCoords(search) {
  showLoader();
  var apiURL = weatherAPIurl + "/geo/1.0/direct"
             + "?q=" + encodeURIComponent(search)
             + "&limit=5&appid=" + weatherAPIkey;

  fetch(apiURL)
    .then(function (response) { return response.json(); })
    .then(function (data) {
      if (!data[0]) {
        hideLoader();
        showError("City not found. Please try again.");
      } else {
        hideError();
        appendSearchHistory(search);
        fetchWeather(data[0]);
      }
    })
    .catch(function (err) {
      console.error(err);
      hideLoader();
      showError("Network error. Check your connection and try again.");
    });
}

// ── Reverse geocoding ─────────────────────────────────────────────────────────

// Turns raw coordinates (from the browser's Geolocation API) into a city
// name, then calls fetchWeather(). This is the second step of the
// "Use My Location" flow — the first step happens in app.js.
function fetchCoordsFromLatLon(lat, lon) {
  showLoader();
  var apiURL = weatherAPIurl + "/geo/1.0/reverse"
             + "?lat=" + lat + "&lon=" + lon
             + "&limit=1&appid=" + weatherAPIkey;

  fetch(apiURL)
    .then(function (response) { return response.json(); })
    .then(function (data) {
      setLocationLoading(false);
      if (!data[0]) {
        hideLoader();
        showError("Could not find a city at your location. Try searching manually.");
        return;
      }
      hideError();
      clearWeatherEffects();
      appendSearchHistory(data[0].name);
      fetchWeather(data[0]);
    })
    .catch(function (err) {
      console.error(err);
      setLocationLoading(false);
      hideLoader();
      showError("Network error. Check your connection and try again.");
    });
}
