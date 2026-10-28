export function walk(value, visitor) {
  if (!value || typeof value !== "object") return;
  visitor(value);
  for (const child of Object.values(value)) walk(child, visitor);
}
export function collectionGrid(records, resolve) {
  const result = [];
  walk(Object.values(records), (value) => {
    if (!Array.isArray(value) && value.id === "collection-list-products-grid") {
      walk(resolve(value), (node) => {
        if (!Array.isArray(node) && node.handle && node.productDetail && node.attributes)
          result.push(node);
      });
    }
  });
  return [...new Map(result.map((item) => [item.handle, item])).values()];
}

export function flight($) {
  let stream = "";
  $("script").each((_, element) => {
    const match = ($(element).html() || "").match(/^self\.__next_f\.push\((\[.*\])\)$/s);
    if (match)
      try {
        const value = JSON.parse(match[1]);
        if (value[0] === 1) stream += value[1];
      } catch {}
  });
  const buffer = Buffer.from(stream);
  const records = {};
  let cursor = 0;
  while (cursor < buffer.length) {
    while (buffer[cursor] === 10) cursor++;
    const colon = buffer.indexOf(58, cursor);
    if (colon < 0) break;
    const id = buffer.subarray(cursor, colon).toString();
    if (!/^[\da-f]+$/.test(id)) break;
    cursor = colon + 1;
    if (buffer[cursor] === 84) {
      const comma = buffer.indexOf(44, cursor);
      const length = parseInt(buffer.subarray(cursor + 1, comma).toString(), 16);
      if (!Number.isFinite(length)) break;
      records[id] = buffer.subarray(comma + 1, comma + 1 + length).toString();
      cursor = comma + 1 + length;
    } else {
      const newline = buffer.indexOf(10, cursor);
      if (newline < 0) break;
      try {
        records[id] = JSON.parse(buffer.subarray(cursor, newline).toString());
      } catch {}
      cursor = newline + 1;
    }
  }
  const resolve = (value, depth = 0) => {
    if (depth > 22) return null;
    if (typeof value === "string" && /^\$[\da-f]+$/.test(value))
      return resolve(records[value.slice(1)], depth + 1);
    if (Array.isArray(value)) return value.map((item) => resolve(item, depth + 1));
    if (value && typeof value === "object")
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, resolve(item, depth + 1)]),
      );
    return value;
  };
  return { records, resolve };
}
