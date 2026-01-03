// matching.js
// Front-end only replacement for your backend algorithm
// Uses Firebase + simple similarity scoring
// Returns same structure as server.js: { combined_best_to_worst: { userId: [ ... ] }}

import { getDatabase, ref, get } from "firebase/database";

/**
 * Tokenize string into lowercase keyword set
 */
function tokenize(str = "") {
  return new Set(
    str
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
  );
}

/**
 * Compute similarity between two texts using Jaccard-like overlap
 */
function bioSimilarity(a = "", b = "") {
  const A = tokenize(a);
  const B = tokenize(b);

  if (A.size === 0 || B.size === 0) return 0;

  let intersection = 0;
  A.forEach((w) => {
    if (B.has(w)) intersection++;
  });

  const union = A.size + B.size - intersection;
  return union === 0 ? 0 : intersection / union; // 0–1
}

/**
 * Name similarity: optional small boost
 */
function nameSimilarity(a = "", b = "") {
  a = a.toLowerCase();
  b = b.toLowerCase();
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.5;
  return 0;
}

/**
 * Score a user vs. current user
 */
function scoreUser(currentUser, otherUser, activeConnections = []) {
  let score = 0;

  // bio similarity = strong signal
  score += bioSimilarity(currentUser.bio, otherUser.bio) * 0.7;

  // name similarity = weak signal
  score += nameSimilarity(currentUser.name, otherUser.name) * 0.2;

  // bonus: already in active connections
  const isActive = activeConnections.some(
    (c) => c.type === "person" && c.id === otherUser.id
  );
  if (isActive) score += 0.1;

  return score;
}

/**
 * Score a group for current user
 */
function scoreGroup(currentUser, group, activeConnections = []) {
  let score = 0;

  // bio similarity
  score += bioSimilarity(currentUser.bio, group.bio) * 0.8;

  // name similarity
  score += nameSimilarity(currentUser.name, group.name) * 0.1;

  // bonus: user already part of this group
  const isActive = activeConnections.some(
    (c) => c.type === "group" && c.id === group.id
  );
  if (isActive) score += 0.1;

  return score;
}

/**
 * Normalize scores 0–1 like server.js
 */
function normalizeScores(arr) {
  if (arr.length === 0) return arr;
  const values = arr.map((x) => x.score);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const denom = max - min || 1;

  return arr.map((x) => ({
    ...x,
    score: (x.score - min) / denom,
  }));
}

/**
 * Main function: returns same structure as /algorithm endpoint
 */
export async function runMatching(currentUser) {
  const db = getDatabase();

  // 1. Load users & groups from Firebase
  const usersSnap = await get(ref(db, "users"));
  const groupsSnap = await get(ref(db, "groups"));

  const users = usersSnap.exists()
    ? Object.values(usersSnap.val())
    : [];

  const groups = groupsSnap.exists()
    ? Object.values(groupsSnap.val())
    : [];

  // 2. Remove yourself from the users list
  const others = users.filter((u) => u.id !== currentUser.id);

  // 3. Load active connections from Firebase
  //    (used only for small bonus)
  const chatsSnap = await get(ref(db, "chats"));
  const activeConnections = chatsSnap.exists()
    ? Object.values(chatsSnap.val()).filter((c) =>
        c.allowedUsers?.includes(currentUser.id)
      )
    : [];

  // 4. Score all users
  const scoredUsers = others.map((u) => ({
    type: "user",
    id: u.id,
    score: scoreUser(currentUser, u, activeConnections),
  }));

  // 5. Score all groups
  const scoredGroups = groups.map((g) => ({
    type: "group",
    id: g.id,
    score: scoreGroup(currentUser, g, activeConnections),
  }));

  // 6. Merge
  let merged = [...scoredUsers, ...scoredGroups];

  // 7. Normalize 0–1 (server.js behaviour)
  merged = normalizeScores(merged);

  // 8. Sort by score descending
  merged.sort((a, b) => b.score - a.score);

  // 9. Return same backend structure
  return {
    combined_best_to_worst: {
      [currentUser.id]: merged,
    },
  };
}
