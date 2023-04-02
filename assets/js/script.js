// Global variables
var searchHistory = [];
var weatherAPIurl = "https://api.openweathermap.org";
var weatherAPIkey = "b917dd3be7f85cdcbd69de2a255eb995";

// DOM element references
var searchForm = document.querySelector("#searchInput");
var searchInput = document.querySelector("#searchForm");
var currentContainer = document.querySelector("#current");
var forecastContainer = document.querySelector("#forecast");
var historyContainer = document.querySelector("#history");
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
  var temp = weather.main.temp;
  var wind = weather.wind.speed;
  var humidity = weather.main.humidity;
  // icon- future development

  // create elements - TODO AFTER STYLING DONE
  //   var card
  //   var cardBody
  //   var heading
  //   var icon
  //   var temp
  //   var wind
  //   var humidity

  // SetAttribute and class card
  //   row > col > card > card-content > card-title span > p > future development = card-action

  // SetAttribute and card body
  // append cardBody

  // textContent card-title
  // set attribute icons
  // append icon

  // text content for temp, wind, humidity
  // append heading, temp, wind, humidity

  // innerHTML to clear w/ empty string
  // append entire card
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
  renderForecast(data.list);
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
        notFound();
      } else {
        // call appendSearchHistory(search)+fetchWeather
        appendSearchHistory(search);
        fetchWeather(data[0]);
      }
      // Else
    })
    .catch(function (err) {
      console.error(err);
    });
}

// Function to handle search form submit
function handleSearchFormSubmit() {
  // Don't continue if there is nothing in the search form
  //   Call fetchCoords(search)
}

// Function to handle search form click
function handleSearchFormClick() {
  // Don't do search if current elements is not a search history button
  // Call fetchCoords(search)
}

// NotFound alert generation
function notFound() {
  // remove .hidden
  // setTimeout
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
searchForm;
searchHistory;
