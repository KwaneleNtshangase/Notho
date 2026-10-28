# Mock question security and answer-quality safeguards

## What the audit found

Before this change, both RE5 mock papers were ordinary client-side lessons.
Question banks, correct indices and both feedback strings were imported into the
browser bundle. The browser selected variants, shuffled options, decided whether
an answer was correct, displayed feedback immediately and calculated the final
mark. A learner did not need to take a screenshot to recover the key: browser
developer tools or the downloaded JavaScript were enough.

The existing shuffle was deterministic per learner and lesson. It was stable on
resume, but not persisted as a server-owned attempt and did not change on a
retake in the way an exam paper should.

## Implemented boundary

The two RE5 mock lessons now ship only titles and the public count of 50
questions. The actual mock banks are imported exclusively by a `server-only`
module.

Starting a mock requires a valid Supabase bearer session. The API resumes the
learner's one in-progress paper, reopens the latest submitted report when no
retake was requested, or creates a new `mock_attempts` row. Variant
selection, opaque option IDs and Fisher-Yates option order are generated once on
the server and persisted in normalized `mock_attempt_questions` rows. Those
private rows include the correct opaque option ID and explanation. Direct table
access is not part of the learner contract: authenticated clients use the API's
allow-listed projection, while service-role code owns reads and mutations.

The server owns the fixed expiry timestamp and all attempt state. Answer,
answer-clear, flag and view mutations are authenticated, ownership-checked and
idempotent. Refreshing or changing devices resumes the persisted paper and
timer; it does not select a fresh variant or reset the clock. The mock flow does
not use lesson hearts, so there is no client-side mock-heart counter to bypass.

The active-attempt response is an explicit allow-list projection containing:

- attempt metadata and a learner-specific watermark;
- question ID, number and prompt; and
- opaque option ID, neutral A-D display label and option text.

It does not contain authored slot/variant IDs, correct option IDs, correctness,
knowledge-area attribution or feedback/explanations. Options are normalised to
remove authored `A)`, `Option B:` and `[correct]`/`(answer)` markers before the
neutral labels are assigned.

Learner submission is gated until every question has been viewed. Answers may
still be cleared deliberately; unanswered questions score zero and are reported
as unanswered rather than being silently discarded. The server re-loads the
owned attempt, validates saved opaque option IDs, grades it and transactionally
changes its status from `in_progress` to `submitted`. Crossing the fixed expiry
uses the same server submission path. Repeated or concurrent submissions cannot
re-grade a submitted attempt. The immutable lesson result and private normalized
question rows are written only from that server-validated result. Authored IDs
are not copied into the learner-readable legacy `question_attempts` table.

Only a submitted, owned attempt receives grading data. Review responses contain
the selected and correct option IDs but no explanation text. Each explanation
has a separate authenticated endpoint that checks submitted status and
ownership, then returns one explanation on demand.

## Operational controls

Protected routes use account-scoped, database-backed rolling rate checks. Their
events are recorded in `mock_exam_audit_log`, along with outcome, attempt where
owned, request ID, user agent and an optional salted hash of the source address.
Set `MOCK_AUDIT_HASH_SECRET` to enable that hash; raw IP addresses are not
stored. Audit-table failure fails the rate-limit check closed.
Repeated 429 responses are deduplicated to one audit event per learner, action
and fixed rate window, so rejection traffic cannot amplify audit-table growth.

The mock and review screens show the signed-in learner identity plus a short
attempt reference in a visible header and repeated watermark. Within those
screens the app suppresses ordinary context-menu, copy/cut, text selection,
dragging, common copy/print/save shortcuts and printable page content. There is
no mock export action. These controls are deliberately scoped to mock/review
content so they do not degrade normal lessons.

All protected responses use `private, no-store`, `no-referrer` and `nosniff`
headers.

Automated guards check that:

- the client content registry and client lesson-bank registry contain no mock
  questions;
- active responses redact correctness, explanations and authoring identifiers;
- private manifests contain 50 validated, uniquely identified questions;
- the correct authored option is distributed approximately evenly across A-D
  over many seeded shuffles; and
- authored question numbers, option labels and answer markers are removed.

## Remaining limitations

This design reduces casual extraction and removes the answer key from active
browser state. It cannot make displayed content secret.

- A screenshot, screen recording, external camera, OCR or manual transcription
  cannot be blocked reliably by a web or mobile UI. The visible watermark adds
  attribution and deterrence, not prevention.
- A learner can inspect and automate their own authenticated question-delivery
  requests. Rate limits raise the cost; they do not stop slow collection,
  multiple genuine accounts, account sharing or collusion.
- Every question and option needed for the active paper must exist in that
  learner's browser while it is displayed. The answer key and explanations do
  not, but question text can still be copied by custom scripts or accessibility
  tooling despite normal selection/copy controls.
- Once an attempt is submitted, its answer key is intentionally available for
  review. Explanations are fetched individually, but a learner can request all
  of them within the applicable rate window over time.
- Watermarks can be cropped, obscured or edited. They are not forensic DRM.
- Account-scoped audit-count rate limiting is durable across app instances but
  is not a perfectly atomic global quota under a burst of concurrent requests.
  A transactional database function or managed rate-limit service would be the
  next hardening step if abuse data justifies it.
- The service-role key remains a critical secret. It must stay server-only and
  be rotated and monitored under the normal incident process.
- Audit retention, alert thresholds and staff review procedures still need an
  explicit operational policy. Logging without review is evidence, not active
  detection.
- The ordered migration `20260901140000_re5_mock_attempts.sql` must be reviewed
  and applied before this code is released. Until then the protected endpoints
  fail closed because their storage and audit controls do not exist.

Browser restrictions must never be described to learners or stakeholders as a
guarantee that screenshots, copying or answer sharing are impossible.
