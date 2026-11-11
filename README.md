# Walmart vs Fiesta Mart price 

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


## Limits to know
- Web search can't choose a store by ZIP. Prices often come from delivery listings and can differ from in-store or be out of date.
