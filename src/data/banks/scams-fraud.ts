import type { LessonLayoutItem, QuestionSlot } from "@/data/content";
import type { LessonBank } from "./money-basics";

/**
 * Bank for the Scams & Fraud course. Per docs/QUESTION-VOICE-GUIDE.md.
 * Behavioural/safety content — kept empathetic and non-victim-blaming.
 * Stable facts used: banks never ask for your PIN/password/OTP; FSCA register
 * at fsca.co.za (complaints 0800 110 443); SAPS 10111; report fast, keep records.
 */

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 1 · "Phishing & Email Scams"
// ═══════════════════════════════════════════════════════════════════════════

const lesson1Slots: QuestionSlot[] = [
  {
    slotId: "scams-fraud/lesson-1/fake-sender",
    conceptId: "phishing",
    variants: [
      {
        variantId: "fs-fnb-gmail",
        step: {
          type: "mcq",
          question: "You get an email from 'fnb-security@gmail.com' saying your account is frozen. What do you do?",
          options: [
            "Call FNB on the number from your card",
            "Click the link right away to unfreeze",
            "Reply with your ID number to verify",
            "Forward it to all your contacts",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Always go to the source yourself. A real bank doesn't email from a Gmail address. Contact FNB using a number you look up, not one in the email.",
            incorrect: "Never click links in a suspicious email. Contact your bank directly on a number from their official site or the back of your card.",
          },
        },
      },
      {
        variantId: "fs-address-tf",
        step: {
          type: "true-false",
          statement: "An email from 'absa.support@gmail.com' could genuinely be from Absa.",
          correct: false,
          feedback: {
            correct: "Correct. Real banks send from their own domain, not Gmail. A free-email 'support' address is a phishing giveaway.",
            incorrect: "It's not. Banks use their own domains. A Gmail 'support' address is a fake. Check the sender before you trust anything.",
          },
        },
      },
      {
        variantId: "fs-lookalike-scenario",
        step: {
          type: "scenario",
          question: "A link in a 'bank' SMS reads www.absa-secure.co.za. What should that tell you?",
          options: [
            "It's likely fake. A lookalike domain",
            "It's safe, it says secure",
            "It's Absa's new website",
            "Links can't be faked",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Scammers register lookalike domains ('absa-secure') to seem real. Don't tap it: open your banking app or type the official address yourself.",
            incorrect: "'Secure' in the name means nothing. It's a lookalike domain trick. Go to the bank's real site directly instead of tapping the link.",
          },
        },
      },
    ],
  },
  {
    slotId: "scams-fraud/lesson-1/never-otp",
    conceptId: "phishing",
    variants: [
      {
        variantId: "no-otp-tf",
        step: {
          type: "true-false",
          statement: "Your bank will sometimes ask for your full PIN, password or OTP by email or phone.",
          correct: false,
          feedback: {
            correct: "Correct. NO legitimate bank EVER asks for your PIN, password or OTP, by email, SMS or call. Anyone who does is a scammer, full stop.",
            incorrect: "Never. A real bank will never ask for your PIN, password or OTP. If someone does, it's a scam. Hang up or delete it.",
          },
        },
      },
      {
        variantId: "no-otp-call-scenario",
        step: {
          type: "scenario",
          question: "Someone phones claiming to be 'bank fraud department' and asks for the OTP you just received to 'stop a fraudulent payment'. What do you do?",
          options: [
            "Refuse, and call the bank yourself",
            "Read them the OTP to stop the fraud",
            "Give them your card number too",
            "Stay on the line and follow along",
          ],
          correct: 0,
          feedback: {
            correct: "Right. This is the most common scam script. The OTP they want IS the fraudulent payment, reading it out authorises the thief. Hang up and call the bank yourself.",
            incorrect: "That OTP is the scammer's payment waiting for your approval. Never share it. Hang up and phone the bank on a number you look up.",
          },
        },
      },
      {
        variantId: "no-otp-what-mcq",
        step: {
          type: "mcq",
          question: "What is an OTP (one-time PIN) actually for?",
          options: [
            "To authorise something you started",
            "To share with support so they can help",
            "To prove your honesty to someone",
            "To post in public whenever asked to",
          ],
          correct: 0,
          feedback: {
            correct: "Right. An OTP confirms an action you initiated. If you didn't start a payment, an OTP arriving means someone else is trying. Never pass it on.",
            incorrect: "It authorises something YOU started. If one arrives unexpectedly, someone's trying to use your account. Don't share it with anyone.",
          },
        },
      },
    ],
  },
  {
    slotId: "scams-fraud/lesson-1/red-flags",
    conceptId: "phishing",
    variants: [
      {
        variantId: "rf-which-mcq",
        step: {
          type: "mcq",
          question: "Which of these is a classic phishing red flag?",
          options: [
            "Urgent threats about closing your account",
            "An email addressing you correctly by name",
            "A message with no links asking nothing",
            "Your normal monthly statement",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Manufactured urgency is designed to make you act before you think. Slow down. Real issues don't need you to click a link in a panic.",
            incorrect: "The red flag is urgency and pressure. Legitimate messages don't threaten to close your account in hours unless you click immediately.",
          },
        },
      },
      {
        variantId: "rf-greeting-tf",
        step: {
          type: "true-false",
          statement: "A generic greeting like 'Dear Customer' instead of your name can be a phishing sign.",
          correct: true,
          feedback: {
            correct: "True. Mass phishing emails often don't know your name. Combined with urgency and a dodgy link, 'Dear Customer' is a warning worth heeding.",
            incorrect: "It's true. 'Dear Customer' can signal a mass scam that doesn't have your details. It's one flag among several to watch for.",
          },
        },
      },
      {
        variantId: "rf-urgency-scenario",
        step: {
          type: "scenario",
          question: "An email creates panic: 'Suspicious login! Verify NOW or lose access.' What's the safest reaction?",
          options: [
            "Pause. Don't click",
            "Click immediately, there's no time to lose",
            "Enter your password on the linked page fast",
            "Reply with your details to verify",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Panic is the point. Take a breath and verify independently, open your banking app or phone the bank. Never let urgency rush you into clicking.",
            incorrect: "Urgency is the trap. Don't click. Verify by opening your app or calling the bank yourself. A real alert survives a two-minute pause.",
          },
        },
      },
    ],
  },
  {
    slotId: "scams-fraud/lesson-1/verify-direct",
    conceptId: "phishing",
    variants: [
      {
        variantId: "vd-mcq",
        step: {
          type: "mcq",
          question: "The safest way to respond to any 'bank' message you're unsure about is to:",
          options: [
            "Contact the bank yourself",
            "Use the details in the message",
            "Click the link to see if it's real",
            "Reply and ask if it's genuine",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Always reach the bank through a channel YOU choose, your app, or a number from the card or official site. Never use the contacts a suspicious message gives you.",
            incorrect: "Go direct through your own trusted channel. The details inside a scam message just lead back to the scammer.",
          },
        },
      },
      {
        variantId: "vd-type-tf",
        step: {
          type: "true-false",
          statement: "It's safer to type your bank's web address yourself than to click a link someone sent you.",
          correct: true,
          feedback: {
            correct: "True. Typing the address (or using your saved app) avoids lookalike-domain links entirely. Clicking is how people land on fake login pages.",
            incorrect: "It's true: typing it yourself or using your app dodges fake links. A sent link can quietly point to a scam page.",
          },
        },
      },
      {
        variantId: "vd-attachment-scenario",
        step: {
          type: "scenario",
          question: "An unexpected email says 'Your invoice/refund is attached' with a file to open. Sensible move?",
          options: [
            "Don't open it, verify with the sender",
            "Open it immediately to see the refund",
            "Enable macros if it asks you to",
            "Forward it to friends first",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Unexpected attachments are a common malware route. If you weren't expecting it, don't open it, confirm with the real sender through a known contact.",
            incorrect: "Unexpected attachments can be malware. Don't open it; verify with the sender through a channel you trust first.",
          },
        },
      },
    ],
  },
];

const lesson1Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "The Most Dangerous Scam in Your Inbox",
    content:
      "<p>Phishing is when criminals send fake emails or SMSes pretending to be your bank, SARS or a trusted company. The goal: get you to click a link and hand over your details.</p><p><strong>Red flags:</strong> urgent threats ('account closes in 24 hours!'); a generic 'Dear Customer'; a free-email sender (absa.support@gmail.com is NOT Absa); lookalike links (www.absa-secure.co.za). The golden rule: no real bank ever asks for your PIN, password or OTP, and when in doubt, contact the bank yourself using your app or a number you look up, never the one in the message.</p>",
  },
  { slot: "scams-fraud/lesson-1/fake-sender" },
  { slot: "scams-fraud/lesson-1/never-otp" },
  { slot: "scams-fraud/lesson-1/red-flags" },
  { slot: "scams-fraud/lesson-1/verify-direct" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 2 · "SIM Swap Fraud"
// ═══════════════════════════════════════════════════════════════════════════

const lesson2Slots: QuestionSlot[] = [
  {
    slotId: "scams-fraud/lesson-2/no-service",
    conceptId: "sim-swap",
    variants: [
      {
        variantId: "ns-mcq",
        step: {
          type: "mcq",
          question: "Your phone suddenly shows 'No Service' on a normal day. What should you do first?",
          options: [
            "Call your network from another phone",
            "Wait for it to come back on its own",
            "Restart your phone a few times",
            "Post about it on social media",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Unexpected loss of signal is a classic SIM-swap warning sign. Call your network at once from another phone. A swap in progress can be stopped.",
            incorrect: "Sudden loss of service can mean a SIM swap is happening. Call your network immediately from a different phone to check.",
          },
        },
      },
      {
        variantId: "ns-why-scenario",
        step: {
          type: "scenario",
          question: "Nomsa's phone loses all signal, then minutes later she gets emails about password resets she didn't request. What's likely happening?",
          options: [
            "A SIM swap, they now get her OTPs",
            "A network glitch, nothing to worry about",
            "Her phone simply needs to be charged",
            "The emails are unrelated to it",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Lost signal plus reset attempts is a SIM swap underway. She should call her network and bank immediately to freeze things before accounts are drained.",
            incorrect: "That combination is a SIM swap in progress. Her number is now on the thief's SIM. She must call her network and bank right away.",
          },
        },
      },
      {
        variantId: "ns-act-tf",
        step: {
          type: "true-false",
          statement: "Reacting within minutes to an unexpected loss of signal can stop a SIM swap before accounts are emptied.",
          correct: true,
          feedback: {
            correct: "True. Speed is everything. A fast call to your network can halt the swap or reverse it before the criminal uses your OTPs. Don't wait it out.",
            incorrect: "It's true. Minutes matter. Calling your network the moment signal drops can stop a swap before it's used to raid your accounts.",
          },
        },
      },
    ],
  },
  {
    slotId: "scams-fraud/lesson-2/what-is",
    conceptId: "sim-swap",
    variants: [
      {
        variantId: "wi-mcq-scam",
        step: {
          type: "mcq",
          question: "What is 'SIM swap' fraud?",
          options: [
            "Your number moved to their SIM",
            "Swapping your phone for a newer one",
            "Changing your data bundle",
            "A type of monthly bank service fee",
          ],
          correct: 0,
          feedback: {
            correct: "Right. They impersonate you to your network and hijack your number. Once your OTPs arrive on their SIM, they can get into your banking.",
            incorrect: "It's when a criminal takes over your phone number by fooling your network: then your OTPs go to them, unlocking your accounts.",
          },
        },
      },
      {
        variantId: "wi-otp-tf",
        step: {
          type: "true-false",
          statement: "The danger of a SIM swap is that your one-time PINs (OTPs) then reach the criminal instead of you.",
          correct: true,
          feedback: {
            correct: "True. Your number is the key to SMS OTPs. Control the number, and the thief can approve payments and resets as if they were you.",
            incorrect: "It's true, with your number, the criminal receives your SMS OTPs, which is what lets them break into your accounts.",
          },
        },
      },
      {
        variantId: "wi-how-scenario",
        step: {
          type: "scenario",
          question: "How does a criminal usually pull off a SIM swap?",
          options: [
            "By impersonating you to your network",
            "By physically stealing the network tower",
            "By guessing the PIN code on your phone",
            "It is quite impossible to actually do",
          ],
          correct: 0,
          feedback: {
            correct: "Right. They use your leaked or phished personal info to convince your network they're you. That's why guarding your details, and setting a SIM-swap PIN, matters.",
            incorrect: "They impersonate you to the network with personal details they've collected. Protecting your info and setting a SIM-swap PIN blocks this.",
          },
        },
      },
    ],
  },
  {
    slotId: "scams-fraud/lesson-2/protect",
    conceptId: "sim-swap",
    variants: [
      {
        variantId: "pr-mcq-scam",
        step: {
          type: "mcq",
          question: "Which step best protects you against SIM-swap fraud?",
          options: [
            "Set a SIM-swap PIN with your network",
            "Share your number with far more people",
            "Turn off your phone at night",
            "Nothing can be done about it",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A SIM-swap PIN makes it harder for someone to hijack your number, and an authenticator app (like Google Authenticator) means codes don't travel by SMS.",
            incorrect: "Set a SIM-swap PIN with your network, and prefer an authenticator app over SMS OTPs. Those two steps cut the risk sharply.",
          },
        },
      },
      {
        variantId: "pr-authenticator-tf",
        step: {
          type: "true-false",
          statement: "An authenticator app is generally safer than SMS for two-factor codes, because the codes aren't tied to your SIM.",
          correct: true,
          feedback: {
            correct: "True. Authenticator codes live on your device, not your phone number, so a SIM swap doesn't hand them to the criminal. Use it where your bank/app allows.",
            incorrect: "It's true, authenticator codes aren't sent over your number, so a SIM swap can't intercept them. Prefer it to SMS where you can.",
          },
        },
      },
      {
        variantId: "pr-pin-scenario",
        step: {
          type: "scenario",
          question: "Sipho wants to make it harder for anyone to hijack his number. What should he set up with his network?",
          options: [
            "A SIM-swap / RICA PIN",
            "A louder ringtone",
            "More airtime",
            "A second phone case",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A SIM-swap PIN adds a verification step the criminal can't easily pass, blocking the swap at the source. Ask your network to enable it.",
            incorrect: "He should set a SIM-swap/RICA PIN with his network. It stops a swap going through without that code.",
          },
        },
      },
    ],
  },
  {
    slotId: "scams-fraud/lesson-2/act-fast",
    conceptId: "sim-swap",
    variants: [
      {
        variantId: "af-tf",
        step: {
          type: "true-false",
          statement: "If you suspect a SIM swap, you should contact both your network AND your bank quickly.",
          correct: true,
          feedback: {
            correct: "True. The network can restore your number; the bank can freeze accounts and block transactions. Calling both fast limits the damage.",
            incorrect: "It's true: tell your network (to recover the number) and your bank (to freeze accounts) as fast as you can. Both calls matter.",
          },
        },
      },
      {
        variantId: "af-order-mcq",
        step: {
          type: "mcq",
          question: "You're fairly sure a SIM swap is happening. What's the priority?",
          options: [
            "Call your network and bank",
            "Wait a day to be sure",
            "Only change your email password",
            "Ignore it until the money is gone",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Act now, not later. Every minute the thief has your number is a minute they can drain accounts. Freeze first, sort out the details after.",
            incorrect: "The priority is speed: call your network and bank immediately. Waiting gives the criminal time to empty your accounts.",
          },
        },
      },
      {
        variantId: "af-prepared-tf",
        step: {
          type: "true-false",
          statement: "Saving your network's and bank's fraud numbers now means you can react instantly if a SIM swap happens.",
          correct: true,
          feedback: {
            correct: "True. In the panic of a swap you won't want to be searching for numbers. Store them today so you can act in seconds when it counts.",
            incorrect: "It's true. Pre-saving those numbers turns a scramble into a quick call. Prepare when calm so you're fast under pressure.",
          },
        },
      },
    ],
  },
];

const lesson2Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "How Criminals Hijack Your Phone Number",
    content:
      "<p>SIM-swap fraud: a criminal calls your mobile network, pretends to be you, and gets your number transferred to a SIM they control. Now every OTP you'd normally receive goes to them, and that's the key to your banking.</p><p><strong>Protect yourself:</strong> set a SIM-swap/RICA PIN with your network; if your phone suddenly loses signal for no reason, call your network immediately from another phone; and use an authenticator app instead of SMS OTPs where you can, since those codes aren't tied to your number.</p>",
  },
  { slot: "scams-fraud/lesson-2/no-service" },
  { slot: "scams-fraud/lesson-2/what-is" },
  { slot: "scams-fraud/lesson-2/protect" },
  { slot: "scams-fraud/lesson-2/act-fast" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 3 · "Fake Investment Schemes"
// ═══════════════════════════════════════════════════════════════════════════

const lesson3Slots: QuestionSlot[] = [
  {
    slotId: "scams-fraud/lesson-3/guarantee-recruit",
    conceptId: "investment-scams",
    variants: [
      {
        variantId: "gr-mcq",
        step: {
          type: "mcq",
          question: "Which detail should make you pause before sending money to an 'investment club'?",
          options: [
            "Guaranteed weekly returns",
            "A registered business name you can verify",
            "They explain their fees clearly",
            "They give you time to think",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Guaranteed weekly returns plus recruitment pressure is the signature of a Ponzi or pyramid. The 'returns' are just new members' money.",
            incorrect: "The warning signs are guaranteed returns and pressure to recruit. Real investments carry risk and don't pay you to bring in friends.",
          },
        },
      },
      {
        variantId: "gr-recruit-tf",
        step: {
          type: "true-false",
          statement: "If recruiting new members pays more than the 'investment' itself, it's likely a pyramid scheme.",
          correct: true,
          feedback: {
            correct: "True. When the money comes from recruitment rather than a real asset, it's a pyramid, it collapses the moment new members dry up.",
            incorrect: "It's true, if the rewards come from recruiting, not a genuine asset, it's a pyramid. Those always collapse and most people lose.",
          },
        },
      },
      {
        variantId: "gr-screenshots-scenario",
        step: {
          type: "scenario",
          question: "A WhatsApp 'trader' posts screenshots of R10 000 becoming R250 000 in weeks and says 'top up before the window closes'. What does this tell you?",
          options: [
            "It's almost certainly a scam",
            "It's a great opportunity you should grab",
            "The screenshots prove it's real",
            "You should recruit family fast",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Screenshots are trivial to fake, and real growth is slow and boring. Impossible returns plus 'act now' pressure is a scam script, not an opportunity.",
            incorrect: "It's a scam pattern: fake screenshots, impossible returns, and urgency to deposit more. Legitimate investing is slow, regulated and unglamorous.",
          },
        },
      },
    ],
  },
  {
    slotId: "scams-fraud/lesson-3/verify-fsca",
    conceptId: "investment-scams",
    variants: [
      {
        variantId: "vf-tf",
        step: {
          type: "true-false",
          statement: "You can check whether a South African financial services provider is registered before you invest.",
          correct: true,
          feedback: {
            correct: "True. The FSCA keeps a public register of licensed providers and publishes scam warnings at fsca.co.za. Checking takes minutes and can save your savings.",
            incorrect: "It's true, the FSCA register (fsca.co.za) lists licensed providers and warnings. Always verify before you hand over any money.",
          },
        },
      },
      {
        variantId: "vf-how-mcq",
        step: {
          type: "mcq",
          question: "Before investing with a company, how can you check it's legitimate?",
          options: [
            "Verify its FSP number with the FSCA",
            "Trust the glossy PDF they send",
            "Rely on how confident they sound",
            "Assume it's fine if friends joined",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A legitimate provider has an FSP number you can look up on the FSCA register. No number, or not on the register? Don't invest.",
            incorrect: "Verify the FSP number on the FSCA register. Brochures, confidence and friends joining prove nothing. The register does.",
          },
        },
      },
      {
        variantId: "vf-switchboard-scenario",
        step: {
          type: "scenario",
          question: "A 'financial adviser' gives you a phone number to 'confirm' the company is real. What's the safer check?",
          options: [
            "Call the number you look up yourself",
            "Call the number that they provided you",
            "Trust the letterhead",
            "Skip checking to save time",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The number they hand you may ring an accomplice. Look up the company's real switchboard yourself and confirm the person and product independently.",
            incorrect: "Don't use the number they give you. It can be part of the scam. Find the official switchboard yourself and verify independently.",
          },
        },
      },
    ],
  },
  {
    slotId: "scams-fraud/lesson-3/personal-account",
    conceptId: "investment-scams",
    variants: [
      {
        variantId: "pa-scenario",
        step: {
          type: "scenario",
          question: "Someone offers '6% per month, risk-free' if you EFT to their personal Capitec account today. Safest response?",
          options: [
            "Refuse and report it",
            "Send R5 000 to test it first",
            "Ask three cousins to join in",
            "Share your OTP to load the platform",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Real investments don't collect into someone's personal account, and 'risk-free' high returns don't exist. Refuse, and report it. Don't test it.",
            incorrect: "Everything here screams scam: personal account, impossible 'risk-free' return, urgency. Refuse and report; even a 'test' amount is gone.",
          },
        },
      },
      {
        variantId: "pa-fill",
        step: {
          type: "fill-blank",
          title: "Annualise the promise",
          prompt: "A scheme promises '6% per month'. As a simple yearly figure that's 6 × 12 = ____%.",
          correct: 72,
          feedback: {
            correct: "Correct: 72% a year. No legitimate, risk-free investment comes close. That alone tells you it's a scam.",
            incorrect: "6% × 12 = 72% a year. Impossibly high for 'risk-free': a dead giveaway.",
          },
        },
      },
      {
        variantId: "pa-personal-tf",
        step: {
          type: "true-false",
          statement: "A legitimate investment might ask you to EFT money into a random person's personal bank account.",
          correct: false,
          feedback: {
            correct: "Correct. Real providers use regulated, named company accounts and custodians. Never a personal account. That request alone is enough to walk away.",
            incorrect: "It wouldn't. Legitimate investments use proper company accounts, not someone's personal one. A personal-account request is a scam signal.",
          },
        },
      },
    ],
  },
  {
    slotId: "scams-fraud/lesson-3/boring-is-real",
    conceptId: "investment-scams",
    variants: [
      {
        variantId: "br-mcq",
        step: {
          type: "mcq",
          question: "What does real, legitimate investment growth usually look like?",
          options: [
            "Slow, regulated",
            "Fast, guaranteed and exciting",
            "Doubling your money every few weeks",
            "Whatever a WhatsApp group promises",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Genuine growth is patient and paperwork-heavy. If it's thrilling and urgent, that excitement is usually the bait on a hook.",
            incorrect: "Real investing is slow, regulated and frankly boring. 'Fast, guaranteed, exciting' is the language of scams, not assets.",
          },
        },
      },
      {
        variantId: "br-toogood-tf",
        step: {
          type: "true-false",
          statement: "'If it sounds too good to be true, it probably is' is a useful rule for spotting investment scams.",
          correct: true,
          feedback: {
            correct: "True. It's a cliché because it works. Extraordinary, guaranteed returns are the single most reliable sign that something is a scam.",
            incorrect: "It's true. It's a cliché that holds. Too-good-to-be-true returns are the clearest warning sign there is.",
          },
        },
      },
      {
        variantId: "br-pressure-scenario",
        step: {
          type: "scenario",
          question: "An 'opportunity' insists you decide today or 'lose your spot'. What's the healthy response?",
          options: [
            "Treat the pressure as a red flag",
            "Rush in before that spot is all gone",
            "Borrow the money in order to grab it",
            "Recruit others so you don't miss out",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Urgency exists to stop you thinking and checking. A genuine opportunity survives you sleeping on it and verifying, a scam can't.",
            incorrect: "Time pressure is a manipulation tactic. Step back. Anything real will still be there after you've checked it properly.",
          },
        },
      },
    ],
  },
];

const lesson3Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Promises That Don't Add Up",
    content:
      "<p>'Elite traders' on WhatsApp post screenshots of R10 000 becoming R250 000 in weeks and urge you to 'top up' before the window closes. Legitimate growth takes time, regulation and visible paperwork. It's boring next to the story.</p><p>In South Africa: check FSCA warnings, ask for the FSP number and verify it at fsca.co.za, call the institution on its official switchboard (not the number the salesperson gives you), and never move money to a random personal account. If recruiting members pays more than the 'returns', you're looking at a pyramid, not an asset.</p>",
  },
  { slot: "scams-fraud/lesson-3/guarantee-recruit" },
  { slot: "scams-fraud/lesson-3/verify-fsca" },
  { slot: "scams-fraud/lesson-3/personal-account" },
  { slot: "scams-fraud/lesson-3/boring-is-real" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 4 · "Romance & Social Media Scams"
// ═══════════════════════════════════════════════════════════════════════════

const lesson4Slots: QuestionSlot[] = [
  {
    slotId: "scams-fraud/lesson-4/never-met-cash",
    conceptId: "romance-scams",
    variants: [
      {
        variantId: "nmc-tf",
        step: {
          type: "true-false",
          statement: "It's a serious warning sign when someone you've never met in person asks you to send money or airtime.",
          correct: true,
          feedback: {
            correct: "True. This is the core of romance fraud. However kind they seem, a request for cash from someone you've never met face to face is a red line: pause and talk to someone you trust.",
            incorrect: "It's true. A money request from someone you've never met in person is the central red flag of romance scams. It's not rude to refuse and check.",
          },
        },
      },
      {
        variantId: "nmc-emergency-scenario",
        step: {
          type: "scenario",
          question: "After weeks of sweet messages, an online partner you've never met has an 'emergency'. Customs is holding a gift and they need a fee. What's happening?",
          options: [
            "A classic romance-scam script",
            "True love being tested, so pay",
            "A genuine customs issue to fix",
            "A sign to send more to prove you care",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The build-up of trust exists to set up this 'emergency'. There is no gift and no customs fee. Only a request for your money. It's not your fault for being kind, but don't pay.",
            incorrect: "It's the scam's payoff moment: trust built, now an 'emergency' fee. There's no gift. Don't send anything, and it's okay to walk away.",
          },
        },
      },
      {
        variantId: "nmc-cut-mcq",
        step: {
          type: "mcq",
          question: "An online-only contact starts asking for e-wallet sends, airtime or access to your banking app. What's wise?",
          options: [
            "Stop sending and talk to someone",
            "Keep sending to keep them happy",
            "Give them your full banking login details",
            "Send airtime just this once, repeatedly",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Those requests are the scam. Stopping isn't cruel. It's self-protection. A quick word with a trusted friend often breaks the spell.",
            incorrect: "Stop and get a second opinion from someone you trust. Requests for e-wallets, airtime or app access are the fraud, not affection.",
          },
        },
      },
    ],
  },
  {
    slotId: "scams-fraud/lesson-4/gift-cards",
    conceptId: "romance-scams",
    variants: [
      {
        variantId: "gc-tf",
        step: {
          type: "true-false",
          statement: "Being asked to buy retail gift cards and share the codes is almost always a scam.",
          correct: true,
          feedback: {
            correct: "True. Legitimate companies and real partners don't collect payment as gift-card codes photographed from strangers. It's untraceable, which is exactly why scammers love it.",
            incorrect: "It's true. Gift-card code requests are overwhelmingly fraud. No genuine business or partner asks to be paid that way. Treat it as a bright red flag.",
          },
        },
      },
      {
        variantId: "gc-why-mcq",
        step: {
          type: "mcq",
          question: "Why do scammers love asking for gift-card codes?",
          options: [
            "Fast, anonymous and untraceable",
            "Gift cards earn you extra interest",
            "It is the safest way to pay",
            "Banks actively recommend it",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Once you share the codes, the value is gone with almost no way to recover it. That untraceability is the whole appeal for the fraudster.",
            incorrect: "It's because gift cards are anonymous and irreversible, perfect for a scammer, terrible for you. No legitimate payment works this way.",
          },
        },
      },
      {
        variantId: "gc-boss-scenario",
        step: {
          type: "scenario",
          question: "A message claiming to be your 'boss' urgently asks you to buy gift cards and send the codes. What do you do?",
          options: [
            "Don't buy anything",
            "Buy them quickly to impress your boss",
            "Reply asking how many they need",
            "Send the codes to be safe",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The 'urgent boss gift-card' request is a well-known scam. Confirm with your boss in person or on a number you already have. Never act on the message alone.",
            incorrect: "It's a classic impersonation scam. Don't buy anything; check with your boss directly on a known number first.",
          },
        },
      },
    ],
  },
  {
    slotId: "scams-fraud/lesson-4/boundaries",
    conceptId: "romance-scams",
    variants: [
      {
        variantId: "bd-tf",
        step: {
          type: "true-false",
          statement: "Someone who truly cares for you will respect a firm 'no' when you decline to send money to a stranger's account.",
          correct: true,
          feedback: {
            correct: "True. Guilt-tripping you about 'love versus money' after you've said no is manipulation, not affection. A real partner accepts your boundary.",
            incorrect: "It's true. Pressure after a clear 'no' is a tactic, not love. Someone who cares respects your boundary rather than working around it.",
          },
        },
      },
      {
        variantId: "bd-pressure-mcq",
        step: {
          type: "mcq",
          question: "You say no to sending cash, and the person lays on guilt: 'If you loved me you'd help.' What does that reveal?",
          options: [
            "Manipulation, not care",
            "That you should send it after all",
            "That they truly love you",
            "That you were wrong to say no",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Turning your 'no' into a test of love is a control tactic. Your boundary is valid. The pressure itself is the red flag.",
            incorrect: "It's manipulation. Weaponising 'if you loved me' to get money is a tactic, not affection. Hold your boundary.",
          },
        },
      },
      {
        variantId: "bd-firm-scenario",
        step: {
          type: "scenario",
          question: "An online partner keeps pushing after you've clearly declined to send money. What's the healthy step?",
          options: [
            "Hold the boundary, it's a red flag",
            "Give in to keep the peace",
            "Apologise and send a smaller amount",
            "Send it to prove you're not selfish",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Repeated pressure after a clear no tells you what this really is. You don't owe anyone your savings. Holding firm protects you.",
            incorrect: "Repeated pushing after a 'no' is the warning. Hold firm: you don't owe money to prove anything, and giving in only invites more asks.",
          },
        },
      },
    ],
  },
  {
    slotId: "scams-fraud/lesson-4/tell-ally",
    conceptId: "romance-scams",
    variants: [
      {
        variantId: "ta-mcq",
        step: {
          type: "mcq",
          question: "Which habit most reduces the risk of a romance scam?",
          options: [
            "Telling a trusted friend first",
            "Keeping the relationship totally secret",
            "Sending photos of your bank card",
            "Sharing OTPs to prove honesty",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Scammers isolate you so no one talks you out of it. A trusted 'pause partner' who hears you say 'I met someone online' breaks that isolation.",
            incorrect: "Telling someone you trust is the strongest protection. Secrecy is what scammers rely on. An ally breaks the trance.",
          },
        },
      },
      {
        variantId: "ta-isolation-tf",
        step: {
          type: "true-false",
          statement: "Scammers often try to keep the relationship secret and isolate you from friends and family.",
          correct: true,
          feedback: {
            correct: "True. Isolation is deliberate, the fewer outside voices, the less chance someone spots the con. That push for secrecy is itself a warning sign.",
            incorrect: "It's true. Isolating you is part of the playbook, because outside perspective is what exposes the scam. Secrecy pressure is a red flag.",
          },
        },
      },
      {
        variantId: "ta-video-scenario",
        step: {
          type: "scenario",
          question: "You've met someone on a dating app. What's a sensible safety habit early on?",
          options: [
            "Video-call to confirm they are real",
            "Move to a secret chat and tell nobody",
            "Send money to show you're serious",
            "Share your OTPs to build trust",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Accountability to people you trust, plus proof they're real, beats secret intensity. And no genuine new connection needs your cash upfront.",
            incorrect: "Stay accountable: video-call, tell family, and refuse upfront money. Secret chats and early cash requests are how scams thrive.",
          },
        },
      },
    ],
  },
];

const lesson4Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Building Trust, Then an 'Emergency'",
    content:
      "<p>Fraudsters build trust over weeks (compliments, voice notes, shared playlists) then comes an 'emergency': customs holding a gift, a sick relative, software that needs a small activation fee. People in South Africa have lost cars, stokvel savings and study money this way. It is never the victim's fault for being kind.</p><p>Step back if anyone you've never met in person asks for e-wallet sends, airtime, gift-card codes or access to your banking app. A real partner respects a firm 'no'. And tell one trusted person before you send funds or share ID copies. Scammers isolate you, and an ally breaks the trance.</p>",
  },
  { slot: "scams-fraud/lesson-4/never-met-cash" },
  { slot: "scams-fraud/lesson-4/gift-cards" },
  { slot: "scams-fraud/lesson-4/boundaries" },
  { slot: "scams-fraud/lesson-4/tell-ally" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 5 · "Guaranteed Returns Red Flag"
// ═══════════════════════════════════════════════════════════════════════════

const lesson5Slots: QuestionSlot[] = [
  {
    slotId: "scams-fraud/lesson-5/guaranteed-scam",
    conceptId: "scam-red-flags",
    variants: [
      {
        variantId: "gs-mcq",
        step: {
          type: "mcq",
          question: "In the investment world, which phrase is the most reliable sign of a scam?",
          options: [
            "'Guaranteed returns' well above normal interest rates",
            "'Past performance is no guarantee of future results'",
            "'Your capital is at risk'",
            "'Fees apply'",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Guaranteed high returns are the classic scam signal. Real investments carry risk and can't promise a fixed return above the risk-free rate. Ponzi schemes are the only ones that 'guarantee' it.",
            incorrect: "'Guaranteed returns' is the red flag. Honest products warn about risk; scams promise certainty that doesn't exist.",
          },
        },
      },
      {
        variantId: "gs-impossible-tf",
        step: {
          type: "true-false",
          statement: "A legitimate investment can guarantee a fixed return far above prevailing interest rates.",
          correct: false,
          feedback: {
            correct: "Correct. It can't. Real returns above the risk-free rate come with risk. Anything 'guaranteeing' big fixed returns is paying early investors with later ones (a Ponzi).",
            incorrect: "It can't. Returns above the risk-free rate always carry risk. A 'guarantee' of big fixed returns is the definition of a Ponzi scheme.",
          },
        },
      },
      {
        variantId: "gs-riskfree-scenario",
        step: {
          type: "scenario",
          question: "Two products: one warns 'your capital is at risk', the other 'guarantees' 20% a year. Which is more likely legitimate?",
          options: [
            "The one that warns about risk",
            "The one guaranteeing a 20% return",
            "Whichever has the flashier advert",
            "Neither one can really be judged",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Counterintuitively, the risk warning is the trustworthy signal. Real providers must disclose risk; scammers sell false certainty.",
            incorrect: "The risk warning is the good sign. Honesty about risk marks a real product; a 'guarantee' of 20% marks a scam.",
          },
        },
      },
    ],
  },
  {
    slotId: "scams-fraud/lesson-5/report-not-invest",
    conceptId: "scam-red-flags",
    variants: [
      {
        variantId: "rn-mcq",
        step: {
          type: "mcq",
          question: "An 'opportunity' promises 15% guaranteed monthly returns with no risk. What should you do?",
          options: [
            "Report it to the FSCA and walk away",
            "Invest quickly before spots run out",
            "Invest a small amount to test it",
            "Ask friends whether to join in",
          ],
          correct: 0,
          feedback: {
            correct: "Right. 15% a month is about 180% a year, impossible legitimately. Report it to the FSCA (0800 110 443) and don't invest; even a 'test' amount funds the scam and is lost.",
            incorrect: "This is a textbook Ponzi. Don't invest a cent. Report it to the FSCA. A small 'test' just hands the scammer your money.",
          },
        },
      },
      {
        variantId: "rn-fill",
        step: {
          type: "fill-blank",
          title: "Annualise the pitch",
          prompt: "A scheme 'guarantees' 15% per month. As a simple yearly figure, 15 × 12 = ____%.",
          correct: 180,
          feedback: {
            correct: "Correct: 180% a year. No legitimate, risk-free investment produces that. It's a scam by the numbers.",
            incorrect: "15% × 12 = 180% a year. Impossibly high. A clear scam signal.",
          },
        },
      },
      {
        variantId: "rn-test-tf",
        step: {
          type: "true-false",
          statement: "Investing a small 'test' amount in a suspected scheme is a safe way to check if it's real.",
          correct: false,
          feedback: {
            correct: "Correct. It isn't safe. Early 'returns' are bait paid from other victims' money to lure a bigger deposit. Any amount you put in is likely gone.",
            incorrect: "It's not safe. Scams often pay small early 'returns' to build trust before you deposit more: then it all vanishes. Don't test it.",
          },
        },
      },
    ],
  },
  {
    slotId: "scams-fraud/lesson-5/fsca-register",
    conceptId: "scam-red-flags",
    variants: [
      {
        variantId: "fr-tf",
        step: {
          type: "true-false",
          statement: "You can verify whether an investment company is legally licensed in South Africa by checking the FSCA register.",
          correct: true,
          feedback: {
            correct: "True. The FSCA keeps a public register of licensed financial services providers at fsca.co.za. If a company isn't on it, don't invest with them.",
            incorrect: "It's true, the FSCA register (fsca.co.za) lists every licensed FSP. Not on the register means don't invest.",
          },
        },
      },
      {
        variantId: "fr-who-mcq",
        step: {
          type: "mcq",
          question: "Who must license a company that offers investment products to the public in South Africa?",
          options: [
            "The FSCA",
            "The local municipality",
            "The company itself, informally",
            "No one. Anyone can offer investments",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Public investment products must be handled by an FSCA-licensed provider. Check the FSP's licence on the FSCA register before you part with money.",
            incorrect: "It's the FSCA. Legitimate providers are licensed and appear on the FSCA register. Verify there before investing.",
          },
        },
      },
      {
        variantId: "fr-notlisted-scenario",
        step: {
          type: "scenario",
          question: "You check the FSCA register and the 'investment company' isn't on it. What does that mean?",
          options: [
            "It's not a licensed provider",
            "It's fine, they're probably just new",
            "The register must be wrong",
            "You should invest more to be sure",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Not on the register means not licensed to take your investment. That's a hard stop. Walk away, and consider reporting them.",
            incorrect: "Not being on the register is a hard no. Licensed providers are listed; if they're not, don't invest, and report if it looks like a scam.",
          },
        },
      },
    ],
  },
  {
    slotId: "scams-fraud/lesson-5/pressure-tactics",
    conceptId: "scam-red-flags",
    variants: [
      {
        variantId: "pt-mcq",
        step: {
          type: "mcq",
          question: "Alongside 'guaranteed returns', which tactic commonly signals an investment scam?",
          options: [
            "Pressure to act NOW before a 'window closes'",
            "A cooling-off period to think",
            "Clear, written terms",
            "An invitation to check the FSCA register",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Urgency stops you verifying. Guaranteed returns plus 'act now' is the scam combo; real providers are happy for you to take your time and check.",
            incorrect: "It's the urgency. 'Act now or miss out' exists to stop you checking. Legitimate offers give you time and welcome verification.",
          },
        },
      },
      {
        variantId: "pt-secrecy-tf",
        step: {
          type: "true-false",
          statement: "Being told to keep an 'investment opportunity' secret is a reason to trust it more.",
          correct: false,
          feedback: {
            correct: "Correct. It's the opposite. Secrecy stops others from warning you. Real investments don't need to be hidden; a push for secrecy is a red flag.",
            incorrect: "It's a warning, not reassurance. Secrecy keeps sensible outside voices away. Anything real can stand up to a second opinion.",
          },
        },
      },
      {
        variantId: "pt-sleep-scenario",
        step: {
          type: "scenario",
          question: "A 'once-in-a-lifetime' scheme won't let you sleep on it. What's the safe move?",
          options: [
            "Refuse to be rushed",
            "Commit tonight so you don't miss out",
            "Borrow to get in fast",
            "Recruit family before the window shuts",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Anything genuine survives a night's sleep and a check on the FSCA register. If it can't wait for that, it was never real.",
            incorrect: "Don't be rushed. A real opportunity survives verification and a night's sleep; pressure to skip that is the scam itself.",
          },
        },
      },
    ],
  },
];

const lesson5Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "No Investment Can Guarantee a Fixed Return",
    content:
      "<p>The phrase <strong>'guaranteed returns'</strong> is the most reliable sign of a scam in investing. Any product promising a fixed return well above the risk-free rate (a few percent, roughly in line with prevailing interest rates) is almost certainly fraudulent, because real returns above that come with real risk. Ponzi schemes 'guarantee' it by paying early investors with later investors' money, until they collapse.</p><p>How to check: any investment offered to the public must be run by an <strong>FSCA-licensed</strong> provider. Verify on the FSCA register at fsca.co.za before you invest a cent, and report suspected scams to the FSCA (0800 110 443).</p>",
  },
  { slot: "scams-fraud/lesson-5/guaranteed-scam" },
  { slot: "scams-fraud/lesson-5/report-not-invest" },
  { slot: "scams-fraud/lesson-5/fsca-register" },
  { slot: "scams-fraud/lesson-5/pressure-tactics" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 6 · "What to Do If Scammed"
// ═══════════════════════════════════════════════════════════════════════════

const lesson6Slots: QuestionSlot[] = [
  {
    slotId: "scams-fraud/lesson-6/act-fast",
    conceptId: "scam-recovery",
    variants: [
      {
        variantId: "af-mcq",
        step: {
          type: "mcq",
          question: "You notice money has left your account or an unauthorised debit appears. What's the first practical step?",
          options: [
            "Call your bank's fraud department",
            "Delete your banking app to hide it",
            "Send more money to reverse it",
            "Ignore it for the next 30 days",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The hour after you notice matters most. A fast call to the fraud line starts an investigation and can freeze downstream accounts before more is lost.",
            incorrect: "Call your bank's fraud line straight away and have channels blocked. Speed limits the damage; silence only helps the thief.",
          },
        },
      },
      {
        variantId: "af-speed-tf",
        step: {
          type: "true-false",
          statement: "Acting within the first hour of realising money moved wrongly can help freeze accounts and limit the damage.",
          correct: true,
          feedback: {
            correct: "True. Fast reporting doesn't guarantee your money back, but it can stop the funds moving further and protect others in the chain. Move quickly.",
            incorrect: "It's true. Quick action can freeze downstream accounts and reduce the loss. It's the single most useful thing you can do.",
          },
        },
      },
      {
        variantId: "af-shame-scenario",
        step: {
          type: "scenario",
          question: "Nomsa realises she's been scammed and feels too embarrassed to report it. What's the caring, practical truth?",
          options: [
            "Shame is normal but it delays reporting",
            "She should stay quiet to avoid embarrassment",
            "It's far too late, so she shouldn't bother",
            "She should blame herself first",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Scammers are skilled manipulators, being fooled isn't a character flaw. The kindest thing she can do for herself is report quickly, shame aside.",
            incorrect: "Embarrassment is understandable, but it only helps the thief. It's not her fault, and fast reporting is what protects her and others.",
          },
        },
      },
    ],
  },
  {
    slotId: "scams-fraud/lesson-6/keep-evidence",
    conceptId: "scam-recovery",
    variants: [
      {
        variantId: "ke-tf",
        step: {
          type: "true-false",
          statement: "Keeping SMSes, emails and proof of payment helps investigators, even if getting your money back is uncertain.",
          correct: true,
          feedback: {
            correct: "True. Evidence supports your bank dispute and any police case. Organise it calmly. Don't delete chats in frustration, as that can weaken your case.",
            incorrect: "It's true. Records support disputes and police work. Keep the messages and proof of payment rather than deleting them in anger.",
          },
        },
      },
      {
        variantId: "ke-what-mcq",
        step: {
          type: "mcq",
          question: "What should you gather after a scam?",
          options: [
            "Screenshots and proof of payment",
            "Nothing, just try to forget about it",
            "Only the scammer's first name given",
            "A public social media post naming them",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Save the paper trail. Chats, emails, payment proof, references. It's what your bank and SAPS need. Avoid public 'shaming' posts, which tip off the criminal.",
            incorrect: "Gather the evidence: chats, emails, payment proof and reference numbers. Public revenge posts help the scammer, not your case.",
          },
        },
      },
      {
        variantId: "ke-noshame-scenario",
        step: {
          type: "scenario",
          question: "Tempted to publicly post the scammer's details to warn others, what's the better first move?",
          options: [
            "Report to your bank and SAPS first",
            "Post everything online for revenge",
            "Delete all of the evidence",
            "Do nothing at all about it",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Formal reports (bank, SAPS, and the relevant platform's abuse team) do more than a revenge post, and posting can warn the scammer to cover their tracks.",
            incorrect: "Report to your bank and SAPS with the evidence first. A public post feels satisfying but can tip off the criminal and hurt the investigation.",
          },
        },
      },
    ],
  },
  {
    slotId: "scams-fraud/lesson-6/report-saps",
    conceptId: "scam-recovery",
    variants: [
      {
        variantId: "rs-mcq",
        step: {
          type: "mcq",
          question: "For some recovery and dispute processes, you may need a:",
          options: [
            "SAPS case number from opening a police case",
            "Post on a community group",
            "Screenshot of your own bank balance only",
            "Letter from the scammer",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Opening a case with SAPS gives you a case number that some banks and insurers require to process a claim or dispute. Do it early.",
            incorrect: "You'll often need a SAPS case number. Open a police case, some recovery and dispute paths won't proceed without it.",
          },
        },
      },
      {
        variantId: "rs-landlord-scenario",
        step: {
          type: "scenario",
          question: "You paid a deposit to a fake landlord who's now vanished. Besides your bank, who else should you notify quickly?",
          options: [
            "SAPS and the listing platform",
            "Nobody, just hope it works out",
            "Only your ex-partner",
            "The scammer's own family",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A SAPS case reference supports any recovery, and the listing platform's abuse team can pull the ad and warn the next victim. Both help beyond your bank.",
            incorrect: "Report to SAPS (for a case number) and the platform that hosted the fake listing. Those official routes do more than informal ones.",
          },
        },
      },
      {
        variantId: "rs-ombud-tf",
        step: {
          type: "true-false",
          statement: "It's worth asking your bank which ombudsman or regulator handles disputes for your specific product type.",
          correct: true,
          feedback: {
            correct: "True. If the bank doesn't resolve it fairly, the right ombudsman (e.g. the National Financial Ombud for banking) can help. Free of charge. Ask which one applies.",
            incorrect: "It's true, knowing the right ombudsman or regulator for your product gives you a free escalation route if the bank won't resolve it.",
          },
        },
      },
    ],
  },
  {
    slotId: "scams-fraud/lesson-6/be-prepared",
    conceptId: "scam-recovery",
    variants: [
      {
        variantId: "bp-mcq-scam",
        step: {
          type: "mcq",
          question: "What's a simple way to be ready to act fast if you're ever defrauded?",
          options: [
            "Save the fraud line and SAPS now",
            "Wait until it happens to look them up",
            "Memorise nothing at all and just hope",
            "Rely on a public Facebook group only",
          ],
          correct: 0,
          feedback: {
            correct: "Right. In a panic you won't want to be searching. Store your bank's fraud number and SAPS 10111 today so you can react in seconds when it counts.",
            incorrect: "Save the numbers now. Your bank's fraud line and SAPS 10111. Being prepared when calm means you act fast when stressed.",
          },
        },
      },
      {
        variantId: "bp-practice-tf",
        step: {
          type: "true-false",
          statement: "Knowing in advance who to call turns a panicked scramble into quick, effective action.",
          correct: true,
          feedback: {
            correct: "True. Preparation is protection. When money moves wrongly, seconds count, and a saved contact labelled 'Fraud' removes the delay of searching.",
            incorrect: "It's true: deciding who to call before a crisis means you move fast when it matters. Save those numbers today.",
          },
        },
      },
      {
        variantId: "bp-passwords-scenario",
        step: {
          type: "scenario",
          question: "Right after realising your banking details may be compromised, alongside calling the bank you should:",
          options: [
            "Change passwords from a safe device",
            "Post your new password",
            "Reuse the same password everywhere",
            "Do nothing until next month",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Lock the doors behind you: change compromised passwords/PINs from a device you trust, so the criminal can't get back in while the bank investigates.",
            incorrect: "Change the affected passwords and PINs from a safe device, alongside calling the bank. It stops the criminal reusing them.",
          },
        },
      },
    ],
  },
];

const lesson6Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Speed and a Paper Trail",
    content:
      "<p>The hour after you realise money moved wrongly matters most. Call your bank's fraud line, change your passwords from a safe device, and gather references. Open a case with SAPS (10111) if theft occurred. Some recovery paths need a case number. Keep chats, emails and proof of payment for investigators; avoid public 'shaming' posts that tip off the criminal.</p><p>Expect emotions, shame delays reporting, but being scammed isn't your fault; fraudsters are skilled manipulators. Acting fast can't guarantee your money back, but it can freeze downstream accounts and protect others. Follow your bank's affidavit process, and ask which ombudsman or regulator handles your product type.</p>",
  },
  { slot: "scams-fraud/lesson-6/act-fast" },
  { slot: "scams-fraud/lesson-6/keep-evidence" },
  { slot: "scams-fraud/lesson-6/report-saps" },
  { slot: "scams-fraud/lesson-6/be-prepared" },
];

export const SCAMS_FRAUD_BANKS: Record<string, LessonBank> = {
  "scams-fraud::lesson-1": { layout: lesson1Layout, slots: lesson1Slots },
  "scams-fraud::lesson-2": { layout: lesson2Layout, slots: lesson2Slots },
  "scams-fraud::lesson-3": { layout: lesson3Layout, slots: lesson3Slots },
  "scams-fraud::lesson-4": { layout: lesson4Layout, slots: lesson4Slots },
  "scams-fraud::lesson-5": { layout: lesson5Layout, slots: lesson5Slots },
  "scams-fraud::lesson-6": { layout: lesson6Layout, slots: lesson6Slots },
};
