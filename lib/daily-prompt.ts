const moments = [
  { topic: "Leaving Butler Library after midnight and calling the walk home my NYC nightlife.", category: "Campus" },
  { topic: "A subway musician providing the soundtrack to my very unglamorous grocery run.", category: "Subway" },
  { topic: "Buying a bagel in NYC and suddenly becoming a person with strong bagel opinions.", category: "Food" },
  { topic: "Planning a cheap weekend in the city and spending my budget on one coffee.", category: "Weekend" },
  { topic: "Discovering that my sense of walking distance has changed forever.", category: "Weekend" },
  { topic: "Treating the dorm elevator ride like a chance encounter in a sitcom.", category: "Campus" },
  { topic: "Taking one nice photo in Riverside Park and posting like I spent the whole day outdoors.", category: "Weekend" },
];
export function dailyChallenge(date = new Date()) { return moments[Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86400000) % moments.length]; }
export function dailyPrompt(date = new Date()) { return dailyChallenge(date).topic; }
