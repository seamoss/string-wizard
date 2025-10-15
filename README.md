# String Wizard

A powerful string comparison library with advanced algorithms for fuzzy matching, name comparison, and text similarity analysis.

## Features

- **Multi-algorithm String Comparison**: Uses a weighted blend of Levenshtein distance, Jaccard similarity, and Longest Common Substring for accurate fuzzy matching
- **Name Comparison**: Specialized function for comparing people's names with smart handling of honorifics, suffixes, and initials
- **Diacritic Stripping**: Remove accents and special characters from strings for normalized comparisons
- **Name Sanitization**: Intelligent normalization of names with support for common honorifics and suffixes
- **Structural Bonuses**: Extra similarity scoring for matching first initials and last names

## Installation

```bash
npm install str-wizard
```

## Usage

This package uses ES6 modules. You can import functions using either named imports or default import.

### Basic String Comparison

```javascript
import { compareStrings } from 'str-wizard';

const score = compareStrings("hello world", "hello there");
console.log(score); // 0.6 (60% similar)

const exactMatch = compareStrings("test", "test");
console.log(exactMatch); // 1.0 (100% identical)
```

### Name Comparison

```javascript
import { compareNames } from 'str-wizard';

// Handles honorifics and suffixes automatically
const score = compareNames(
  "Dr. John A. Smith, Jr.",
  "John Smith"
);
console.log(score); // ~0.85-0.9

// Works with variations
const score2 = compareNames(
  "PETER H WILLINGSWORTH",
  "PETER H.E. WILLINGSWORTH SR."
);
console.log(score2); // ~0.86-0.88
```

### Strip Diacritics

```javascript
import { stripDiacritics } from 'str-wizard';

console.log(stripDiacritics("café")); // "cafe"
console.log(stripDiacritics("áéíóú")); // "aeiou"
console.log(stripDiacritics("Zürich")); // "Zurich"
```

### Sanitize Names

```javascript
import { sanitizeName } from 'str-wizard';

console.log(sanitizeName("Mr. John A. Smith, Jr."));
// "john a smith"

console.log(sanitizeName("Dr. Jane M. Doe, Ph.D."));
// "jane m doe"

// Handles single-letter initials intelligently
console.log(sanitizeName("H E Smith"));
// "he smith"
```

### Structural Bonus

```javascript
import { structuralBonus } from 'str-wizard';

// Returns bonus score for structural similarities
const bonus = structuralBonus("john a smith", "john b smith");
console.log(bonus); // 0.07 (matching last name + first initial)
```

### Import All Functions

```javascript
// Named imports (recommended)
import { compareStrings, compareNames, sanitizeName, stripDiacritics, structuralBonus } from 'str-wizard';

// Or use default import
import stringWizard from 'str-wizard';
const score = stringWizard.compareStrings("hello", "hallo");
```

## API Reference

### `compareStrings(a, b)`

Compares two strings and returns a similarity score between 0 and 1.

**Parameters:**
- `a` (string): First string to compare
- `b` (string): Second string to compare

**Returns:** (number) A similarity score between 0 and 1, where:
- `1` = identical strings
- `0` = completely different strings

**Algorithm:** Uses a weighted blend of:
- Levenshtein distance (50%)
- Jaccard similarity of word tokens (30%)
- Longest common substring (20%)

### `compareNames(a, b)`

Compares two names and returns a similarity score between 0 and 1. Automatically handles name variations, honorifics, and suffixes.

**Parameters:**
- `a` (string): First name to compare
- `b` (string): Second name to compare

**Returns:** (number) A similarity score between 0 and 1

### `sanitizeName(s)`

Sanitizes a name by normalizing and removing common honorifics and suffixes.

**Parameters:**
- `s` (string|any): The input name to sanitize

**Returns:** (string) The sanitized name with:
- Lowercase conversion
- Diacritics stripped
- Punctuation normalized
- Honorifics removed (Mr, Mrs, Ms, Dr, Prof, etc.)
- Suffixes removed (Jr, Sr, PhD, MD, Esq, etc.)
- Single-letter initials collapsed

### `stripDiacritics(s)`

Removes diacritical marks (accents) from a string.

**Parameters:**
- `s` (string): The input string

**Returns:** (string) A new string with all diacritics removed

### `structuralBonus(aSan, bSan)`

Calculates a structural similarity bonus between two sanitized strings.

**Parameters:**
- `aSan` (string): First sanitized string
- `bSan` (string): Second sanitized string

**Returns:** (number) Bonus value between 0 and 0.07:
- `0.05` if last words match
- `0.02` if first letters of first words match
- Sum of applicable bonuses

## Use Cases

- **Fuzzy Search**: Find approximate matches in search results
- **Deduplication**: Identify duplicate entries with slight variations
- **Name Matching**: Match people's names across different databases
- **Data Cleaning**: Normalize and compare messy text data
- **Record Linkage**: Connect related records across systems
- **Autocomplete**: Provide smart suggestions based on partial input

## Algorithm Details

### Levenshtein Distance
Measures the minimum number of single-character edits (insertions, deletions, substitutions) needed to change one string into another.

### Jaccard Similarity
Compares the similarity between word token sets using the formula: `|intersection| / |union|`

### Longest Common Substring
Finds the longest contiguous sequence of characters that appear in both strings.

## Requirements

- Node.js >= 12.0.0

## License

MIT
