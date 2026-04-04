// utils.js
// Small, reusable helper functions. None of these touch the DOM or make
// network requests — they just take a value in and return a value out.
// That makes them easy to understand and test in isolation.

// ── Formatting helpers ────────────────────────────────────────────────────────

// The wind direction comes from the API as a number (0–360 degrees).
// This converts it to a compass label like "NNE" or "SW" by dividing
// the circle into 16 equal slices of 22.5 degrees each.
function getWindDirection(deg) {
  var dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

// Visibility is returned in meters — miles are more intuitive for US users.
function metersToMiles(meters) {
  return (meters / 1609.34).toFixed(1);
}

// Weather descriptions come back all-lowercase ("light rain").
// This uppercases the first letter so they read naturally in the UI.
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ── Temperature helpers ───────────────────────────────────────────────────────
// All API data arrives in imperial (Fahrenheit). These functions convert
// for display without touching the stored data, so toggling units is instant.

function toDisplayTemp(fahrenheit) {
  if (tempUnit === "C") {
    return Math.round((fahrenheit - 32) * 5 / 9);
  }
  return Math.round(fahrenheit);
}

function unitLabel() {
  return tempUnit === "C" ? "°C" : "°F";
}

// ── DOM builder ───────────────────────────────────────────────────────────────

// Creates one tile in the stats grid — an icon on top, a value in the
// middle, and a small label underneath. Returns the element so the caller
// can decide where to append it.
function makeStatBox(iconName, value, label) {
  var box = document.createElement("div");
  box.setAttribute("class", "stat-box");

  var icon = document.createElement("i");
  icon.setAttribute("class", "material-icons stat-icon");
  icon.textContent = iconName;

  var valEl = document.createElement("span");
  valEl.setAttribute("class", "stat-value");
  valEl.textContent = value;

  var lblEl = document.createElement("span");
  lblEl.setAttribute("class", "stat-label");
  lblEl.textContent = label;

  box.append(icon, valEl, lblEl);
  return box;
}

// ── Weather image lookup ──────────────────────────────────────────────────────

// Maps the API's weather condition to a matching Pooh illustration.
// The API gives us a broad "main" category (e.g. "Rain") and a more
// specific numeric "id" (e.g. 502 = heavy rain). We use both to pick
// the most fitting image.
function getWeatherImage(weatherArr) {
  var main = weatherArr[0].main;
  var id   = weatherArr[0].id;
  var base = "./assets/images/weather-specific/";

  if (main === "Thunderstorm") {
    // IDs 202, 212, 221, 232 are severe — warrant the broken-umbrella image
    return (id === 202 || id === 212 || id === 221 || id === 232)
      ? base + "pooh99.png"
      : base + "pooh96.png";
  }

  if (main === "Drizzle") return base + "pooh1.png";

  if (main === "Rain") {
    if (id === 503 || id === 504 || id === 511 || id === 522 || id === 531) return base + "pooh94.png";
    if (id === 502) return base + "pooh6.png";
    if (id === 501 || id === 521) return base + "pooh97.png";
    return base + "pooh98.png";
  }

  if (main === "Snow")       return base + "pooh45.png";

  if (main === "Atmosphere") {
    if (id === 781) return base + "pooh43.png"; // tornado
    if (id === 771) return base + "pooh80.png"; // squall
    return base + "pooh45.png";                 // mist, fog, haze
  }

  if (main === "Clear") return base + "pooh4.png";

  if (main === "Clouds") {
    if (id === 801) return base + "pooh110.png"; // few clouds
    if (id === 802) return base + "pooh2.png";   // scattered
    if (id === 803) return base + "pooh5.png";   // broken
    return base + "pooh3.png";                   // overcast
  }

  return base + "pooh3.png"; // fallback
}
