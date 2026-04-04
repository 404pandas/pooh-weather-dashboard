// effects.js
// Decorative weather particle effects that play on the current weather card.
// Each condition gets its own visual treatment so the UI reacts to the weather.
// clearWeatherEffects() must be called before every new render so old
// particles don't pile up on top of each other.

// ── Cleanup ───────────────────────────────────────────────────────────────────

function clearWeatherEffects() {
  gsap.killTweensOf(".sidebar");
  gsap.killTweensOf(".current-card");
  gsap.set(".sidebar",      { clearProps: "x,rotation" });
  gsap.set(".current-card", { clearProps: "boxShadow" });

  // Remove overlay elements from previous renders
  var existing = document.getElementById("weatherEffect");
  if (existing) existing.remove();
  var flash = document.getElementById("lightningFlash");
  if (flash) flash.remove();
}

// ── Overlay factory ───────────────────────────────────────────────────────────

// Creates a transparent div that sits over the card image and catches all
// the particle elements. pointer-events:none keeps mouse interactions working.
function createCardOverlay() {
  var card = document.querySelector("#current .current-card");
  if (!card) return null;
  card.style.position = "relative";

  var overlay = document.createElement("div");
  overlay.id = "weatherEffect";
  overlay.style.cssText = "position:absolute;inset:0;pointer-events:none;overflow:hidden;border-radius:8px;z-index:6";
  card.prepend(overlay);
  return overlay;
}

// ── Individual effects ────────────────────────────────────────────────────────

// Animates short diagonal streaks downward to simulate rainfall.
// intense = true for heavy rain (more drops, faster, more opaque).
function createRainEffect(intense) {
  var overlay = createCardOverlay();
  if (!overlay) return;

  var count = intense ? 45 : 22;
  var alpha = intense ? 0.55 : 0.35;
  var h     = intense ? 22 : 14;
  var dur   = intense ? 0.45 : 0.75;

  for (var i = 0; i < count; i++) {
    var drop = document.createElement("div");
    drop.style.cssText = [
      "position:absolute", "width:1.5px", "height:" + h + "px",
      "background:rgba(100,160,255," + alpha + ")", "border-radius:2px",
      "top:" + (Math.random() * 110 - 10) + "%",
      "left:" + (Math.random() * 110) + "%"
    ].join(";");
    overlay.append(drop);

    // Each drop loops forever on a randomized timer so they don't all move together.
    gsap.to(drop, {
      y: "140%", x: "-18%",
      duration: dur + Math.random() * 0.4,
      ease: "none", repeat: -1, delay: Math.random() * 1.8
    });
  }
}

// Drifts snowflake characters downward with a slight side-to-side drift.
function createSnowEffect() {
  var overlay = createCardOverlay();
  if (!overlay) return;

  for (var i = 0; i < 22; i++) {
    var flake = document.createElement("div");
    var size  = 5 + Math.random() * 8;
    flake.textContent = "❄";
    flake.style.cssText = [
      "position:absolute", "font-size:" + size + "px",
      "color:rgba(200,225,255,0.9)", "top:-12%",
      "left:" + (Math.random() * 100) + "%"
    ].join(";");
    overlay.append(flake);

    gsap.to(flake, {
      y: "130%", x: "+=" + (Math.random() * 70 - 35),
      rotation: Math.random() * 400 - 200,
      duration: 3.5 + Math.random() * 3,
      ease: "none", repeat: -1, delay: Math.random() * 4
    });
  }
}

// Pulses a golden glow on the card border and gently rocks the illustration.
function createSunEffect() {
  gsap.to(".current-card", {
    boxShadow: "0 0 30px rgba(255,200,50,0.65), 0 4px 12px rgba(0,0,0,0.15)",
    duration: 1.6, ease: "sine.inOut", repeat: -1, yoyo: true
  });
  gsap.to("#current .card-image img", {
    rotation: 3, duration: 4, ease: "sine.inOut", repeat: -1, yoyo: true
  });
}

// Sweeps horizontal streaks across the full page and makes the sidebar sway.
function createWindEffect() {
  var overlay = document.createElement("div");
  overlay.id = "weatherEffect";
  overlay.style.cssText = "position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:1";
  document.body.prepend(overlay);

  for (var i = 0; i < 15; i++) {
    var streak = document.createElement("div");
    var w = 60 + Math.random() * 120;
    streak.style.cssText = [
      "position:absolute", "width:" + w + "px", "height:1px",
      "background:linear-gradient(to right,transparent,rgba(160,195,220,0.45),transparent)",
      "top:" + (8 + Math.random() * 84) + "%", "left:-20%"
    ].join(";");
    overlay.append(streak);
    gsap.to(streak, {
      x: "120vw", duration: 0.55 + Math.random() * 0.7,
      ease: "power1.in", repeat: -1, delay: Math.random() * 2.5
    });
  }

  gsap.to(".sidebar", {
    x: 4, rotation: 0.3, duration: 0.6, ease: "sine.inOut", repeat: -1, yoyo: true
  });
}

// Combines heavy rain with a randomized full-screen lightning strobe.
// The strobe fires itself again after a random 4–12 second delay.
function createThunderstormEffect() {
  createRainEffect(true);

  var flash = document.createElement("div");
  flash.id = "lightningFlash";
  flash.style.cssText = "position:fixed;inset:0;background:rgba(200,220,255,0);pointer-events:none;z-index:9999";
  document.body.append(flash);

  function doFlash() {
    gsap.timeline()
      .to(flash, { background: "rgba(200,220,255,0.5)",  duration: 0.04 })
      .to(flash, { background: "rgba(200,220,255,0)",    duration: 0.06 })
      .to(flash, { background: "rgba(200,220,255,0.25)", duration: 0.04 })
      .to(flash, { background: "rgba(200,220,255,0)",    duration: 0.25 });
    setTimeout(doFlash, 4000 + Math.random() * 8000);
  }
  setTimeout(doFlash, 1500 + Math.random() * 2000);
}

// ── Effect router ─────────────────────────────────────────────────────────────

// Reads the condition from the API response and applies the matching effect.
// Cloudy and misty conditions have no particle effect — the illustration alone
// is enough to set the mood.
function applyWeatherEffect(weatherArr) {
  var main = weatherArr[0].main;
  var id   = weatherArr[0].id;

  if      (main === "Thunderstorm")                              createThunderstormEffect();
  else if (main === "Rain")                                      createRainEffect(id >= 502);
  else if (main === "Drizzle")                                   createRainEffect(false);
  else if (main === "Snow")                                      createSnowEffect();
  else if (main === "Clear")                                     createSunEffect();
  else if (main === "Atmosphere" && (id === 771 || id === 781)) createWindEffect();
}
