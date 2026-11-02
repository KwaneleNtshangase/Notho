import { test, expect } from '@playwright/test';
import { createClient, type Session } from '@supabase/supabase-js';
import { LOCALES, LOCALE_NAMES } from '../src/i18n/locales';
import { translate } from '../src/i18n/messages';
import { TEST_EMAIL, TEST_PASSWORD } from './helpers';
import fs from 'node:fs';
import { installCatalog } from '../src/i18n/catalog';
import { localizeString } from '../src/i18n/stringZu';
import catalogManifest from '../src/i18n/catalogManifest.json';

for (const [locale, url] of Object.entries(catalogManifest.urls)) installCatalog(locale, JSON.parse(fs.readFileSync(`public${url}`, 'utf8')));

test.afterEach(async ({ page }) => {
  await page.unrouteAll({ behavior: 'ignoreErrors' });
});

async function noOverflow(page: import('@playwright/test').Page) {
  const layout = await page.evaluate(() => ({
    fits: document.documentElement.scrollWidth <= window.innerWidth + 1,
    width: window.innerWidth,
    overflow: [...document.querySelectorAll('body *')].filter(el => el.getBoundingClientRect().right > window.innerWidth + 1)
      .slice(0, 12).map(el => ({ tag: el.tagName, class: el.getAttribute('class'), width: el.getBoundingClientRect().width })),
  }));
  expect(layout.fits, JSON.stringify(layout)).toBe(true);
}

test('all languages, persistence, accessible sign-in and English recovery', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/learn');
  const selector = page.getByRole('combobox');
  await expect(selector).toHaveValue('en');
  await expect(page.getByRole('complementary', { name: 'Translation status' })).toHaveCount(0);
  await expect(selector.locator('option')).toHaveCount(11);
  await expect(selector.locator('option[value=en]')).toHaveText('English');
  for (const locale of LOCALES.filter(code => code !== 'en')) {
    await selector.selectOption(locale);
    await expect(page.locator('html')).toHaveAttribute('lang', `${locale}-ZA`);
    await expect(selector.locator(`option[value=${locale}]`)).toHaveText(`${LOCALE_NAMES[locale]} (under review)`);
    await expect(page.getByRole('complementary', { name: localizeString(locale, 'Translation status') })).toContainText('(under review)');
    await expect(page.getByRole('button', { name: translate(locale, 'auth.createAccount'), exact: true })).toBeVisible();
    await expect(page.getByText('About these translations', { exact: true })).toHaveCount(0);
    await expect(page.getByText(translate(locale, 'settings.draftNotice'), { exact: true })).toHaveCount(0);
    await noOverflow(page);
  }
  await page.reload();
  await expect(selector).toHaveValue('ts');
  await selector.selectOption('af');
  await page.getByRole('button', { name: 'Meld aan', exact: true }).click();
  await expect(page.locator('input[type=email]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Wys wagwoord', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Wys wagwoord', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Versteek wagwoord', exact: true })).toBeVisible();
  await noOverflow(page);
  await page.screenshot({ path: testInfo.outputPath('afrikaans-signin.png'), fullPage: true });
  await page.getByRole('button', { name: 'Switch to English', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-ZA');
  await expect(page.getByRole('complementary', { name: 'Translation status' })).toHaveCount(0);
  await expect(selector).toHaveValue('en');
  expect(errors).toEqual([]);
});

test('translation feedback captures context locally and dialog supports Escape', async ({ page }) => {
  await page.goto('/learn');
  await page.getByRole('combobox').selectOption('af');
  await page.getByRole('button', { name: 'Rapporteer ’n vertaling'.replace('’', "'") }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await page.getByLabel(localizeString('af', 'Phrase shown')).fill('Leer');
  await page.getByLabel(localizeString('af', 'Suggested correction or explanation (optional)')).fill('Test feedback only');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: localizeString('af', 'Download feedback'), exact: true }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const report = JSON.parse(Buffer.concat(chunks).toString());
  expect(report).toMatchObject({ locale: 'af', screen: '/learn', phrase: 'Leer', source: 'Learn', key: 'messages:nav.learn', status: 'needs-review' });
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('button', { name: "Rapporteer 'n vertaling" })).toBeFocused();
});

test('invalid saved locale falls back to English', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('notho-locale', 'sasl');
    document.cookie = 'notho_locale=tn;path=/';
  });
  await page.goto('/learn');
  await expect(page.getByRole('combobox')).toHaveValue('en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-ZA');
  await expect.poll(() => page.evaluate(() => document.cookie.split('; ').find(value => value.startsWith('notho_locale=')))).toBe('notho_locale=en');
});

test('unavailable bulk pack retains usable navigation and English recovery', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/locales/*.json', route => route.fulfill({ status: 503, body: 'Unavailable' }));
  await page.goto('/learn');
  await page.getByRole('combobox').selectOption('af');
  await expect(page.getByRole('button', { name: translate('af', 'auth.createAccount'), exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Switch to English', exact: true }).click();
  await expect(page.getByRole('combobox')).toHaveValue('en');
  expect(errors).toEqual([]);
});

test('restricted storage does not crash language switching', async ({ page }) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) { if (key === 'notho-locale') throw new DOMException('Restricted', 'SecurityError'); original.call(this, key, value); };
  });
  await page.goto('/learn');
  await page.getByRole('combobox').selectOption('xh');
  await expect(page.locator('html')).toHaveAttribute('lang', 'xh-ZA');
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await expect(page.getByRole('combobox')).toHaveValue('en');
});

test('authenticated settings, navigation, course and lesson screens', async ({ page }, testInfo) => {
  test.setTimeout(240_000);
  await page.addInitScript(() => {
    let voices = [{ name: 'English test voice', lang: 'en-ZA', default: true, localService: true, voiceURI: 'en-test' }];
    // Installed system voices survive navigation, including the first service
    // worker activation reload. Keep the mock consistent with that behaviour.
    const installed: string[] = JSON.parse(sessionStorage.getItem('notho-test-voice-languages') || '[]');
    voices.push(...installed.map(lang => ({ name: `${lang} test voice`, lang, default: false, localService: true, voiceURI: lang })));
    const synth = new EventTarget();
    Object.assign(synth, {
      getVoices: () => voices,
      cancel: () => window.dispatchEvent(new Event('speech-cancelled')),
      speak: (utterance: { text: string; lang: string; voice: { lang: string } }) => {
        document.documentElement.dataset.spoken = JSON.stringify({ text: utterance.text, lang: utterance.lang, voice: utterance.voice.lang });
      },
    });
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: synth });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: class { constructor(public text: string) {} } });
    window.addEventListener('test-add-voice', event => {
      const lang = (event as CustomEvent<string>).detail;
      voices = [...voices, { name: `${lang} test voice`, lang, default: false, localService: true, voiceURI: lang }];
      if (!installed.includes(lang)) installed.push(lang);
      sessionStorage.setItem('notho-test-voice-languages', JSON.stringify(installed));
      synth.dispatchEvent(new Event('voiceschanged'));
    });
    localStorage.setItem('notho-tts-voice-key', 'English test voice||en-ZA');
  });

  const url = process.env.TEST_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  test.skip(!url || !anonKey, 'Existing test-account credentials unavailable');
  const client = createClient(url!, anonKey!, { auth: { persistSession: false, autoRefreshToken: false } });
  // Sign in to the existing test account using the repository's established
  // test credentials. No account creation or administrative changes.
  const { data, error } = await client.auth.signInWithPassword({ email: TEST_EMAIL, password: TEST_PASSWORD });
  if (error || !data.session) throw new Error(`Existing E2E sign-in failed (${error?.status ?? 'no session'}).`);
  const session: Session = data.session;
  const key = `sb-${new URL(url!).hostname.split('.')[0]}-auth-token`;
  await page.addInitScript(({ key, session }) => {
    localStorage.setItem(key, JSON.stringify(session));
    if (!localStorage.getItem('notho-locale')) localStorage.setItem('notho-locale', 'en');
  }, { key, session });
  // Preferences are exercised locally; never change the shared test account's language.
  await page.route('**/auth/v1/user', async route => {
    if (route.request().method() === 'PUT') await route.fulfill({ json: { ...session.user, user_metadata: { ...session.user.user_metadata, ...route.request().postDataJSON()?.data } } });
    else await route.continue();
  });
  // Each viewport starts the same lesson. Cross-device resume data from the
  // shared account must neither move this test forward nor be changed by it.
  await page.route('**/rest/v1/user_progress?*', async route => {
    if (route.request().method() !== 'GET') return route.continue();
    const response = await route.fetch().catch(() => null);
    if (!response) { await route.abort().catch(() => {}); return; }
    const body = await response.json();
    const clearResume = (row: Record<string, unknown>) => ({ ...row, lesson_resume: null });
    await route.fulfill({ response, json: Array.isArray(body) ? body.map(clearResume) : body ? clearResume(body) : body });
  });
  await page.route('**/rest/v1/rpc/merge_lesson_resume', route => route.fulfill({
    json: { ok: true, resume: route.request().postDataJSON()?.p_resume ?? null },
  }));
  await page.route('**/rest/v1/rpc/apply_progress_delta', async route => {
    const response = await route.fetch().catch(() => null);
    if (!response) { await route.abort().catch(() => {}); return; }
    const body = await response.json();
    await route.fulfill({ response, json: body ? { ...body, lesson_resume: null } : body });
  });
  await page.goto('/settings', { waitUntil: 'domcontentloaded' });
  const selector = page.getByRole('combobox').filter({ has: page.locator('option[value=af]') });
  await expect(selector).toBeVisible({ timeout: 60_000 });
  await page.getByRole('button', { name: 'Test voice', exact: true }).click();
  expect(await page.locator('html').getAttribute('data-spoken')).toBe(JSON.stringify({ text: 'This is how Notto will read lessons to you.', lang: 'en-ZA', voice: 'en-ZA' }));
  await selector.selectOption('af');
  await expect(page.getByRole('button', { name: localizeString('af', 'Test voice'), exact: true })).toHaveCount(0);
  await expect(page.getByLabel(localizeString('af', 'Read-aloud voice'), { exact: true })).toHaveCount(0);
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('test-add-voice', { detail: 'af-ZA' })));
  await expect(page.getByLabel(localizeString('af', 'Read-aloud voice'), { exact: true }).locator('option')).toHaveCount(1);
  await page.getByRole('button', { name: localizeString('af', 'Test voice'), exact: true }).click();
  const spoken = JSON.parse((await page.locator('html').getAttribute('data-spoken'))!);
  expect(spoken).toMatchObject({ lang: 'af-ZA', voice: 'af-ZA' });
  expect(spoken.text).toContain('Notto');

  for (const locale of ['xh','ve','tn'] as const) {
    await selector.selectOption(locale);
    await expect(page.getByRole('heading', { name: translate(locale, 'settings.title'), exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: localizeString(locale, 'Test voice'), exact: true })).toHaveCount(0);
    await noOverflow(page);
    await expect(page.getByRole('complementary', { name: localizeString(locale, 'Translation status') })).toBeVisible();
    await page.locator('.translation-notice strong').scrollIntoViewIfNeeded();
    expect(await page.locator('.translation-notice strong').evaluate(el => { const r=el.getBoundingClientRect(); return el.contains(document.elementFromPoint(r.x+5,r.y+r.height/2)); })).toBe(true);
    if (testInfo.project.name.includes('mobile')) expect(await page.locator('.bottom-nav .nav-lbl').evaluateAll(labels => labels.every(el => el.scrollWidth <= el.clientWidth + 1 && el.scrollHeight <= el.clientHeight + 1))).toBe(true);
  }
  await page.screenshot({ path: testInfo.outputPath('setswana-settings.png'), fullPage: true });
  await page.goto('/learn', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.app-container')).toBeVisible();
  await noOverflow(page);
  await page.screenshot({ path: testInfo.outputPath('setswana-learn.png'), fullPage: true });
  await page.goto('/course/money-basics', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Metheo ya madi' })).toBeVisible();
  await noOverflow(page);
  await page.goto('/lesson/money-basics/lesson-1', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.step-title').first()).toHaveText('Madi a feta kheše');
  await expect(page.locator('.speak-button-wrap')).toHaveCount(0);
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('test-add-voice', { detail: 'tn-ZA' })));
  await page.locator('.speak-button-wrap button').first().click();
  expect(JSON.parse((await page.locator('html').getAttribute('data-spoken'))!)).toMatchObject({ lang: 'tn-ZA', voice: 'tn-ZA' });

  await noOverflow(page);
  await page.screenshot({ path: testInfo.outputPath('setswana-lesson.png'), fullPage: true });
  const continueButton = page.getByRole('button', { name: translate('tn', 'lesson.continue'), exact: true });
  await continueButton.scrollIntoViewIfNeeded();
  await continueButton.click();
  await expect(page.locator('.step-title').first()).not.toHaveText('Madi a feta kheše');
  await noOverflow(page);
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-ZA');
  await page.getByRole('button', { name: 'Back to course', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Keep Going', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Leave', exact: true }).click();
  await expect(page).toHaveURL(/\/course\/money-basics/);
  await page.goto('/settings', { waitUntil: 'domcontentloaded' });
  await selector.selectOption('af');
  await page.goto('/calculator', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: localizeString('af', 'Investment Calculator'), exact: true })).toBeVisible();
  const principal = page.getByRole('spinbutton', { name: localizeString('af', 'Initial Amount (R)'), exact: true });
  await principal.fill('12000');
  await principal.blur();
  await page.locator('#mainContent').getByRole('button', { name: localizeString('af', ' Calculate').trim(), exact: true }).click();
  await expect(page.locator('.recharts-responsive-container')).toBeVisible();
  await expect(principal).toHaveValue('12000');
  await noOverflow(page);
  await page.screenshot({ path: testInfo.outputPath('afrikaans-calculator.png'), fullPage: true });
  await page.goto('/budget', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.app-container')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'af-ZA');
  await noOverflow(page);
  await page.screenshot({ path: testInfo.outputPath('afrikaans-budget.png'), fullPage: true });
});
