// Pulls price candidates out of free-text web search excerpts. No dependencies.
const UNIT_ALIASES = {
  'fl oz':'fl oz','fl. oz':'fl oz','floz':'fl oz','oz':'oz','ounce':'oz','ounces':'oz',
  lb:'lb',lbs:'lb',pound:'lb',pounds:'lb',gal:'gal',gallon:'gal',gallons:'gal',qt:'qt',quart:'qt',
  pt:'pt',pint:'pt',ct:'ct',count:'ct',ml:'mL',kg:'kg',dozen:'dozen',doz:'dozen',
  l:'L',liter:'L',litre:'L',liters:'L',litres:'L'
};
const SIZE_RE = /(\d+(?:\.\d+)?)\s?(fl\.?\s?oz|ounces?|oz|lbs?|pounds?|gallons?|gal|quarts?|qt|pints?|pt|ct|count|ml|kg|dozen|doz|liters?|litres?|L)\b/gi;
const PRICE_RE = /\$\s?(\d{1,4})(?:[.\s](\d{2}))?(?!\d)/g;
const STOP = new Set(['the','and','for','with','pack','size','brand','gallon','gal','ounce','pound','count','large','small','each']);

function normUnit(u) {
  const k = u.toLowerCase().replace(/\s+/g, ' ').replace('fl. oz', 'fl oz');
  if (u === 'L') return 'L';
  return UNIT_ALIASES[k] || null;
}
function findSize(text) {
  SIZE_RE.lastIndex = 0;
  let m;
  while ((m = SIZE_RE.exec(text))) {
    const unit = normUnit(m[2]);
    if (unit) return { size: parseFloat(m[1]), unit };
  }
  if (/\bhalf[- ]gallon\b/i.test(text)) return { size: 0.5, unit: 'gal' };
  if (/\bgallon\b/i.test(text)) return { size: 1, unit: 'gal' };
  return null;
}
function findPrices(line) {
  const out = [];
  PRICE_RE.lastIndex = 0;
  let m;
  while ((m = PRICE_RE.exec(line))) {
    const rest = line.slice(m.index + m[0].length);
    if (/^\s?\/\s?(fl|oz|lb|ct)/i.test(rest)) continue; // a per-unit price, not a shelf price
    out.push(parseInt(m[1], 10) + (m[2] ? parseInt(m[2], 10) / 100 : 0));
  }
  return out;
}
function itemTokens(item) {
  return item.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(w => w.length >= 3 && !STOP.has(w));
}
function cleanName(s) {
  return s.replace(/\$\s?\d+(?:[.\s]\d{2})?/g, '').replace(/current price:?|original price:?|\b(add|subscribe)\b/gi, '')
    .replace(/\s+/g, ' ').trim().slice(0, 80);
}
function hostOf(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } }

function extractCandidates(results, item, storeDomains, exclude = []) {
  const tokens = itemTokens(item);
  const want = findSize(item);
  const need = tokens.length <= 2 ? tokens.length : Math.ceil(tokens.length * 0.7);
  const seen = new Set(), out = [];
  for (const r of results) {
    const host = hostOf(r.url), official = storeDomains.some(d => host.endsWith(d));
    const text = (r.excerpts || []).join('\n');
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    lines.forEach((line, i) => {
      const prices = findPrices(line);
      if (!prices.length) return;
      const priceOnly = l => /^[\s$\d.]+$/.test(l || '');
      if (priceOnly(line) && priceOnly(lines[i - 1])) return; // struck-through original price
      const win = lines.slice(Math.max(0, i - 3), i + 4);
      const wl = win.join(' ').toLowerCase();
      const hits = tokens.filter(t => wl.includes(t)).length;
      if (tokens.length && hits < need) return;
      let name = '';
      for (const j of [i, i - 1, i - 2, i - 3, i + 1, i + 2]) {
        const l = lines[j];
        if (l && tokens.some(t => l.toLowerCase().includes(t)) && cleanName(l).length >= 4) { name = cleanName(l); break; }
      }
      if (!name || exclude.some(x => name.toLowerCase().includes(x))) return;
      const sz = findSize(win.join(' '));
      const price = prices[0];
      const key = name.toLowerCase() + '|' + price;
      if (seen.has(key)) return;
      seen.add(key);
      let score = hits + (official ? 2 : 0) + (sz ? 1 : 0);
      if (want && sz && want.unit === sz.unit && want.size === sz.size) score += 3;
      out.push({ product: name, price, size: sz ? sz.size : null, unit: sz ? sz.unit : null,
                 src: r.url, host, official, score });
    });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, 6);
}
module.exports = { extractCandidates, findSize, findPrices };
