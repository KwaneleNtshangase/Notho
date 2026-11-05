/** Source-preservation rules, not translation approvals. Sentences containing
 * these terms still require translation; only the entire literal can qualify. */
const names = new Set([
  'Notho', 'Notto', 'OTHO', 'Fundi Finance', 'The Solution Org (Pty) Ltd', 'Cosmo', 'Absa', 'FNB', 'Capitec', 'Nedbank', 'Standard Bank',
  'Discovery Bank', 'TymeBank', 'African Bank', 'Google', 'Apple', 'Facebook',
  'WhatsApp', 'LinkedIn', 'EasyEquities', 'Satrix', 'Sygnia', 'RSA Retail Bonds',
  'SARS', 'FSCA', 'NCR', 'JSE', 'RE5', 'TFSA', 'GEPF', 'IRP5',
  'Thabo', 'Zanele', 'Lindiwe', 'Priya', 'Sipho', 'Durban', 'Centurion',
  'SEDA', 'SEDFA', 'SEFA', 'UIF', 'RA', 'ZAR', 'SAST', 'SARS eFiling',
  'JSE (Johannesburg Stock Exchange)', 'Notho RE5',
  'IT3(a)', 'IT3(b)', 'IT3(c)', 'XP', 'PDF', 'CSV', 'JSON',
  'English', 'Afrikaans', 'isiNdebele', 'isiXhosa', 'isiZulu', 'Sepedi',
  'Sesotho', 'Setswana', 'siSwati', 'Tshivenda', 'Xitsonga',
  // Whole product/fund names already present in the app's English source.
  'TymeBank GoalSave', 'Capitec Money Market', 'Allan Gray Stable Fund',
  'Satrix Bond ETF', 'Coronation Capital Plus', 'Satrix Balanced Index Fund',
  'Allan Gray Balanced Fund', 'Coronation Balanced Plus', 'Sygnia Skeleton Balanced 70',
  'Satrix MSCI World ETF', 'Satrix 40 ETF', 'Sygnia Itrix S&P 500', 'EasyEquities TFSA',
]);
const mathematicalSymbols = new Set(['R', 'PV', 'FV', 'PMT', 'P', 'r', 'n', 't', 'LTV', 'XP', 'g', 'y', 'EBITDA', 'ROI']);

export function preservedSourceReason(source: string): string | undefined {
  const text = source.trim();
  if (!text) return undefined;
  if (names.has(text)) return 'Exact brand, institution, product or language name, or standard identifier';
  if (/^(?:\{value\d+\} \| Notho|Cosmo \{value\d+\}|\(SAST\))$/.test(text)) return 'Brand or time-zone label with interpolated data';
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text) || /^(?:[\w-]+\.)+(?:co\.za|za|com|org|net)$/.test(text)) return 'Literal email address or domain';
  if (text === 'balance = balance × (1 + r / 12) + PMT') return 'Formula using fixed mathematical variable names';
  if (text === 'Aa') return 'Font-size control sample glyphs';
  if (/^https?:\/\/\S+$/.test(text)) return 'Literal URL';
  const withoutPlaceholders = text.replace(/\{[A-Za-z_]\w*\}/g, '');
  // Attribute values can themselves contain accessible/user-facing prose.
  const withoutTags = withoutPlaceholders.replace(/<\/?[a-z][a-z0-9]*>/gi, '');
  const words = withoutTags.match(/\p{L}+/gu) ?? [];
  if (!words.length) return 'Numbers, punctuation and interpolation placeholders only';
  if ((/\d/.test(withoutTags) || withoutPlaceholders !== text)
    && words.every(word => mathematicalSymbols.has(word))) {
    return 'Mathematical notation or currency/XP amounts without prose';
  }
  return undefined;
}
