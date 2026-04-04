// ui.js
// Functions that update the UI in response to loading and error states.
// These sit between globals.js and the render/api files in the load order
// because both render.js and api.js need to call them.

// ── Error box ─────────────────────────────────────────────────────────────────

// Shows the error alert with a specific message, then shakes it.
// Passing a message instead of hardcoding "city not found" means we can
// give users accurate feedback for network errors, empty input, etc.
function showError(message) {
  if (errorMsgEl) errorMsgEl.textContent = message;
  errorAlert.classList.remove("hidden");
  animateError();
}

function hideError() {
  errorAlert.classList.add("hidden");
}

// ── Loader overlay ────────────────────────────────────────────────────────────

// Random messages to show while the API call is in flight.
var loaderMessages = [
  "Pooh is checking the honey pot weather gauge…",
  "Tigger is bouncing over to find out…",
  "Piglet is peeking nervously from behind a tree…",
  "Eeyore is reluctantly looking at the clouds…",
  "Owl is consulting his very important weather charts…",
  "Rabbit is running the weather calculations efficiently…"
];

// Fades the loader in and picks a random Pooh message each time.
function showLoader() {
  if (!loaderEl) return;
  var msgEl = loaderEl.querySelector(".loader-msg");
  if (msgEl) {
    msgEl.textContent = loaderMessages[Math.floor(Math.random() * loaderMessages.length)];
  }
  loaderEl.classList.remove("hidden");
  gsap.fromTo(loaderEl, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" });
}

// Fades the loader out, then hides it after the animation completes.
// Using onComplete ensures .hidden is only added after the fade finishes.
function hideLoader() {
  if (!loaderEl) return;
  gsap.to(loaderEl, {
    opacity: 0, duration: 0.3, ease: "power2.in",
    onComplete: function () { loaderEl.classList.add("hidden"); }
  });
}

// ── Location button ───────────────────────────────────────────────────────────

// Spins the location icon and dims the button while geolocation is running,
// then resets everything once we have a result (success or failure).
function setLocationLoading(isLoading) {
  if (isLoading) {
    locationBtn.disabled = true;
    gsap.to(locationIcon, { rotation: 360, duration: 1.1, ease: "none", repeat: -1 });
    gsap.to(locationBtn,  { opacity: 0.7, scale: 0.96, duration: 0.5, ease: "sine.inOut", repeat: -1, yoyo: true });
  } else {
    locationBtn.disabled = false;
    gsap.killTweensOf(locationIcon);
    gsap.killTweensOf(locationBtn);
    gsap.set(locationIcon, { rotation: 0 });
    gsap.set(locationBtn,  { opacity: 1, scale: 1 });
  }
}
