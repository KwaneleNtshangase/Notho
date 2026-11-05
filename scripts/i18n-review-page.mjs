/** Build an offline review worksheet from the existing JSON export. No app writes. */
import fs from 'node:fs';
const arg = name => { const i = process.argv.indexOf(name); return i < 0 ? undefined : process.argv[i + 1]; };
const input = arg('--file'), output = arg('--out');
if (!input || !output) throw new Error('Use --file exported-review.json --out review.html [--all]. Output must not already exist.');
const source = JSON.parse(fs.readFileSync(input, 'utf8'));
const rows = source.filter(row => process.argv.includes('--all') || !row.sourcePreservationReason && (
  row.fallbackReason || row.key.startsWith('messages:') && row.priority === 'priority-human-review'
  || /Download My Data|Delete My Data|Push notifications|Plays on correct|Money is more than cash|Session recording|Sessions are recorded|Signed-in sessions are recorded|ZBB allocates|Zero-based budgeting (?:gives|means)/.test(row.source)
  || /content:course\.(credit-debt|taxes|insurance|retirement|estate-planning|re5)/.test(row.key)
));
const payload = JSON.stringify(rows).replaceAll('<', '\\u003c');
const template = fs.readFileSync(new URL('./lib/review-worksheet.html', import.meta.url), 'utf8');
const html = template.replace('__WORKSHEET_ROWS__', () => payload);
fs.writeFileSync(output, html, { flag: 'wx' });
console.log(`Created offline worksheet with ${rows.length} rows: ${output}`);
