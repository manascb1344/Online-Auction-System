const { env } = require("../config/env");
const { compile } = require("./compile");

let adapter = null;
let adapterDialect = null;

function getAdapter() {
  if (!adapter) {
    adapter = env.DB_CLIENT === "postgres"
      ? require("./dialects/postgres").create(env)
      : require("./dialects/mysql").create(env);
    adapterDialect = env.DB_CLIENT;
  }
  return adapter;
}

function wrap(execute) {
  const query = async (sql, params = {}) => {
    const { text, values } = compile(sql, params, env.DB_CLIENT);
    return execute(text, values);
  };
  return {
    query,
    many: async (sql, params = {}) => (await query(sql, params)).rows,
    one: async (sql, params = {}) => (await query(sql, params)).rows[0] ?? null,
  };
}

const db = {
  get dialect() {
    return adapterDialect ?? env.DB_CLIENT;
  },
  ...wrap((text, values) => getAdapter().query(text, values)),
  async transaction(fn) {
    return getAdapter().transaction((tx) => fn(wrap((text, values) => tx.query(text, values))));
  },
  async ping() {
    await getAdapter().ping();
  },
  async close() {
    if (adapter) {
      await adapter.close();
      adapter = null;
      adapterDialect = null;
    }
  },
};

module.exports = db;
