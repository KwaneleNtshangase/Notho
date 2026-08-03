/**
 * Strip characters that are legal in JavaScript but illegal in Postgres text.
 *
 * A PDF's text layer is not clean UTF-8. Fonts with broken encoding maps,
 * ligature glyphs, and certified or stamped statements routinely emit NUL bytes
 * and stray control characters, and `unpdf` passes them through verbatim
 * because they are perfectly valid JS string contents.
 *
 * Postgres disagrees. A NUL inside a JSON string arrives as the escape
 * backslash-u-0000, which Postgres cannot convert to `text`, so it rejects the
 * statement with:
 *
 *     unsupported Unicode escape sequence
 *     DETAIL: \u0000 cannot be converted to text.
 *
 * PostgREST fails the ENTIRE batch on that, so one bad glyph anywhere in a
 * statement loses every row. The user watches 314 transactions parse perfectly
 * and then die at the final step with an error that means nothing to them.
 * That is exactly what happened, twice, to the same person.
 *
 * Lone surrogates are stripped for the same reason: they are unpaired halves of
 * a code point, valid in a JS string, invalid as UTF-8, and they break the JSON
 * encode on its way to the database.
 *
 * Applied at extraction so the whole pipeline downstream is clean, and again
 * defensively at insert so CSV and OFX imports get the same protection.
 *
 * Everything here is written with \u escapes rather than literal bytes. Literal
 * control characters in a source file get flagged as binary by git, mangled by
 * editors, and are invisible in review.
 */

/** NUL and C0/C1 control characters, except tab, newline and carriage return. */
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;

/** Unpaired surrogate halves - valid JS, invalid UTF-8. */
const LONE_SURROGATES =
  /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g;

/**
 * Make a string safe to store. Returns "" for null/undefined so callers can
 * treat the result as a plain string.
 */
export function sanitiseText(value: string | null | undefined): string {
  if (value == null) return "";
  return value
    .replace(CONTROL_CHARS, " ")
    .replace(LONE_SURROGATES, "")
    // Collapse the whitespace the substitutions just introduced, so a stripped
    // control character does not leave a visible gap in a merchant name.
    .replace(/\s+/g, " ")
    .trim();
}

/** True when a string contains anything Postgres would reject. Used by tests. */
export function hasUnsafeChars(value: string): boolean {
  CONTROL_CHARS.lastIndex = 0;
  LONE_SURROGATES.lastIndex = 0;
  return CONTROL_CHARS.test(value) || LONE_SURROGATES.test(value);
}
