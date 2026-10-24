const crypto = require("crypto");

const MIN_ACTIVE = Number(process.env.DEMO_MIN_ACTIVE || 4);
const MAX_PER_RUN = Number(process.env.DEMO_MAX_PER_RUN || 4);
const LIVE_URL = process.env.DEMO_DATABASE_URL;

function assertLiveTarget() {
  if (process.env.ALLOW_DEMO_TOPUP !== "true") {
    throw new Error("Refusing to top up: set ALLOW_DEMO_TOPUP=true");
  }
  if (!LIVE_URL) {
    throw new Error("DEMO_DATABASE_URL is required; this job only runs against the hosted demo");
  }

  const { hostname } = new URL(LIVE_URL);
  const privateHost =
    ["localhost", "127.0.0.1", "::1"].includes(hostname) ||
    hostname.endsWith(".local") ||
    hostname.startsWith("10.") ||
    hostname.startsWith("192.168.") ||
    /^172\.(1[6-9]|2[0-9]|3[01])\./.test(hostname);
  if (privateHost) {
    throw new Error(`Refusing to top up a non-public host: ${hostname}`);
  }

  process.env.DATABASE_URL = LIVE_URL;
  process.env.DB_CLIENT = process.env.DB_CLIENT || "postgres";
}

try {
  assertLiveTarget();
} catch (error) {
  console.error("top-up-demo failed:", error.message);
  process.exit(1);
}

const { env } = require("../src/config/env");
const db = require("../src/db");
const items = require("../src/queries/items");
const auctions = require("../src/queries/auctions");
const bids = require("../src/queries/bids");
const auth = require("../src/queries/auth");

const SELLERS = ["seller1", "seller2", "seller3"];
const BUYERS = ["buyer1", "buyer2", "buyer3", "buyer4"];
const CATALOGUE = [
  { name: "Vintage 50mm lens", description: "Clean glass, smooth focus ring, includes caps.", startingPrice: 75, category: "Photography" },
  { name: "Hand-thrown ceramic vase", description: "Stoneware with a matte glaze, signed by the maker.", startingPrice: 40, category: "Home" },
  { name: "Signed limited-edition print", description: "Numbered screen print, framed and ready to hang.", startingPrice: 60, category: "Art" },
  { name: "75% mechanical keyboard kit", description: "Hot-swappable board with tactile switches and keycaps.", startingPrice: 55, category: "Electronics" },
  { name: "Full-grain leather weekend bag", description: "Brass hardware, canvas lining, lightly used.", startingPrice: 90, category: "Fashion" },
  { name: "First-edition novel (1968)", description: "Hardback with the original dust jacket.", startingPrice: 35, category: "Books" },
  { name: "Compact analog synthesiser", description: "Serviced mono synth with MIDI and a carry case.", startingPrice: 150, category: "Music" },
  { name: "Hand-carved wooden chess set", description: "Folding board with weighted pieces.", startingPrice: 45, category: "Games" },
];

async function loadDemoUsers() {
  const sellers = (await Promise.all(
    SELLERS.map((username) => db.one(auth.findSellerByUsername, { username })),
  )).filter(Boolean);
  const buyers = (await Promise.all(
    BUYERS.map((username) => db.one(auth.findBuyerByUsername, { username })),
  )).filter(Boolean);

  if (sellers.length === 0 || buyers.length === 0) {
    throw new Error("Demo accounts are missing; seed the hosted database once with pnpm db:seed:hosted");
  }
  return { sellers, buyers };
}

async function main() {
  if (env.DB_HOST !== new URL(LIVE_URL).hostname) {
    throw new Error("Resolved database host does not match DEMO_DATABASE_URL");
  }

  const before = Number((await db.one(auctions.countActive)).total);
  console.log(`Active auctions before: ${before}`);

  if (before >= MIN_ACTIVE) {
    console.log(`At least ${MIN_ACTIVE} active auctions; nothing to add.`);
    return;
  }

  const { sellers, buyers } = await loadDemoUsers();
  const toCreate = Math.min(MIN_ACTIVE - before, MAX_PER_RUN);
  const created = [];

  for (let index = 0; index < toCreate; index += 1) {
    const template = CATALOGUE[(before + index) % CATALOGUE.length];
    const itemId = crypto.randomUUID();
    const auctionId = crypto.randomUUID();
    const seller = sellers[index % sellers.length];
    const startTime = new Date();
    const endTime = new Date(Date.now() + (3 + index * 2) * 86400000);

    await db.transaction(async (tx) => {
      await tx.query(items.insert, {
        id: itemId,
        sellerId: seller.id,
        name: template.name,
        description: template.description,
        startingPrice: template.startingPrice,
        category: template.category,
        imageUrl: null,
      });
      await tx.query(auctions.insert, {
        id: auctionId,
        itemId,
        startTime,
        endTime,
        status: "active",
        reservePrice: template.startingPrice,
      });

      const firstBuyer = buyers[index % buyers.length];
      await tx.query(bids.insert, {
        id: crypto.randomUUID(),
        itemId,
        bidderId: firstBuyer.id,
        amount: template.startingPrice,
      });

      if (buyers.length > 1) {
        const secondBuyer = buyers[(index + 1) % buyers.length];
        await tx.query(bids.markPreviousOutbid, { itemId });
        await tx.query(bids.insert, {
          id: crypto.randomUUID(),
          itemId,
          bidderId: secondBuyer.id,
          amount: template.startingPrice + 1,
        });
      }
    });

    created.push(template.name);
  }

  const after = Number((await db.one(auctions.countActive)).total);
  console.log(`Top-up complete: ${JSON.stringify({ before, created, after })}`);
}

main()
  .catch((error) => {
    console.error("top-up-demo failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => db.close());
