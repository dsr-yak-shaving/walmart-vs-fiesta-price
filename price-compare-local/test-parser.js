// Offline sanity test for the price parser (no network needed): npm test
const assert = require('assert');
const { extractCandidates } = require('./parser');
const fiesta = [{ url: 'https://www.shop.fiestamart.com/store/fiesta-mart/products/1-fiesta-whole-milk-1-gal',
  excerpts: ['Fiesta Whole Milk\n\n1 gal\n• $0.02/fl oz\nCurrent price: $3.19 $3.19 Original price: $4.19\nAdd to cart'] }];
const walmart = [{ url: 'https://business.walmart.com/search?q=milk',
  excerpts: ['Great Value Whole Vitamin D Milk, Gallon\nAdd\nSubscribe\n$3.82\ncurrent price $3.82\n3.0 ¢/fl oz\nGreat Value Whole Vitamin D Milk, Gallon\n'] },
  { url: 'https://doordash.com/x', excerpts: ['Fiesta Whole Milk (1 gal)\n44% off\n$ 2 24\n$3.99\n1 gal'] }];
let c = extractCandidates(fiesta, 'whole milk 1 gallon', ['fiestamart.com']);
console.log(c[0]);
assert(c.length && c[0].price === 3.19 && c[0].unit === 'gal' && c[0].size === 1);
c = extractCandidates(walmart, 'whole milk 1 gallon', ['walmart.com'], ['fiesta']);
console.log(c.map(x => `${x.product} $${x.price} ${x.size || '?'} ${x.unit || ''}`));
assert(c.some(x => x.price === 3.82 && x.unit === 'gal') && !c.some(x => /fiesta/i.test(x.product)));
console.log('parser OK');
