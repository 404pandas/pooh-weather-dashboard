// animations.js
// All GSAP entrance, transition, and looping animations live here.
// GSAP's ScrollTrigger plugin lets us delay animations until an element
// actually scrolls into the viewport — registered once at the top so
// every function below can use it.

gsap.registerPlugin(ScrollTrigger);

// ── Page load ─────────────────────────────────────────────────────────────────

// Staggers the main page sections in from off-screen when the app first loads.
// Each element starts slightly before the previous one finishes (negative offset).
function animatePageLoad() {
  var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.from("header nav",              { y: -90, opacity: 0, duration: 0.8, ease: "back.out(1.7)" })
    .from(".sidebar",                { x: -300, opacity: 0, duration: 0.9, ease: "power4.out" }, "-=0.45")
    .from(".sidebar-heading",        { y: 20, opacity: 0, duration: 0.4 }, "-=0.5")
    .from(".search-form .input-field", { y: 18, opacity: 0, duration: 0.4 }, "-=0.3")
    .from(".btn-search",             { y: 18, opacity: 0, scale: 0.8, duration: 0.45, ease: "back.out(2.5)" }, "-=0.2")
    .from(".main-content",           { opacity: 0, duration: 0.6 }, "-=0.4");
}

// ── Search feedback ───────────────────────────────────────────────────────────

// Quick squish-and-spring on the search button to confirm the click was heard.
function animateSearchClick() {
  var btn = document.querySelector(".btn-search");
  gsap.timeline()
    .to(btn, { scaleX: 0.88, scaleY: 0.92, duration: 0.1, ease: "power2.in" })
    .to(btn, { scaleX: 1.06, scaleY: 1.04, duration: 0.15, ease: "power2.out" })
    .to(btn, { scaleX: 1,    scaleY: 1,    duration: 0.5,  ease: "elastic.out(1.4, 0.4)" });
}

// Shakes the error box sideways to draw attention without being too alarming.
function animateError() {
  gsap.fromTo(errorAlert,
    { x: 0 },
    { keyframes: { x: [0, -14, 14, -11, 11, -7, 7, -4, 4, 0] }, duration: 0.65, ease: "none" }
  );
}

// ── Current weather card ──────────────────────────────────────────────────────

// Runs when the current weather card scrolls into view for the first time.
// The card slides up, then each piece of content staggers in after it.
// Stat boxes each get their own ScrollTrigger so they pop in individually.
// The temperature also counts up from 0 to add a satisfying reveal.
function animateCurrentCard() {
  gsap.killTweensOf("#current .card-image img");

  var card = document.querySelector("#current .current-card");
  if (!card) return;

  var tl = gsap.timeline({
    scrollTrigger: { trigger: card, start: "top 88%", once: true }
  });

  tl.from(card, { y: 60, opacity: 0, scale: 0.9, duration: 0.75, ease: "back.out(1.6)" })
    .from("#current .current-city",                         { x: -40, opacity: 0, duration: 0.45, ease: "power3.out" }, "-=0.35")
    .from("#current .current-date, #current .current-description", { y: 12, opacity: 0, duration: 0.35, stagger: 0.1 }, "-=0.25")
    .from("#current .current-temp",                         { scale: 0, opacity: 0, duration: 0.6, ease: "elastic.out(1, 0.45)" }, "-=0.15")
    .from("#current .current-feels, #current .current-range", { y: 10, opacity: 0, duration: 0.3, stagger: 0.1 }, "-=0.1");

  // Each stat box pops in as it enters the viewport (staggered by index).
  gsap.utils.toArray(".stat-box").forEach(function (box, i) {
    gsap.from(box, {
      scrollTrigger: { trigger: box, start: "top 92%", once: true },
      y: 30, opacity: 0, scale: 0.65, rotationX: 25,
      duration: 0.45, delay: i * 0.07, ease: "back.out(2.8)",
      transformOrigin: "top center"
    });
  });

  // Count the temperature up from 0 once the card enters the viewport.
  var tempEl = document.querySelector(".current-temp");
  if (tempEl) {
    var finalTemp = parseInt(tempEl.textContent);
    var counter = { val: 0 };
    ScrollTrigger.create({
      trigger: card, start: "top 88%", once: true,
      onEnter: function () {
        gsap.to(counter, {
          val: finalTemp, duration: 1.2, ease: "power2.out", delay: 0.6,
          onUpdate: function () {
            tempEl.textContent = Math.round(counter.val) + unitLabel();
          }
        });
      }
    });
  }

  // After the entrance finishes, the illustration floats up and down forever.
  tl.call(function () {
    gsap.to("#current .card-image img", {
      y: -12, duration: 3, ease: "sine.inOut", repeat: -1, yoyo: true
    });
  });
}

// ── Forecast cards ────────────────────────────────────────────────────────────

// Each card flips up into position as it scrolls into the viewport.
// The small delay between cards (i * 0.1) creates a cascading effect.
function animateForecastCards() {
  gsap.utils.toArray(".forecast-grid .card").forEach(function (card, i) {
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: "top 92%", once: true },
      y: 80, opacity: 0, scale: 0.8, rotationX: 20,
      duration: 0.6, delay: i * 0.1, ease: "back.out(1.8)",
      transformOrigin: "top center"
    });
  });
}

// ── History list ──────────────────────────────────────────────────────────────

// Slides new history rows in from the left each time the list is rebuilt.
function animateHistoryBtns() {
  var rows = historyContainer.querySelectorAll(".history-row");
  if (!rows.length) return;
  gsap.from(rows, {
    x: -50, opacity: 0, scale: 0.85,
    duration: 0.45, stagger: 0.07, ease: "back.out(2)"
  });
}

// ── Empty state ───────────────────────────────────────────────────────────────

// The Pooh illustration drops in, the quote and message fade up after it,
// then the image floats gently on a loop.
function animateEmptyState() {
  gsap.timeline()
    .from(".empty-state-img",   { y: -30, opacity: 0, scale: 0.85, duration: 0.8, ease: "back.out(1.6)" })
    .from(".empty-state-quote", { opacity: 0, y: 10, duration: 0.5, ease: "power2.out" }, "-=0.2")
    .from(".empty-state-msg",   { opacity: 0, y: 10, duration: 0.45, ease: "power2.out" }, "-=0.2");

  gsap.to(".empty-state-img", {
    y: -10, duration: 3, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 0.9
  });
}
