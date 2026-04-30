import data from "./cafes.json";

export function getCafe(slug) {
  return data[slug] ?? null;
}

export function getAllSlugs() {
  return Object.keys(data);
}

export function getAllCafes() {
  return Object.entries(data).map(([slug, cafe]) => ({ slug, ...cafe }));
}
