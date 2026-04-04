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

  // Start at end of array so most recent appears at top
  for (var i = searchHistory.length - 1; i >= 0; i--) {
    var btn = document.createElement("button");
    btn.setAttribute("class", "btn waves-effect waves-light history-btn");
    btn.setAttribute("data-search", searchHistory[i]);
    btn.textContent = searchHistory[i];
    historyContainer.append(btn);
  }
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
}

// Function to render both current and forecast sections.
function renderItems(city, data) {
  renderCurrent(city, data.list[0]);
  renderForecast(city, data.list);
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
      } else {
        errorAlert.classList.add("hidden");
        appendSearchHistory(search);
        fetchWeather(data[0]);
      }
    })
    .catch(function (err) {
      console.error(err);
      errorAlert.classList.remove("hidden");
    });
}

// Function to handle search form submit.
function handleSearchFormSubmit(event) {
  event.preventDefault();

  var search = searchInput.value.trim();
  if (!search) {
    errorAlert.classList.remove("hidden");
    return;
  }

  errorAlert.classList.add("hidden");
  fetchCoords(search);
  searchInput.value = "";
}

// Function to handle clicks on search history buttons.
function handleSearchHistoryClick(event) {
  if (!event.target.matches(".history-btn")) return;

  var search = event.target.getAttribute("data-search");
  fetchCoords(search);
}

// Init: load and display any saved search history
getSearchHistory();

// Event listeners
searchForm.addEventListener("submit", handleSearchFormSubmit);
historyContainer.addEventListener("click", handleSearchHistoryClick);
