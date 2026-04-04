// globals.js
// Shared state and DOM references used by every other script file.
// Because these are plain var declarations at the top level (not inside a
// function), they become global variables that any later script can read
// and write. Load this file first, right after config.js.

// ── App state ─────────────────────────────────────────────────────────────────

var searchHistory = [];   // array of city strings, kept in sync with localStorage
var forecastGrid;         // holds a reference to the .forecast-grid element after it's built
var weatherAPIurl = "https://api.openweathermap.org";
var weatherAPIkey = WEATHER_API_KEY;  // defined in config.js — never hardcode here

var tempUnit = "F";    // "F" or "C", toggled by the pill buttons in the navbar
var lastCity = null;   // most recently rendered city name
var lastData = null;   // full API response for lastCity — used to re-render on unit change

// ── DOM references ────────────────────────────────────────────────────────────
// Grabbing these once at startup is faster than querying the DOM every time
// a function runs.

var searchForm        = document.querySelector("#searchForm");
var searchInput       = document.querySelector("#searchInput");
var currentContainer  = document.querySelector("#current");
var forecastContainer = document.querySelector("#forecast");
var historyContainer  = document.querySelector("#history");
var errorAlert        = document.querySelector("#error");
var errorMsgEl        = document.querySelector("#errorMsg");
var loaderEl          = document.querySelector("#loader");
var locationBtn       = document.querySelector("#locationBtn");
var locationIcon      = document.querySelector("#locationIcon");
