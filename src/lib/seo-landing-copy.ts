export const bestDealsFaq = [
  {
    q: "How does FlashDealAI choose “best” deals?",
    a: "We combine discount depth, review volume, price stability, and retailer trust into a transparent AI score — not sponsored placement.",
  },
  {
    q: "Are prices guaranteed?",
    a: "No. Retailers change prices and coupons often. We refresh frequently, but always verify in cart before you buy.",
  },
  {
    q: "Why do some deals disappear?",
    a: "Lightning-style offers expire or sell out. Our feed updates as new signals arrive from ingestion and partner feeds.",
  },
];

/** /best-deals hub — conversational FAQ for launch traffic. */
export const bestDealsHubLaunchFaq = [
  {
    q: "Is this page pay-to-play?",
    a: "No. Ranking comes from our scoring model plus occasional editor pins you can see in the product flags — merchants can’t buy a slot here.",
  },
  {
    q: "What if the grid looks small?",
    a: "Strict filters mean an honest shelf. We’d rather show fewer listings than filler. Browse all deals or drop your budget on the under-$ hubs.",
  },
  {
    q: "How fresh are these prices?",
    a: "Cards show a “updated” hint from our last crawl. Always confirm tax, shipping, and coupons on the retailer before you buy.",
  },
];

export const bestDealsTodayLaunchFaq = [
  {
    q: "What counts as “today”?",
    a: "We use each listing’s last-seen timestamp in our system — roughly the past 24 hours — not the retailer’s midnight.",
  },
  {
    q: "Why might the list be short?",
    a: "Quiet ingestion days happen. Use the main best-deals hub or category pages for the full scored catalog.",
  },
  {
    q: "Can I trust the discount badges?",
    a: "We normalize list price when we have it. If a card says “verify price,” we’re still reconciling numbers — check the merchant page.",
  },
];

export const bestDealsUnder50LaunchFaq = [
  {
    q: "Is $50 before or after tax?",
    a: "We filter on the indexed shelf price in USD. Sales tax and shipping show up at checkout.",
  },
  {
    q: "Do Prime / membership prices count?",
    a: "Sometimes — it depends on what the merchant exposes when we index. Re-check the live cart.",
  },
  {
    q: "Looking for gifts under $50?",
    a: "Use this grid as a starting point, then open the detail page for specs and return policies before you gift it.",
  },
];

export const bestDealsElectronicsHubFaq = [
  {
    q: "Refurbished vs new?",
    a: "When the source states condition, it stays in the title or tags. If it doesn’t say refurbished, assume new unless you see otherwise on the retailer.",
  },
  {
    q: "How do you pick “best” in electronics?",
    a: "We weigh discount credibility, review volume, seller trust, and how stable the price has looked — same AI score as the rest of the site.",
  },
  {
    q: "Will this match Prime Day or Black Friday?",
    a: "Event pricing moves hourly. This hub refreshes on a schedule — always confirm the live offer before you check out.",
  },
];

export const top10ElectronicsLaunchFaq = [
  {
    q: "Why only ten?",
    a: "It’s a deliberate shortlist: easier to scan on mobile and better for sharing. Jump to the category hub if you want the full shelf.",
  },
  {
    q: "How often does the order change?",
    a: "Whenever ingestion refreshes prices and scores. The numbered slots aren’t locked for the week.",
  },
  {
    q: "Are these the cheapest electronics on the internet?",
    a: "Not necessarily — they’re the ten we’d stand behind on value and risk today. Compare specs and warranty on the product page.",
  },
];

export const under50Faq = [
  {
    q: "What does “under $50” include?",
    a: "Deals whose current cart price is $50 or less in USD at the time we indexed them — verify the live price at checkout.",
  },
  {
    q: "Do you include tax and shipping?",
    a: "List prices are from merchants; tax and shipping depend on your location and membership (e.g. Prime). Factor those in.",
  },
  {
    q: "Can I filter further?",
    a: "Yes — use Search for natural-language style queries or browse by category and brand from the main navigation.",
  },
];

export const nikeFaq = [
  {
    q: "Are Nike deals authentic?",
    a: "We link to major retailers and brand-direct listings we trust. Always buy from sellers you recognize.",
  },
  {
    q: "Do Nike promo codes stack?",
    a: "Sometimes — it depends on the retailer and campaign. Check the cart and Nike’s terms for the season you’re shopping.",
  },
  {
    q: "How often is this page updated?",
    a: "Our catalog refreshes as ingestion runs; hot drops may move quickly, so timestamps on cards matter.",
  },
];

export const electronicsFaq = [
  {
    q: "How do you handle refurbished or open-box?",
    a: "When the source lists condition, we preserve it in titles/tags. If unclear, assume new unless stated.",
  },
  {
    q: "Are specs verified?",
    a: "We summarize from merchant data and reviews — always confirm model numbers and warranty on the product page.",
  },
  {
    q: "What about compatibility (e.g. region, voltage)?",
    a: "US-focused listings by default; import or gray-market items may differ — read the fine print on the retailer site.",
  },
];
