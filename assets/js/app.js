// app.js
// The final script to load. Wires all the event listeners together,
// starts the animated favicon, and runs the init sequence.

// ── Form submission ───────────────────────────────────────────────────────────

function handleSearchFormSubmit(event) {
  // Prevent the default form submit so the page doesn't reload.
  event.preventDefault();

  var search = searchInput.value.trim();
  if (!search) {
    showError("Please enter a city name.");
    return;
  }

  animateSearchClick();
  hideError();
  clearWeatherEffects();
  fetchCoords(search);
  searchInput.value = "";
}

// ── Location button ───────────────────────────────────────────────────────────

function handleLocationClick() {
  // Not all browsers support geolocation — check before trying.
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by your browser.");
    return;
  }

  setLocationLoading(true);
  hideError();

  navigator.geolocation.getCurrentPosition(
    function (position) {
      // Success — hand the coordinates off to the API module.
      fetchCoordsFromLatLon(position.coords.latitude, position.coords.longitude);
    },
    function (err) {
      // Failure — usually means the user denied the permission prompt.
      console.error(err);
      setLocationLoading(false);
      showError("Could not get your location. Please check your browser permissions.");
    },
    { timeout: 10000 }
  );
}

// ── Forecast card hover ───────────────────────────────────────────────────────

// Event delegation on document means this works even after new cards are
// created. We listen at the top and check which element was actually hovered.
document.addEventListener("mouseover", function (e) {
  var card = e.target.closest(".forecast-grid .card");
  if (card) gsap.to(card, { y: -6, scale: 1.03, duration: 0.25, ease: "power2.out" });
});

document.addEventListener("mouseout", function (e) {
  var card = e.target.closest(".forecast-grid .card");
  if (card) gsap.to(card, { y: 0, scale: 1, duration: 0.3, ease: "power2.inOut" });
});

// ── Keyboard accessibility ────────────────────────────────────────────────────

// Materialize's card reveal only responds to mouse clicks by default.
// This lets keyboard users press Enter or Space to open and close it.
document.addEventListener("keydown", function (e) {
  if (e.key !== "Enter" && e.key !== " ") return;
  if (e.target.classList.contains("activator")) {
    e.preventDefault();
    e.target.click();
  }
});

// ── Temperature unit toggle ───────────────────────────────────────────────────

// When the user clicks °F or °C, we update the global, flip the active
// state on the buttons, and re-render from the cached data — no API call needed.
document.querySelectorAll(".unit-toggle-btn").forEach(function (btn) {
  btn.addEventListener("click", function () {
    var newUnit = btn.getAttribute("data-unit");
    if (newUnit === tempUnit) return;

    tempUnit = newUnit;

    document.querySelectorAll(".unit-toggle-btn").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-unit") === tempUnit);
    });

    if (lastCity && lastData) {
      clearWeatherEffects();
      renderItems(lastCity, lastData);
    }
  });
});

// ── Animated favicon ──────────────────────────────────────────────────────────

// Draws a bee orbiting a honey pot on a tiny canvas, then swaps the favicon
// every 50ms. Wrapping this in an IIFE (immediately invoked function expression)
// keeps the canvas and angle variables from polluting the global scope.
(function () {
  var canvas = document.createElement("canvas");
  canvas.width  = 32;
  canvas.height = 32;
  var ctx = canvas.getContext("2d");

  // Find an existing <link rel="icon"> or create one if there isn't one.
  var link = document.querySelector("link[rel='icon']") || document.createElement("link");
  link.rel = "icon";
  document.head.append(link);

  var angle = 0;

  setInterval(function () {
    ctx.clearRect(0, 0, 32, 32);

    // Honey pot stays centered
    ctx.font = "18px serif";
    ctx.textAlign = "center";
    ctx.fillText("🍯", 16, 22);

    // Bee orbits at a radius of 12px around the center
    var x = 16 + Math.cos(angle) * 12;
    var y = 16 + Math.sin(angle) * 12;
    ctx.font = "10px serif";
    ctx.fillText("🐝", x, y);

    angle += 0.15;  // radians per frame — higher = faster orbit

    // toDataURL() converts the canvas pixels into a base64 image string
    // that can be used as the href for a favicon link tag.
    link.href = canvas.toDataURL("image/png");
  }, 50);
}());

// ── Init ──────────────────────────────────────────────────────────────────────

// Load any previously saved cities and show the default empty screen.
getSearchHistory();
renderEmptyState();

// Wire up the three interactive elements in the sidebar.
searchForm.addEventListener("submit", handleSearchFormSubmit);
historyContainer.addEventListener("click", handleSearchHistoryClick);
locationBtn.addEventListener("click", handleLocationClick);

// DOMContentLoaded fires as soon as the HTML is fully parsed (but before
// images load). By this point all our script tags have already run, so
// this just ensures the animation starts at the right moment.
document.addEventListener("DOMContentLoaded", animatePageLoad);
