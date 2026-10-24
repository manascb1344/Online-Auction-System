const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");

process.env.NODE_ENV = "test";

const request = require("supertest");
const { createApp } = require("../src/app");
const db = require("../src/db");

const app = createApp();
const suffix = `${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;

const buyerOne = {
  role: "buyer",
  username: `test_buyer_a_${suffix}`,
  password: "TestPass123!",
  email: `buyer_a_${suffix}@example.com`,
};
const buyerTwo = {
  role: "buyer",
  username: `test_buyer_b_${suffix}`,
  password: "TestPass123!",
  email: `buyer_b_${suffix}@example.com`,
};
const seller = {
  role: "seller",
  username: `test_seller_${suffix}`,
  password: "TestPass123!",
  email: `seller_${suffix}@example.com`,
};

const state = {
  buyerToken: null,
  secondBuyerToken: null,
  sellerToken: null,
  adminToken: null,
  itemId: null,
};

const auth = (token) => ({ Authorization: `Bearer ${token}` });
const future = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

test.before(async () => {
  await db.ping();
});

test.after(async () => {
  await db.close();
});

test("health endpoint reports the active dialect", async () => {
  const response = await request(app).get("/health");
  assert.equal(response.status, 200);
  assert.equal(response.body.status, "ok");
  assert.equal(response.body.dialect, process.env.DB_CLIENT ?? "mysql");

  const login = await request(app)
    .post("/api/auth/login")
    .send({ role: "admin", username: "admin", password: "Admin123!" });
  assert.equal(login.status, 200);
  state.adminToken = login.body.data.token;
});

test("buyers and sellers can register and duplicates are rejected", async () => {
  const first = await request(app).post("/api/auth/register").send(buyerOne);
  assert.equal(first.status, 201);
  assert.equal(first.body.data.user.role, "buyer");
  assert.equal(first.body.data.user.username, buyerOne.username);
  assert.ok(first.body.data.token);
  assert.equal(first.body.data.user.passwordHash, undefined);
  assert.equal(first.body.data.user.accountBalance, 0);
  assert.ok(!Number.isNaN(Date.parse(first.body.data.user.createdAt)));
  state.buyerToken = first.body.data.token;

  const second = await request(app).post("/api/auth/register").send(buyerTwo);
  assert.equal(second.status, 201);
  state.secondBuyerToken = second.body.data.token;

  const createdSeller = await request(app).post("/api/auth/register").send(seller);
  assert.equal(createdSeller.status, 201);
  state.sellerToken = createdSeller.body.data.token;

  const duplicate = await request(app).post("/api/auth/register").send(buyerOne);
  assert.equal(duplicate.status, 409);
  assert.equal(duplicate.body.error.code, "CONFLICT");

  const badPayload = await request(app)
    .post("/api/auth/register")
    .send({ role: "buyer", username: "x", password: "short", email: "not-an-email" });
  assert.equal(badPayload.status, 422);
  assert.equal(badPayload.body.error.code, "VALIDATION_ERROR");
});

test("login rejects wrong credentials and accepts the seeded seller", async () => {
  const wrong = await request(app)
    .post("/api/auth/login")
    .send({ role: "buyer", username: buyerOne.username, password: "nope" });
  assert.equal(wrong.status, 401);
  assert.equal(wrong.body.error.code, "UNAUTHORIZED");

  const unknownUser = await request(app)
    .post("/api/auth/login")
    .send({ role: "buyer", username: "no_such_account", password: "nope" });
  assert.equal(unknownUser.status, 401);
  assert.equal(unknownUser.body.error.message, "Invalid username or password");

  const seeded = await request(app)
    .post("/api/auth/login")
    .send({ role: "seller", username: "seller1", password: "Seller123!" });
  assert.equal(seeded.status, 200);
  assert.equal(seeded.body.data.user.username, "seller1");
});

test("item creation enforces authentication and role", async () => {
  const anonymous = await request(app)
    .post("/api/items")
    .send({ name: "Anonymous item", startingPrice: 10, endTime: future(2) });
  assert.equal(anonymous.status, 401);

  const asBuyer = await request(app)
    .post("/api/items")
    .set(auth(state.buyerToken))
    .send({ name: "Buyer item", startingPrice: 10, endTime: future(2) });
  assert.equal(asBuyer.status, 403);

  const asSeller = await request(app)
    .post("/api/items")
    .set(auth(state.sellerToken))
    .send({
      name: `Test lot ${suffix}`,
      description: "Integration-test lot",
      startingPrice: 25,
      category: "Testing",
      endTime: future(2),
    });
  assert.equal(asSeller.status, 201);
  assert.equal(asSeller.body.data.name, `Test lot ${suffix}`);
  assert.equal(asSeller.body.data.auction.status, "active");
  assert.equal(asSeller.body.data.startingPrice, 25);
  state.itemId = asSeller.body.data.id;
});

test("items can be read and filtered", async () => {
  const detail = await request(app).get(`/api/items/${state.itemId}`);
  assert.equal(detail.status, 200);
  assert.equal(detail.body.data.id, state.itemId);

  const list = await request(app).get("/api/items").query({ status: "active", limit: 50 });
  assert.equal(list.status, 200);
  assert.ok(Array.isArray(list.body.data));
  assert.ok(list.body.data.some((item) => item.id === state.itemId));

  const search = await request(app).get("/api/items").query({ search: suffix });
  assert.equal(search.status, 200);
  assert.equal(search.body.data.length, 1);

  const mine = await request(app).get("/api/items/mine").set(auth(state.sellerToken));
  assert.equal(mine.status, 200);
  assert.ok(mine.body.data.some((item) => item.id === state.itemId));

  const missing = await request(app).get(`/api/items/${crypto.randomUUID()}`);
  assert.equal(missing.status, 404);
});

test("a scheduled auction activates once its start time passes", async () => {
  const start = new Date(Date.now() + 2000);
  const end = new Date(Date.now() + 60 * 60 * 1000);

  const created = await request(app)
    .post("/api/items")
    .set(auth(state.sellerToken))
    .send({
      name: `Scheduled lot ${suffix}`,
      startingPrice: 15,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    });
  assert.equal(created.status, 201);
  assert.equal(created.body.data.auction.status, "scheduled");
  const itemId = created.body.data.id;

  const hidden = await request(app).get("/api/items").query({ status: "active", limit: 50 });
  assert.ok(!hidden.body.data.some((item) => item.id === itemId));

  const early = await request(app)
    .post(`/api/items/${itemId}/bids`)
    .set(auth(state.buyerToken))
    .send({ amount: 15 });
  assert.equal(early.status, 409);

  // The auction lifecycle is time-based; wait past the start boundary before bidding.
  await new Promise((resolve) => setTimeout(resolve, 2300));

  const placed = await request(app)
    .post(`/api/items/${itemId}/bids`)
    .set(auth(state.buyerToken))
    .send({ amount: 15 });
  assert.equal(placed.status, 201);

  const detail = await request(app).get(`/api/items/${itemId}`);
  assert.equal(detail.body.data.auction.status, "active");

  const visible = await request(app).get("/api/items").query({ status: "active", limit: 50 });
  assert.ok(visible.body.data.some((item) => item.id === itemId));
});

test("bidding enforces role, minimum increment and auction state", async () => {
  const asSeller = await request(app)
    .post(`/api/items/${state.itemId}/bids`)
    .set(auth(state.sellerToken))
    .send({ amount: 30 });
  assert.equal(asSeller.status, 403);

  const tooLow = await request(app)
    .post(`/api/items/${state.itemId}/bids`)
    .set(auth(state.buyerToken))
    .send({ amount: 24 });
  assert.equal(tooLow.status, 422);
  assert.equal(tooLow.body.error.details.minimum, 25);

  const firstBid = await request(app)
    .post(`/api/items/${state.itemId}/bids`)
    .set(auth(state.buyerToken))
    .send({ amount: 30 });
  assert.equal(firstBid.status, 201);
  assert.equal(firstBid.body.data.amount, 30);
  assert.equal(firstBid.body.data.status, "winning");

  const secondBid = await request(app)
    .post(`/api/items/${state.itemId}/bids`)
    .set(auth(state.secondBuyerToken))
    .send({ amount: 31 });
  assert.equal(secondBid.status, 201);
  assert.equal(secondBid.body.data.status, "winning");

  const bids = await request(app).get(`/api/items/${state.itemId}/bids`);
  assert.equal(bids.status, 200);
  assert.equal(bids.body.data[0].amount, 31);
  assert.equal(bids.body.data.find((bid) => bid.amount === 30).status, "outbid");

  const closed = await request(app)
    .post("/api/items/00000000-0000-4000-8000-000000000204/bids")
    .set(auth(state.buyerToken))
    .send({ amount: 50 });
  assert.equal(closed.status, 409);

  const myBids = await request(app).get("/api/me/bids").set(auth(state.buyerToken));
  assert.equal(myBids.status, 200);
  assert.ok(myBids.body.data.some((bid) => bid.itemId === state.itemId));

  // Two simultaneous bids at the same amount: the row lock must let exactly one win.
  const concurrent = await Promise.all([
    request(app)
      .post(`/api/items/${state.itemId}/bids`)
      .set(auth(state.buyerToken))
      .send({ amount: 32 }),
    request(app)
      .post(`/api/items/${state.itemId}/bids`)
      .set(auth(state.secondBuyerToken))
      .send({ amount: 32 }),
  ]);
  assert.deepEqual(concurrent.map((response) => response.status).sort(), [201, 422]);

  const afterRace = await request(app).get(`/api/items/${state.itemId}/bids`);
  assert.equal(afterRace.body.data.filter((bid) => bid.amount === 32).length, 1);
});

test("admin endpoints are restricted and return aggregate views", async () => {
  const forbidden = await request(app).get("/api/admin/stats").set(auth(state.buyerToken));
  assert.equal(forbidden.status, 403);

  const stats = await request(app).get("/api/admin/stats").set(auth(state.adminToken));
  assert.equal(stats.status, 200);
  assert.ok(stats.body.data.items >= 6);

  for (const path of ["/api/admin/auctions", "/api/admin/bids", "/api/admin/transactions"]) {
    const response = await request(app).get(path).set(auth(state.adminToken));
    assert.equal(response.status, 200, path);
    assert.ok(Array.isArray(response.body.data), path);
  }

  const buyerTransactions = await request(app)
    .get("/api/me/transactions")
    .set(auth(state.buyerToken));
  assert.equal(buyerTransactions.status, 200);
  assert.ok(Array.isArray(buyerTransactions.body.data));
});

test("unknown routes return the structured 404 envelope", async () => {
  const response = await request(app).get("/api/does-not-exist");
  assert.equal(response.status, 404);
  assert.equal(response.body.error.code, "NOT_FOUND");
});
