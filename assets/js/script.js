// Global variables
var searchHistory = [];
var forecastGrid;
var weatherAPIurl = "https://api.openweathermap.org";
var weatherAPIkey = "b917dd3be7f85cdcbd69de2a255eb995";

// DOM element references
var searchForm = document.querySelector("#searchForm");
var searchInput = document.querySelector("#searchInput");
var currentContainer = document.querySelector("#current");
var forecastContainer = document.querySelector("#forecast");
var historyContainer = document.querySelector("#history");
var errorAlert = document.querySelector("#error");

// Returns the appropriate Pooh image path based on OpenWeather condition data.
// weatherArr is weather[0] from the API response (has .main and .id).
function getWeatherImage(weatherArr) {
  var main = weatherArr[0].main;
  var id   = weatherArr[0].id;
  var base = "./assets/images/weather-specific/";

  // Thunderstorm (200–232)
  if (main === "Thunderstorm") {
    // Severe thunderstorm IDs: 202, 212, 221, 232
    if (id === 202 || id === 212 || id === 221 || id === 232) {
      return base + "pooh99.png"; // broken umbrella flipped in extreme storm
    }
    return base + "pooh96.png"; // Christopher Robin in full downpour with umbrella
  }

  // Drizzle (300–321)
  if (main === "Drizzle") {
    return base + "pooh1.png"; // Christopher Robin with umbrella, walking calmly
  }

  // Rain (500–531)
  if (main === "Rain") {
    // Violent / extreme / freezing rain
    if (id === 503 || id === 504 || id === 511 || id === 522 || id === 531) {
      return base + "pooh94.png"; // multiple extreme soaking-wet scenes
    }
    // Heavy rain
    if (id === 502) {
      return base + "pooh6.png"; // Pooh in a puddle, rain splashing
    }
    // Moderate rain
    if (id === 501 || id === 521) {
      return base + "pooh97.png"; // Pooh hunched, trudging through rain
    }
    // Light rain / shower
    return base + "pooh98.png"; // Pooh sitting sadly in gentle rain
  }

  // Snow (600–622) — no snow images, Pooh looking confused at notice board fits
  if (main === "Snow") {
    return base + "pooh45.png";
  }

  // Atmosphere: mist, fog, haze, dust, squall, tornado (701–781)
  if (main === "Atmosphere") {
    if (id === 781) return base + "pooh43.png"; // tornado — Piglet tumbling in wind
    if (id === 771) return base + "pooh80.png"; // squall — Piglet blowing dandelion
    return base + "pooh45.png"; // fog / mist / haze — Pooh confused at board
  }

  // Clear sky (800)
  if (main === "Clear") {
    return base + "pooh4.png"; // Pooh & friends picnicking on a sunny day
  }

  // Clouds (801–804)
  if (main === "Clouds") {
    if (id === 801) return base + "pooh110.png"; // few clouds — Pooh & Piglet walk at sunset
    if (id === 802) return base + "pooh2.png";   // scattered clouds — Pooh with balloon
    if (id === 803) return base + "pooh5.png";   // broken clouds — Pooh eating honey
    return base + "pooh3.png";                   // overcast — Pooh, Piglet & Christopher Robin
  }

  // Fallback
  return base + "pooh3.png";
}

// Function to display the search history list.
function renderSearchHistory() {
  historyContainer.innerHTML = "";
  var heading = document.querySelector("#historyHeading");

  if (searchHistory.length === 0) {
    if (heading) heading.classList.add("hidden");
    return;
  }

  if (heading) heading.classList.remove("hidden");

  // Most recent at the top
  for (var i = searchHistory.length - 1; i >= 0; i--) {
    var row = document.createElement("div");
    row.setAttribute("class", "history-row");

    var btn = document.createElement("button");
    btn.setAttribute("class", "btn waves-effect waves-light history-btn");
    btn.setAttribute("data-search", searchHistory[i]);
    btn.textContent = searchHistory[i];

    var removeBtn = document.createElement("button");
    removeBtn.setAttribute("class", "history-remove");
    removeBtn.setAttribute("data-search", searchHistory[i]);
    removeBtn.setAttribute("aria-label", "Remove " + searchHistory[i]);
    removeBtn.textContent = "✕";

    row.append(btn);
    row.append(removeBtn);
    historyContainer.append(row);
  }

  // Clear all button
  var clearBtn = document.createElement("button");
  clearBtn.setAttribute("class", "btn clear-history-btn");
  clearBtn.textContent = "Clear History";
  historyContainer.append(clearBtn);

  animateHistoryBtns();
}

// Removes a single city from history, animating the row out first.
function removeFromHistory(city) {
  var target = historyContainer.querySelector('[data-search="' + CSS.escape(city) + '"].history-btn');
  if (!target) return;
  var row = target.closest(".history-row");

  gsap.to(row, {
    x: 40, opacity: 0, height: 0, marginBottom: 0,
    duration: 0.3, ease: "power2.in",
    onComplete: function () {
      row.remove();
      var idx = searchHistory.indexOf(city);
      if (idx !== -1) searchHistory.splice(idx, 1);
      localStorage.setItem("searchHistory", JSON.stringify(searchHistory));

      // Hide heading + clear button if now empty
      if (searchHistory.length === 0) {
        var heading = document.querySelector("#historyHeading");
        if (heading) heading.classList.add("hidden");
        var clearBtn = historyContainer.querySelector(".clear-history-btn");
        if (clearBtn) clearBtn.remove();
      }
    }
  });
}

// Animates all rows out then wipes history.
function clearAllHistory() {
  var rows = Array.from(historyContainer.querySelectorAll(".history-row"));
  if (!rows.length) return;

  gsap.timeline({
    onComplete: function () {
      searchHistory = [];
      localStorage.removeItem("searchHistory");
      renderSearchHistory();
    }
  })
  .to(rows, {
    x: 50, opacity: 0, height: 0,
    duration: 0.25, stagger: 0.05, ease: "power2.in"
  });
}

// Function to update history in local storage then updates displayed history.
function appendSearchHistory(search) {
  if (!search) return;

  // Remove duplicate if it already exists so we can re-add at the end
  var idx = searchHistory.indexOf(search);
  if (idx !== -1) {
    searchHistory.splice(idx, 1);
  }

  searchHistory.push(search);

  // Keep only the 10 most recent searches
  if (searchHistory.length > 10) {
    searchHistory.shift();
  }

  localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  renderSearchHistory();
}

// Function to get search history from local storage
function getSearchHistory() {
  var stored = localStorage.getItem("searchHistory");
  if (stored) {
    searchHistory = JSON.parse(stored);
    renderSearchHistory();
  }
}

// Converts wind degrees to a compass direction string.
function getWindDirection(deg) {
  var dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

// Converts meters to miles (for visibility).
function metersToMiles(meters) {
  return (meters / 1609.34).toFixed(1);
}

// Capitalizes the first letter of a string.
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Builds a single stat tile: icon, value, label.
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

  box.append(icon);
  box.append(valEl);
  box.append(lblEl);
  return box;
}

// Function to display the current weather data fetched from OpenWeather api.
function renderCurrent(city, weather) {
  // Pull all available fields from the API response
  var date        = dayjs().format("MMMM D, YYYY");
  var description = capitalize(weather.weather[0].description);
  var tempF       = Math.round(weather.main.temp);
  var feelsLike   = Math.round(weather.main.feels_like);
  var tempMin     = Math.round(weather.main.temp_min);
  var tempMax     = Math.round(weather.main.temp_max);
  var humidity    = weather.main.humidity;
  var pressure    = weather.main.pressure;
  var windSpeed   = weather.wind.speed.toFixed(1);
  var windDir     = getWindDirection(weather.wind.deg);
  var windGust    = weather.wind.gust ? weather.wind.gust.toFixed(1) : null;
  var cloudiness  = weather.clouds ? weather.clouds.all : null;
  var visibility  = weather.visibility ? metersToMiles(weather.visibility) : null;
  var precipChance = (weather.pop !== undefined) ? Math.round(weather.pop * 100) : null;

  // Clear and add section label
  currentContainer.innerHTML = "";
  var label = document.createElement("h2");
  label.setAttribute("class", "section-label");
  label.textContent = "Current Weather";
  currentContainer.append(label);

  // Card (no reveal — show everything at once)
  var card = document.createElement("div");
  card.setAttribute("class", "card current-card");

  // Pooh image
  var cardImgDiv = document.createElement("div");
  cardImgDiv.setAttribute("class", "card-image");
  var img = document.createElement("img");
  img.setAttribute("src", getWeatherImage(weather.weather));
  img.setAttribute("alt", description);
  cardImgDiv.append(img);
  card.append(cardImgDiv);

  // Card body
  var content = document.createElement("div");
  content.setAttribute("class", "card-content current-card-content");

  // City + date header
  var cityEl = document.createElement("h2");
  cityEl.setAttribute("class", "current-city");
  cityEl.textContent = city;
  var dateEl = document.createElement("p");
  dateEl.setAttribute("class", "current-date");
  dateEl.textContent = date;
  content.append(cityEl);
  content.append(dateEl);

  // Weather description
  var descEl = document.createElement("p");
  descEl.setAttribute("class", "current-description");
  descEl.textContent = description;
  content.append(descEl);

  // Temperature + feels like
  var tempRow = document.createElement("div");
  tempRow.setAttribute("class", "current-temp-row");
  var tempEl = document.createElement("span");
  tempEl.setAttribute("class", "current-temp");
  tempEl.textContent = `${tempF}°F`;
  var feelsEl = document.createElement("span");
  feelsEl.setAttribute("class", "current-feels");
  feelsEl.textContent = `Feels like ${feelsLike}°F`;
  var rangeEl = document.createElement("span");
  rangeEl.setAttribute("class", "current-range");
  rangeEl.textContent = `H: ${tempMax}° / L: ${tempMin}°`;
  tempRow.append(tempEl);
  tempRow.append(feelsEl);
  tempRow.append(rangeEl);
  content.append(tempRow);

  // Stats grid
  var grid = document.createElement("div");
  grid.setAttribute("class", "current-stats-grid");

  grid.append(makeStatBox("air",      `${windSpeed} mph ${windDir}`, "Wind"));
  grid.append(makeStatBox("opacity",  `${humidity}%`,                "Humidity"));
  grid.append(makeStatBox("speed",    `${pressure} hPa`,             "Pressure"));

  if (cloudiness !== null) {
    grid.append(makeStatBox("cloud", `${cloudiness}%`, "Cloud Cover"));
  }
  if (visibility !== null) {
    grid.append(makeStatBox("visibility", `${visibility} mi`, "Visibility"));
  }
  if (windGust !== null) {
    grid.append(makeStatBox("storm", `${windGust} mph`, "Gusts"));
  }
  if (precipChance !== null) {
    grid.append(makeStatBox("grain", `${precipChance}%`, "Precip Chance"));
  }

  content.append(grid);
  card.append(content);
  currentContainer.append(card);

  animateCurrentCard();
  applyWeatherEffect(weather.weather);
}

// Function to display a forecast card for a single day.
function renderForecastCard(forecast, city) {
  // Short label for the card face — fits in the narrow card without overflow
  var shortLabel  = dayjs(forecast.dt_txt).format("ddd, MMM D");
  // Full date for the reveal panel
  var fullDate    = dayjs(forecast.dt_txt).format("MM/DD/YYYY");
  var description = capitalize(forecast.weather[0].description);
  var tempF       = Math.round(forecast.main.temp);
  var feelsLike   = Math.round(forecast.main.feels_like);
  var windMph     = forecast.wind.speed.toFixed(1);
  var windDir     = getWindDirection(forecast.wind.deg);
  var humidity    = forecast.main.humidity;
  var precipChance = (forecast.pop !== undefined) ? Math.round(forecast.pop * 100) : null;

  var cardContainer = document.createElement("div");
  var cardImgDiv    = document.createElement("div");
  var cardImg       = document.createElement("img");
  var cardContent   = document.createElement("div");
  var cardTitle     = document.createElement("span");
  var moreIcon      = document.createElement("i");
  var cardReveal    = document.createElement("div");
  var revealTitle   = document.createElement("span");
  var closeIcon     = document.createElement("i");
  var ul            = document.createElement("ul");

  cardContainer.setAttribute("class", "card");

  // Image — uses contain so the full illustration is always visible
  cardImgDiv.setAttribute("class", "card-image waves-effect waves-block waves-light forecast-card-image");
  cardImg.setAttribute("class", "activator");
  cardImg.setAttribute("src", getWeatherImage(forecast.weather));
  cardImg.setAttribute("alt", description);
  cardImgDiv.append(cardImg);
  cardContainer.append(cardImgDiv);

  // Card face: short date label + expand icon
  cardContent.setAttribute("class", "card-content forecast-card-content");
  cardTitle.setAttribute("class", "card-title activator forecast-card-title");
  cardTitle.textContent = shortLabel;
  moreIcon.setAttribute("class", "material-icons");
  moreIcon.textContent = "expand_more";
  cardTitle.append(moreIcon);
  cardContent.append(cardTitle);
  cardContainer.append(cardContent);

  // Reveal panel: full details
  cardReveal.setAttribute("class", "card-reveal");
  revealTitle.setAttribute("class", "card-title grey-text text-darken-4");
  revealTitle.textContent = `${city}`;
  closeIcon.setAttribute("class", "material-icons right");
  closeIcon.textContent = "close";
  revealTitle.append(closeIcon);
  cardReveal.append(revealTitle);

  var rows = [
    fullDate,
    description,
    `Temp: ${tempF}°F`,
    `Feels like: ${feelsLike}°F`,
    `Wind: ${windMph} mph ${windDir}`,
    `Humidity: ${humidity}%`,
  ];
  if (precipChance !== null) {
    rows.push(`Precip: ${precipChance}%`);
  }

  rows.forEach(function (text) {
    var li = document.createElement("li");
    li.textContent = text;
    ul.append(li);
  });

  cardReveal.append(ul);
  cardContainer.append(cardReveal);
  forecastGrid.append(cardContainer);
}

// Function to display 5 day forecast.
function renderForecast(city, forecastList) {
  // Unix timestamps for start of tomorrow and end of 5-day window
  var startOfTomorrow = dayjs().add(1, "day").startOf("day").unix();
  var endOf5Days = dayjs().add(6, "day").startOf("day").unix();

  forecastContainer.innerHTML = "";

  // Section label
  var label = document.createElement("h2");
  label.setAttribute("class", "forecast-label");
  label.textContent = "5-Day Forecast";
  forecastContainer.append(label);

  // Grid wrapper
  forecastGrid = document.createElement("div");
  forecastGrid.setAttribute("class", "forecast-grid");
  forecastContainer.append(forecastGrid);

  // Prefer noon (12:00) entries for each day to get a consistent snapshot
  var noonForecasts = forecastList.filter(function (item) {
    var itemTime = dayjs(item.dt_txt);
    return (
      itemTime.unix() >= startOfTomorrow &&
      itemTime.unix() < endOf5Days &&
      itemTime.hour() === 12
    );
  });

  // Fallback: if noon entries aren't available (timezone edge cases), take first entry per day
  if (noonForecasts.length === 0) {
    var seenDays = {};
    noonForecasts = forecastList.filter(function (item) {
      var itemTime = dayjs(item.dt_txt);
      var dayKey = itemTime.format("MM/DD/YYYY");
      if (
        itemTime.unix() >= startOfTomorrow &&
        itemTime.unix() < endOf5Days &&
        !seenDays[dayKey]
      ) {
        seenDays[dayKey] = true;
        return true;
      }
      return false;
    });
  }

  noonForecasts.forEach(function (forecast) {
    renderForecastCard(forecast, city);
  });

  animateForecastCards();
}

// Function to render both current and forecast sections.
function renderItems(city, data) {
  renderCurrent(city, data.list[0]);
  renderForecast(city, data.list);
  // Let ScrollTrigger recalculate positions now that new content is in the DOM
  ScrollTrigger.refresh();
}

// Function to fetch weather data for given coordinates.
function fetchWeather(location) {
  var lat = location.lat;
  var lon = location.lon;
  var city = location.name;

  var apiURL = `${weatherAPIurl}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${weatherAPIkey}`;

  fetch(apiURL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      renderItems(city, data);
    })
    .catch(function (err) {
      console.error(err);
      errorAlert.classList.remove("hidden");
    });
}

// Fetches coordinates for the searched city, then calls fetchWeather.
function fetchCoords(search) {
  var apiURL = `${weatherAPIurl}/geo/1.0/direct?q=${encodeURIComponent(
    search
  )}&limit=5&appid=${weatherAPIkey}`;

  fetch(apiURL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (!data[0]) {
        errorAlert.classList.remove("hidden");
        animateError();
      } else {
        errorAlert.classList.add("hidden");
        appendSearchHistory(search);
        fetchWeather(data[0]);
      }
    })
    .catch(function (err) {
      console.error(err);
      errorAlert.classList.remove("hidden");
      animateError();
    });
}

// Function to handle search form submit.
function handleSearchFormSubmit(event) {
  event.preventDefault();

  var search = searchInput.value.trim();
  if (!search) {
    errorAlert.classList.remove("hidden");
    animateError();
    return;
  }

  animateSearchClick();
  errorAlert.classList.add("hidden");
  clearWeatherEffects();
  fetchCoords(search);
  searchInput.value = "";
}

// Function to handle clicks inside the history container.
function handleSearchHistoryClick(event) {
  var t = event.target;

  if (t.matches(".history-btn")) {
    gsap.timeline()
      .to(t, { scale: 0.92, duration: 0.1 })
      .to(t, { scale: 1, duration: 0.4, ease: "elastic.out(1.5, 0.4)" });
    clearWeatherEffects();
    fetchCoords(t.getAttribute("data-search"));

  } else if (t.matches(".history-remove")) {
    removeFromHistory(t.getAttribute("data-search"));

  } else if (t.matches(".clear-history-btn")) {
    clearAllHistory();
  }
}

// =====================================================================
//                        GSAP ANIMATIONS
// =====================================================================

gsap.registerPlugin(ScrollTrigger);

// --- Cleanup: kills all weather effects before a new render ---
function clearWeatherEffects() {
  // Kill persistent tweens
  gsap.killTweensOf(".sidebar");
  gsap.killTweensOf(".current-card");
  gsap.set(".sidebar", { clearProps: "x,rotation" });
  gsap.set(".current-card", { clearProps: "boxShadow" });
  // Remove full-screen overlays (lightning, etc.)
  var flash = document.getElementById("lightningFlash");
  if (flash) flash.remove();
}

// --- Page load entrance ---
function animatePageLoad() {
  var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.from("header nav", {
      y: -90, opacity: 0, duration: 0.8, ease: "back.out(1.7)"
    })
    .from(".sidebar", {
      x: -300, opacity: 0, duration: 0.9, ease: "power4.out"
    }, "-=0.45")
    .from(".sidebar-heading", {
      y: 20, opacity: 0, duration: 0.4
    }, "-=0.5")
    .from(".search-form .input-field", {
      y: 18, opacity: 0, duration: 0.4
    }, "-=0.3")
    .from(".btn-search", {
      y: 18, opacity: 0, scale: 0.8, duration: 0.45, ease: "back.out(2.5)"
    }, "-=0.2")
    .from(".main-content", {
      opacity: 0, duration: 0.6
    }, "-=0.4");
}

// --- Search button squish + bounce ---
function animateSearchClick() {
  var btn = document.querySelector(".btn-search");
  gsap.timeline()
    .to(btn, { scaleX: 0.88, scaleY: 0.92, duration: 0.1, ease: "power2.in" })
    .to(btn, { scaleX: 1.06, scaleY: 1.04, duration: 0.15, ease: "power2.out" })
    .to(btn, { scaleX: 1, scaleY: 1, duration: 0.5, ease: "elastic.out(1.4, 0.4)" });
}

// --- Error alert shake ---
function animateError() {
  gsap.fromTo(errorAlert,
    { x: 0 },
    {
      keyframes: { x: [0, -14, 14, -11, 11, -7, 7, -4, 4, 0] },
      duration: 0.65, ease: "none"
    }
  );
}

// --- Current weather card entrance ---
function animateCurrentCard() {
  gsap.killTweensOf("#current .card-image img");

  var card = document.querySelector("#current .current-card");
  if (!card) return;

  // The whole card sequence fires once the card enters the viewport
  var tl = gsap.timeline({
    scrollTrigger: {
      trigger: card,
      start: "top 88%",
      once: true
    }
  });

  tl.from(card, {
      y: 60, opacity: 0, scale: 0.9, duration: 0.75, ease: "back.out(1.6)"
    })
    .from("#current .current-city", {
      x: -40, opacity: 0, duration: 0.45, ease: "power3.out"
    }, "-=0.35")
    .from("#current .current-date, #current .current-description", {
      y: 12, opacity: 0, duration: 0.35, stagger: 0.1
    }, "-=0.25")
    .from("#current .current-temp", {
      scale: 0, opacity: 0, duration: 0.6, ease: "elastic.out(1, 0.45)"
    }, "-=0.15")
    .from("#current .current-feels, #current .current-range", {
      y: 10, opacity: 0, duration: 0.3, stagger: 0.1
    }, "-=0.1")
;

  // Stat boxes each trigger individually as they enter the viewport
  gsap.utils.toArray(".stat-box").forEach(function (box, i) {
    gsap.from(box, {
      scrollTrigger: {
        trigger: box,
        start: "top 92%",
        once: true
      },
      y: 30, opacity: 0, scale: 0.65, rotationX: 25,
      duration: 0.45, delay: i * 0.07, ease: "back.out(2.8)",
      transformOrigin: "top center"
    });
  });

  // Endless gentle float — starts after the card is visible
  tl.call(function () {
    gsap.to("#current .card-image img", {
      y: -12, duration: 3, ease: "sine.inOut", repeat: -1, yoyo: true
    });
  });

  // Temperature count-up synced to when the card becomes visible
  var tempEl = document.querySelector(".current-temp");
  if (tempEl) {
    var finalTemp = parseInt(tempEl.textContent);
    var counter = { val: 0 };
    ScrollTrigger.create({
      trigger: card,
      start: "top 88%",
      once: true,
      onEnter: function () {
        gsap.to(counter, {
          val: finalTemp, duration: 1.2, ease: "power2.out", delay: 0.6,
          onUpdate: function () {
            tempEl.textContent = Math.round(counter.val) + "°F";
          }
        });
      }
    });
  }
}

// --- Forecast cards fly in (each triggers when it enters the viewport) ---
function animateForecastCards() {
  gsap.utils.toArray(".forecast-grid .card").forEach(function (card, i) {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: "top 92%",
        once: true
      },
      y: 80, opacity: 0, scale: 0.8, rotationX: 20,
      duration: 0.6, delay: i * 0.1, ease: "back.out(1.8)",
      transformOrigin: "top center"
    });
  });
}

// --- History rows stagger in from the left ---
function animateHistoryBtns() {
  var rows = historyContainer.querySelectorAll(".history-row");
  if (!rows.length) return;
  gsap.from(rows, {
    x: -50, opacity: 0, scale: 0.85,
    duration: 0.45, stagger: 0.07, ease: "back.out(2)"
  });
}

// =====================================================================
//                     WEATHER PARTICLE EFFECTS
// =====================================================================

// Creates an overlay div absolutely positioned inside the current card
function createCardOverlay() {
  var card = document.querySelector("#current .current-card");
  if (!card) return null;
  card.style.position = "relative";
  var overlay = document.createElement("div");
  overlay.id = "weatherEffect";
  overlay.style.cssText = [
    "position:absolute", "inset:0", "pointer-events:none",
    "overflow:hidden", "border-radius:8px", "z-index:6"
  ].join(";");
  card.prepend(overlay);
  return overlay;
}

// Rain streaks
function createRainEffect(intense) {
  var overlay = createCardOverlay();
  if (!overlay) return;
  var count  = intense ? 45 : 22;
  var alpha  = intense ? 0.55 : 0.35;
  var h      = intense ? 22 : 14;
  var dur    = intense ? 0.45 : 0.75;

  for (var i = 0; i < count; i++) {
    var drop = document.createElement("div");
    drop.style.cssText = [
      "position:absolute",
      "width:1.5px",
      "height:" + h + "px",
      "background:rgba(100,160,255," + alpha + ")",
      "border-radius:2px",
      "top:" + (Math.random() * 110 - 10) + "%",
      "left:" + (Math.random() * 110) + "%"
    ].join(";");
    overlay.append(drop);

    gsap.to(drop, {
      y: "140%", x: "-18%",
      duration: dur + Math.random() * 0.4,
      ease: "none", repeat: -1,
      delay: Math.random() * 1.8
    });
  }
}

// Snowflakes
function createSnowEffect() {
  var overlay = createCardOverlay();
  if (!overlay) return;

  for (var i = 0; i < 22; i++) {
    var flake = document.createElement("div");
    var size  = 5 + Math.random() * 8;
    flake.textContent = "❄";
    flake.style.cssText = [
      "position:absolute",
      "font-size:" + size + "px",
      "color:rgba(200,225,255,0.9)",
      "top:-12%",
      "left:" + (Math.random() * 100) + "%"
    ].join(";");
    overlay.append(flake);

    gsap.to(flake, {
      y: "130%",
      x: "+=" + (Math.random() * 70 - 35),
      rotation: Math.random() * 400 - 200,
      duration: 3.5 + Math.random() * 3,
      ease: "none", repeat: -1,
      delay: Math.random() * 4
    });
  }
}

// Pulsing golden sun glow on the card border
function createSunEffect() {
  gsap.to(".current-card", {
    boxShadow: "0 0 30px rgba(255,200,50,0.65), 0 4px 12px rgba(0,0,0,0.15)",
    duration: 1.6, ease: "sine.inOut", repeat: -1, yoyo: true
  });
  // Also gently rotate the Pooh image back and forth
  gsap.to("#current .card-image img", {
    rotation: 3, duration: 4, ease: "sine.inOut", repeat: -1, yoyo: true
  });
}

// Horizontal wind streaks across the whole page + sidebar sway
function createWindEffect() {
  // Page-level streaks
  var overlay = document.createElement("div");
  overlay.id = "weatherEffect";
  overlay.style.cssText = [
    "position:fixed", "inset:0", "pointer-events:none",
    "overflow:hidden", "z-index:1"
  ].join(";");
  document.body.prepend(overlay);

  for (var i = 0; i < 15; i++) {
    var streak = document.createElement("div");
    var w = 60 + Math.random() * 120;
    streak.style.cssText = [
      "position:absolute",
      "width:" + w + "px", "height:1px",
      "background:linear-gradient(to right,transparent,rgba(160,195,220,0.45),transparent)",
      "top:" + (8 + Math.random() * 84) + "%",
      "left:-20%"
    ].join(";");
    overlay.append(streak);

    gsap.to(streak, {
      x: "120vw",
      duration: 0.55 + Math.random() * 0.7,
      ease: "power1.in", repeat: -1,
      delay: Math.random() * 2.5
    });
  }

  // Sidebar gently sways
  gsap.to(".sidebar", {
    x: 4, rotation: 0.3, duration: 0.6,
    ease: "sine.inOut", repeat: -1, yoyo: true
  });
}

// Rain + full-screen lightning flashes
function createThunderstormEffect() {
  createRainEffect(true);

  var flash = document.createElement("div");
  flash.id = "lightningFlash";
  flash.style.cssText = [
    "position:fixed", "inset:0",
    "background:rgba(200,220,255,0)",
    "pointer-events:none", "z-index:9999"
  ].join(";");
  document.body.append(flash);

  function doFlash() {
    gsap.timeline()
      .to(flash, { background: "rgba(200,220,255,0.5)", duration: 0.04 })
      .to(flash, { background: "rgba(200,220,255,0)",   duration: 0.06 })
      .to(flash, { background: "rgba(200,220,255,0.25)",duration: 0.04 })
      .to(flash, { background: "rgba(200,220,255,0)",   duration: 0.25 });

    // Random interval between 4 and 12 seconds
    setTimeout(doFlash, 4000 + Math.random() * 8000);
  }
  setTimeout(doFlash, 1500 + Math.random() * 2000);
}

// Applies the correct effect based on the weather condition
function applyWeatherEffect(weatherArr) {
  var main = weatherArr[0].main;
  var id   = weatherArr[0].id;

  if (main === "Thunderstorm") {
    createThunderstormEffect();
  } else if (main === "Rain") {
    createRainEffect(id >= 502);
  } else if (main === "Drizzle") {
    createRainEffect(false);
  } else if (main === "Snow") {
    createSnowEffect();
  } else if (main === "Clear") {
    createSunEffect();
  } else if (main === "Atmosphere" && (id === 771 || id === 781)) {
    createWindEffect();
  }
  // Cloudy / mist / fog — no particle effect, the illustration is enough
}

// =====================================================================
//                    CSS HOVER LIFT ON FORECAST CARDS
// =====================================================================

document.addEventListener("mouseover", function (e) {
  var card = e.target.closest(".forecast-grid .card");
  if (card) {
    gsap.to(card, { y: -6, scale: 1.03, duration: 0.25, ease: "power2.out" });
  }
});
document.addEventListener("mouseout", function (e) {
  var card = e.target.closest(".forecast-grid .card");
  if (card) {
    gsap.to(card, { y: 0, scale: 1, duration: 0.3, ease: "power2.inOut" });
  }
});

// =====================================================================
//                         INIT + EVENT WIRING
// =====================================================================

// =====================================================================
//                         EMPTY STATE
// =====================================================================

var emptyStatePool = [
  {
    img: "pooh45.png",
    quote: "Oh, bother.",
    message: "The notice board is empty! Search a city name to see what weather is out there."
  },
  {
    img: "pooh2.png",
    quote: "I wonder where the wind will take me…",
    message: "Floating along and waiting! Search a city to bring the forecast down to earth."
  },
  {
    img: "pooh110.png",
    quote: "Let's go on an expotition!",
    message: "Adventure awaits somewhere out there. Search a city to see what weather you'll find."
  },
  {
    img: "pooh5.png",
    quote: "Think, think, think…",
    message: "Pooh's thinking (and snacking). Search a city name to get the weather going!"
  },
  {
    img: "pooh4.png",
    quote: "It's a perfect day for something.",
    message: "But perfect for what? Search a city to find out what the weather has planned."
  },
  {
    img: "pooh3.png",
    quote: "We're all wondering the same thing.",
    message: "What's the weather like? Search a city name and we'll find out together."
  }
];

function renderEmptyState() {
  var pick = emptyStatePool[Math.floor(Math.random() * emptyStatePool.length)];
  var base = "./assets/images/weather-specific/";

  currentContainer.innerHTML = "";
  forecastContainer.innerHTML = "";

  var wrapper = document.createElement("div");
  wrapper.setAttribute("class", "empty-state");

  var img = document.createElement("img");
  img.setAttribute("src", base + pick.img);
  img.setAttribute("alt", "Pooh illustration");
  img.setAttribute("class", "empty-state-img");

  var quote = document.createElement("p");
  quote.setAttribute("class", "empty-state-quote");
  quote.textContent = "\u201C" + pick.quote + "\u201D";

  var msg = document.createElement("p");
  msg.setAttribute("class", "empty-state-msg");
  msg.textContent = pick.message;

  wrapper.append(img);
  wrapper.append(quote);
  wrapper.append(msg);
  currentContainer.append(wrapper);

  // Entrance animation
  var tl = gsap.timeline();
  tl.from(".empty-state-img", {
      y: -30, opacity: 0, scale: 0.85, duration: 0.8, ease: "back.out(1.6)"
    })
    .from(".empty-state-quote", {
      opacity: 0, y: 10, duration: 0.5, ease: "power2.out"
    }, "-=0.2")
    .from(".empty-state-msg", {
      opacity: 0, y: 10, duration: 0.45, ease: "power2.out"
    }, "-=0.2");

  // Gentle float on the image
  gsap.to(".empty-state-img", {
    y: -10, duration: 3, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 0.9
  });
}

// =====================================================================
//                              INIT
// =====================================================================

// Init: load and display any saved search history
getSearchHistory();

// Show empty state on first load (before any search)
renderEmptyState();

// Event listeners
searchForm.addEventListener("submit", handleSearchFormSubmit);
historyContainer.addEventListener("click", handleSearchHistoryClick);

// Page entrance after everything is ready
document.addEventListener("DOMContentLoaded", animatePageLoad);
