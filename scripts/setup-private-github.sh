#!/usr/bin/env bash
# setup-private-github.sh — connect this repo to a PRIVATE GitHub repository.
#
# Nothing is published. The script only ever creates or accepts a private repo,
# re-checks visibility before every push, refuses to run if GitHub Pages is
# enabled, and never adds a Pages workflow, CNAME file or public deploy.
#
# It is a dry run unless --yes is given.

set -euo pipefail

REPO="felipsant/marienbraeu" # OWNER/NAME on github.com
URL=""                          # alternative: an existing repo URL (https or ssh)
INVITE=""                       # GitHub username of the owner to invite
PERMISSION="admin"              # collaborator permission: pull|triage|push|maintain|admin
REMOTE="github"                 # remote name; origin (ForgeJo) is left untouched
DO_PUSH=0
APPLY=0

usage() {
  cat <<'EOF'
Usage: scripts/setup-private-github.sh (--repo OWNER/NAME | --url URL) [options]

  --repo OWNER/NAME    create (if missing) and use this private repository
  --url URL            use an existing repository by URL (must be private)
  --invite USERNAME    invite the owner's GitHub account as a collaborator
  --permission LEVEL   collaborator permission (default: admin)
  --remote NAME        git remote name to add (default: github)
  --push               push the main branch after all checks pass
  --yes                actually make changes (default is a dry run)
  -h, --help           show this help

Requires the GitHub CLI (gh), logged in with: gh auth login
EOF
}

die()  { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
info() { printf '==> %s\n' "$*"; }
run()  {
  if [ "$APPLY" -eq 1 ]; then "$@"; else printf '[dry-run] %s\n' "$*"; fi
}

while [ $# -gt 0 ]; do
  case "$1" in
    --repo)       REPO="${2:?--repo needs OWNER/NAME}"; shift 2 ;;
    --url)        URL="${2:?--url needs a URL}"; shift 2 ;;
    --invite)     INVITE="${2:?--invite needs a username}"; shift 2 ;;
    --permission) PERMISSION="${2:?--permission needs a level}"; shift 2 ;;
    --remote)     REMOTE="${2:?--remote needs a name}"; shift 2 ;;
    --push)       DO_PUSH=1; shift ;;
    --yes)        APPLY=1; shift ;;
    -h|--help)    usage; exit 0 ;;
    --public|--internal|--visibility*)
      die "this script only creates private repositories; '$1' is not accepted" ;;
    *) usage >&2; die "unknown argument: $1" ;;
  esac
done

# --- inputs ---------------------------------------------------------------

if [ -n "$URL" ] && [ -z "$REPO" ]; then
  # https://github.com/OWNER/NAME(.git) or git@github.com:OWNER/NAME(.git)
  REPO="$(printf '%s' "$URL" | sed -E 's#^(https://github\.com/|git@github\.com:|ssh://git@github\.com/)##; s#\.git$##; s#/$##')"
  [ "$REPO" != "$URL" ] || die "only github.com URLs are supported: $URL"
fi
[ -n "$REPO" ] || { usage >&2; die "give --repo OWNER/NAME or --url URL"; }
printf '%s' "$REPO" | grep -Eq '^[A-Za-z0-9-]+/[A-Za-z0-9._-]+$' \
  || die "not an OWNER/NAME pair: $REPO"
case "$PERMISSION" in pull|triage|push|maintain|admin) ;; *)
  die "invalid --permission: $PERMISSION" ;; esac
REMOTE_URL="${URL:-git@github.com:${REPO}.git}"

command -v git >/dev/null || die "git is not installed"
command -v gh  >/dev/null || die "the GitHub CLI (gh) is required: https://cli.github.com"
git rev-parse --show-toplevel >/dev/null 2>&1 || die "run this inside the marienbraeu git repository"
cd "$(git rev-parse --show-toplevel)"
gh auth status >/dev/null 2>&1 || die "gh is not logged in; run: gh auth login"

[ "$APPLY" -eq 1 ] || info "DRY RUN — nothing will change. Re-run with --yes to apply."

# --- guard rails ----------------------------------------------------------

# Visibility of the remote repo: PRIVATE, or empty if it does not exist.
visibility() {
  gh repo view "$REPO" --json visibility --jq .visibility 2>/dev/null || true
}

assert_private() {
  local v; v="$(visibility)"
  [ "$v" = "PRIVATE" ] || die "$REPO visibility is '${v:-unknown}', not PRIVATE — refusing to continue"
}

# A Pages site would publish the repo's HTML. The API answers 404 when there is none.
assert_no_pages() {
  if gh api "repos/$REPO/pages" >/dev/null 2>&1; then
    die "GitHub Pages is enabled on $REPO. Disable it (Settings → Pages) before continuing; this script will not publish anything."
  fi
}

# Nothing in the tree that would deploy the site once pushed.
assert_no_publish_config() {
  local hits
  hits="$(git ls-tree -r --name-only main -- CNAME .nojekyll .github/workflows 2>/dev/null || true)"
  [ -z "$hits" ] || die "the main branch contains publishing config, refusing to push:
$hits"
}

# --- repository -----------------------------------------------------------

v="$(visibility)"
if [ -z "$v" ]; then
  [ -z "$URL" ] || die "$REPO does not exist (or this account cannot see it)"
  info "creating private repository $REPO"
  run gh repo create "$REPO" --private --disable-wiki \
    --description "Marienbräu website — private, not published"
  if [ "$APPLY" -eq 1 ]; then assert_private; fi
else
  info "$REPO exists (visibility: $v)"
  assert_private
fi

if [ "$APPLY" -eq 1 ] || [ -n "$v" ]; then
  assert_no_pages
  info "no GitHub Pages site on $REPO"
  # Keep the repo from accidentally gaining a public face later.
  run gh repo edit "$REPO" --enable-wiki=false --enable-projects=false
fi

# --- git remote -----------------------------------------------------------

if git remote get-url "$REMOTE" >/dev/null 2>&1; then
  current="$(git remote get-url "$REMOTE")"
  [ "$current" = "$REMOTE_URL" ] \
    || die "remote '$REMOTE' already points at $current; pick another --remote"
  info "remote '$REMOTE' already set to $REMOTE_URL"
else
  info "adding remote '$REMOTE' → $REMOTE_URL"
  run git remote add "$REMOTE" "$REMOTE_URL"
fi

# --- push (opt-in) ----------------------------------------------------------

if [ "$DO_PUSH" -eq 1 ]; then
  git rev-parse --verify -q main >/dev/null || die "no local main branch to push"
  assert_no_publish_config
  if [ "$APPLY" -eq 1 ]; then assert_private; fi  # re-check right before pushing
  info "pushing main to $REMOTE (private)"
  run git push "$REMOTE" main:main
else
  info "skipping push (add --push to upload the main branch)"
fi

# --- collaborator invite (opt-in) -----------------------------------------

if [ -n "$INVITE" ]; then
  if [ "$APPLY" -eq 1 ]; then assert_private; fi
  info "inviting $INVITE to $REPO with '$PERMISSION' permission"
  run gh api -X PUT "repos/$REPO/collaborators/$INVITE" -f "permission=$PERMISSION" --silent
fi

if [ "$APPLY" -eq 1 ]; then
  info "done. $REPO is private; nothing was published."
else
  info "dry run complete; nothing was changed."
fi
