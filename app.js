// ---------- Data ----------
const TRANSACTIONS = [
  { id: 1,  date: "2026-09-30", description: "Starbucks Coffee",        category: "Dining",        amount: -6.45 },
  { id: 2,  date: "2026-09-29", description: "Payroll Deposit",         category: "Income",        amount: 3250.00 },
  { id: 3,  date: "2026-09-28", description: "Amazon Marketplace",      category: "Shopping",      amount: -42.99 },
  { id: 4,  date: "2026-09-27", description: "Shell Gas Station",       category: "Transport",     amount: -48.10 },
  { id: 5,  date: "2026-09-26", description: "Netflix Subscription",    category: "Entertainment", amount: -15.49 },
  { id: 6,  date: "2026-09-25", description: "Whole Foods Market",      category: "Groceries",     amount: -87.32 },
  { id: 7,  date: "2026-09-24", description: "Starbucks Coffee",        category: "Dining",        amount: -5.75 },
  { id: 8,  date: "2026-09-23", description: "Uber Trip",               category: "Transport",     amount: -18.20 },
  { id: 9,  date: "2026-09-22", description: "Amazon Prime",            category: "Shopping",      amount: -14.99 },
  { id: 10, date: "2026-09-21", description: "Electric Company",        category: "Utilities",     amount: -96.40 },
  { id: 11, date: "2026-09-20", description: "Starbucks Coffee",        category: "Dining",        amount: -7.10 },
  { id: 12, date: "2026-09-19", description: "Venmo Transfer from Sam", category: "Transfer",      amount: 40.00 },
  { id: 13, date: "2026-09-18", description: "Trader Joe's",            category: "Groceries",     amount: -63.18 },
  { id: 14, date: "2026-09-17", description: "Spotify Premium",         category: "Entertainment", amount: -11.99 },
  { id: 15, date: "2026-09-16", description: "Amazon Marketplace",      category: "Shopping",      amount: -128.45 },
  { id: 16, date: "2026-09-15", description: "Payroll Deposit",         category: "Income",        amount: 3250.00 },
  { id: 17, date: "2026-09-14", description: "Starbucks Coffee",        category: "Dining",        amount: -4.95 },
  { id: 18, date: "2026-09-13", description: "Chipotle Mexican Grill",  category: "Dining",        amount: -13.85 },
  { id: 19, date: "2026-09-12", description: "Rent Payment",            category: "Housing",       amount: -1650.00 },
  { id: 20, date: "2026-09-11", description: "Starbucks Coffee",        category: "Dining",        amount: -6.25 },
  { id: 21, date: "2026-09-10", description: "Water Utility",           category: "Utilities",     amount: -38.70 },
  { id: 22, date: "2026-09-09", description: "Starbucks Coffee",        category: "Dining",        amount: -5.40 },
  { id: 23, date: "2026-09-08", description: "Apple Store",             category: "Shopping",      amount: -229.00 },
  { id: 24, date: "2026-09-07", description: "Gym Membership",          category: "Health",        amount: -45.00 },
  { id: 25, date: "2026-09-06", description: "Interest Payment",        category: "Income",        amount: 3.12 },
];

const MAX_SUGGESTIONS = 5;

// ---------- Pure search logic ----------
// Case-insensitive match against description, category, date and amount (stories 5, 6).
function filterTransactions(transactions, query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return transactions.slice();
  return transactions.filter((t) => {
    const haystack = [
      t.description,
      t.category,
      t.date,
      formatDate(t.date),
      Math.abs(t.amount).toFixed(2),
    ].join(" ").toLowerCase();
    return haystack.includes(q);
  });
}

// Up to 5 suggestions; none when the query is empty (stories 8, 10, 17, 18).
function getSuggestions(transactions, query) {
  if (!(query || "").trim()) return [];
  return filterTransactions(transactions, query).slice(0, MAX_SUGGESTIONS);
}

function formatDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatAmount(n) {
  const s = Math.abs(n).toLocaleString("en-US", { style: "currency", currency: "USD" });
  return n < 0 ? `-${s}` : `+${s}`;
}

// Export for Node tests; skip DOM wiring outside the browser.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { TRANSACTIONS, filterTransactions, getSuggestions, MAX_SUGGESTIONS };
}

// ---------- UI ----------
if (typeof document !== "undefined") {
  const form = document.getElementById("search-form");
  const input = document.getElementById("search-input");
  const suggestionsEl = document.getElementById("suggestions");
  const listEl = document.getElementById("transaction-list");
  const emptyEl = document.getElementById("empty-state");
  const emptyMsg = document.getElementById("empty-message");
  const resultsBar = document.getElementById("results-bar");
  const resultsLabel = document.getElementById("results-label");
  const clearBtn = document.getElementById("clear-button");

  // State
  const state = {
    query: "",          // current text in the search bar (story 3)
    submitted: null,    // last submitted query; null = normal history
    selectedId: null,   // transaction chosen from a suggestion (story 14)
    activeIndex: -1,    // keyboard highlight in suggestion list
  };

  const escapeHtml = (s) =>
    s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function highlight(text, query) {
    const q = query.trim();
    if (!q) return escapeHtml(text);
    const i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i === -1) return escapeHtml(text);
    return escapeHtml(text.slice(0, i)) + "<mark>" + escapeHtml(text.slice(i, i + q.length)) + "</mark>" + escapeHtml(text.slice(i + q.length));
  }

  function transactionRow(t) {
    const cls = t.amount < 0 ? "debit" : "credit";
    const selected = t.id === state.selectedId ? " selected" : "";
    return `<li class="transaction${selected}" data-id="${t.id}">
      <span class="desc">${escapeHtml(t.description)}</span>
      <span class="amount ${cls}">${formatAmount(t.amount)}</span>
      <span class="meta">${formatDate(t.date)} · ${escapeHtml(t.category)}</span>
    </li>`;
  }

  // ----- Suggestions (stories 4, 7-10, 17, 18) -----
  function renderSuggestions() {
    const items = getSuggestions(TRANSACTIONS, state.query);
    if (items.length === 0) {
      hideSuggestions();
      return;
    }
    suggestionsEl.innerHTML = items.map((t, i) => `
      <li class="suggestion${i === state.activeIndex ? " active" : ""}" role="option" data-id="${t.id}">
        <span>
          <div>${highlight(t.description, state.query)}</div>
          <div class="meta">${formatDate(t.date)} · ${highlight(t.category, state.query)}</div>
        </span>
        <span class="amount ${t.amount < 0 ? "debit" : "credit"}">${formatAmount(t.amount)}</span>
      </li>`).join("");
    suggestionsEl.hidden = false;
    input.setAttribute("aria-expanded", "true");
  }

  function hideSuggestions() {
    suggestionsEl.hidden = true;
    suggestionsEl.innerHTML = "";
    state.activeIndex = -1;
    input.setAttribute("aria-expanded", "false");
  }

  // ----- Main list (stories 11-13, 15, 16) -----
  function renderList() {
    let items;
    if (state.selectedId !== null) {
      items = TRANSACTIONS.filter((t) => t.id === state.selectedId);
      resultsBar.hidden = false;
      resultsLabel.textContent = "Showing selected transaction";
    } else if (state.submitted !== null && state.submitted.trim()) {
      items = filterTransactions(TRANSACTIONS, state.submitted);
      resultsBar.hidden = false;
      const n = items.length;
      resultsLabel.textContent = `${n} result${n === 1 ? "" : "s"} for “${state.submitted.trim()}”`;
    } else {
      items = TRANSACTIONS;
      resultsBar.hidden = true;
    }

    listEl.innerHTML = items.map(transactionRow).join("");
    const empty = items.length === 0;
    emptyEl.hidden = !empty;
    if (empty) {
      emptyMsg.textContent = `We couldn't find any transactions matching “${state.submitted.trim()}”. Try a different search term.`;
    }
  }

  function submitSearch() {
    state.submitted = state.query;
    state.selectedId = null;
    hideSuggestions();
    renderList();
  }

  function selectSuggestion(id) {
    const t = TRANSACTIONS.find((x) => x.id === id);
    if (!t) return;
    state.selectedId = id;
    state.query = t.description;
    input.value = t.description;
    hideSuggestions();
    renderList();
  }

  function clearSearch() {
    state.query = "";
    state.submitted = null;
    state.selectedId = null;
    input.value = "";
    hideSuggestions();
    renderList();
    input.focus();
  }

  // ----- Events -----
  input.addEventListener("input", (e) => {
    state.query = e.target.value;   // capture text as typed
    state.activeIndex = -1;
    if (!state.query.trim()) {
      // Empty bar: hide suggestions and restore normal history
      state.submitted = null;
      state.selectedId = null;
      hideSuggestions();
      renderList();
      return;
    }
    renderSuggestions();
  });

  input.addEventListener("focus", () => renderSuggestions());

  input.addEventListener("keydown", (e) => {
    const items = suggestionsEl.querySelectorAll(".suggestion");
    if (e.key === "ArrowDown" && items.length) {
      e.preventDefault();
      state.activeIndex = (state.activeIndex + 1) % items.length;
      renderSuggestions();
    } else if (e.key === "ArrowUp" && items.length) {
      e.preventDefault();
      state.activeIndex = (state.activeIndex - 1 + items.length) % items.length;
      renderSuggestions();
    } else if (e.key === "Enter" && state.activeIndex >= 0 && items[state.activeIndex]) {
      e.preventDefault();
      selectSuggestion(Number(items[state.activeIndex].dataset.id));
    } else if (e.key === "Escape") {
      hideSuggestions();
    }
  });

  // Search icon / Enter submits (story 11)
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    submitSearch();
  });

  // mousedown so the click registers before the input loses focus
  suggestionsEl.addEventListener("mousedown", (e) => {
    const li = e.target.closest(".suggestion");
    if (!li) return;
    e.preventDefault();
    selectSuggestion(Number(li.dataset.id));
  });

  clearBtn.addEventListener("click", clearSearch);

  document.addEventListener("click", (e) => {
    if (!form.contains(e.target)) hideSuggestions();
  });

  renderList();
}
