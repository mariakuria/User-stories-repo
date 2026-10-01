# Transaction History Search

A dependency-free view (HTML/CSS/JS) implementing the transaction search user stories.

## Run locally

Option 1 – just open `index.html` in your browser.

Option 2 – serve it:

```bash
cd transaction-search
python3 -m http.server 8000
# or: npx serve .
```

Then visit http://localhost:8000

## Tests

```bash
node test.js
```

## Try it

| Search        | What you'll see                                              |
|---------------|--------------------------------------------------------------|
| `starbucks`   | 5 suggestions; click the search icon to see all 7 results    |
| `STARBUCKS`   | Same as above (case insensitive)                             |
| `chipotle`    | Exactly 1 suggestion                                         |
| `zzz`         | No suggestions; submitting shows the empty state             |
| *(empty)*     | Full transaction history                                     |

Searches match description, category, date and amount. Arrow keys + Enter navigate suggestions; Escape closes them.
