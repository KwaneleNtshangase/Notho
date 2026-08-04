import type { LessonLayoutItem, QuestionSlot } from "@/data/content";
import type { LessonBank } from "./money-basics";

/**
 * Premium banks for the Scams & Fraud EXTRA lessons.
 * Reporting routes per docs/SA-REGULATORY-FIGURES.md: National Financial Ombud
 * (NFO) 0860 800 900 / nfosa.co.za for bank disputes; FSCA for financial service
 * providers; SAPS for criminal complaints. Banks never request OTPs or PINs.
 * variantId prefix: `sfx-`.
 */
const info = (title: string, content: string): LessonLayoutItem => ({ type: "info", title, content });
const L = (slots: QuestionSlot[], title: string, content: string): LessonLayoutItem[] => [
  info(title, content),
  ...slots.map((s) => ({ slot: s.slotId })),
];

// ── Advance Fee Fraud ───────────────────────────────────────────────────────
const afSlots: QuestionSlot[] = [
  {
    slotId: "scams-fraud/advance-fee/pay-first",
    conceptId: "advance-fee-fraud",
    variants: [
      { variantId: "sfx-af-pf-mcq", step: { type: "mcq", question: "An email says you've won $500 000 in a lottery you never entered. To claim it you must pay R2 500 in 'release fees'. What is this?", options: ["Advance fee fraud. The fee is the entire point", "A legitimate international lottery", "A tax requirement on foreign winnings", "A processing charge you'll get back"], correct: 0, feedback: { correct: "Right. There's no prize. Pay the R2 500 and a new fee appears (customs, legal, transfer) until you stop.", incorrect: "It's advance fee fraud. You can't win a lottery you never entered, and the 'fee' is the scam." } } },
      { variantId: "sfx-af-pf-tf", step: { type: "true-false", statement: "Being asked to pay a fee before receiving money you're owed is a reliable sign of fraud.", correct: true, feedback: { correct: "Right. Legitimate payouts deduct costs from the amount, they don't ask you to send money first.", incorrect: "It's true, and it's the single most consistent marker of this scam family." } } },
      { variantId: "sfx-af-pf-sc", step: { type: "scenario", question: "Nomsa has already paid one 'release fee' and is now asked for a second. What should she do?", options: ["Stop paying, keep the evidence, and report it", "Pay it. She's too far in to stop", "Negotiate a smaller fee", "Ask them to deduct it from the payout"], correct: 0, feedback: { correct: "Right. The escalating fee is the scam's engine, and money already spent is gone. Continuing only adds to the loss.", incorrect: "Stop now. Sunk cost is what these scams rely on; the fees never end and no payout exists." } } },
    ],
  },
  {
    slotId: "scams-fraud/advance-fee/fake-authority",
    conceptId: "advance-fee-fraud",
    variants: [
      { variantId: "sfx-af-fa-tf", step: { type: "true-false", statement: "SARS will phone you and require an immediate EFT payment for outstanding tax.", correct: false, feedback: { correct: "Right. SARS communicates through eFiling and official correspondence, and never demands instant payment to an account given over the phone.", incorrect: "SARS doesn't work that way. Anyone demanding an immediate EFT by phone is impersonating them." } } },
      { variantId: "sfx-af-fa-mcq", step: { type: "mcq", question: "A 'SARS official' demands R15 000 immediately, payable in gift-card vouchers, or you'll be arrested. What's happening?", options: ["A scam, no government body accepts vouchers as payment", "A legitimate urgent collection", "A penalty arrangement", "A standard SARS process for arrears"], correct: 0, feedback: { correct: "Right. Vouchers are untraceable, which is exactly why scammers ask for them and no real authority ever does.", incorrect: "Voucher demands are always fraud. SARS collects through recognised channels, not iTunes cards." } } },
      { variantId: "sfx-af-fa-sc", step: { type: "scenario", question: "Thabo gets a threatening call claiming to be from a government department. How does he verify it?", options: ["Hang up and call the department on a number he looks up independently", "Ask the caller for their official number", "Trust it because they knew his ID number", "Pay a small amount to test whether it's real"], correct: 0, feedback: { correct: "Right. Numbers can be spoofed and personal details are widely leaked. An independently sourced number is the only real check.", incorrect: "Hang up and call back on a number you find yourself. Anything the caller gives you is part of the script." } } },
    ],
  },
  {
    slotId: "scams-fraud/advance-fee/job-scams",
    conceptId: "advance-fee-fraud",
    variants: [
      { variantId: "sfx-af-js-sc", step: { type: "scenario", question: "You're offered R40 000 a month for work-from-home data capturing after a single WhatsApp exchange, with a R2 000 'system licence' payable upfront. What should you do?", options: ["Refuse. Legitimate employers don't charge you to start work", "Pay it; the salary justifies the risk", "Negotiate the licence fee down", "Ask to pay it from your first salary"], correct: 0, feedback: { correct: "Right. No interview, an implausible salary and an upfront fee: three red flags in one message.", incorrect: "Employers pay you, not the other way around. Any upfront fee for a job is a scam." } } },
      { variantId: "sfx-af-js-tf", step: { type: "true-false", statement: "A legitimate South African employer may charge a fee for training or equipment before you start.", correct: false, feedback: { correct: "Right. Charging job seekers is unlawful in SA. The request itself tells you what you're dealing with.", incorrect: "It's not permitted. Recruitment costs sit with the employer, never the applicant." } } },
      { variantId: "sfx-af-js-mcq", step: { type: "mcq", question: "Besides upfront fees, which sign most reliably marks a fake job offer?", options: ["A salary far above the market with no interview or verifiable company", "A remote working arrangement", "An immediate start date", "Communication by email"], correct: 0, feedback: { correct: "Right. Check the company on the CIPC register and look for a real physical address and phone number.", incorrect: "The implausible salary with no process behind it. Remote work and quick starts are ordinary." } } },
    ],
  },
  {
    slotId: "scams-fraud/advance-fee/reporting",
    conceptId: "scam-recovery",
    variants: [
      { variantId: "sfx-af-rp-mcq", step: { type: "mcq", question: "You've sent money to an advance fee scammer. What should you do first?", options: ["Contact your bank immediately to attempt a recall", "Wait to see if the payout arrives", "Send a smaller follow-up payment to keep contact", "Delete everything out of embarrassment"], correct: 0, feedback: { correct: "Right, and speed matters. Recall is only possible while the funds are still in the receiving account.", incorrect: "Bank first, then SAPS. Keep every message: the evidence is what any investigation depends on." } } },
      { variantId: "sfx-af-rp-tf", step: { type: "true-false", statement: "Keeping all messages and payment records improves your chances after a scam.", correct: true, feedback: { correct: "Right. Account numbers, screenshots and timestamps are what banks and investigators actually work from.", incorrect: "It's true. Deleting the evidence removes the only basis for a recall or a case." } } },
      { variantId: "sfx-af-rp-sc", step: { type: "scenario", question: "Weeks later, a 'recovery agency' contacts Nomsa offering to retrieve her money for an upfront fee. What is it?", options: ["A second scam targeting known victims", "A legitimate service worth trying", "A government programme", "Her bank's fraud department"], correct: 0, feedback: { correct: "Right. Victim lists get resold, and the upfront fee is the same trick in a new costume.", incorrect: "It's a follow-up scam. Genuine recovery runs through your bank and the police, without upfront fees." } } },
    ],
  },
];

// ── Vishing: Voice Call Fraud ───────────────────────────────────────────────
const vishSlots: QuestionSlot[] = [
  {
    slotId: "scams-fraud/vishing/never-share-otp",
    conceptId: "vishing",
    variants: [
      { variantId: "sfx-vs-no-mcq", step: { type: "mcq", question: "A caller says: 'This is the bank's fraud department. Give us your OTP so we can block the fraudulent transaction.' What should you do?", options: ["Hang up and call the bank on the number from your card or app", "Give the OTP so the transaction is blocked", "Give only the first three digits", "Ask them to send confirmation by SMS first"], correct: 0, feedback: { correct: "Right. An OTP authorises a transaction. It can never block one. Sharing it is what lets the money leave.", incorrect: "Never share an OTP. It approves a payment; no bank employee will ever ask for it." } } },
      { variantId: "sfx-vs-no-tf", step: { type: "true-false", statement: "There is a legitimate situation in which your bank will ask for your OTP or PIN over the phone.", correct: false, feedback: { correct: "Right. No situation, no exception. Any request for either is fraud, whoever the caller claims to be.", incorrect: "There is none. Banks never ask for OTPs or PINs by phone, email or SMS." } } },
      { variantId: "sfx-vs-no-sc", step: { type: "scenario", question: "Ayesha is on a call and an OTP arrives on her phone. The caller asks her to read it out. What's happening?", options: ["Someone is authorising a transaction right now and needs her to approve it", "The bank is verifying her identity", "It's a routine security check", "The OTP is cancelling a payment"], correct: 0, feedback: { correct: "Right. The OTP arrived because a transaction was initiated on her account, reading it out completes the theft.", incorrect: "The OTP exists because a payment is being made. Reading it out approves it." } } },
    ],
  },
  {
    slotId: "scams-fraud/vishing/knowing-details",
    conceptId: "vishing",
    variants: [
      { variantId: "sfx-vs-kd-tf", step: { type: "true-false", statement: "A caller who knows your full name, ID number and account balance is definitely from your bank.", correct: false, feedback: { correct: "Right. Data breaches and insider leaks mean scammers often open with accurate details. That's the trust-building step, not proof.", incorrect: "Knowing your details proves nothing. Leaked data makes convincing openings cheap for scammers." } } },
      { variantId: "sfx-vs-kd-mcq", step: { type: "mcq", question: "Why do vishing callers open with accurate personal information?", options: ["To establish credibility before making the request that actually matters", "Because only the bank could have it", "To comply with regulations", "To confirm your identity for your protection"], correct: 0, feedback: { correct: "Right. The accurate details are the setup; the request for an OTP or a transfer is the payload.", incorrect: "It's a credibility play. Personal data circulates widely after breaches." } } },
      { variantId: "sfx-vs-kd-sc", step: { type: "scenario", question: "A caller correctly states Johan's recent transactions. What should he conclude?", options: ["Nothing yet. He should still hang up and call the bank himself", "The caller must be genuine", "His account is definitely compromised by an insider", "He should cooperate fully"], correct: 0, feedback: { correct: "Right. Verification means calling back on a number he sources himself, whatever the caller knows.", incorrect: "Detailed knowledge isn't verification. Hang up and call the bank on your own number." } } },
    ],
  },
  {
    slotId: "scams-fraud/vishing/transfer-script",
    conceptId: "vishing",
    variants: [
      { variantId: "sfx-vs-ts-mcq", step: { type: "mcq", question: "A 'fraud officer' asks you to move your money to a 'safe account' they'll provide. What's the correct read?", options: ["No such thing exists. Banks protect accounts by freezing them, not by moving your money out", "It's a standard protective measure", "It's safe if the account is at the same bank", "It's fine if they email confirmation first"], correct: 0, feedback: { correct: "Right. A real bank blocks the card and freezes the account. Any 'safe account' belongs to the scammer.", incorrect: "There's no such thing as a safe account. Banks freeze; they don't ask you to transfer funds away." } } },
      { variantId: "sfx-vs-ts-tf", step: { type: "true-false", statement: "Urgency and instructions not to discuss the call with anyone are hallmarks of vishing.", correct: true, feedback: { correct: "Right. Both exist to stop you pausing or asking someone who'd recognise the script.", incorrect: "It's true. Pressure and secrecy are the two tools that prevent verification." } } },
      { variantId: "sfx-vs-ts-sc", step: { type: "scenario", question: "Priya is told she must act within five minutes or lose her savings. What's the right move?", options: ["End the call. No genuine bank process depends on a five-minute deadline", "Comply quickly to protect her money", "Ask for ten minutes instead", "Transfer a small test amount"], correct: 0, feedback: { correct: "Right. The deadline exists purely to stop her thinking. Ending the call costs nothing if the call were real.", incorrect: "End the call and phone the bank yourself. Artificial deadlines are the scam, not the emergency." } } },
    ],
  },
  {
    slotId: "scams-fraud/vishing/after-the-call",
    conceptId: "scam-recovery",
    variants: [
      { variantId: "sfx-vs-ac-mcq", step: { type: "mcq", question: "You realise mid-call that you've been scammed. What's the first action?", options: ["Freeze the card in your banking app and call the bank's fraud line", "Call the scammer back to negotiate", "Post a warning online", "Wait for your statement"], correct: 0, feedback: { correct: "Right. Freezing takes seconds in the app, and every minute of delay allows more transactions.", incorrect: "Freeze the card in the app immediately, then call the fraud line. Speed decides how much is recoverable." } } },
      { variantId: "sfx-vs-ac-tf", step: { type: "true-false", statement: "If your bank refuses a legitimate fraud claim, the National Financial Ombud can review it free of charge.", correct: true, feedback: { correct: "Right, 0860 800 900 or nfosa.co.za, and its rulings bind the bank.", incorrect: "It's true. The NFO handles banking complaints free, and can rule against the bank." } } },
      { variantId: "sfx-vs-ac-sc", step: { type: "scenario", question: "Sipho shared his PIN during a scam call and R12 000 was taken. What's his likely position with the bank?", options: ["Weak: sharing a PIN breaches the banking agreement", "Guaranteed refund", "The bank must refund half", "SARS covers the loss"], correct: 0, feedback: { correct: "Right, which is why the PIN rule matters so much. He should still report it, but the outcome is far less certain than card-present fraud.", incorrect: "Sharing a PIN generally shifts liability to you. Report it anyway, but expect resistance." } } },
    ],
  },
];

// ── WhatsApp Scams ──────────────────────────────────────────────────────────
const waSlots: QuestionSlot[] = [
  {
    slotId: "scams-fraud/whatsapp/impersonation",
    conceptId: "whatsapp-scams",
    variants: [
      { variantId: "sfx-wa-im-sc", step: { type: "scenario", question: "An unknown number messages: 'Hi, it's Lungelo from varsity. I'm stuck in Cape Town, lost my wallet, please EFT R1 500.' Best response?", options: ["Call the real Lungelo on the number you already have before doing anything", "Send the money. He's a friend in trouble", "Reply asking for his bank details", "Ask a security question by message"], correct: 0, feedback: { correct: "Right. A voice call to the number you already hold defeats the entire scam in thirty seconds.", incorrect: "Verify by voice on your existing number. A stranger claiming a familiar name is the whole trick." } } },
      { variantId: "sfx-wa-im-tf", step: { type: "true-false", statement: "Asking a security question by message is enough to verify someone's identity on WhatsApp.", correct: false, feedback: { correct: "Right. Social media makes most 'only we would know' details findable, and a compromised account has the chat history.", incorrect: "It isn't enough. Call the person on the number you already have instead." } } },
      { variantId: "sfx-wa-im-mcq", step: { type: "mcq", question: "Why does the 'stuck and stranded' message work so well?", options: ["It combines urgency, a familiar name and a small enough amount not to trigger caution", "It's usually genuine", "It arrives from a verified account", "It offers something in return"], correct: 0, feedback: { correct: "Right. R1 500 is small enough to send without thinking, which is exactly why that figure is chosen.", incorrect: "Urgency, familiarity and a modest amount. The small ask is deliberate." } } },
    ],
  },
  {
    slotId: "scams-fraud/whatsapp/group-investment",
    conceptId: "whatsapp-scams",
    variants: [
      { variantId: "sfx-wa-gi-sc", step: { type: "scenario", question: "A 50-member WhatsApp group posts daily screenshots of R2 000–R5 000 'returns' on R10 000 investments, and members are enthusiastic. What is this?", options: ["A manufactured social proof scam. Screenshots are trivial to fake and many 'members' work for the operator", "A genuine investment club", "A stokvel", "A regulated collective investment scheme"], correct: 0, feedback: { correct: "Right. Those returns are impossible, and the visible enthusiasm is the product being sold to you.", incorrect: "It's engineered social proof. Screenshots prove nothing, and the returns are mathematically impossible." } } },
      { variantId: "sfx-wa-gi-tf", step: { type: "true-false", statement: "A WhatsApp investment group is safe to join if it claims an FSCA-registered administrator.", correct: false, feedback: { correct: "Right. Claims are free. Verify the FSP number on the FSCA register yourself, and check what it's actually licensed for.", incorrect: "A claim isn't a licence. Verify independently on the FSCA register before anything else." } } },
      { variantId: "sfx-wa-gi-mcq", step: { type: "mcq", question: "Why is 'my cousin has been paid twice' weak evidence for an investment scheme?", options: ["Early participants in a Ponzi are always paid", "Cousins are unreliable", "It's evidence of unregistered advice", "Payments are always reversed later"], correct: 0, feedback: { correct: "Right. Early payouts are the recruitment tool, not proof of a working investment.", incorrect: "Early payouts are how Ponzi schemes recruit. They prove the scheme is running, not that it works." } } },
    ],
  },
  {
    slotId: "scams-fraud/whatsapp/qr-and-links",
    conceptId: "whatsapp-scams",
    variants: [
      { variantId: "sfx-wa-qr-mcq", step: { type: "mcq", question: "A seller sends a QR code to 'confirm you're receiving payment'. What's really happening?", options: ["Scanning it authorises a payment out of your account, not into it", "It's a standard way to receive money", "It verifies your identity", "It generates a receipt"], correct: 0, feedback: { correct: "Right. QR codes initiate payments. Nobody needs a code from you to send you money. Your number or account details are enough.", incorrect: "Scanning a QR code sends money. Receiving money never requires you to scan anything." } } },
      { variantId: "sfx-wa-qr-tf", step: { type: "true-false", statement: "You never need to scan a QR code or click a link to receive money.", correct: true, feedback: { correct: "Right. Any request to scan or click 'to receive' is an attempt to make you pay or to steal your credentials.", incorrect: "It's true. Receiving requires nothing from you beyond your details." } } },
      { variantId: "sfx-wa-qr-sc", step: { type: "scenario", question: "A buyer on a marketplace insists Nomsa clicks a link to 'release' the payment. What should she do?", options: ["Refuse and ask for a normal EFT to her account", "Click it to complete the sale", "Send her banking login so they can pay directly", "Scan the QR code they offer instead"], correct: 0, feedback: { correct: "Right. A plain EFT needs nothing from her but an account number. The insistence on a link is the tell.", incorrect: "Insist on an ordinary EFT. Links and QR codes in this context exist to take money, not send it." } } },
    ],
  },
  {
    slotId: "scams-fraud/whatsapp/account-takeover",
    conceptId: "whatsapp-scams",
    variants: [
      { variantId: "sfx-wa-at-mcq", step: { type: "mcq", question: "Someone messages asking you to forward a six-digit code that just arrived by SMS. What is it?", options: ["Your WhatsApp verification code, sharing it hands over your account", "A group invitation code", "A delivery confirmation", "A bank reference number"], correct: 0, feedback: { correct: "Right. Once they have it, they become you, and start asking your contacts for money.", incorrect: "It's your WhatsApp registration code. Sharing it gives someone else control of your account." } } },
      { variantId: "sfx-wa-at-tf", step: { type: "true-false", statement: "Enabling two-step verification on WhatsApp protects your account even if someone gets the SMS code.", correct: true, feedback: { correct: "Right. The extra PIN is what stops a takeover, and it takes a minute to set up.", incorrect: "It's true. Two-step verification adds a PIN that the SMS code alone can't bypass." } } },
      { variantId: "sfx-wa-at-sc", step: { type: "scenario", question: "Thabo's WhatsApp is taken over and his contacts are being asked for money. What should he do first?", options: ["Re-register the number to reclaim the account", "Wait for it to be restored automatically", "Buy a new SIM", "Reply to the scammer from another number"], correct: 0, feedback: { correct: "Right. Re-registering logs the attacker out, and an urgent warning limits the damage to his contacts.", incorrect: "Re-register immediately and warn people through another channel. Every hour costs someone money." } } },
    ],
  },
];

// ── The WhatsApp 'Investment' (applied) ─────────────────────────────────────
const waAppSlots: QuestionSlot[] = [
  {
    slotId: "scams-fraud/wa-scheme/the-maths",
    conceptId: "investment-scams",
    variants: [
      { variantId: "sfx-ws-tm-mcq", step: { type: "mcq", question: "A scheme promises 10% a month. What does that compound to over a year?", options: ["More than 200%", "About 120%", "About 10%", "About 30%"], correct: 0, feedback: { correct: "Right. R10 000 would become over R31 000 in a year, and over R98 000 in two. The maths breaks long before the promises do.", incorrect: "10% monthly compounds to more than 200% a year. Nothing legitimate produces that repeatedly." } } },
      { variantId: "sfx-ws-tm-tf", step: { type: "true-false", statement: "A scheme paying consistent monthly returns regardless of market conditions is behaving suspiciously.", correct: true, feedback: { correct: "Right. Real returns fluctuate. Perfectly smooth returns usually mean the numbers are being written rather than earned.", incorrect: "It's true. Consistency in all conditions is a hallmark of fabricated returns." } } },
      { variantId: "sfx-ws-tm-fill", step: { type: "fill-blank", title: "The promise", prompt: "A scheme promises 10% a month on R10 000, paid as simple interest. Over 12 months that's R____ in claimed 'returns'.", correct: 12000, feedback: { correct: "R1 000 × 12 = R12 000, more than doubling the capital in a year, which no real investment guarantees.", incorrect: "R10 000 × 10% = R1 000 a month, × 12 = R12 000." } } },
    ],
  },
  {
    slotId: "scams-fraud/wa-scheme/recruitment",
    conceptId: "investment-scams",
    variants: [
      { variantId: "sfx-ws-rc-mcq", step: { type: "mcq", question: "The scheme pays a bonus for every friend you bring in. What does that tell you?", options: ["Its income comes from recruitment, not from investing", "It's a generous referral programme", "It's a registered marketing structure", "It reduces your own risk"], correct: 0, feedback: { correct: "Right. When new money pays old members, the scheme collapses the moment recruitment slows, and the last people in lose everything.", incorrect: "Recruitment-based income is the Ponzi signature. Real investments earn from markets, not from members." } } },
      { variantId: "sfx-ws-rc-tf", step: { type: "true-false", statement: "Recruiting friends into a scheme spreads your risk.", correct: false, feedback: { correct: "Right. It multiplies the harm and makes you the person they blame. Many recruiters are victims twice over.", incorrect: "It doesn't reduce your risk at all. It just adds their losses to the damage, and to your relationships." } } },
      { variantId: "sfx-ws-rc-sc", step: { type: "scenario", question: "Lerato is asked to bring five people into the group to 'unlock' her withdrawal. What's happening?", options: ["Her money is being used as leverage to recruit more victims", "A standard membership requirement", "A security verification step", "A tax compliance rule"], correct: 0, feedback: { correct: "Right. The withdrawal will never come, and the condition exists only to extend the scheme's life.", incorrect: "It's recruitment leverage. No legitimate investment ties your withdrawal to bringing in others." } } },
    ],
  },
  {
    slotId: "scams-fraud/wa-scheme/verification",
    conceptId: "scam-red-flags",
    variants: [
      { variantId: "sfx-ws-vf-mcq", step: { type: "mcq", question: "Before putting money into any scheme, what's the minimum check?", options: ["Verify the FSP number on the FSCA register and confirm what they're licensed to do", "Ask other members whether they've been paid", "Check how many people are in the group", "Read the testimonials"], correct: 0, feedback: { correct: "Right. Not on the register means no licence, no oversight and no complaints route. That alone ends the conversation.", incorrect: "Independent verification on the FSCA register. Members and testimonials are part of the pitch." } } },
      { variantId: "sfx-ws-vf-tf", step: { type: "true-false", statement: "Schemes promoted through a church or community group deserve less scrutiny than others.", correct: false, feedback: { correct: "Right. The opposite. Affinity fraud uses shared trust precisely because it suspends the questions people would otherwise ask.", incorrect: "They deserve more scrutiny. Trusted settings are how affinity fraud spreads fastest in SA." } } },
      { variantId: "sfx-ws-vf-sc", step: { type: "scenario", question: "The organiser can't produce an FSP number but says the fund is 'registered offshore'. What should Sipho do?", options: ["Walk away, anyone offering financial products to South Africans needs FSCA authorisation", "Ask for the offshore certificate", "Invest a small amount to test it", "Ask a member to vouch for it"], correct: 0, feedback: { correct: "Right. 'Registered offshore' is a standard deflection, and it removes every protection he has.", incorrect: "Walk away. Offering financial products here requires SA authorisation, whatever is claimed abroad." } } },
    ],
  },
  {
    slotId: "scams-fraud/wa-scheme/what-to-do",
    conceptId: "scam-recovery",
    variants: [
      { variantId: "sfx-ws-wd-sc", step: { type: "scenario", question: "Sipho put in R100 000 and received R40 000 in 'returns' within two months, with pressure to reinvest and recruit. What's the safest action?", options: ["Withdraw whatever he can now, stop recruiting, and report the scheme", "Reinvest to compound the returns", "Recruit friends to reduce his exposure", "Wait and see whether payments continue"], correct: 0, feedback: { correct: "Right. Those payments are other people's capital. Withdrawing early is the only outcome he controls, and recruiting makes him part of their loss.", incorrect: "Get out and stop recruiting. Reinvesting hands back the only money he's likely to see." } } },
      { variantId: "sfx-ws-wd-mcq", step: { type: "mcq", question: "Where should an investment scheme be reported in South Africa?", options: ["The FSCA, and SAPS for the criminal side", "The National Credit Regulator", "SARS", "The Reserve Bank"], correct: 0, feedback: { correct: "Right. The FSCA regulates financial services conduct; SAPS handles the fraud itself.", incorrect: "The FSCA for the financial conduct, SAPS for the crime. The NCR handles credit, not investments." } } },
      { variantId: "sfx-ws-wd-tf", step: { type: "true-false", statement: "Reporting a scheme is worthwhile even if you've already lost the money.", correct: true, feedback: { correct: "Right. Reports are how schemes get shut down, and the person who reports today saves someone else's savings.", incorrect: "It's true. Reporting protects the next person even when recovery for you is unlikely." } } },
    ],
  },
];

export const SCAMS_FRAUD_EXTRA_BANKS: Record<string, LessonBank> = {
  "scams-fraud::lesson-advance-fee-fraud": {
    layout: L(afSlots, "If You Pay First, You Lose", "<p>Advance fee fraud always has the same shape: a large sum is waiting for you, and a small payment stands between you and it. Pay, and a new fee appears. <strong>SARS never phones demanding an immediate EFT</strong>, and no authority accepts gift-card vouchers. Employers may not charge job seekers for training, licences or equipment. If you've paid: contact your bank immediately for a recall, report to SAPS, and keep every message.</p>"),
    slots: afSlots,
  },
  "scams-fraud::lesson-vishing-scams": {
    layout: L(vishSlots, "The Call That Empties Your Account", "<p>An OTP <strong>authorises</strong> a transaction. It can never block one, which is why no bank will ever ask you for it. Scammers open with your name, ID number and recent transactions because leaked data is cheap; that's a credibility play, not proof. There is <strong>no such thing as a 'safe account'</strong>: real banks freeze accounts, they don't ask you to move money. Hang up and call back on a number you source yourself.</p>"),
    slots: vishSlots,
  },
  "scams-fraud::lesson-whatsapp-scams": {
    layout: L(waSlots, "Why WhatsApp Carries So Much Fraud", "<p>Four patterns cover most of it. <strong>Impersonation</strong>: an unknown number claiming a familiar name with an urgent, modest ask. Call the person on your existing number. <strong>Fake investment groups</strong>: screenshots and enthusiasm are manufactured. <strong>QR codes and links</strong>: you never scan or click to <em>receive</em> money. <strong>Account takeover</strong>: never forward the six-digit code, and switch on two-step verification.</p>"),
    slots: waSlots,
  },
  "scams-fraud::lesson-applied-whatsapp-scheme": {
    layout: L(waAppSlots, "The WhatsApp 'Investment'", "<p>Sipho is invited into a group promising <strong>10% a month</strong>. He puts in R100 000 and receives R40 000 within two months. Then the pressure starts: reinvest, and recruit five friends to unlock a withdrawal. 10% monthly compounds to over 200% a year, which nothing legitimate sustains, and income from recruitment rather than investing is the Ponzi signature. Verify every FSP number on the <strong>FSCA register</strong> before anything else.</p>"),
    slots: waAppSlots,
  },
};
