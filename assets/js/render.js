// render.js
// Functions that build and insert DOM elements to display weather data.
// We create elements in JavaScript rather than writing HTML strings because
// it's easier to read and avoids accidentally rendering untrusted content.

// ── Empty state ───────────────────────────────────────────────────────────────

// These options are picked randomly each time renderEmptyState() runs.
var emptyStatePool = [
  { img: "pooh45.png",  quote: "Oh, bother.",                          message: "The notice board is empty! Search a city to see what's out there." },
  { img: "pooh2.png",   quote: "I wonder where the wind will take me…", message: "Floating along and waiting. Search a city to bring the forecast down to earth." },
  { img: "pooh110.png", quote: "Let's go on an expotition!",            message: "Adventure awaits. Search a city to see what weather you'll find." },
  { img: "pooh5.png",   quote: "Think, think, think…",                  message: "Pooh's thinking (and snacking). Search a city to get things going!" },
  { img: "pooh4.png",   quote: "It's a perfect day for something.",     message: "But perfect for what? Search a city to find out." },
  { img: "pooh3.png",   quote: "We're all wondering the same thing.",   message: "What's the weather like? Search a city and we'll find out together." }
];

// Shown before any search has been made. Picks a random entry from the pool.
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
  quote.textContent = "\u201C" + pick.quote + "\u201D";  // curly quotes

  var msg = document.createElement("p");
  msg.setAttribute("class", "empty-state-msg");
  msg.textContent = pick.message;

  wrapper.append(img, quote, msg);
  currentContainer.append(wrapper);
  animateEmptyState();
}

// ── Current weather ───────────────────────────────────────────────────────────

// Builds the full current-conditions card and replaces whatever was in #current.
function renderCurrent(city, weather) {
  var date         = dayjs().format("MMMM D, YYYY");
  var description  = capitalize(weather.weather[0].description);
  var tempF        = Math.round(weather.main.temp);
  var feelsLike    = Math.round(weather.main.feels_like);
  var tempMin      = Math.round(weather.main.temp_min);
  var tempMax      = Math.round(weather.main.temp_max);
  var humidity     = weather.main.humidity;
  var pressure     = weather.main.pressure;
  var windSpeed    = weather.wind.speed.toFixed(1);
  var windDir      = getWindDirection(weather.wind.deg);
  var windGust     = weather.wind.gust     ? weather.wind.gust.toFixed(1)      : null;
  var cloudiness   = weather.clouds        ? weather.clouds.all                : null;
  var visibility   = weather.visibility    ? metersToMiles(weather.visibility) : null;
  var precipChance = (weather.pop !== undefined) ? Math.round(weather.pop * 100) : null;

  currentContainer.innerHTML = "";

  var label = document.createElement("h2");
  label.setAttribute("class", "section-label");
  label.textContent = "Current Weather";
  currentContainer.append(label);

  var card = document.createElement("div");
  card.setAttribute("class", "card current-card");

  // Illustration
  var cardImgDiv = document.createElement("div");
  cardImgDiv.setAttribute("class", "card-image");
  var img = document.createElement("img");
  img.setAttribute("src", getWeatherImage(weather.weather));
  img.setAttribute("alt", description);
  cardImgDiv.append(img);
  card.append(cardImgDiv);

  // Text content
  var content = document.createElement("div");
  content.setAttribute("class", "card-content current-card-content");

  var cityEl = document.createElement("h2");
  cityEl.setAttribute("class", "current-city");
  cityEl.textContent = city;

  var dateEl = document.createElement("p");
  dateEl.setAttribute("class", "current-date");
  dateEl.textContent = date;

  var descEl = document.createElement("p");
  descEl.setAttribute("class", "current-description");
  descEl.textContent = description;

  // "dt" is a Unix timestamp (seconds since 1970). Multiply by 1000 to get
  // milliseconds, which is what JavaScript's Date (and dayjs) expects.
  var updatedEl = document.createElement("p");
  updatedEl.setAttribute("class", "current-updated");
  updatedEl.textContent = "Updated as of " + dayjs(weather.dt * 1000).format("h:mm A");

  content.append(cityEl, dateEl, descEl, updatedEl);

  // Temperature row
  var tempRow = document.createElement("div");
  tempRow.setAttribute("class", "current-temp-row");

  var tempEl = document.createElement("span");
  tempEl.setAttribute("class", "current-temp");
  tempEl.textContent = toDisplayTemp(tempF) + unitLabel();

  var feelsEl = document.createElement("span");
  feelsEl.setAttribute("class", "current-feels");
  feelsEl.textContent = "Feels like " + toDisplayTemp(feelsLike) + unitLabel();

  var rangeEl = document.createElement("span");
  rangeEl.setAttribute("class", "current-range");
  rangeEl.textContent = "H: " + toDisplayTemp(tempMax) + unitLabel() + " / L: " + toDisplayTemp(tempMin) + unitLabel();

  tempRow.append(tempEl, feelsEl, rangeEl);
  content.append(tempRow);

  // Stats grid — only add tiles for values the API actually returned
  var grid = document.createElement("div");
  grid.setAttribute("class", "current-stats-grid");
  grid.append(makeStatBox("air",        windSpeed + " mph " + windDir, "Wind"));
  grid.append(makeStatBox("opacity",    humidity + "%",                 "Humidity"));
  grid.append(makeStatBox("speed",      pressure + " hPa",             "Pressure"));
  if (cloudiness   !== null) grid.append(makeStatBox("cloud",      cloudiness + "%",   "Cloud Cover"));
  if (visibility   !== null) grid.append(makeStatBox("visibility", visibility + " mi", "Visibility"));
  if (windGust     !== null) grid.append(makeStatBox("storm",      windGust + " mph",  "Gusts"));
  if (precipChance !== null) grid.append(makeStatBox("grain",      precipChance + "%", "Precip Chance"));

  content.append(grid);
  card.append(content);
  currentContainer.append(card);

  animateCurrentCard();
  applyWeatherEffect(weather.weather);
}

// ── Forecast cards ────────────────────────────────────────────────────────────

// Builds one card in the 5-day grid. The card face shows the date and
// weather description. Clicking the image or title slides up a reveal panel
// with the full detail list (Materialize's card-reveal component handles this).
function renderForecastCard(forecast, city) {
  var shortLabel   = dayjs(forecast.dt_txt).format("ddd, MMM D");
  var fullDate     = dayjs(forecast.dt_txt).format("MM/DD/YYYY");
  var description  = capitalize(forecast.weather[0].description);
  var tempF        = Math.round(forecast.main.temp);
  var feelsLike    = Math.round(forecast.main.feels_like);
  var windMph      = forecast.wind.speed.toFixed(1);
  var windDir      = getWindDirection(forecast.wind.deg);
  var humidity     = forecast.main.humidity;
  var precipChance = (forecast.pop !== undefined) ? Math.round(forecast.pop * 100) : null;

  var cardContainer = document.createElement("div");
  cardContainer.setAttribute("class", "card");

  // Image — has the "activator" class so Materialize knows clicking it opens the reveal
  var cardImgDiv = document.createElement("div");
  cardImgDiv.setAttribute("class", "card-image waves-effect waves-block waves-light forecast-card-image");
  var cardImg = document.createElement("img");
  cardImg.setAttribute("class", "activator");
  cardImg.setAttribute("src", getWeatherImage(forecast.weather));
  cardImg.setAttribute("alt", description);
  cardImgDiv.append(cardImg);
  cardContainer.append(cardImgDiv);

  // Card face (visible by default)
  var cardContent = document.createElement("div");
  cardContent.setAttribute("class", "card-content forecast-card-content");

  var cardTitle = document.createElement("span");
  cardTitle.setAttribute("class", "card-title activator forecast-card-title");
  cardTitle.setAttribute("tabindex", "0");         // keyboard reachable
  cardTitle.setAttribute("role", "button");
  cardTitle.setAttribute("aria-label", "View forecast details for " + shortLabel);
  cardTitle.textContent = shortLabel;

  var moreIcon = document.createElement("i");
  moreIcon.setAttribute("class", "material-icons");
  moreIcon.textContent = "expand_more";
  cardTitle.append(moreIcon);

  var descP = document.createElement("p");
  descP.setAttribute("class", "forecast-desc");
  descP.textContent = description;

  cardContent.append(cardTitle, descP);
  cardContainer.append(cardContent);

  // Reveal panel (slides up when the card is activated)
  var cardReveal = document.createElement("div");
  cardReveal.setAttribute("class", "card-reveal");

  var revealTitle = document.createElement("span");
  revealTitle.setAttribute("class", "card-title grey-text text-darken-4");
  revealTitle.textContent = city;

  var closeIcon = document.createElement("i");
  closeIcon.setAttribute("class", "material-icons right");
  closeIcon.textContent = "close";
  revealTitle.append(closeIcon);
  cardReveal.append(revealTitle);

  var rows = [
    fullDate,
    description,
    "Temp: "       + toDisplayTemp(tempF)     + unitLabel(),
    "Feels like: " + toDisplayTemp(feelsLike) + unitLabel(),
    "Wind: "       + windMph + " mph " + windDir,
    "Humidity: "   + humidity + "%"
  ];
  if (precipChance !== null) rows.push("Precip: " + precipChance + "%");

  var ul = document.createElement("ul");
  rows.forEach(function (text) {
    var li = document.createElement("li");
    li.textContent = text;
    ul.append(li);
  });

  cardReveal.append(ul);
  cardContainer.append(cardReveal);
  forecastGrid.append(cardContainer);
}

// ── Forecast grid ─────────────────────────────────────────────────────────────

// Filters the 3-hourly forecast list down to one reading per day,
// preferring the noon entry as the most representative snapshot.
function renderForecast(city, forecastList) {
  var startOfTomorrow = dayjs().add(1, "day").startOf("day").unix();
  var endOf5Days      = dayjs().add(6, "day").startOf("day").unix();

  forecastContainer.innerHTML = "";

  var label = document.createElement("h2");
  label.setAttribute("class", "forecast-label");
  label.textContent = "5-Day Forecast";
  forecastContainer.append(label);

  forecastGrid = document.createElement("div");
  forecastGrid.setAttribute("class", "forecast-grid");
  forecastContainer.append(forecastGrid);

  // Grab the 12:00 entry for each day.
  var noonForecasts = forecastList.filter(function (item) {
    var t = dayjs(item.dt_txt);
    return t.unix() >= startOfTomorrow && t.unix() < endOf5Days && t.hour() === 12;
  });

  // Some timezones won't have a noon entry — fall back to the first entry per day.
  if (noonForecasts.length === 0) {
    var seenDays = {};
    noonForecasts = forecastList.filter(function (item) {
      var t      = dayjs(item.dt_txt);
      var dayKey = t.format("MM/DD/YYYY");
      if (t.unix() >= startOfTomorrow && t.unix() < endOf5Days && !seenDays[dayKey]) {
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

// ── Top-level render ──────────────────────────────────────────────────────────

// Called after a successful API response. Caches the data so we can re-render
// instantly if the user switches temperature units.
// ScrollTrigger.refresh() recalculates all scroll positions after new DOM
// nodes have been added.
function renderItems(city, data) {
  lastCity = city;
  lastData = data;
  renderCurrent(city, data.list[0]);
  renderForecast(city, data.list);
  hideLoader();
  ScrollTrigger.refresh();
}
