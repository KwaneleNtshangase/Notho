import type { LessonLayoutItem, QuestionSlot } from "@/data/content";
import type { LessonBank } from "./money-basics";

/**
 * Premium banks for the Crypto Basics EXTRA lessons.
 *
 * Verified positions used here:
 *  - The FSCA declared crypto assets a financial product (2022); Crypto Asset
 *    Service Providers must hold an FSP licence, so SA exchanges are licensed
 *    and subject to FICA. A licence covers conduct — it never guarantees value.
 *  - SARS: crypto gains are taxed either as capital (CGT) or as revenue
 *    (income tax) depending on intention and trading frequency. Crypto-to-crypto
 *    swaps ARE disposals and therefore taxable events. All must be declared.
 *  - CGT: 40% inclusion, R50 000 annual exclusion (per SA-REGULATORY-FIGURES.md).
 * No coin prices, market caps or yields are pinned — they go stale immediately.
 * variantId prefix: `cbx-`.
 */
const info = (title: string, content: string): LessonLayoutItem => ({ type: "info", title, content });
const L = (slots: QuestionSlot[], title: string, content: string): LessonLayoutItem[] => [
  info(title, content),
  ...slots.map((s) => ({ slot: s.slotId })),
];

// ── How Blockchain Works ────────────────────────────────────────────────────
const bcSlots: QuestionSlot[] = [
  {
    slotId: "crypto-basics/blockchain/tamper-resistance",
    conceptId: "blockchain",
    variants: [
      { variantId: "cbx-bc-tr-mcq", step: { type: "mcq", question: "What makes blockchain records so difficult to tamper with?", options: ["Linked blocks, copied widely", "A single company guards it", "The data is encrypted, unreadable", "Transactions are deleted yearly"], correct: 0, feedback: { correct: "Right. Change one block and every block after it breaks, and you'd have to convince the majority of the network to accept your version.", incorrect: "It's the chaining plus distribution. There's no single database to attack, and altered history is immediately visible." } } },
      { variantId: "cbx-bc-tr-tf", step: { type: "true-false", statement: "A blockchain is maintained by a single central company that can edit it.", correct: false, feedback: { correct: "Right. A public blockchain is maintained by a distributed network with no single party able to rewrite it.", incorrect: "There's no central editor. That distribution is the entire point of the design." } } },
      { variantId: "cbx-bc-tr-sc", step: { type: "scenario", question: "Someone claims they can 'delete' a Bitcoin transaction that's already confirmed. What's the honest answer?", options: ["They can't. Confirmed transactions can't be reversed by anyone", "Only the exchange can do it", "Only with a court order", "It happens routinely"], correct: 0, feedback: { correct: "Right, and that irreversibility is why crypto scams work so well, a mistaken or scammed payment simply can't be recalled.", incorrect: "Confirmed transactions are final. Nobody, including exchanges and courts, can reverse them on-chain." } } },
    ],
  },
  {
    slotId: "crypto-basics/blockchain/pseudonymous",
    conceptId: "blockchain",
    variants: [
      { variantId: "cbx-bc-ps-tf", step: { type: "true-false", statement: "All blockchain transactions are completely anonymous.", correct: false, feedback: { correct: "Right. They're <em>pseudonymous</em>. Every transaction is permanently public, and analytics firms routinely link wallet addresses to real people.", incorrect: "They're pseudonymous, not anonymous. The ledger is public and addresses can often be traced back to identities." } } },
      { variantId: "cbx-bc-ps-sc", step: { type: "scenario", question: "A journalist writes that 'Bitcoin transactions are untraceable, which is why criminals use it'. What's the accurate assessment?", options: ["The opposite, it's traceable", "Entirely correct as written", "Correct for Bitcoin only", "Correct for large amounts only"], correct: 0, feedback: { correct: "Right. Cash is far harder to trace. Blockchain analysis has been central to numerous prosecutions precisely because the record is permanent.", incorrect: "It's backwards. The public, permanent ledger makes blockchain more traceable than cash, not less." } } },
      { variantId: "cbx-bc-ps-mcq", step: { type: "mcq", question: "What does a SA exchange know about you that the blockchain doesn't?", options: ["Your identity, from FICA", "Your wallet balance", "Your transaction history", "Nothing at all about you"], correct: 0, feedback: { correct: "Right. Licensed exchanges must verify identity under FICA, which is the link between a real person and an address.", incorrect: "Your verified identity. FICA requirements are what connect on-chain activity to a named individual." } } },
    ],
  },
  {
    slotId: "crypto-basics/blockchain/what-it-solves",
    conceptId: "blockchain",
    variants: [
      { variantId: "cbx-bc-ws-mcq", step: { type: "mcq", question: "What problem was blockchain designed to solve?", options: ["Transferring value between strangers without a trusted middleman", "Making payments free", "Encrypting private messages", "Speeding up bank transfers"], correct: 0, feedback: { correct: "Right. Whether that trade-off is worth it depends entirely on what you're doing. For most South Africans, PayShap is faster and cheaper.", incorrect: "It removes the need for a trusted intermediary. It isn't inherently free, private or fast." } } },
      { variantId: "cbx-bc-ws-tf", step: { type: "true-false", statement: "Blockchain transactions are always cheaper and faster than a normal bank transfer.", correct: false, feedback: { correct: "Right. Network fees can spike badly, and a local instant payment is usually quicker and cheaper for domestic transfers.", incorrect: "Not always. Fees vary with congestion, and domestic bank rails are typically faster and cheaper." } } },
      { variantId: "cbx-bc-ws-sc", step: { type: "scenario", question: "Sipho wants to send R500 to a friend in Johannesburg. Is crypto the sensible tool?", options: ["No, a local payment is better", "Yes, it is always the better tool", "Yes, if the amount is small", "Only on weekends"], correct: 0, feedback: { correct: "Right. Crypto's advantage is cross-border and trustless settlement, not domestic payments between people who already trust each other.", incorrect: "Local instant payments win here. Crypto solves a problem he doesn't have." } } },
    ],
  },
  {
    slotId: "crypto-basics/blockchain/volatility",
    conceptId: "crypto-basics",
    variants: [
      { variantId: "cbx-bc-vl-mcq", step: { type: "mcq", question: "What's the most important risk for a first-time crypto buyer to understand?", options: ["Prices can fall by very large percentages and stay down for years", "Transaction fees", "Slow confirmation times", "Exchange interfaces are confusing"], correct: 0, feedback: { correct: "Right. Drawdowns of 70–80% have happened more than once, so only money you can genuinely afford to lose belongs here.", incorrect: "Volatility. Large, extended drawdowns are a normal feature of this asset class, not an anomaly." } } },
      { variantId: "cbx-bc-vl-tf", step: { type: "true-false", statement: "Crypto should sit at the bottom of your financial priority list, after debt, emergency fund and retirement.", correct: true, feedback: { correct: "Right. It's speculative money. It comes after the things that actually protect you.", incorrect: "It's true. Clearing expensive debt and building a buffer beat a speculative allocation every time." } } },
      { variantId: "cbx-bc-vl-sc", step: { type: "scenario", question: "Nomsa wants crypto exposure at 3% of her R500 000 portfolio. What's the maximum allocation?", options: ["R15 000", "R50 000", "R150 000", "R5 000"], correct: 0, feedback: { correct: "R500 000 × 3% = R15 000. Sized so that a total loss would be disappointing rather than damaging.", incorrect: "3% of R500 000 = R15 000." } } },
    ],
  },
];

// ── Bitcoin vs Ethereum ─────────────────────────────────────────────────────
const btcSlots: QuestionSlot[] = [
  {
    slotId: "crypto-basics/btc-eth/supply-cap",
    conceptId: "crypto-basics",
    variants: [
      { variantId: "cbx-be-sc-mcq", step: { type: "mcq", question: "Why is Bitcoin's 21 million coin limit significant?", options: ["Supply is fixed by the protocol", "It guarantees the price will rise", "It means transactions are free", "It makes it legal tender"], correct: 0, feedback: { correct: "Right. Fixed supply is the design claim, but scarcity alone doesn't create value, and demand can fall as easily as it rises.", incorrect: "It's about fixed, protocol-enforced supply. That's a design property, not a price guarantee." } } },
      { variantId: "cbx-be-sc-tf", step: { type: "true-false", statement: "A limited supply guarantees that an asset's price will increase over time.", correct: false, feedback: { correct: "Right. Plenty of scarce things are worthless. Value needs demand, and demand is not guaranteed.", incorrect: "Scarcity without demand produces nothing. Limited supply is one input, not a prediction." } } },
      { variantId: "cbx-be-sc-sc", step: { type: "scenario", question: "Someone argues Bitcoin 'must' rise because supply is capped. What's missing from that argument?", options: ["Demand, which can fall", "The transaction fee involved", "The mining difficulty level", "The exchange listing"], correct: 0, feedback: { correct: "Right. Fixed supply says nothing about how many people want it next year.", incorrect: "Demand is the missing half. Supply constraints only matter if buyers keep showing up." } } },
    ],
  },
  {
    slotId: "crypto-basics/btc-eth/smart-contracts",
    conceptId: "crypto-basics",
    variants: [
      { variantId: "cbx-be-sm-tf", step: { type: "true-false", statement: "Ethereum can run programmes that execute financial agreements automatically, without an intermediary.", correct: true, feedback: { correct: "Right. Smart contracts. The catch is that a bug in the code is executed just as faithfully as the intended behaviour.", incorrect: "It's true. Smart contracts are Ethereum's defining feature, and their code is final once deployed." } } },
      { variantId: "cbx-be-sm-mcq", step: { type: "mcq", question: "What's the practical difference between Bitcoin and Ethereum?", options: ["Bitcoin is designed mainly as a store of value", "They're identical", "Ethereum has a fixed supply and Bitcoin doesn't", "Bitcoin runs smart contracts and Ethereum doesn't"], correct: 0, feedback: { correct: "Right. Different designs and different risk profiles. Treating them as interchangeable is a common mistake.", incorrect: "Bitcoin emphasises being a scarce store of value; Ethereum is a platform for programmable applications." } } },
      { variantId: "cbx-be-sm-sc", step: { type: "scenario", question: "A smart contract has a coding bug that lets funds be drained. What happens?", options: ["The code executes as written", "The developers reverse it", "The FSCA refunds users", "It is auto-cancelled"], correct: 0, feedback: { correct: "Right, and hundreds of millions have been lost this way. 'Code is law' cuts both ways.", incorrect: "The code runs regardless of intent. There's typically no reversal and no regulator to make you whole." } } },
    ],
  },
  {
    slotId: "crypto-basics/btc-eth/position-sizing",
    conceptId: "crypto-basics",
    variants: [
      { variantId: "cbx-be-ps-mcq", step: { type: "mcq", question: "What's a sensible way to size a crypto position?", options: ["An amount you could lose entirely without changing your plans", "As much as you can borrow", "Whatever your friends have put in", "Your full emergency fund"], correct: 0, feedback: { correct: "Right. If a total loss would derail you, the position is too big. Regardless of how confident you feel.", incorrect: "Size it to survive a total loss. Borrowing or using your buffer turns volatility into a crisis." } } },
      { variantId: "cbx-be-ps-tf", step: { type: "true-false", statement: "Borrowing money to buy crypto is a reasonable strategy if you're confident.", correct: false, feedback: { correct: "Right. Debt repayments are fixed and crypto prices aren't. The combination has ruined people who were also confident.", incorrect: "It's dangerous. Fixed repayments against a volatile asset is how a bad month becomes an unpayable debt." } } },
      { variantId: "cbx-be-ps-sc", step: { type: "scenario", question: "Thabo wants to put his emergency fund into crypto for better returns. What should he consider?", options: ["An emergency fund must be stable and available. Crypto is neither", "Crypto returns are higher, so it makes sense", "It's fine if he uses a stablecoin", "He should use half"], correct: 0, feedback: { correct: "Right. Emergencies don't wait for a recovery, and a 60% drawdown in the month you're retrenched is the worst possible timing.", incorrect: "An emergency fund needs stability and access. Neither crypto nor stablecoins provide the certainty required." } } },
    ],
  },
  {
    slotId: "crypto-basics/btc-eth/altcoins",
    conceptId: "crypto-basics",
    variants: [
      { variantId: "cbx-be-al-mcq", step: { type: "mcq", question: "What's the main risk of small, newly launched coins?", options: ["Most fail, and thin liquidity makes them easy to manipulate", "They're too expensive", "They're illegal in SA", "They can't be traded"], correct: 0, feedback: { correct: "Right. The overwhelming majority of tokens ever launched are now worthless or abandoned.", incorrect: "Failure rates and manipulation. Thin markets make pump-and-dump schemes easy to run." } } },
      { variantId: "cbx-be-al-tf", step: { type: "true-false", statement: "A coin heavily promoted by influencers is likely to be a good investment.", correct: false, feedback: { correct: "Right. Paid promotion is a warning, not a recommendation. Undisclosed promotion of tokens is a well-documented pattern.", incorrect: "Promotion signals marketing spend, not quality. It's frequently the setup for a pump and dump." } } },
      { variantId: "cbx-be-al-sc", step: { type: "scenario", question: "Ayesha is offered a 'presale' token with guaranteed returns before public listing. What is that?", options: ["A classic scam structure", "An early investment opportunity", "A properly regulated offering", "A standard practice"], correct: 0, feedback: { correct: "Right. Guaranteed returns plus exclusivity plus urgency is the same pattern as any other investment fraud.", incorrect: "It's a scam pattern. Nothing about crypto makes guaranteed returns possible." } } },
    ],
  },
];

// ── South African Crypto Exchanges ──────────────────────────────────────────
const exSlots: QuestionSlot[] = [
  {
    slotId: "crypto-basics/exchanges/licensing",
    conceptId: "crypto-custody",
    variants: [
      { variantId: "cbx-ex-lc-mcq", step: { type: "mcq", question: "Why does using an FSCA-licensed SA exchange matter?", options: ["You get a complaints route", "It guarantees no loss of value", "It insures your holdings", "It removes tax obligations"], correct: 0, feedback: { correct: "Right. Crypto assets are a declared financial product in SA, so service providers need an FSP licence. That covers conduct, not price.", incorrect: "It provides conduct oversight and recourse. It doesn't protect the value of what you buy." } } },
      { variantId: "cbx-ex-lc-tf", step: { type: "true-false", statement: "An FSCA licence means the crypto you buy is a safe investment.", correct: false, feedback: { correct: "Right. It regulates how the provider behaves, not whether the asset holds its value. The volatility is entirely yours.", incorrect: "Licensing addresses conduct, never investment outcomes. Prices can still collapse." } } },
      { variantId: "cbx-ex-lc-sc", step: { type: "scenario", question: "An offshore platform offers better prices but isn't FSCA-licensed. What are you giving up?", options: ["Local recourse and protections", "Nothing meaningful at all really", "Only the user interface", "Only your tax reporting"], correct: 0, feedback: { correct: "Right. If an unlicensed offshore platform freezes withdrawals, there's very little a South African can do about it.", incorrect: "You give up local oversight and recourse. That's usually worth more than a small price difference." } } },
    ],
  },
  {
    slotId: "crypto-basics/exchanges/custody",
    conceptId: "crypto-custody",
    variants: [
      { variantId: "cbx-ex-cu-tf", step: { type: "true-false", statement: "Keeping large amounts of crypto on an exchange long-term is best practice.", correct: false, feedback: { correct: "Right. If you don't hold the keys, you hold a claim against a company, and exchange failures have wiped out customers repeatedly.", incorrect: "It isn't. Long-term holdings belong in self-custody; exchanges are for transacting." } } },
      { variantId: "cbx-ex-cu-mcq", step: { type: "mcq", question: "What does 'not your keys, not your coins' mean?", options: ["Exchange coins are only a claim", "Exchanges charge for key storage", "You need a password to trade", "Keys expire after a year"], correct: 0, feedback: { correct: "Right. Control of the private key is what constitutes ownership on a blockchain.", incorrect: "It means custody equals control. Coins on an exchange are the exchange's, with you as a creditor." } } },
      { variantId: "cbx-ex-cu-sc", step: { type: "scenario", question: "Johan holds a long-term crypto position on an exchange. What's the trade-off in moving it to self-custody?", options: ["He takes on key risk", "There is no trade-off", "He loses the ability to sell", "It becomes entirely tax-free"], correct: 0, feedback: { correct: "Right, and self-custody has its own failure mode: lose the seed phrase and the coins are gone permanently.", incorrect: "He trades counterparty risk for key-management risk. Both are real; neither is free." } } },
    ],
  },
  {
    slotId: "crypto-basics/exchanges/security",
    conceptId: "crypto-custody",
    variants: [
      { variantId: "cbx-ex-se-mcq", step: { type: "mcq", question: "What's the single most important security step on a crypto account?", options: ["App-based two-factor authentication rather than SMS", "A long username", "Checking the account daily", "Using a well-known exchange"], correct: 0, feedback: { correct: "Right. SIM swap fraud is common in South Africa, and SMS-based codes are exactly what it defeats.", incorrect: "App-based 2FA. SMS codes are vulnerable to SIM swaps, which are a serious problem locally." } } },
      { variantId: "cbx-ex-se-tf", step: { type: "true-false", statement: "Anyone who obtains your recovery seed phrase can take everything in that wallet.", correct: true, feedback: { correct: "Right. Never photograph it, never store it in the cloud, never type it into a website. Legitimate support will never ask for it.", incorrect: "It's true. The seed phrase <em>is</em> the wallet, so anyone with it has full control." } } },
      { variantId: "cbx-ex-se-sc", step: { type: "scenario", question: "'Support' messages Priya asking for her seed phrase to fix an account issue. What's happening?", options: ["A scam. No legitimate service ever needs your seed phrase", "Standard verification", "A required security check", "A software update"], correct: 0, feedback: { correct: "Right, and the theft would be instant and irreversible. Genuine support can never require it.", incorrect: "It's a scam. No legitimate exchange or wallet asks for your seed phrase, ever." } } },
    ],
  },
  {
    slotId: "crypto-basics/exchanges/costs",
    conceptId: "crypto-custody",
    variants: [
      { variantId: "cbx-ex-co-mcq", step: { type: "mcq", question: "Where do crypto trading costs usually hide?", options: ["In the buy-sell spread", "In the blockchain itself", "In your bank charges only", "There are no hidden costs"], correct: 0, feedback: { correct: "Right. A wide spread can cost more than the advertised commission, especially on smaller or less liquid coins.", incorrect: "The spread. Compare the actual buy and sell prices, not just the stated fee." } } },
      { variantId: "cbx-ex-co-tf", step: { type: "true-false", statement: "Frequent crypto trading multiplies both your costs and your tax admin.", correct: true, feedback: { correct: "Right, and SARS is more likely to treat frequent trading as revenue, taxed at your full marginal rate rather than as CGT.", incorrect: "It's true. Every trade carries a spread, a fee and a tax record you have to keep." } } },
      { variantId: "cbx-ex-co-sc", step: { type: "scenario", question: "Sipho wants to reduce the cost drag on a small monthly crypto allocation. What helps most?", options: ["Fewer, larger purchases and comparing spreads between platforms", "Trading more often to catch moves", "Using several exchanges at once", "Buying more obscure coins"], correct: 0, feedback: { correct: "Right. Each transaction has a fixed cost element, so fewer transactions means less drag on a small amount.", incorrect: "Fewer transactions and better spreads. More trading and obscure coins both increase costs." } } },
    ],
  },
];

// ── DeFi and SA Investors ───────────────────────────────────────────────────
const defiSlots: QuestionSlot[] = [
  {
    slotId: "crypto-basics/defi/rug-pull",
    conceptId: "defi-risks",
    variants: [
      { variantId: "cbx-df-rp-mcq", step: { type: "mcq", question: "What is a 'rug pull' in DeFi?", options: ["Developers drain the pooled funds and disappear", "A market correction", "A network upgrade", "A regulatory shutdown"], correct: 0, feedback: { correct: "Right, and it's fast. Liquidity can vanish in minutes with no way to recover it.", incorrect: "It's the developers extracting the pooled funds and abandoning the project." } } },
      { variantId: "cbx-df-rp-tf", step: { type: "true-false", statement: "Because DeFi transactions are irreversible, funds lost to a rug pull generally can't be recovered.", correct: true, feedback: { correct: "Right. There's no chargeback, no ombud and usually no identifiable party to pursue.", incorrect: "It's true. Irreversibility plus anonymous developers means recovery is rare." } } },
      { variantId: "cbx-df-rp-sc", step: { type: "scenario", question: "A new DeFi project has anonymous developers and no audit. How should Nomsa read that?", options: ["Two of the strongest rug-pull warning signs", "Normal for early projects", "A sign of decentralisation", "Only a concern for large amounts"], correct: 0, feedback: { correct: "Right. Anonymity removes accountability, and no audit means nobody has checked whether the code does what it claims.", incorrect: "Both are serious warnings. Anonymity plus no audit is the standard rug-pull profile." } } },
    ],
  },
  {
    slotId: "crypto-basics/defi/no-regulator",
    conceptId: "defi-risks",
    variants: [
      { variantId: "cbx-df-nr-tf", step: { type: "true-false", statement: "DeFi smart contracts are safe because they're audited by the FSCA.", correct: false, feedback: { correct: "Right. The FSCA doesn't audit smart contracts. Private audits exist but they reduce risk rather than removing it. Audited protocols have still been drained.", incorrect: "The FSCA audits nothing of the sort. Even private code audits don't guarantee safety." } } },
      { variantId: "cbx-df-nr-mcq", step: { type: "mcq", question: "If a DeFi protocol loses your funds, what recourse do you have?", options: ["Usually none at all", "The FSCA refunds you", "Your bank reverses it", "The NFO investigates it"], correct: 0, feedback: { correct: "Right. That absence of recourse is the defining risk, and it's why position sizing matters so much here.", incorrect: "Generally none. The consumer protections that apply to banks and FSPs simply don't reach here." } } },
      { variantId: "cbx-df-nr-sc", step: { type: "scenario", question: "Thabo compares a bank deposit with a DeFi yield product. What's the fundamental difference?", options: ["The deposit is covered to R100 000 by CODI and regulated; the DeFi product has neither", "The DeFi product is safer because it's decentralised", "They carry identical risk", "Only the interest rate differs"], correct: 0, feedback: { correct: "Right, and that's what the extra yield is compensating for: it isn't free money, it's paid risk.", incorrect: "Deposit insurance and regulation. The higher yield exists precisely because those protections are absent." } } },
    ],
  },
  {
    slotId: "crypto-basics/defi/yield-question",
    conceptId: "defi-risks",
    variants: [
      { variantId: "cbx-df-yq-sc", step: { type: "scenario", question: "A platform promises 40% a year on stablecoins. What's the most important first question?", options: ["Where does the yield come from, and who's paying it?", "Which wallet should I use?", "Can I withdraw daily?", "Is the app well designed?"], correct: 0, feedback: { correct: "Right. If nobody can explain the source of the return in plain terms, the source is usually new depositors.", incorrect: "Ask where the yield comes from. Unexplained high yields are typically funded by later investors." } } },
      { variantId: "cbx-df-yq-mcq", step: { type: "mcq", question: "Why is a 40% stablecoin yield suspicious when banks pay far less?", options: ["Such a gap implies enormous hidden risk or that it isn't being earned at all", "Banks are simply inefficient", "Stablecoins are more productive assets", "DeFi has no costs"], correct: 0, feedback: { correct: "Right. Risk and return are linked everywhere, a return that far above the market is a warning, not an opportunity.", incorrect: "The gap has to be explained by risk or by fraud. Efficiency doesn't produce that difference." } } },
      { variantId: "cbx-df-yq-tf", step: { type: "true-false", statement: "'Stablecoin' means the asset carries no risk.", correct: false, feedback: { correct: "Right. Stablecoins depend on their backing and the issuer's solvency, and some have broken their peg and collapsed entirely.", incorrect: "The name describes an aim, not a guarantee. Several stablecoins have failed." } } },
    ],
  },
  {
    slotId: "crypto-basics/defi/how-much",
    conceptId: "defi-risks",
    variants: [
      { variantId: "cbx-df-hm-mcq", step: { type: "mcq", question: "Given the absence of recourse, how should DeFi be sized in a portfolio?", options: ["Only money you could lose entirely without any effect on your plans", "As much as you can spare", "Your emergency fund", "Whatever generates the most yield"], correct: 0, feedback: { correct: "Right. Total loss is a realistic outcome here, so the position must be sized for it.", incorrect: "Only money whose complete loss wouldn't matter. There's no safety net to fall back on." } } },
      { variantId: "cbx-df-hm-tf", step: { type: "true-false", statement: "Understanding what a protocol actually does is a minimum requirement before using it.", correct: true, feedback: { correct: "Right. If you can't explain how the yield is generated, you can't assess whether it's sustainable.", incorrect: "It's true. Investing in mechanisms you can't explain is how people end up in unexplainable losses." } } },
      { variantId: "cbx-df-hm-sc", step: { type: "scenario", question: "Priya is told DeFi is 'the future of finance' and she should move her savings there. What's a reasonable response?", options: ["Treat DeFi as speculation", "Move everything across now", "Move about half of it", "Move her emergency fund only"], correct: 0, feedback: { correct: "Right. A technology can be genuinely interesting and still be an unsuitable home for money she needs.", incorrect: "Savings belong in regulated products. DeFi exposure, if any, should be sized as speculation." } } },
    ],
  },
];

// ── Crypto Tax Filing with SARS ─────────────────────────────────────────────
const ctaxSlots: QuestionSlot[] = [
  {
    slotId: "crypto-basics/crypto-tax/capital-or-revenue",
    conceptId: "crypto-tax",
    variants: [
      { variantId: "cbx-ct-cr-mcq", step: { type: "mcq", question: "You trade crypto actively, several times a week. How is SARS most likely to treat your gains?", options: ["As revenue, taxed at your full marginal income tax rate", "As capital gains, at the lower effective CGT rate", "As tax-free", "As a foreign dividend"], correct: 0, feedback: { correct: "Right. Frequency and intention decide it. Active trading looks like a trade, and trading profits are ordinary income.", incorrect: "Frequent trading points to revenue, taxed at your full marginal rate rather than the ~18% maximum effective CGT rate." } } },
      { variantId: "cbx-ct-cr-tf", step: { type: "true-false", statement: "Buying and holding crypto for years is more likely to be treated as capital than active daily trading.", correct: true, feedback: { correct: "Right. Intention and holding period are what SARS weighs, and long-term holding supports a capital argument.", incorrect: "It's true. Long-term holding supports capital treatment; frequent trading supports revenue treatment." } } },
      { variantId: "cbx-ct-cr-sc", step: { type: "scenario", question: "Johan bought R50 000 of Bitcoin in one purchase, held it two years, and sold. How is that likely treated?", options: ["As a capital gain, subject to CGT", "As revenue at his marginal rate", "As tax-free after two years", "As a donation"], correct: 0, feedback: { correct: "Right. A single long-held position points to investment intent. Keep the records that show it.", incorrect: "A single long-held position supports capital treatment. There's no tax-free holding period in SA." } } },
    ],
  },
  {
    slotId: "crypto-basics/crypto-tax/swaps",
    conceptId: "crypto-tax",
    variants: [
      { variantId: "cbx-ct-sw-tf", step: { type: "true-false", statement: "Swapping one cryptocurrency for another is a taxable event in South Africa.", correct: true, feedback: { correct: "Right. A swap is a disposal of the first asset, even though no rands were involved, which surprises a lot of people at assessment time.", incorrect: "It's true. Crypto-to-crypto swaps are disposals and must be valued in rands and declared." } } },
      { variantId: "cbx-ct-sw-mcq", step: { type: "mcq", question: "Which of these triggers a tax event?", options: ["Swapping Bitcoin for Ethereum", "Moving crypto between your own wallets", "Buying crypto with rands", "Holding crypto without selling"], correct: 0, feedback: { correct: "Right. A swap disposes of one asset for another; transfers between your own wallets don't change ownership.", incorrect: "The swap. Purchases, holds and self-transfers aren't disposals." } } },
      { variantId: "cbx-ct-sw-sc", step: { type: "scenario", question: "Ayesha made 200 swaps this year and kept no records. What's her position?", options: ["She must still declare each swap", "Nothing is owed, she never cashed out", "Only her final rand balance matters", "SARS ignores crypto swaps entirely"], correct: 0, feedback: { correct: "Right. Exchanges report to SARS, and 'I didn't keep records' isn't a defence, export the history and reconstruct it.", incorrect: "Each swap is a disposal requiring a rand value. Never cashing out doesn't remove the obligation." } } },
    ],
  },
  {
    slotId: "crypto-basics/crypto-tax/cgt-maths",
    conceptId: "crypto-tax",
    variants: [
      { variantId: "cbx-ct-cm-fill", step: { type: "fill-blank", title: "Taxable capital gain", prompt: "You bought crypto for R200 000 and sold for R320 000: a R120 000 gain. After the R50 000 annual exclusion, 40% of the remainder is added to taxable income. Amount added = R____.", correct: 28000, feedback: { correct: "(R120 000 − R50 000) × 40% = R28 000 added to taxable income, then taxed at your marginal rate.", incorrect: "R70 000 remains after the exclusion; 40% of that is R28 000." } } },
      { variantId: "cbx-ct-cm-mcq", step: { type: "mcq", question: "What's the maximum effective CGT rate on a crypto gain treated as capital?", options: ["About 18%", "45%", "40%", "20%"], correct: 0, feedback: { correct: "Right, 40% inclusion at a 45% marginal rate. That's why the capital-versus-revenue distinction matters so much.", incorrect: "40% inclusion × 45% top marginal rate = 18% effective, compared with up to 45% if treated as revenue." } } },
      { variantId: "cbx-ct-cm-tf", step: { type: "true-false", statement: "The R50 000 annual capital gains exclusion applies across all your capital gains, not per asset.", correct: true, feedback: { correct: "Right. It's one annual exclusion covering your total net capital gain for the year.", incorrect: "It's a single annual exclusion, not one per asset or per transaction." } } },
    ],
  },
  {
    slotId: "crypto-basics/crypto-tax/declare-it",
    conceptId: "crypto-tax",
    variants: [
      { variantId: "cbx-ct-di-mcq", step: { type: "mcq", question: "Do you have to declare crypto to SARS if you never converted it back to rands?", options: ["Yes. Any disposal, including a swap, must be declared", "No, only rand withdrawals count", "Only above R100 000", "Only if the exchange reports it"], correct: 0, feedback: { correct: "Right. SARS receives information from licensed exchanges, and non-declaration is treated as evasion.", incorrect: "Every disposal must be declared, whether or not rands were involved." } } },
      { variantId: "cbx-ct-di-tf", step: { type: "true-false", statement: "Keeping a full transaction history export from your exchange makes crypto tax filing far simpler.", correct: true, feedback: { correct: "Right. Reconstructing years of trades afterwards is expensive and error-prone, export it annually and store it.", incorrect: "It's true. An annual export is the difference between a tedious hour and a very expensive reconstruction." } } },
      { variantId: "cbx-ct-di-sc", step: { type: "scenario", question: "Sipho has undeclared crypto gains from previous years. What's the sensible route?", options: ["Get proper tax advice and regularise it", "Ignore it: SARS can't see crypto", "Move the crypto offshore", "Cash out slowly in small amounts"], correct: 0, feedback: { correct: "Right. Voluntary regularisation is far cheaper than being caught, and the other options are evasion.", incorrect: "Regularise it with advice. SARS receives exchange data, and structuring withdrawals to hide them is itself an offence." } } },
    ],
  },
];

export const CRYPTO_BASICS_EXTRA_BANKS: Record<string, LessonBank> = {
  "crypto-basics::lesson-blockchain-explained": {
    layout: L(bcSlots, "What a Blockchain Actually Is", "<p>Each block is cryptographically linked to the one before it, and thousands of computers hold copies, so altering history breaks every block after it and the network rejects your version. Transactions are <strong>pseudonymous, not anonymous</strong>: the ledger is permanently public, which makes blockchain <em>more</em> traceable than cash. It solves one problem, transferring value without a trusted middleman, and it isn't automatically cheaper or faster than a local instant payment.</p>"),
    slots: bcSlots,
  },
  "crypto-basics::lesson-bitcoin-vs-ethereum": {
    layout: L(btcSlots, "Two Different Designs", "<p><strong>Bitcoin</strong> has a protocol-enforced <strong>21 million</strong> supply cap and is designed mainly as a scarce store of value, though scarcity without demand guarantees nothing. <strong>Ethereum</strong> is programmable: smart contracts execute agreements automatically, and execute bugs just as faithfully. Size any position so a total loss would be disappointing rather than damaging, and never borrow to buy it.</p>"),
    slots: btcSlots,
  },
  "crypto-basics::lesson-sa-crypto-exchanges": {
    layout: L(exSlots, "Buying Crypto in South Africa", "<p>Crypto assets are a declared <strong>financial product</strong> in SA, so service providers need an FSP licence. That gives you conduct oversight and a complaints route, but it never makes the asset safe. <strong>'Not your keys, not your coins'</strong>: holdings on an exchange are a claim against a company, so long-term positions belong in self-custody. Use <strong>app-based 2FA</strong>, never SMS, SIM swap fraud is common here, and never share a seed phrase.</p>"),
    slots: exSlots,
  },
  "crypto-basics::lesson-defi-risks": {
    layout: L(defiSlots, "DeFi: No Safety Net", "<p>A <strong>rug pull</strong> is developers draining the pooled funds and disappearing, and because transactions are irreversible, the money is gone. The FSCA doesn't audit smart contracts, and even privately audited protocols have been drained. If a platform promises 40% on stablecoins, the first question is <strong>where the yield comes from</strong>; if nobody can explain it plainly, the answer is usually new depositors. There's no CODI cover and no ombud here.</p>"),
    slots: defiSlots,
  },
  "crypto-basics::lesson-crypto-sars-tax": {
    layout: L(ctaxSlots, "SARS and Your Crypto", "<p>Gains are taxed either as <strong>capital</strong> (CGT, max ~18% effective) or as <strong>revenue</strong> (your full marginal rate), intention and trading frequency decide which. <strong>Crypto-to-crypto swaps are disposals</strong> and must be valued in rands and declared, even though no rands changed hands. On a R120 000 gain, the R50 000 annual exclusion leaves R70 000, and 40% of that (<strong>R28 000</strong>) is added to taxable income. Export your transaction history every year.</p>"),
    slots: ctaxSlots,
  },
};
