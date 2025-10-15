import {
  compareStrings,
  stripDiacritics,
  sanitizeName,
  structuralBonus,
  compareNames
} from './index.js';

// Test utilities
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`);
    passed++;
  } else {
    console.error(`✗ ${message}`);
    failed++;
  }
}

function assertClose(actual, expected, tolerance, message) {
  const diff = Math.abs(actual - expected);
  if (diff <= tolerance) {
    console.log(`✓ ${message} (${actual.toFixed(4)} ≈ ${expected.toFixed(4)})`);
    passed++;
  } else {
    console.error(`✗ ${message} - Expected ${expected.toFixed(4)}, got ${actual.toFixed(4)}`);
    failed++;
  }
}

function assertEquals(actual, expected, message) {
  if (actual === expected) {
    console.log(`✓ ${message}`);
    passed++;
  } else {
    console.error(`✗ ${message} - Expected "${expected}", got "${actual}"`);
    failed++;
  }
}

// Test compareStrings
console.log('\n=== Testing compareStrings ===');

assert(
  compareStrings("hello", "hello") === 1,
  'Identical strings return 1.0'
);

assert(
  compareStrings("", "") === 0,
  'Empty strings return 0'
);

assert(
  compareStrings("hello", "") === 0,
  'One empty string returns 0'
);

assert(
  compareStrings(null, "test") === 0,
  'Null value returns 0'
);

const helloWorldScore = compareStrings("hello world", "hello there");
assert(
  helloWorldScore > 0.4 && helloWorldScore < 0.6,
  'Similar strings return reasonable score'
);

assert(
  compareStrings("abc", "xyz") < 0.3,
  'Completely different strings return low score'
);

assert(
  compareStrings("Hello", "hello") === 1,
  'Case insensitive comparison works'
);

assert(
  compareStrings("  hello  ", "hello") === 1,
  'Whitespace trimming works'
);

const typoScore = compareStrings("recieve", "receive");
assert(
  typoScore > 0.4 && typoScore < 0.5,
  'Common typo (one letter swap) has moderate similarity'
);

// Test stripDiacritics
console.log('\n=== Testing stripDiacritics ===');

assertEquals(
  stripDiacritics("café"),
  "cafe",
  'Removes accent from café'
);

assertEquals(
  stripDiacritics("áéíóú"),
  "aeiou",
  'Removes accents from áéíóú'
);

assertEquals(
  stripDiacritics("Zürich"),
  "Zurich",
  'Removes umlaut from Zürich'
);

assertEquals(
  stripDiacritics("hello"),
  "hello",
  'Leaves plain ASCII unchanged'
);

assertEquals(
  stripDiacritics("naïve"),
  "naive",
  'Removes diaeresis from naïve'
);

assertEquals(
  stripDiacritics("São Paulo"),
  "Sao Paulo",
  'Removes tilde from São'
);

assertEquals(
  stripDiacritics("façade"),
  "facade",
  'Removes cedilla from façade'
);

// Test sanitizeName
console.log('\n=== Testing sanitizeName ===');

assertEquals(
  sanitizeName("Mr. John Smith"),
  "john smith",
  'Removes Mr. honorific'
);

assertEquals(
  sanitizeName("Dr. Jane Doe"),
  "jane doe",
  'Removes Dr. honorific'
);

assertEquals(
  sanitizeName("John Smith, Jr."),
  "john smith",
  'Removes Jr. suffix'
);

// Ph.D. with dots becomes "ph d" after punctuation replacement, then gets collapsed
const phdResult = sanitizeName("John Smith, Ph.D.");
assert(
  phdResult === "john smith ph d" || phdResult === "john smith phd",
  'Handles Ph.D. suffix (becomes "ph d" or "phd")'
);

assertEquals(
  sanitizeName("Mr. John A. Smith, Jr."),
  "john a smith",
  'Removes both honorific and suffix'
);

assertEquals(
  sanitizeName("PETER H WILLINGSWORTH"),
  "peter h willingsworth",
  'Lowercase conversion works'
);

assertEquals(
  sanitizeName("H E Smith"),
  "he smith",
  'Collapses single letter initials'
);

assertEquals(
  sanitizeName("José García"),
  "jose garcia",
  'Strips diacritics from names'
);

assertEquals(
  sanitizeName("O'Brien"),
  "o brien",
  'Normalizes apostrophe'
);

assertEquals(
  sanitizeName(null),
  "",
  'Handles null input'
);

assertEquals(
  sanitizeName(""),
  "",
  'Handles empty string'
);

assertEquals(
  sanitizeName("Prof. Smith"),
  "smith",
  'Removes Prof. honorific'
);

assertEquals(
  sanitizeName("John Smith, Esq."),
  "john smith",
  'Removes Esq. suffix'
);

// Test structuralBonus
console.log('\n=== Testing structuralBonus ===');

assertEquals(
  structuralBonus("john smith", "john smith"),
  0.07,
  'Matching first initial and last name returns 0.07'
);

assertEquals(
  structuralBonus("john a smith", "john b smith"),
  0.07,
  'Same first initial and last name returns 0.07'
);

assertEquals(
  structuralBonus("jane doe", "jane a doe"),
  0.07,
  'Different middle but same first and last returns 0.07'
);

assertEquals(
  structuralBonus("alice", "bob"),
  0,
  'Completely different names return 0'
);

assertEquals(
  structuralBonus("john smith", "jane smith"),
  0.07,
  'Same last name + same first initial (j/j) returns 0.07'
);

assertEquals(
  structuralBonus("john doe", "jane smith"),
  0.02,
  'Same first initial but different last name returns 0.02'
);

assertEquals(
  structuralBonus("", "john"),
  0,
  'Empty string returns 0'
);

// Test compareNames
console.log('\n=== Testing compareNames ===');

assert(
  compareNames("John Smith", "John Smith") === 1,
  'Identical names return 1.0'
);

assertClose(
  compareNames("Dr. John A. Smith, Jr.", "John Smith"),
  0.85,
  0.1,
  'Name with honorific/suffix matches simplified version'
);

assertClose(
  compareNames("PETER H WILLINGSWORTH", "PETER H.E. WILLINGSWORTH SR."),
  0.86,
  0.1,
  'Complex name variations match with high score'
);

assert(
  compareNames("José García", "Jose Garcia") > 0.95,
  'Names with diacritics match their plain versions'
);

assert(
  compareNames("John Smith", "Jane Smith") > 0.5 && compareNames("John Smith", "Jane Smith") < 0.8,
  'Different first names, same last name get medium score'
);

assert(
  compareNames("Alice Johnson", "Bob Williams") < 0.3,
  'Completely different names get low score'
);

assertClose(
  compareNames("Ms. Jane Doe", "Jane D."),
  0.65,
  0.1,
  'Name with initial matches full name'
);

assert(
  compareNames("", "") === 0,
  'Empty names return 0'
);

assert(
  compareNames(null, "John") === 0,
  'Null name returns 0'
);

assert(
  compareNames("J Smith", "John Smith") > 0.6,
  'Initial + last name matches full name reasonably well'
);

assertClose(
  compareNames("Robert Johnson", "Bob Johnson"),
  0.62,
  0.1,
  'Different first names (nicknames not recognized) but same last name'
);

// Edge cases
console.log('\n=== Testing Edge Cases ===');

assert(
  compareStrings("a", "a") === 1,
  'Single character exact match'
);

assert(
  compareStrings("a", "b") < 0.5,
  'Single character mismatch'
);

assertEquals(
  sanitizeName("123"),
  "123",
  'Numeric string passes through'
);

assert(
  compareNames("Dr.", "Dr.") === 0,
  'Honorific-only comparison returns 0 (both sanitize to empty)'
);

assert(
  compareStrings("test".repeat(100), "test".repeat(100)) === 1,
  'Long strings exact match'
);

// Summary
console.log('\n=== Test Summary ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('\n✓ All tests passed!');
}
