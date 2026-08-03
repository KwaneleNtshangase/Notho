#!/usr/bin/env bash
# Usage: RESEND_API_KEY=re_xxxx bash create_drip_templates.sh
# Creates D+7, D+14, and D+30 Resend templates for Notho.
# After running, paste the returned IDs into Supabase Edge Function secrets:
#   D7_TEMPLATE_ID, D14_TEMPLATE_ID, D30_TEMPLATE_ID

set -euo pipefail

if [[ -z "${RESEND_API_KEY:-}" ]]; then
  echo "ERROR: Set RESEND_API_KEY first. e.g.: RESEND_API_KEY=re_xxxx bash create_drip_templates.sh"
  exit 1
fi

AUTH="Authorization: Bearer ${RESEND_API_KEY}"

# ── D+7 template ──────────────────────────────────────────────────────────────
echo "Creating notho-d7-milestone..."
D7_PAYLOAD=$(cat << 'JSON'
{
  "name": "notho-d7-milestone",
  "subject": "One week in, {{{username}}}",
  "variables": [
    {"key": "username",      "type": "string"},
    {"key": "streak_badge",  "type": "string"},
    {"key": "streak_line",   "type": "string"},
    {"key": "goal_emoji",    "type": "string"},
    {"key": "goal_label",    "type": "string"},
    {"key": "xp_total",      "type": "string"}
  ],
  "html": "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>One Week In</title></head><body style='margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;'><table width='100%' cellpadding='0' cellspacing='0' style='background:#f4f4f5;padding:32px 16px;'><tr><td align='center'><table width='600' cellpadding='0' cellspacing='0' style='max-width:600px;width:100%;'><tr><td style='background:linear-gradient(135deg,#1A7C4E 0%,#2E9E68 100%);border-radius:16px 16px 0 0;padding:40px 32px;text-align:center;'><img src='https://www.notho.co.za/Logo.png' alt='Notho' width='64' style='display:block;margin:0 auto 16px;'>{{{streak_badge}}}<h1 style='color:#fff;font-size:26px;font-weight:800;margin:16px 0 8px;letter-spacing:-0.5px;'>Seven days, {{{username}}}.</h1><p style='color:rgba(255,255,255,0.85);font-size:16px;margin:0;'>{{{streak_line}}}</p></td></tr><tr><td style='background:#fff;padding:40px 32px;'><p style='color:#1a1a2e;font-size:17px;line-height:1.6;margin:0 0 20px;'>A week ago you made a decision. You opened Notho, set your goal, and started learning. That is more than most people ever do.</p><p style='color:#1a1a2e;font-size:17px;line-height:1.6;margin:0 0 28px;'>Your goal: <strong>{{{goal_emoji}}} {{{goal_label}}}</strong><br>Your XP so far: <strong>{{{xp_total}}} XP</strong></p><p style='color:#555;font-size:15px;line-height:1.6;margin:0 0 32px;'>The research is clear: people who reach Day 7 are 4x more likely to still be learning at Day 30. You are already in that group. Keep the momentum.</p><div style='text-align:center;margin-bottom:32px;'><a href='https://www.notho.co.za' style='display:inline-block;background:linear-gradient(135deg,#1A7C4E,#2E9E68);color:#fff;text-decoration:none;padding:16px 40px;border-radius:50px;font-size:16px;font-weight:700;letter-spacing:0.3px;'>Continue Learning</a></div><hr style='border:none;border-top:1px solid #f0f0f0;margin:0 0 24px;'><p style='color:#999;font-size:13px;text-align:center;margin:0;'>You are receiving this because you signed up for Notho.<br><a href='https://www.notho.co.za' style='color:#1A7C4E;'>Manage preferences</a></p></td></tr></table></td></tr></table></body></html>"
}
JSON
)

D7_RESP=$(echo "$D7_PAYLOAD" | curl -s -X POST https://api.resend.com/emails/templates \
  -H "$AUTH" -H "Content-Type: application/json" --data @-)
D7_ID=$(echo "$D7_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id','ERROR'))")
echo "  D+7 Template ID: $D7_ID"

# ── D+14 template ─────────────────────────────────────────────────────────────
echo "Creating notho-d14-milestone..."
D14_PAYLOAD=$(cat << 'JSON'
{
  "name": "notho-d14-milestone",
  "subject": "Two weeks, {{{username}}}. You are building something real.",
  "variables": [
    {"key": "username",      "type": "string"},
    {"key": "streak_badge",  "type": "string"},
    {"key": "streak_line",   "type": "string"},
    {"key": "goal_emoji",    "type": "string"},
    {"key": "goal_label",    "type": "string"},
    {"key": "xp_total",      "type": "string"}
  ],
  "html": "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>Two Weeks In</title></head><body style='margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;'><table width='100%' cellpadding='0' cellspacing='0' style='background:#f4f4f5;padding:32px 16px;'><tr><td align='center'><table width='600' cellpadding='0' cellspacing='0' style='max-width:600px;width:100%;'><tr><td style='background:linear-gradient(135deg,#1A5C8C 0%,#2E80B8 100%);border-radius:16px 16px 0 0;padding:40px 32px;text-align:center;'><img src='https://www.notho.co.za/Logo.png' alt='Notho' width='64' style='display:block;margin:0 auto 16px;'>{{{streak_badge}}}<h1 style='color:#fff;font-size:26px;font-weight:800;margin:16px 0 8px;letter-spacing:-0.5px;'>Two weeks, {{{username}}}.</h1><p style='color:rgba(255,255,255,0.85);font-size:16px;margin:0;'>{{{streak_line}}}</p></td></tr><tr><td style='background:#fff;padding:40px 32px;'><p style='color:#1a1a2e;font-size:17px;line-height:1.6;margin:0 0 20px;'>Fourteen days is not a streak. It is a habit forming. The part of your brain that makes decisions is literally rewiring itself around financial thinking.</p><p style='color:#1a1a2e;font-size:17px;line-height:1.6;margin:0 0 28px;'>Your goal: <strong>{{{goal_emoji}}} {{{goal_label}}}</strong><br>Total XP earned: <strong>{{{xp_total}}} XP</strong></p><p style='color:#555;font-size:15px;line-height:1.6;margin:0 0 32px;'>At Notho, we measure success differently. Not by how much you invested yet, but by whether you understand why you should. You do now. Keep going.</p><div style='background:#f8f9ff;border-left:4px solid #2E80B8;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:32px;'><p style='color:#1a1a2e;font-size:15px;font-style:italic;margin:0;'>&ldquo;The best time to start was last year. The second best time is finishing today's lesson.&rdquo;</p></div><div style='text-align:center;margin-bottom:32px;'><a href='https://www.notho.co.za' style='display:inline-block;background:linear-gradient(135deg,#1A5C8C,#2E80B8);color:#fff;text-decoration:none;padding:16px 40px;border-radius:50px;font-size:16px;font-weight:700;letter-spacing:0.3px;'>Pick Up Where You Left Off</a></div><hr style='border:none;border-top:1px solid #f0f0f0;margin:0 0 24px;'><p style='color:#999;font-size:13px;text-align:center;margin:0;'>You are receiving this because you signed up for Notho.<br><a href='https://www.notho.co.za' style='color:#1A5C8C;'>Manage preferences</a></p></td></tr></table></td></tr></table></body></html>"
}
JSON
)

D14_RESP=$(echo "$D14_PAYLOAD" | curl -s -X POST https://api.resend.com/emails/templates \
  -H "$AUTH" -H "Content-Type: application/json" --data @-)
D14_ID=$(echo "$D14_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id','ERROR'))")
echo "  D+14 Template ID: $D14_ID"

# ── D+30 template ─────────────────────────────────────────────────────────────
echo "Creating notho-d30-milestone..."
D30_PAYLOAD=$(cat << 'JSON'
{
  "name": "notho-d30-milestone",
  "subject": "30 days. You are not the same person who signed up, {{{username}}}.",
  "variables": [
    {"key": "username",      "type": "string"},
    {"key": "streak_badge",  "type": "string"},
    {"key": "streak_line",   "type": "string"},
    {"key": "goal_emoji",    "type": "string"},
    {"key": "goal_label",    "type": "string"},
    {"key": "xp_total",      "type": "string"}
  ],
  "html": "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>30 Days In</title></head><body style='margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;'><table width='100%' cellpadding='0' cellspacing='0' style='background:#f4f4f5;padding:32px 16px;'><tr><td align='center'><table width='600' cellpadding='0' cellspacing='0' style='max-width:600px;width:100%;'><tr><td style='background:linear-gradient(135deg,#7C3A1A 0%,#B8622E 100%);border-radius:16px 16px 0 0;padding:40px 32px;text-align:center;'><img src='https://www.notho.co.za/Logo.png' alt='Notho' width='64' style='display:block;margin:0 auto 16px;'>{{{streak_badge}}}<h1 style='color:#fff;font-size:26px;font-weight:800;margin:16px 0 8px;letter-spacing:-0.5px;'>30 days, {{{username}}}. 🏆</h1><p style='color:rgba(255,255,255,0.85);font-size:16px;margin:0;'>{{{streak_line}}}</p></td></tr><tr><td style='background:#fff;padding:40px 32px;'><p style='color:#1a1a2e;font-size:17px;line-height:1.6;margin:0 0 20px;'>Thirty days ago you opened an app and made a bet on yourself. A bet that understanding money could change things. That bet is paying off.</p><p style='color:#1a1a2e;font-size:17px;line-height:1.6;margin:0 0 20px;'>Your goal: <strong>{{{goal_emoji}}} {{{goal_label}}}</strong><br>XP earned: <strong>{{{xp_total}}} XP</strong></p><p style='color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;'>Most people who reach 30 days on Notho report that they have already made at least one real financial decision differently. A purchase they did not make. A budget they actually wrote down. A conversation about money they were not afraid to have.</p><p style='color:#555;font-size:15px;line-height:1.6;margin:0 0 32px;'>That is what this is for. Not the XP. Not the streaks. The moment where the knowledge becomes a decision that actually helps you. Keep going.</p><div style='text-align:center;margin-bottom:16px;'><a href='https://www.notho.co.za' style='display:inline-block;background:linear-gradient(135deg,#7C3A1A,#B8622E);color:#fff;text-decoration:none;padding:16px 40px;border-radius:50px;font-size:16px;font-weight:700;letter-spacing:0.3px;'>Continue Your Journey</a></div><div style='text-align:center;margin-bottom:32px;'><p style='color:#999;font-size:14px;margin:8px 0 0;'>You have earned it. Do not stop now.</p></div><hr style='border:none;border-top:1px solid #f0f0f0;margin:0 0 24px;'><p style='color:#999;font-size:13px;text-align:center;margin:0;'>You are receiving this because you signed up for Notho.<br><a href='https://www.notho.co.za' style='color:#B8622E;'>Manage preferences</a></p></td></tr></table></td></tr></table></body></html>"
}
JSON
)

D30_RESP=$(echo "$D30_PAYLOAD" | curl -s -X POST https://api.resend.com/emails/templates \
  -H "$AUTH" -H "Content-Type: application/json" --data @-)
D30_ID=$(echo "$D30_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id','ERROR'))")
echo "  D+30 Template ID: $D30_ID"

echo ""
echo "============================================================"
echo "Templates created. Add these to Supabase Edge Function secrets:"
echo "  D7_TEMPLATE_ID  = $D7_ID"
echo "  D14_TEMPLATE_ID = $D14_ID"
echo "  D30_TEMPLATE_ID = $D30_ID"
echo "============================================================"
