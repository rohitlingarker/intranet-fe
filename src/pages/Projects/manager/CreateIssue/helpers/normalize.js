export const normalizeId = (v) =>
  v === "" || v === null || v === undefined ? null : Number(v);
