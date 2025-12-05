// Summary/apiCache.js
const CACHE = {};
const PENDING = {};

export function setCache(key, value, ttl = 30000) {
  const expireAt = Date.now() + ttl;
  CACHE[key] = { value, expireAt };
}

export function getCache(key) {
  const entry = CACHE[key];
  if (!entry) return null;
  if (Date.now() > entry.expireAt) {
    delete CACHE[key];
    return null;
  }
  return entry.value;
}

export function getPending(key) {
  return PENDING[key];
}

export function setPending(key, promise) {
  PENDING[key] = promise;
  // remove pending when settled
  promise.finally(() => delete PENDING[key]);
}
