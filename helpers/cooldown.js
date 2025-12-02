const cooldowns = new Map();

export function isOnCooldown(userId, cooldownTime) {
  const now = Date.now();
  if (!cooldowns.has(userId)) {
    cooldowns.set(userId, now);
    return false;
  }

  const last = cooldowns.get(userId);
  if (now - last < cooldownTime) return true;

  cooldowns.set(userId, now);
  return false;
}