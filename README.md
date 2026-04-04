<div align="center">

  <!-- Add badges using the following format: -->
  <!-- ![Name](urlToShieldHere)(urlToGithubHere) -->

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Contributors](https://img.shields.io/github/contributors/404pandas/pooh-weather-dashboard.svg?style=plastic&logo=appveyor)](https://github.com/404pandas/pooh-weather-dashboard/graphs/contributors)
[![Forks](https://img.shields.io/github/forks/404pandas/pooh-weather-dashboard.svg?style=plastic&logo=appveyor)](https://github.com/404pandas/pooh-weather-dashboard/network/members)
[![Stargazers](https://img.shields.io/github/stars/404pandas/pooh-weather-dashboard.svg?style=plastic&logo=appveyor)](https://github.com/404pandas/pooh-weather-dashboard/stargazers)
[![Issues](https://img.shields.io/github/issues/404pandas/pooh-weather-dashboard.svg?style=plastic&logo=appveyor)](https://github.com/404pandas/pooh-weather-dashboard/issues)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-black.svg?style=plastic&logo=linkedin&colorB=555)](https://linkedin.com/in/404pandas)
[![Deployment](https://img.shields.io/badge/Deployment-pink.svg?style=plastic&logo=netlify&logo)](https://pooh-weather-dashboard.netlify.app/)

</div>

<!-- PROJECT LOGO -->

<div align="center">
  <a href="https://github.com/404pandas/pooh-weather-dashboard">
    <img src="./assets/images/coded-logo.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">Pooh Weather Dashboard</h3>

  <p align="center">
Weather Dashboard using newly open source Pooh drawings    <br />
    <a href="https://github.com/404pandas/pooh-weather-dashboard"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://pooh-weather-dashboard.netlify.app/">View Demo</a>
    ·
    <a href="https://github.com/404pandas/pooh-weather-dashboard/issues">Report Bug</a>
    ·
    <a href="https://github.com/404pandas/pooh-weather-dashboard/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

<!-- Add screenshots using the following format: -->
<!-- ![Screenshot alt description](directPathOfScreenshots) -->

This project was built with basic Javascript, Html, and CSS.
It uses Materialize for a CSS framework.
It also makes use of packages dayjs and jquery and gsap

### Built With

<!--  Dayjs, gsap, jquery, materialize, javascript, css, html, node.js npm vs code -->

<div align="center">

[![Day.js](https://img.shields.io/badge/Package-Dayjs-ff0000?style=plastic&logo=npm&logoWidth=10)](https://day.js.org/)
[![GSAP](https://img.shields.io/badge/Package-GSAP-ff8000?style=plastic&logo=greensock&logoWidth=10)](https://https://greensock.com/gsap/)
[![jQuery](https://img.shields.io/badge/Framework-jQuery-ffff00?style=plastic&logo=jQuery&logoWidth=10)](hhttps://api.jquery.com/)
[![Materialize](https://img.shields.io/badge/Framework-Materialize-80ff00?style=plastic&logo=#757575&logoWidth=10)](https://materializecss.com/)
[![Javascript](https://img.shields.io/badge/Language-JavaScript-ff0000?style=plastic&logo=JavaScript&logoWidth=10)](https://javascript.info/)
[![CSS](https://img.shields.io/badge/Tool-CSS-ff8000?style=plastic&logo=css3&logoWidth=10)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Node.js](https://img.shields.io/badge/Framework-Node.js-ff0000?style=plastic&logo=Node.js&logoWidth=10)](https://nodejs.org/en/)
[![npm](https://img.shields.io/badge/Tools-npm-ff0000?style=plastic&logo=npm&logoWidth=10)](https://www.npmjs.com/)
[![VS Code](https://img.shields.io/badge/IDE-VSCode-ff0000?style=plastic&logo=VisualStudioCode&logoWidth=10)](https://code.visualstudio.com/docs)

</div>

<!-- GETTING STARTED -->

## Getting Started

Once completely built, this application will function as a deployed app on Netlify

### API Key Setup

This project uses the [OpenWeatherMap API](https://openweathermap.org/api). The key lives in `assets/js/config.js`.

1. Get a free key at https://openweathermap.org/api (sign up → API keys tab → copy your key)
2. Duplicate `assets/js/config.example.js` and name the copy `assets/js/config.js`
3. Replace the placeholder inside `config.js` with your real key

> **Heads up:** Because this is a fully static site (no build step, no server), the API key has to exist in client-side JavaScript and is visible in the browser's network tab. This is fine for a free-tier portfolio project — OpenWeatherMap's free plan is rate-limited, and you can regenerate the key in seconds if needed. For a production app with billing on the line, the correct solution is to proxy API calls through a serverless function (e.g. a Netlify Function) so the key never reaches the browser.

### Installation

1. Clone the repo
   git clone https://github.com/404pandas/pooh-weather-dashboard.git
2. Follow the API Key Setup steps above

<!-- USAGE EXAMPLES -->

## Usage

<img src="assets/videos/walkthrough-bigger.gif" controls width="100%"></img>

<!-- ROADMAP -->

## Roadmap

- [x] Weather-matched Pooh illustrations per condition
- [x] GSAP entrance animations (page load, search button, history rows)
- [x] ScrollTrigger — animations fire when elements scroll into view
- [x] Weather particle effects (rain, snow, sun glow, wind streaks, lightning)
- [x] Current weather card with full stat grid (wind, humidity, pressure, visibility, etc.)
- [x] 5-day forecast with Materialize card reveal
- [x] Weather description on forecast cards
- [x] Temperature unit toggle (°F / °C) — instant re-render, no extra API call
- [x] Last updated timestamp on current weather card
- [x] Search history with per-item remove and clear all
- [x] Use My Location button (browser Geolocation API + reverse geocoding)
- [x] Empty state screen with random Pooh quote
- [x] Pooh-themed loading overlay (bee orbiting a honey pot)
- [x] Descriptive error messages (city not found vs. network error)
- [x] Animated favicon (bee orbiting honey pot in the browser tab)
- [x] Keyboard accessibility (focus rings, Enter/Space on card activators)
- [x] Responsive layout (stacks on tablet and mobile)
- [x] API key protected via gitignored config.js
- [ ] Different themes

See the [open issues](https://github.com/404pandas/pooh-weather-dashboard/issues) for a full list of proposed features (and known issues).

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (git checkout -b feature/AmazingFeature)
3. Commit your Changes (git commit -m 'Add some AmazingFeature')
4. Push to the Branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

<!-- LICENSE -->

## License

This project is licensed under the MIT license.

See LICENSE.txt for more information.

<!-- CONTACT -->

## Contact

Mary Elenius - mary.panda.jackson@gmail.com

Project Link: [https://github.com/404pandas/pooh-weather-dashboard](https://github.com/404pandas/pooh-weather-dashboard)
Deployment Link: [https://pooh-weather-dashboard.netlify.app/](https://pooh-weather-dashboard.netlify.app/)

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

I would like to give a big shoutout to my partner in crime and daughter, Yennefer! Every day she proves she is small yet mighty!
