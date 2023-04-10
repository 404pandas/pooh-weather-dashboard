// Global variables
var searchHistory = [];
var weatherAPIurl = "https://api.openweathermap.org";
var weatherAPIkey = "b917dd3be7f85cdcbd69de2a255eb995";

// DOM element references
// https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
var searchForm = document.querySelector("#searchInput");
var searchInput = document.querySelector("#searchForm");
var currentContainer = document.querySelector("#current");
var forecastContainer = document.querySelector("#forecast");
var historyContainer = document.querySelector("#history");
var errorAlert = document.querySelector("#error");
// Opt + Click = add cursor line

// Add timezone plugins to day.js

// Function to display the search history list.
function renderSearchHistory() {
  // Start at end of history array and count down to show the most recent at the top.
  // `data-search` allows access to city name when click handler is invoked
}

// Function to update history in local storage then updates displayed history.
function appendSearchHistory() {
  // If there is no search term return the function

  // Call renderSearchHistory
  renderSearchHistory();
}

// Function to get search history from local storage
function getSearchHistory() {}

// Function to display the current weather data fetched from OpenWeather api.
function renderCurrent(city, weather) {
  // day.js stuff
  var date = dayjs().format("MM/DD/YYYY");
  // Store response data from our fetch request in variables
  var tempF = weather.main.temp;
  var windMph = weather.wind.speed;
  var humidity = weather.main.humidity;
  // icon- future development

  //   Create element variables
  // https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
  var cardContainer = document.createElement(" div");
  var cardImgDiv = document.createElement("div");
  var cardImg = document.createElement("img");
  //   Future development- dynamic src for weather
  var cardContent = document.createElement("div");
  var cardTitle = document.createElement("span");
  var moreIcon = document.createElement("i");
  //   Future development- dynamic link
  var dynamicLink = document.createElement("a");
  var cardReveal = document.createElement("div");
  var cardTitleSecond = document.createElement("span");
  var closeIcon = document.createElement("i");
  var ul = document.createElement("ul");
  var li = document.createElement("li");
  var dateCreate = document.createElement("h2");
  var tempCreate = document.createElement("h2");
  var windCreate = document.createElement("h2");
  var humidityCreate = document.createElement("h2");

  // creates a div and sets class
  cardContainer.setAttribute("class", "card");

  //   Creates a div and sets class
  cardImgDiv.setAttribute(
    "class",
    "card-image waves-effect waves-block waves-light"
  );
  //   Appends cardImgDiv to cardContainer
  cardContainer.append(cardImgDiv);
  //   Creates img and sets class, src, and id
  cardImg.setAttribute("class", "activator");
  cardImg.setAttribute("src", "./assets/images/weather-specific/pooh96.png");
  cardImg.setAttribute("id", "randomImage");
  //   math.random method to randomly generate img src
  document.querySelector(
    "#randomImage"
  ).src = `./assets/images/weather-specific/pooh${Math.floor(
    Math.random() * 7
  )}.png`;

  cardContainer.append(cardImg);

  cardContent.setAttribute("class", "card-content");
  cardContainer.append(cardContainer);

  cardTitle.setAttribute(
    "class",
    "card-title activator grey-text text-darken-4 flexbox flexNoWrap"
  );
  cardTitle.setAttribute("id", "cardTitleId");
  //   https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
  document.getElementById("cardTitleId").textContent = `${city} + ${date}`;

  moreIcon.setAttribute("class", "material-icons right");
  cardTitle.append(moreIcon);
  // Future development- dynamic src for weather

  // Future Development- var dynamicLink = document.createElement('a');  a w/ href dynamicLink onclick RedirectURL();return false;

  //   var cardReveal = document.createElement('div');  div class card-reveal child
  cardReveal.setAttribute("class", "card-reveal");
  cardContainer.append(cardReveal);

  cardTitleSecond.setAttribute("class", "card-title grey-text text-darken-4");
  cardReveal.append(cardTitleSecond);
  closeIcon.setAttribute("class", "material-icons right");
  closeIcon.textContent = "close";
  cardTitleSecond.append(closeIcon);

  cardReveal.append(ul);
  li.appendChild(dateCreate).setAttribute("id", "date");
  li.appendChild(tempCreate).setAttribute("id", "temp");
  li.appendChild(windCreate).setAttribute("id", "wind");
  li.appendChild(humidityCreate).setAttribute("id", "humidity");

  // text content for temp, wind, humidity
  cardTitle.textContent = dayjs(forecast.dt_txt).format("MM/DD/YYYY");
  document.querySelector("#temp").textContent = `Temp: ${tempF}`;
  document.querySelector("#wind").textContent = `Wind: ${windMph}`;
  document.querySelector("#humidity").textContent = `Humidity: ${humidity}`;
  // append heading, temp, wind, humidity

  // innerHTML to clear w/ empty string
  currentContainer.innerHTML = "";
  // append entire card
  currentContainer.append(cardContainer);
}

// Function to display a forecast card given an object from open weather api daily forecast.
function renderForecastCard() {
  // variables for data from api
  // Create elements for a card
  // Add content to elements
}

// Function to display 5 day forecast.
function renderForecast() {
  // Create unix timestamps for start and end of 5 day forecast
  // forloop for dailyForecast.length
  // First filters through all of the data and returns only data that falls between one day after the current data and up to 5 days later.
  // Then filters through the data and returns only data captured at noon for each day.
  // if logic that calls renderForecastCard()
}

// Function to render items
function renderItems(city, data) {
  // call renderCurrent
  renderCurrent(city, data.list[0], data.city.timezone);
  // call renderForecast
  //   renderForecast(data.list);
}

// Function to fetch weather data for given location from the Weather Geolocation
// endpoint; then, calls functions to display current and forecast weather data.
function fetchWeather(location) {
  // Variables for long, lat, and city
  var { lat } = location;
  var { lon } = location;
  var city = location.name;

  // Call global variables using ${}
  // apiURL = rootVar/data/2.5/forecast?lat={lat}&lon={lon}&units=imperial&appid=${APIKEYVARIABLE}
  var apiURL = `${weatherAPIurl}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${weatherAPIkey}`;

  // fetch with .then res, .then data, and catch
  fetch(apiURL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      renderItems(city, data);
    })
    .catch(function (err) {
      console.error(err);
    });
}

// Fetches coord data for given location from the Weather Geolocation endpoint
function fetchCoords() {
  // Call global variables using ${}
  // apiURL = rootVar/geo/1.0/direct?q={SEARCHVARIABLE}&limit=5&appid={APIKEYVARIABLE}
  var apiURL = `${weatherAPIurl}/geo/1.0/direct?q=${search}&limit=5&appid=${weatherAPIkey}`;

  // fetch with .then res, .then data, and catch
  fetch(apiURL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      // Not found
      if (!data[0]) {
        errorAlert.removeClass("hidden");
      } else {
        // call appendSearchHistory(search)+fetchWeather
        // appendSearchHistory(search);
        fetchWeather(data[0]);
      }
      // Else
    })
    .catch(function (err) {
      console.error(err);
    });
}

// Function to handle search form submit
function handleSearchFormSubmit(event) {
  // Don't continue if there is nothing in the search form
  //   if logic with !searchInput return
  if (!searchInput.value) {
    // removeAttribute removes hidden attribute from alert
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/removeAttribute
    errorAlert.removeClass("hidden");
    return;
  }
  //   preventDefault tells agent that if event does not
  // get explicitly handled, default action should not be taken
  event.preventDefault();
  //   Call fetchCoords(search)
  //   Creates variable and fills it with the value from search input
  // Trim removes whitespace from both ends of a string
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim
  // Value returns an array of object's property values
  var search = searchInput.value.trim();
  //   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Object/values
  //   check fetchCoords with weather api
  fetchCoords(search);
  //   Turns value into a string
  searchInput.value = "";
}

// Function to handle search form click
function handleSearchHistoryClick() {
  // Don't do search if current elements is not a search history button
  // Call fetchCoords(search)
}

// Dynamic URL for card link
function createDynamicURL(location) {
  //The variable to be returned
  var URL = "https://openweathermap.org/";

  //The variables containing the respective IDs
  var cityID = location.id;

  //Forming the variable to return
  URL += "city/";
  URL += cityID;

  //   console log to check
  console.log(cityID);

  // Future development- call cityID
  // from .json file
  // Example object:
  // [
  //     {
  //          "id": 833,
  //          "name": "Ḩeşār-e Sefīd",
  //          "state": "",
  //          "country": "IR",
  //          "coord": {
  //              "lon": 47.159401,
  //              "lat": 34.330502
  //          }
  //      },

  //  ]
  return URL;
}

// Function to redirect on click
function RedirectURL() {
  // Sets the window.location to match the dynamic URL
  window.location = createDynamicURL();
}

// Init call
getSearchHistory();

// Event listeners (Form and history)
// Search button
searchForm.addEventListener("submit", handleSearchFormSubmit);
// history button
searchHistory.addEventListener("click", handleSearchHistoryClick);

document.addEventListener("DOMContentLoaded", function () {
  var elems = document.querySelectorAll(".carousel");
  var instances = M.Carousel.init(elems, options);
});
