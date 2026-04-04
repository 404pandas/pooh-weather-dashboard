// history.js
// Everything related to the search history list: reading from localStorage,
// writing to it, and keeping the sidebar UI in sync.

// ── Storage ───────────────────────────────────────────────────────────────────

// Reads saved history from localStorage on page load.
// JSON.parse turns the stored string back into a JavaScript array.
function getSearchHistory() {
  var stored = localStorage.getItem("searchHistory");
  if (stored) {
    searchHistory = JSON.parse(stored);
    renderSearchHistory();
  }
}

// Adds a city to the end of the array. If it was already in the list,
// it gets removed first so it moves to the top instead of duplicating.
// The array is capped at 10 items — oldest one falls off the front with shift().
function appendSearchHistory(search) {
  if (!search) return;

  var idx = searchHistory.indexOf(search);
  if (idx !== -1) searchHistory.splice(idx, 1);

  searchHistory.push(search);
  if (searchHistory.length > 10) searchHistory.shift();

  localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  renderSearchHistory();
}

// ── Rendering ─────────────────────────────────────────────────────────────────

// Rebuilds the sidebar history list from scratch using the current array.
// We iterate in reverse so the most recently searched city appears at the top.
function renderSearchHistory() {
  historyContainer.innerHTML = "";
  var heading = document.querySelector("#historyHeading");

  if (searchHistory.length === 0) {
    if (heading) heading.classList.add("hidden");
    return;
  }
  if (heading) heading.classList.remove("hidden");

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

    row.append(btn, removeBtn);
    historyContainer.append(row);
  }

  var clearBtn = document.createElement("button");
  clearBtn.setAttribute("class", "btn clear-history-btn");
  clearBtn.textContent = "Clear History";
  historyContainer.append(clearBtn);

  animateHistoryBtns();
}

// ── Mutations ─────────────────────────────────────────────────────────────────

// Slides a single row off to the right, then removes it from the array
// and localStorage once the animation finishes.
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

      // Clean up the heading and clear button if the list is now empty.
      if (searchHistory.length === 0) {
        var heading = document.querySelector("#historyHeading");
        if (heading) heading.classList.add("hidden");
        var clearBtn = historyContainer.querySelector(".clear-history-btn");
        if (clearBtn) clearBtn.remove();
      }
    }
  });
}

// Staggers all rows off-screen, then wipes the array and localStorage.
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
  .to(rows, { x: 50, opacity: 0, height: 0, duration: 0.25, stagger: 0.05, ease: "power2.in" });
}

// ── Event delegation ──────────────────────────────────────────────────────────

// A single click listener on the container handles all three button types
// inside the history list. This is called "event delegation" — instead of
// attaching a listener to every button, we attach one to the parent and
// check which child was clicked using event.target.
function handleSearchHistoryClick(event) {
  var t = event.target;

  if (t.matches(".history-btn")) {
    gsap.timeline()
      .to(t, { scale: 0.92, duration: 0.1 })
      .to(t, { scale: 1,    duration: 0.4, ease: "elastic.out(1.5, 0.4)" });
    clearWeatherEffects();
    fetchCoords(t.getAttribute("data-search"));

  } else if (t.matches(".history-remove")) {
    removeFromHistory(t.getAttribute("data-search"));

  } else if (t.matches(".clear-history-btn")) {
    clearAllHistory();
  }
}
