const NAME = /^[A-Za-z_][A-Za-z0-9_]*/;

/**
 * Compile a single SQL source written with :named parameters into the
 * placeholder style of the target driver. Strings and comments are copied
 * verbatim so a colon inside them is never treated as a parameter.
 */
function compile(sql, params = {}, dialect) {
  if (dialect !== "mysql" && dialect !== "postgres") {
    throw new Error(`Unsupported dialect: ${dialect}`);
  }

  let text = "";
  let i = 0;
  const values = [];

  const readQuoted = (quote) => {
    text += quote;
    i += 1;
    while (i < sql.length) {
      const char = sql[i];
      if (char === quote) {
        if (sql[i + 1] === quote) {
          text += char + sql[i + 1];
          i += 2;
          continue;
        }
        text += char;
        i += 1;
        return;
      }
      text += char;
      i += 1;
    }
  };

  while (i < sql.length) {
    const char = sql[i];

    if (char === "'" || char === '"' || char === "`") {
      readQuoted(char);
      continue;
    }
    if (char === "-" && sql[i + 1] === "-") {
      const end = sql.indexOf("\n", i);
      const stop = end === -1 ? sql.length : end;
      text += sql.slice(i, stop);
      i = stop;
      continue;
    }
    if (char === "/" && sql[i + 1] === "*") {
      const end = sql.indexOf("*/", i + 2);
      const stop = end === -1 ? sql.length : end + 2;
      text += sql.slice(i, stop);
      i = stop;
      continue;
    }
    if (char === ":" && sql[i + 1] === ":") {
      text += "::";
      i += 2;
      continue;
    }
    if (char === ":" && /[A-Za-z_]/.test(sql[i + 1] || "")) {
      const match = NAME.exec(sql.slice(i + 1));
      const name = match[0];
      if (!Object.prototype.hasOwnProperty.call(params, name)) {
        throw new Error(`Missing SQL parameter :${name}`);
      }
      values.push(params[name]);
      if (dialect === "postgres") {
        text += "$" + values.length;
      } else {
        text += "?";
      }
      i += name.length + 1;
      continue;
    }
    text += char;
    i += 1;
  }

  return { text: text.trim(), values };
}

module.exports = { compile };
