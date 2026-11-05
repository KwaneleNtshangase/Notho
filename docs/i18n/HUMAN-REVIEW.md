# Review Notho in your language

Start with one fluent speaker and a learner who uses that language day to day. Give them their language's offline worksheet and the same lesson on a phone. Ask the learner what the instruction means, which answer they would choose and how they would say it to a friend. Read the answer and its feedback together. Keep a familiar loanword when learners understand it better than a formal alternative.

The worksheets include the English phrase, current wording, source location and reason for review. Start with a named reviewer's corrections in one short lesson. Check them with a second speaker before extending the same terminology to the rest of that course. Review money, legal duties and privacy promises with someone who understands the subject as well as the language. Keep a short shared glossary of agreed terms and a sentence illustrating each one. A glossary headword on its own does not verify a translated sentence.

1. Check the first money-basics lesson in every language, including answer choices and feedback. In the preserved isiZulu opening paragraph, check the negation in the explanation of why money has value. In Xitsonga, check the three zero-based budgeting phrases about allocating, saving and spending. In Setswana, check download, deletion and notification wording in Settings.
2. Check the Xitsonga title for Credit & Debt. The title uses English until a reviewer approves wording that distinguishes access to credit from outstanding debt.
3. Check account deletion and download, masked session recording and opting out, public usernames, age restrictions and account recovery. The user should be able to predict exactly what the control does.
4. Check tax amounts and dates, advice versus education, credit and interest, insurance exclusions, retirement risks, answer negation and the secured RE5 explanations. Compare the figures and the correct answer with the English lesson. Flag problems in the English curriculum separately.
5. Review remaining English fallbacks before the wider catalog. A few entries are internal identifiers, abbreviations or terms naturally shared with English. Confirm them in context before treating them as missing translations.
6. Listen to a native device voice on the phones learners use. Confirm the brand sounds like “Notto” and that questions sound natural. Availability varies by language and device.
7. Plan SASL separately with Deaf South African signers. Start with one signed lesson and its questions, record reviewed videos, add captions and playback controls, and test comprehension with Deaf learners.

## Return corrections

Enter the reviewer's name and date in the offline worksheet. Edit the phrase, check the box only after reviewing it in context, and download the checked approvals. Download before closing the page. Use “Save all worksheet edits” to save an unfinished session. To reopen those saved edits, use them as the JSON input to the worksheet command below. Keep secured exam files with the people authorised to review the exam bank.

From the release checkout, validate a returned public file with:

```sh
npm run i18n:import -- --file /path/to/notho-tn-approved.json
```

For an exam review, add `--private`. To apply a successful validation, repeat the command with `--apply`. The importer makes a backup and protects earlier approvals. Changed English sources and invalid figures, placeholders and markup must be reconciled before import.

To create a fresh worksheet, use new output filenames. The export includes the full catalog. The HTML opens on the fallback and priority phrases. Add `--all` to include the whole export in the HTML.

```sh
npm run i18n:export -- --locale tn --out /tmp/notho-tn-full.json
node scripts/i18n-review-page.mjs --file /tmp/notho-tn-full.json --out /tmp/notho-tn-review.html
```

Keep every language marked under review until its reviewers have actually approved the wording. [Sources and verified terminology](SOURCES.md) records which terms have documentary support.
