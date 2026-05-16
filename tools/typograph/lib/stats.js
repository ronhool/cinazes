export function createStats() {
  return {
    replacements: 0,
    invisibleRemoved: 0,
    artifactsRemoved: 0,
    charactersFixed: 0,
  };
}

export function addReplacements(stats, count) {
  if (count > 0) {
    stats.replacements += count;
    stats.charactersFixed += count;
  }
}
