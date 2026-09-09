import type {
  NormalizedTxn,
  UserMerchantRule,
  CategoriseResult,
} from "../budget/types";
import { normaliseDescription } from "../budget/dedupe";

/** Minimal shape needed to resolve a category name to a user's custom id. */
type CustomBudgetCategory = { id: string; name: string; type: "income" | "expense" };

export type BuiltInRule = {
  pattern: RegExp;
  /** Either a static category id (used directly) or a display NAME to resolve
   *  against the user's custom categories (e.g. "Insurance", "Subscriptions"). */
  category: string;
  type: "income" | "expense";
};

/**
 * SA merchant/keyword rules - ordered most-specific first (first match wins).
 * The SIGN of the amount still decides income vs expense; these only suggest a
 * category, and a rule whose type contradicts the sign is ignored.
 */
export const BUILT_IN_RULES: BuiltInRule[] = [
  // ── Bank charges & fees ───────────────────────────────────────────────
  { pattern: /fund transfers|int acnt trf|ib transfer|inter.?acc(?:ount| trans)|payshap pay by proxy|live better (round-?up|interest sweep)|own account transfer/i, category: "transfers", type: "expense" },
  { pattern: /cash finance charge|#international|#electronic pmt|#inter acc|#fee - pos/i, category: "Bank Charges", type: "expense" },
  { pattern: /send money app/i, category: "Family", type: "expense" },
  { pattern: /\btapngo\b|\blift\b/i, category: "transport", type: "expense" },
  { pattern: /staff wages|village black|vb (staff|expenses)/i, category: "business", type: "expense" },
  { pattern: /pos cash|cshmr|autobank cash withdraw/i, category: "other", type: "expense" },
  { pattern: /\bfee[:\s]|bank charges?|service fee|admin fee|monthly (account )?(admin )?fee|cash (deposit|handling) fee|immediate payment fee|international (processing|transaction) fee|atm (fee|withdrawal fee)|external (payment|immediate) fee|cash sent fee|unpaid fee|other fees|notification fee|sms notification|value added service|balance enqu|card (replacement|delivery) fee|debit order (fee|dispute)|honou?ring fee|decline fee/i, category: "Bank Charges", type: "expense" },
  // ── Insurance ─────────────────────────────────────────────────────────
  { pattern: /insur|\binsure\b|outsurance|miway|mi way|king price|santam|hollard|dialdirect|naked insur|pineapple|budget insurance|1life|1 life|clientele|metropolitan.*(life|cover)|funeral (cover|plan)|life cover|short.?term cover|car insurance/i, category: "Insurance", type: "expense" },
  // ── Healthcare / medical ──────────────────────────────────────────────
  { pattern: /pharmacy|clicks|dis.?chem|medirite|hospital|mediclinic|netcare|life healthcare|\bdentist\b|\bdr\.\s+[a-z]|medical aid|discovery health|bonitas|momentum health|\bgems\b|optometr|physio|clinic/i, category: "healthcare", type: "expense" },
  // ── Groceries & food ──────────────────────────────────────────────────
  { pattern: /woolworth|woolies|checkers|pick ?n ?pay|\bpnp\b|shoprite|\bspar\b|superspar|kwikspar|\bboxer\b|food ?lover|\busave\b|\bmakro\b|game stores|fruit ?&? ?veg|butchery|spaza/i, category: "food", type: "expense" },
  { pattern: /\bkfc\b|nando|mcdonald|steers|debonair|roman'?s pizza|chicken licken|\bwimpy\b|uber ?eats|\bmr ?d\b|\bspur\b|burger|pizza|takeaway|romans|fishaways|galito|ocean basket|\bkauai\b|juice guys|pick ?& ?save/i, category: "food", type: "expense" },
  // ── Fuel & transport ──────────────────────────────────────────────────
  { pattern: /\buber\b|\bbolt\b|gautrain|\btaxi\b|\bengen\b|\bshell\b|\bsasol\b|\bbp\b|caltex|total ?energies|astron|puma energy|\bpetrol\b|\bfuel\b|\bgarage\b|parking|\be.?toll\b|prepaid.*petrol/i, category: "transport", type: "expense" },
  // ── Airtime / data / telecoms ─────────────────────────────────────────
  { pattern: /vodacom|\bmtn\b|telkom|cell ?c|\brain\b|afrihost|webafrica|\bairtime\b|data bundle|prepaid airtime|prepaid.*(mtn|vodacom|telkom|cellc)/i, category: "airtime", type: "expense" },
  // ── Streaming / entertainment ─────────────────────────────────────────
  { pattern: /netflix|\bdstv\b|multichoice|showmax|gogo dstv|disney|amazon prime|\bhbo\b|\bcinema\b|ster.?kinekor|nu metro|playstation|xbox|\bsteam\b|nintendo|spotify/i, category: "entertainment", type: "expense" },
  // ── Subscriptions / software ──────────────────────────────────────────
  { pattern: /openai|chatgpt|\bgrok\b|\bxai\b|apple\.com|\bitunes\b|google ?(play|storage|one)|\bicloud\b|microsoft|office ?365|\badobe\b|\bcanva\b|notion|github|dropbox|linkedin|\bzoom\b|grammarly|substack|patreon|subscription|recurring card purchase/i, category: "Subscriptions", type: "expense" },
  // ── Housing / utilities ───────────────────────────────────────────────
  { pattern: /\brent\b|lease|landlord|body corporate|\blevy\b|levies|municipal|\beskom\b|city of (cape town|joburg|johannesburg|tshwane|ekurhuleni|durban|ethekwini)|\brates\b|water (and|&) (lights|electricity)|prepaid electricity|home ?loan|\bbond\b/i, category: "housing", type: "expense" },
  // ── Education ─────────────────────────────────────────────────────────
  { pattern: /school fees|\buniversity\b|\buct\b|\bwits\b|\btuks\b|\bunisa\b|stellenbosch|\bcollege\b|tuition|udemy|coursera|\bcrèche\b|\bcreche\b|day ?care|education|textbook/i, category: "education", type: "expense" },
  // ── Debt / loans ──────────────────────────────────────────────────────
  { pattern: /\bloan\b|repayment|credit card payment|\bwesbank\b|\bmfc\b|sa home loans|reverse loan|nedbank loan|capitec.*loan|personal loan|store card|\brcs\b|mr price money|\bmobicred\b/i, category: "debt", type: "expense" },
  // ── Savings / investments ─────────────────────────────────────────────
  { pattern: /tymesave|stash|\bsavings\b|save (pocket|goal)|tax.?free|\btfsa\b/i, category: "savings", type: "expense" },
  { pattern: /easy ?equities|easyequities|allan gray|coronation|sygnia|\b10x\b|satrix|unit trust|investment|brokerage|\betf\b|\bshares\b|investec.*(invest|save)|ninety ?one/i, category: "Investments", type: "expense" },
  // ── Stokvel / tithe / gifts / family (commonly custom) ────────────────
  { pattern: /stokvel|\bsociety\b|grocery scheme|burial society/i, category: "Stokvel", type: "expense" },
  { pattern: /\btithe\b|\bchurch\b|\boffering\b|ministr|\bmosque\b|\bzakat\b/i, category: "Tithe", type: "expense" },
  { pattern: /\bgift\b|\bpresent\b|birthday|wedding gift|lobola/i, category: "Gifts", type: "expense" },
  { pattern: /allowance|pocket money|black tax|school.*child|\bdependant\b/i, category: "Family", type: "expense" },
  // ── Income ────────────────────────────────────────────────────────────
  { pattern: /salary|\bwages\b|payroll|stipend|remuneration|\bpay ?slip\b/i, category: "salary", type: "income" },
  { pattern: /freelance|\binvoice\b|consulting|commission/i, category: "freelance", type: "income" },
  { pattern: /\binterest\b|cashback|cash back|\breward\b|rebate|dividend/i, category: "other-income", type: "income" },
  { pattern: /\brefund\b|reversal|chargeback/i, category: "other-income", type: "income" },
];

const UNCATEGORISED_EXPENSE = "other";
const UNCATEGORISED_INCOME = "other-income";

const STATIC_IDS = new Set([
  "food", "transport", "housing", "debt", "savings", "entertainment",
  "airtime", "healthcare", "education", "other", "transfers",
  "salary", "freelance", "business", "other-income",
]);

/** Map a rule's target to a category id available to this user. */
function resolveCategory(
  target: string,
  type: "income" | "expense",
  customCategories: CustomBudgetCategory[]
): string {
  if (STATIC_IDS.has(target)) return target;
  const match = customCategories.find(
    (c) => c.type === type && c.name.trim().toLowerCase() === target.trim().toLowerCase()
  );
  if (match) return match.id;
  return type === "income" ? UNCATEGORISED_INCOME : UNCATEGORISED_EXPENSE;
}

function matchBuiltIn(text: string): BuiltInRule | null {
  for (const rule of BUILT_IN_RULES) {
    if (rule.pattern.test(text)) return rule;
  }
  return null;
}

function matchUserRule(
  text: string,
  userRules: UserMerchantRule[]
): CategoriseResult | null {
  const norm = normaliseDescription(text);
  for (const rule of userRules) {
    const pat = rule.merchant_pattern.toLowerCase();
    if (norm.includes(pat) || text.toLowerCase().includes(pat)) {
      return { category: rule.category, type: rule.type, confidence: 0.95, source: "user" };
    }
  }
  return null;
}

const TRANSFER_EITHER_WAY =
  /fund transfers|int acnt trf|ib transfer|inter.?acc(?:ount| trans)|payshap pay by proxy|live better (round-?up|interest sweep)|own account transfer/i;

export function categorise(
  txn: NormalizedTxn,
  userRules: UserMerchantRule[] = [],
  customCategories: CustomBudgetCategory[] = []
): CategoriseResult {
  const haystack = `${txn.rawMerchant} ${txn.description}`;

  // The SIGN of the amount is authoritative for income vs expense. A keyword may
  // only set the CATEGORY - never flip direction (descriptions often carry bank
  // or merchant words that don't reflect the money direction).
  const type: "income" | "expense" = txn.amountZAR >= 0 ? "income" : "expense";

  const userMatch = matchUserRule(haystack, userRules);
  if (userMatch && userMatch.type === type) return userMatch;

  if (TRANSFER_EITHER_WAY.test(haystack)) {
    return {
      category: resolveCategory("transfers", type, customCategories),
      type,
      confidence: 0.9,
      source: "rule",
    };
  }

  const builtIn = matchBuiltIn(haystack);
  if (builtIn && builtIn.type === type) {
    return {
      category: resolveCategory(builtIn.category, type, customCategories),
      type,
      confidence: 0.85,
      source: "rule",
    };
  }

  return {
    category: type === "income" ? UNCATEGORISED_INCOME : UNCATEGORISED_EXPENSE,
    type,
    confidence: 0.2,
    source: "uncategorised",
  };
}
