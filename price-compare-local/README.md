# Walmart vs Fiesta Mart price compare (local)

Enter a ZIP and one or more items. The app searches the web for each store's listed price and compares them by price per unit (per oz, fl oz or count).

## Run it
1. Install Node.js 18 or newer (https://nodejs.org). Nothing else to install.
2. In this folder run:  `node server.js`
3. Open http://localhost:3000

Change the port with `PORT=4000 node server.js`.

## How it works
- A browser page can't read Walmart or Fiesta Mart directly (the sites block it), so a small local server does the lookup.
- The server calls the free Parallel Search service (no key needed), then pulls price candidates out of the results.
- Each store card has a dropdown of matches. Pick the right one, or edit the price, size and unit boxes by hand. Unit prices and the cheaper store update automatically.
- Use the "Open on Walmart / Fiesta Mart" links to confirm the price at your store.

## Optional settings (copy `.env.example` to `.env`)
- `ANTHROPIC_API_KEY`: lets Claude read the search results and add a "Claude pick" at the top of each dropdown. Better matching, small API cost per lookup.
- `PARALLEL_API_KEY`: higher Parallel Search limits.

## Limits to know
- Web search can't choose a store by ZIP. Prices often come from delivery listings and can differ from in-store or be out of date.
- Without the Anthropic key, matching uses simple text rules, so check the dropdown choice, especially for sizes.
- The free Parallel tier is rate limited. A long item list may slow down or fail now and then.
- `npm test` runs an offline check of the price parser.
