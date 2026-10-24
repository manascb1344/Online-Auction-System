const test = require("node:test");
const assert = require("node:assert/strict");

const { compile } = require("../src/db/compile");

test("mysql compilation emits positional question marks", () => {
  const result = compile(
    "SELECT id FROM items WHERE id = :id AND name = :name",
    { id: "abc", name: "vase" },
    "mysql",
  );
  assert.equal(result.text, "SELECT id FROM items WHERE id = ? AND name = ?");
  assert.deepEqual(result.values, ["abc", "vase"]);
});

test("postgres compilation numbers repeated parameters and keeps casts", () => {
  const result = compile(
    "SELECT created_at::text FROM items WHERE seller_id = :id OR bidder_id = :id",
    { id: "abc" },
    "postgres",
  );
  assert.equal(
    result.text,
    "SELECT created_at::text FROM items WHERE seller_id = $1 OR bidder_id = $2",
  );
  assert.deepEqual(result.values, ["abc", "abc"]);
});

test("quoted text and comments are never treated as parameters", () => {
  const result = compile(
    "SELECT ':notAParam' AS label -- :alsoIgnored\nFROM items WHERE id = :id /* :ignored */",
    { id: "abc" },
    "mysql",
  );
  assert.equal(
    result.text,
    "SELECT ':notAParam' AS label -- :alsoIgnored\nFROM items WHERE id = ? /* :ignored */",
  );
  assert.deepEqual(result.values, ["abc"]);
});

test("missing parameters fail loudly", () => {
  assert.throws(() => compile("SELECT * FROM items WHERE id = :id", {}, "mysql"), /Missing SQL parameter :id/);
});

test("unknown dialects are rejected", () => {
  assert.throws(() => compile("SELECT 1", {}, "sqlite"), /Unsupported dialect/);
});
