# Deploying the Notho rebrand

Branch `rebrand/notho`, 5 commits ahead of `main`.

Two bugs the rename introduced were caught and fixed before release. Both are
worth understanding, because the first one is the reason you cannot just merge
and forget about it.

---

## Read this first: what nearly went wrong

**localStorage.** The rename renamed 39 storage keys, `fundi-*` to `notho-*`.
Every existing user's data lives under the old names. On first load after deploy
they would have read empty `notho-*` keys and looked like brand new users:
pushed back through onboarding, streak and hearts and saved goal all gone. Worst
of it, XP sitting unsynced in `fundi-pending-streak-sync` would have been
orphaned — genuinely lost, not just hidden.

Fixed by a blocking inline script in `<head>` that copies the whole `fundi-`
keyspace across before hydration. It is non-destructive, so a rollback to a
pre-rebrand build still finds the old keys.

**Service worker.** `CACHE_PREFIX` changed too, and the activate handler purges
by prefix, so old `fundi-static-4` caches would have been stranded on every
install forever. Fixed with `LEGACY_CACHE_PREFIXES`; `SW_VERSION` is now 5.

---

## Deploy

### 1. Verify locally

```bash
git checkout rebrand/notho
npm run test:unit          # includes the new storage-migration cases
npm run build
```

Both are clean here except that `vitest` and `next build` cannot run in the
sandbox this work was done in, so **your local run is the real gate.**

### 2. Merge and push

```bash
git checkout main
git merge --no-ff rebrand/notho -m "Rebrand: Fundi Finance -> Notho"
git push origin main
```

`main` was 3 commits ahead of `origin/main` before this work, so that push
carries those too.

Vercel deploys from `main` on push. Nothing else to run.

### 3. Verify on production

In order. The first two are the ones that matter.

**Storage migration.** Open the live site in a browser that already has the old
app, or fake it in DevTools console *before* loading the new build:

```js
localStorage.setItem('fundi-onboarded','true');
localStorage.setItem('fundi-hearts','5');
localStorage.removeItem('notho-storage-migrated');
```

Reload, then:

```js
localStorage.getItem('notho-onboarded');        // "true"
localStorage.getItem('notho-storage-migrated'); // count of keys it saw
```

If `notho-onboarded` is null, stop and roll back — existing users are being
pushed through onboarding.

**Service worker.** DevTools > Application > Service Workers: version should be
`notho-static-5`. Under Cache Storage, no `fundi-*` entries should remain after
the new worker activates. Note the app waits for a `SKIP_WAITING` message rather
than activating immediately, so you may need to reload twice.

**The rest:** favicon and tab title, sidebar logo, `/privacy` and `/terms` naming,
budget report chart (Housing and Education should now be clearly different
colours), dark mode primary is teal not green.

---

## Sending the announcement

**The email does not send itself.** `/api/admin/broadcast` is not on any cron —
`vercel.json` only schedules `/api/cron/lifecycle` and `/api/cron/push-triggers`.
The 21 July 08:00 SAST time is passed to Resend as `scheduled_at`, but Resend
never hears about it until you POST. If you skip this step, nothing goes out.

Deploy first. An email announcing a rebrand that users cannot yet see is worse
than one sent a day late.

You must be signed in as an admin; the route checks the `is_admin` DB flag or
`ADMIN_EMAILS`. From the browser console on the live site:

```js
// 1. Dry run. Sends nothing, returns the recipient count.
await fetch('/api/admin/broadcast', {
  method: 'POST', headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({ dryRun: true })
}).then(r => r.json());

// 2. Send one to yourself and actually read it.
await fetch('/api/admin/broadcast', {
  method: 'POST', headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({ test: true, testEmail: 'you@example.com' })
}).then(r => r.json());

// 3. Schedule the real send.
await fetch('/api/admin/broadcast', {
  method: 'POST', headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({ dryRun: false, confirm: true })
}).then(r => r.json());
```

Preview the rendered HTML any time at `/api/admin/broadcast?preview=1`.

The campaign key is `rebrand-notho`, and the dedupe ledger is keyed on it, so
nobody can be double-sent even if you run step 3 twice.

To move the date, pass `scheduledAt` as an ISO string, or edit
`DEFAULT_SCHEDULED_AT` in the route. **It must be in the future when you POST** —
the previous value had gone stale and would have been rejected.

---

## Renaming things

There are four separate names, and they are independent. Only one has already
changed.

| What | Now | Changes it |
|---|---|---|
| `package.json` name | `notho` | done, in this branch |
| Local folder | `fundi-finance` | you, in Finder or `mv` |
| GitHub repo | `fundi-finance` | GitHub > Settings > Rename |
| Vercel project | check dashboard | Vercel > Settings > Project Name |

### Local folder — safe, with two caveats

Git does not care what the containing folder is called. Nothing in `.git`,
your remote, or `.vercel/project.json` (which links by project ID, not path)
depends on it.

```bash
cd ~/Developer
mv fundi-finance notho
cd notho
rm -rf .next node_modules/.cache      # these cache absolute paths
npm run build                          # confirm it still builds
```

Two things to know:

1. **`.next` caches absolute paths.** Skip the `rm -rf` and you may get strange
   stale-path build errors. `node_modules` itself is usually fine — the `.bin`
   symlinks are relative — but if anything misbehaves, `rm -rf node_modules &&
   npm ci` settles it.
2. **Do it when no tool has the folder open.** Any editor window, terminal
   sitting in the old path, or connected assistant session is pointing at a
   path that no longer exists. Close them first, reopen after.

### GitHub repo

GitHub redirects the old URL indefinitely after a rename, including for git
remotes, so nothing breaks immediately. Update it anyway so it does not quietly
depend on a redirect:

```bash
git remote set-url origin git@github.com:KwaneleNtshangase/notho.git
git remote -v
```

Vercel's GitHub integration follows the rename automatically.

### Vercel project

Renaming changes your `*.vercel.app` preview URL. Your production custom domain
is unaffected. Do this whenever — it has nothing to do with the code.

### Suggested order

1. Deploy and verify (above).
2. Send the announcement.
3. Rename the GitHub repo, update the remote.
4. Rename the local folder.
5. Rename the Vercel project.

Renames last. If something needs rolling back, you want the paths and URLs you
already know still working.

---

## Rollback

Revert the merge and push:

```bash
git revert -m 1 <merge-sha>
git push origin main
```

The storage migration is non-destructive, so users who already loaded the new
build still have their `fundi-*` keys and land back on their data. The service
worker is the slow part: clients on `notho-static-5` need the reverted worker to
activate, which takes a reload or two.

---

## Still open

- **The mascot still says FUNDI on her uniform.** `docs/COSMO-ILLUSTRATOR-BRIEF.md`.
- **`fundiapp.co.za` is untouched on purpose.** Migration order is in
  `docs/REBRAND-NOTHO.md`. Do not change the sending domain in the same week as
  the name.
- **Possible live `fundi_user_*` usernames** in the database:
  `select count(*) from profiles where username like 'fundi%';`
- **`--color-danger` is 4.32:1**, under AA. Pre-existing. `#D6342A` fixes it.
