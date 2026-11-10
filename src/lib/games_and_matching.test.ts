import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCompatibilityScore } from './matchmaking';
import { checkTicTacToeWinner } from './games';

test('calculateCompatibilityScore returns higher score for overlapping interests', () => {
  const overlap = calculateCompatibilityScore(['Gaming', 'Tech & AI'], ['Gaming', 'Tech & AI', 'Anime & Manga']);
  const disjoint = calculateCompatibilityScore(['Gaming'], ['Creative Writing', 'Philosophy']);
  
  assert.ok(overlap.score > disjoint.score);
  assert.equal(overlap.shared.length, 2);
  assert.equal(disjoint.shared.length, 0);
});

test('calculateCompatibilityScore awards bonus for matching language preference', () => {
  const sameLang = calculateCompatibilityScore(['Gaming'], ['Gaming'], 'es', 'es');
  const diffLang = calculateCompatibilityScore(['Gaming'], ['Gaming'], 'es', 'ja');
  
  assert.equal(sameLang.sameLanguage, true);
  assert.equal(diffLang.sameLanguage, false);
  assert.ok(sameLang.score > diffLang.score);
});
