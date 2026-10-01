// Run with: node test.js
const assert = require("assert");
const { TRANSACTIONS, filterTransactions, getSuggestions } = require("./app.js");

// 6: case insensitive
assert.deepStrictEqual(
  filterTransactions(TRANSACTIONS, "STARBUCKS").map((t) => t.id),
  filterTransactions(TRANSACTIONS, "starbucks").map((t) => t.id)
);
// 8 / 18: >5 matches -> 5 suggestions, full results keep all
assert.ok(filterTransactions(TRANSACTIONS, "starbucks").length > 5);
assert.strictEqual(getSuggestions(TRANSACTIONS, "starbucks").length, 5);
// 9 / 16: no matches
assert.strictEqual(getSuggestions(TRANSACTIONS, "zzzz").length, 0);
assert.strictEqual(filterTransactions(TRANSACTIONS, "zzzz").length, 0);
// 10 / 15: empty query
assert.strictEqual(getSuggestions(TRANSACTIONS, "   ").length, 0);
assert.strictEqual(filterTransactions(TRANSACTIONS, "").length, TRANSACTIONS.length);
// 17: single match
assert.strictEqual(getSuggestions(TRANSACTIONS, "chipotle").length, 1);

console.log("All search tests passed.");
