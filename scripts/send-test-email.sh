#!/usr/bin/env bash
# Send one test email through Resend to prove notho.co.za can send.
#
#   bash scripts/send-test-email.sh you@gmail.com
#
# Prompts for the API key rather than taking it as an argument, so the key
# never lands in your shell history or in `ps` output.

TO="${1:-}"
if [ -z "$TO" ]; then
  echo "Usage: bash scripts/send-test-email.sh you@example.com"
  exit 1
fi

read -r -s -p "Resend API key (paste, then press Enter): " RESEND_KEY
echo
if [ -z "$RESEND_KEY" ]; then
  echo "No key entered."
  exit 1
fi

echo "Sending to $TO from hello@notho.co.za ..."

RESPONSE=$(curl -s -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"from\": \"Notho <hello@notho.co.za>\",
    \"to\": [\"$TO\"],
    \"subject\": \"Notho sending test - notho.co.za\",
    \"html\": \"<div style='font-family:Arial,sans-serif;line-height:1.6'><h2 style='color:#007A85'>notho.co.za can send</h2><p>If this arrived in the inbox and not spam, the domain is verified and working.</p><p>Now open this message, choose <b>Show original</b> in Gmail, and confirm all three say PASS:</p><ul><li>SPF</li><li>DKIM</li><li>DMARC</li></ul></div>\",
    \"text\": \"notho.co.za can send. Open this message, choose Show original in Gmail, and confirm SPF, DKIM and DMARC all say PASS.\"
  }")

unset RESEND_KEY

echo
echo "$RESPONSE"
echo

case "$RESPONSE" in
  *'"id"'*)
    echo "Accepted by Resend."
    echo
    echo "Next:"
    echo "  1. Check $TO - it should arrive within a minute."
    echo "  2. If it is in spam, that matters. Say so before flipping the app over."
    echo "  3. Open it, choose Show original in Gmail, confirm SPF/DKIM/DMARC all PASS."
    ;;
  *'"statusCode":403'*|*'not verified'*)
    echo "Rejected: the domain is not verified for sending yet."
    echo "Check resend.com/domains shows notho.co.za as Verified."
    ;;
  *'"statusCode":401'*)
    echo "Rejected: the API key was not accepted. Create a fresh one at resend.com/api-keys."
    ;;
  *)
    echo "Unexpected response - read the JSON above."
    ;;
esac
