# Notho Question Voice & Quality Guide

The bar for every question in the bank. If a variant fails any of the "non-negotiables", it doesn't ship. This exists so 3,000+ questions read like one sharp South African finance teacher wrote them — not like a model filled a template.

## The one-line test
Read the question aloud. If it sounds like a textbook, a quiz-app filler, or a chatbot, rewrite it. It should sound like a smart friend who happens to know money explaining it at a kitchen table in Soweto, Durban, or Cape Town.

## Non-negotiables (every question)
1. **Concrete over abstract.** Use real rands, real products, real institutions. "R2 300 in a Capitec cheque account" beats "some money in a bank account".
2. **South African by default.** SARS, SARB, JSE, TFSA (R46k/yr, R500k lifetime), two-pot, RA, UIF, stokvel, Capitec/FNB/TymeBank, load-shedding budgets, black tax. Never "401(k)", "IRS", "$".
   **Always check a figure against `docs/SA-REGULATORY-FIGURES.md` before you use it** — that file is the single source of truth and it moves.
3. **A person, a situation, a consequence.** The best questions put a named person in a decision with a cost. "Thabo earns R80k/month and spends it all — SARS bills him R280k. What should he have done?" No floating definitions.
4. **One idea per question.** If a learner could get it wrong for two different reasons, split it.
5. **Distractors are plausible and diagnostic.** Each wrong option should be a real misconception, not filler. "Making you happy" as a function of money works because it's a tempting wrong answer. "Purple" does not. Never include joke options, "all/none of the above", or an option that's obviously longest = correct.
6. **Feedback teaches, doesn't just judge.** `incorrect` names the specific misconception and corrects it; `correct` reinforces *why*, adds one new nugget. Both 1–2 sentences. Never "Correct!"/"Wrong." alone.
7. **Numbers are real and checkable.** If you use figures, the maths must be right and the answer should be computable in-head or with the stated method. Show the arithmetic in the feedback.

## Lesson size (hard rule)
Every lesson shows **more than 3 questions** — at least 4 answerable slots, everywhere in the app. A bank lesson therefore needs ≥4 slots (each with its own variant pool); a legacy lesson needs ≥4 question steps. This is enforced by `src/data/__tests__/contentQuality.test.ts` ("every lesson has more than 3 questions"), which fails the build-time test suite if any lesson falls short.

## Variants within a slot
- **Same objective, different surface.** All variants in a slot teach the same concept, but change the scenario, the person, the numbers, and the angle — not just synonyms. Three rephrasings of one sentence is exactly the "AI laziness" to avoid.
- **Difficulty may vary** across variants (that's allowed now). What must stay constant is the *concept* being tested.
- **Rotate question type** where natural: an mcq, a true/false, and a fill-blank on the same idea make a stronger slot than three mcqs.
- **Vary the correct-answer position** in the source (the app also shuffles options, but don't lean on it).

## Banned tells (auto-reject)
- "In today's fast-paced world", "It's important to note", "Let's dive in", "Remember:", "Simply put".
- Rule-of-three padding: "budgeting, saving, and investing" everywhere.
- Em-dash pile-ups and one-sentence "reveal" feedback.
- Generic names only (Person A). Use SA names: Nomsa, Sipho, Lerato, Thabo, Ayesha, Johan, Priya.
- Options that are all the same length and structure (a giveaway it's generated).
- Explaining the answer inside the question stem.

## Worked example (money, one slot, three variants)
**Concept: inflation erodes cash.**
- *v1 (mcq):* "Inflation is about 5%. You keep R1 000 as cash for a year. What's true?" → correct: "It still says R1 000 but buys about R950 worth of goods." Distractors: "grows to R1 050" (confuses inflation with interest), "loses R50 you can see" (thinks rands vanish).
- *v2 (true/false):* "Your salary went up 4% but inflation was 6%. You can afford more this year." → False; feedback does the 4−6 = −2% real cut.
- *v3 (fill-blank):* "R20 000 sits in cash for a year while inflation runs at 5%. In today's buying power it is worth about R____." → 19000.

Three angles, one idea, no repetition, all unmistakably SA.

**Note on fill-blanks:** answers are marked correct within a **±10% tolerance**
(`LessonView.tsx`). That makes percentages useless as answers — "6" would accept
anything from 5.4 to 6.6, and "10.5" would accept 9.45 to 11.55. Use **rand
amounts**, where a 10% band still discriminates properly. (The old version of this
example asked for the top of the SARB's "3–6% band"; that target has since been
replaced by a **3% point target ±1pp**, which is exactly the kind of drift a
percentage answer invites.)
