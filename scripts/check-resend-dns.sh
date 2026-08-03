#!/usr/bin/env bash
# Watch the Resend DNS records for notho.co.za until they resolve.
#
# Resend's Verify button is the source of truth, but it rate-limits and tells
# you nothing while you wait. This polls DNS directly so you can see each record
# appear, and it checks the two things that actually go wrong at Truehost:
# the auto-appended domain suffix, and a duplicated root SPF.
#
#   bash scripts/check-resend-dns.sh          # one pass
#   bash scripts/check-resend-dns.sh --watch  # re-check every 30s

DOMAIN="notho.co.za"

check() {
  local ok=1
  printf '\n=== %s — %s ===\n' "$DOMAIN" "$(date '+%H:%M:%S')"

  local mx spf dkim
  mx=$(dig +short MX "send.$DOMAIN")
  spf=$(dig +short TXT "send.$DOMAIN")
  dkim=$(dig +short TXT "resend._domainkey.$DOMAIN")

  if [ -n "$mx" ]; then
    printf '  [ok]      MX   send            %s\n' "$mx"
  else
    printf '  [waiting] MX   send            not resolving yet\n'; ok=0
  fi

  if [ -n "$spf" ]; then
    printf '  [ok]      TXT  send            %s\n' "$spf"
  else
    printf '  [waiting] TXT  send            not resolving yet\n'; ok=0
  fi

  if [ -n "$dkim" ]; then
    printf '  [ok]      TXT  resend._domainkey  present (%s chars)\n' "${#dkim}"
    # cPanel silently truncates long values. A real DKIM key is ~390+ chars.
    if [ "${#dkim}" -lt 200 ]; then
      printf '  [WARN]    DKIM looks truncated — re-paste the full p=... value\n'; ok=0
    fi
  else
    printf '  [waiting] TXT  resend._domainkey  not resolving yet\n'; ok=0
  fi

  # Trap 1: cPanel appended the domain to a name that already had it.
  if [ -n "$(dig +short TXT "send.$DOMAIN.$DOMAIN")" ] \
     || [ -n "$(dig +short TXT "resend._domainkey.$DOMAIN.$DOMAIN")" ]; then
    printf '  [ERROR]   A record exists at *.%s.%s — cPanel appended the domain.\n' "$DOMAIN" "$DOMAIN"
    printf '            Edit it to just "send" / "resend._domainkey".\n'; ok=0
  fi

  # Trap 2: more than one SPF at the root is invalid and breaks ALL mail.
  local root_spf_count
  root_spf_count=$(dig +short TXT "$DOMAIN" | grep -c 'v=spf1')
  if [ "$root_spf_count" -gt 1 ]; then
    printf '  [ERROR]   %s root SPF records. Only ONE is allowed — mail will fail.\n' "$root_spf_count"
    dig +short TXT "$DOMAIN" | grep 'v=spf1' | sed 's/^/            /'
    ok=0
  else
    printf '  [ok]      root SPF untouched (%s record)\n' "$root_spf_count"
  fi

  if [ "$ok" = 1 ]; then
    printf '\n  All records live. Click Verify in Resend, then send a test.\n'
    return 0
  fi
  return 1
}

if [ "$1" = "--watch" ]; then
  while true; do
    check && break
    sleep 30
  done
else
  check
fi
