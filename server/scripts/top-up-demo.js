const crypto = require("crypto");
const { faker } = require("@faker-js/faker");

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

function generateLot() {
  return {
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    category: faker.commerce.department(),
    startingPrice: Number(faker.commerce.price({ min: 20, max: 250, dec: 2 })),
    durationDays: faker.number.int({ min: 3, max: 7 }),
  };
}

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
    const lot = generateLot();
    const itemId = crypto.randomUUID();
    const auctionId = crypto.randomUUID();
    const seller = faker.helpers.arrayElement(sellers);
    const bidders = faker.helpers.arrayElements(buyers, Math.min(2, buyers.length));
    const startTime = new Date();
    const endTime = new Date(Date.now() + lot.durationDays * 86400000);

    await db.transaction(async (tx) => {
      await tx.query(items.insert, {
        id: itemId,
        sellerId: seller.id,
        name: lot.name,
        description: lot.description,
        startingPrice: lot.startingPrice,
        category: lot.category,
        imageUrl: null,
      });
      await tx.query(auctions.insert, {
        id: auctionId,
        itemId,
        startTime,
        endTime,
        status: "active",
        reservePrice: lot.startingPrice,
      });

      await tx.query(bids.insert, {
        id: crypto.randomUUID(),
        itemId,
        bidderId: bidders[0].id,
        amount: lot.startingPrice,
      });

      if (bidders[1]) {
        const increment = faker.number.int({ min: 1, max: 12 });
        const secondAmount = Math.round((lot.startingPrice + increment) * 100) / 100;
        await tx.query(bids.markPreviousOutbid, { itemId });
        await tx.query(bids.insert, {
          id: crypto.randomUUID(),
          itemId,
          bidderId: bidders[1].id,
          amount: secondAmount,
        });
      }
    });

    created.push({ name: lot.name, category: lot.category, startingPrice: lot.startingPrice });
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
