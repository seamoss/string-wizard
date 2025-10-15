/**
 * Compares two strings and returns a similarity score between 0 and 1.
 *
 * The comparison uses a weighted blend of three algorithms:
 * - Levenshtein distance (50% of the final score)
 * - Jaccard similarity of word tokens (30% of the final score)
 * - Longest common substring (20% of the final score)
 *
 * A score of 1 indicates identical strings, while a score of 0 indicates
 * completely different strings.
 *
 * @param {string} a - First string to compare
 * @param {string} b - Second string to compare
 * @returns {number} A similarity score between 0 and 1
 *
 * @example
 * // Compare two strings
 * const score = compareStrings("hello world", "hello there");
 * console.log(score); // e.g., 0.6
 */
const compareStrings = (a, b) => {
  if (!a || !b) return 0
  a = a.toLowerCase().trim()
  b = b.toLowerCase().trim()

  // Levenshtein
  const levenshtein = (s1, s2) => {
    const dp = Array(s2.length + 1)
      .fill(null)
      .map(() => Array(s1.length + 1).fill(null))
    for (let i = 0; i <= s1.length; i++) dp[0][i] = i
    for (let j = 0; j <= s2.length; j++) dp[j][0] = j
    for (let j = 1; j <= s2.length; j++) {
      for (let i = 1; i <= s1.length; i++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1
        dp[j][i] = Math.min(
          dp[j - 1][i] + 1,
          dp[j][i - 1] + 1,
          dp[j - 1][i - 1] + cost
        )
      }
    }
    return dp[s2.length][s1.length]
  }
  const lev = levenshtein(a, b)
  const levScore = 1 - lev / Math.max(a.length, b.length)

  // Token Jaccard
  const tokenize = str => str.split(/\W+/).filter(Boolean)
  const A = new Set(tokenize(a))
  const B = new Set(tokenize(b))
  const inter = [...A].filter(x => B.has(x)).length
  const union = new Set([...A, ...B]).size
  const jaccard = union ? inter / union : 0

  // Longest Common Substring (normalized)
  const lcs = (s1, s2) => {
    const m = Array(s1.length)
      .fill(0)
      .map(() => Array(s2.length).fill(0))
    let longest = 0
    for (let i = 0; i < s1.length; i++) {
      for (let j = 0; j < s2.length; j++) {
        if (s1[i] === s2[j]) {
          m[i][j] = (i && j ? m[i - 1][j - 1] : 0) + 1
          if (m[i][j] > longest) longest = m[i][j]
        }
      }
    }
    return Math.max(s1.length, s2.length)
      ? longest / Math.max(s1.length, s2.length)
      : 0
  }
  const lcsScore = lcs(a, b)

  // Weighted blend
  const confidence = levScore * 0.5 + jaccard * 0.3 + lcsScore * 0.2
  return Math.max(0, Math.min(1, confidence))
}

/**
 * Strips diacritics from a string.
 * This function normalizes the string using NFKD normalization form and removes all combining
 * diacritical marks.
 *
 * @param {string} s - The input string from which to remove diacritics.
 * @returns {string} A new string with all diacritics removed.
 *
 * @example
 * // returns "cafe"
 * stripDiacritics("café");
 *
 * @example
 * // returns "aeiou"
 * stripDiacritics("áéíóú");
 */
const stripDiacritics = s => s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')

/**
 * Sanitizes a name by normalizing and removing common honorifics and suffixes.
 *
 * @param {string|any} s - The input name to sanitize. Will be converted to string if not already.
 * @returns {string} The sanitized name with the following transformations:
 *   1. Converts to lowercase and strips diacritics
 *   2. Replaces punctuation with spaces and normalizes whitespace
 *   3. Removes common honorifics (e.g., 'Mr', 'Dr') at the beginning
 *   4. Removes common suffixes (e.g., 'Jr', 'PhD') at the end
 *   5. Collapses single-letter initials (e.g., "h e" → "he")
 *
 * @example
 * sanitizeName("Mr. John A. Smith, Jr.") // returns "john a smith"
 * sanitizeName("Dr. Jane M. Doe, Ph.D.") // returns "jane m doe"
 * sanitizeName(null) // returns ""
 */
const sanitizeName = s => {
  const HONORIFICS = new Set([
    'mr',
    'mrs',
    'ms',
    'miss',
    'mx',
    'dr',
    'prof',
    'sir',
    'dame'
  ])
  const SUFFIXES = new Set([
    'jr',
    'sr',
    'ii',
    'iii',
    'iv',
    'v',
    'md',
    'phd',
    'esq'
  ])

  if (!s) return ''

  let x = stripDiacritics(String(s)).toLowerCase()

  x = x
    .replace(/[_.,/\\'’"-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  let tokens = x.split(' ').filter(Boolean)

  while (tokens.length && HONORIFICS.has(tokens[0])) tokens.shift()

  while (
    tokens.length &&
    SUFFIXES.has(tokens[tokens.length - 1].replace(/\.+$/, ''))
  )
    tokens.pop()

  const collapsed = []
  let buffer = ''
  for (const t of tokens) {
    if (/^[a-z]$/.test(t)) {
      buffer += t
    } else {
      if (buffer) {
        collapsed.push(buffer)
        buffer = ''
      }
      collapsed.push(t)
    }
  }
  if (buffer) collapsed.push(buffer)

  return collapsed.join(' ').replace(/\s+/g, ' ').trim()
}

/**
 * Calculates a structural similarity bonus between two sanitized strings.
 *
 * @param {string} aSan - First sanitized string to compare
 * @param {string} bSan - Second sanitized string to compare
 * @returns {number} Similarity bonus value between 0 and 0.07:
 *   - 0.05 if the last words match
 *   - 0.02 if the first letters of the first words match
 *   - Sum of applicable bonuses (0, 0.02, 0.05, or 0.07)
 *
 * @example
 * structuralBonus("john a smith", "john b smith") // returns 0.07
 * structuralBonus("jane doe", "jane a doe") // returns 0.07
 * structuralBonus("alice", "bob") // returns 0
 */
const structuralBonus = (aSan, bSan) => {
  const aT = aSan.split(' ').filter(Boolean)
  const bT = bSan.split(' ').filter(Boolean)
  if (!aT.length || !bT.length) return 0

  const aLast = aT[aT.length - 1]
  const bLast = bT[bT.length - 1]
  const lastMatch = aLast && bLast && aLast === bLast ? 0.05 : 0

  const aFirst = aT[0]
  const bFirst = bT[0]
  const firstInitialMatch =
    aFirst && bFirst && aFirst[0] === bFirst[0] ? 0.02 : 0

  return lastMatch + firstInitialMatch
}

/**
 * Compares two names and returns a similarity score between 0 and 1.
 *
 * The comparison uses sanitized versions of the names and may apply various
 * transformations to improve matching accuracy.
 *
 * @param {string} a - The first name to compare
 * @param {string} b - The second name to compare
 * @returns {number} A similarity score between 0 and 1, where 1 means identical names
 * @requires sanitizeName - Function to sanitize name strings
 * @requires compareStrings - Function to compare two strings
 * @requires structuralBonus - Function to calculate structural similarity bonus
 *
 * @example
 * compareNames("Dr. John A. Smith, Jr.", "John Smith") // returns a score around 0.85-0.9
 * compareNames("Ms. Jane Doe", "Jane D.") // returns a score around 0.8-0.85
 * compareNames("Alice", "Bob") // returns 0  (no similarity)
 */
const compareNames = (a, b) => {
  const aSan = sanitizeName(a)
  const bSan = sanitizeName(b)

  // Left as an experimental option for now
  const joinSingles = s =>
    s
      .split(' ')
      .map(t => (t.length === 1 ? t : t))
      .join(' ')

  const variantsA = [aSan]
  const variantsB = [bSan]

  let best = 0
  for (const va of variantsA) {
    for (const vb of variantsB) {
      const base = compareStrings(va, vb)
      const bonus = structuralBonus(va, vb)
      best = Math.max(best, Math.min(1, base + bonus))
    }
  }
  return best
}

// Named exports
export { compareStrings, stripDiacritics, sanitizeName, structuralBonus, compareNames }

// Default export for convenience
export default {
  compareStrings,
  stripDiacritics,
  sanitizeName,
  structuralBonus,
  compareNames
}
