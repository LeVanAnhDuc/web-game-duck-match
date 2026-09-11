---
name: design-bootstrap
description: Use ONCE per project, before the first UI feature, to produce the design-system token file (MASTER.md) that every later mockup reads - runs ui-ux-pro-max for constraints then frontend-design for the final palette, type pairing and signature element. Trigger on "dung design system", "chot mau va font", "bootstrap design", or when a mockup is requested and docs/design-system/<slug>/MASTER.md does not exist yet.
---

# Design bootstrap — once per project

Produces `docs/design-system/<slug>/MASTER.md`, the token source of truth. Every
per-feature mockup reads it. **Never re-run this for a feature** — `--design-system`
output varies with how the brief is phrased, so regenerating silently drifts the
tokens, which is the whole reason the file exists.

If `MASTER.md` already exists: stop and read it. Do not regenerate.

## The split — constraint vs choice

Two plugins, sequenced. `ui-ux-pro-max` ships its coordination rules in a `stack/`
folder that is **not** part of the installed plugin, so those rules never reach
context. This skill is that missing contract.

| `ui-ux-pro-max` owns (constraints — not overridable) | `frontend-design` owns (choices — final say) |
| --- | --- |
| A11y / UX rules (4.5:1 contrast, 44px targets, visible focus, reduced-motion) | Final palette hex values |
| Anti-patterns and the pre-delivery checklist | Typeface pairing — **≥2 distinct families** |
| Page pattern and section order | The one signature element |
| Spacing scale, density, GSAP motion tier | Where and how much motion |
| Stack-specific implementation, chart types | Copy and wording |

## Step 1 — Constraints

```bash
python "${CLAUDE_PLUGIN_ROOT}/.claude/skills/ui-ux-pro-max/scripts/search.py" \
  "<product> <industry> <keywords>" --design-system -p "<Product Name>" \
  --persist --output-dir docs
```

`--output-dir` is mandatory; without it the files land in whatever directory the
script happens to run from. The `design-system/<slug>/` part of the path is added by
the script and cannot be flattened.

`--force` requires explicit user authorization. Read the existing `MASTER.md` first.

Treat this output as **input**, not as the decision.

## Step 2 — Choices

Decide the final palette, the typeface pairing, the signature element, and the copy.
Then apply `frontend-design`'s self-critique: anything that reads like the generic
default for this product category gets revised, and say what changed and why.

Step 1 returns catalog picks. A real run for "task management productivity saas"
returned Flat Design, teal `#0D9488` + orange `#EA580C`, and `Plus Jakarta Sans` for
**both** type roles — a templated SaaS default, and a single family where two are
required.

- `frontend-design` may override step 1's colors and fonts.
- It may **not** override step 1's a11y / UX rules.

Write the resulting decisions back into `MASTER.md` and commit it.

## Step 3 — Record the decision

Palette, type pairing and signature element are technical decisions with rejected
alternatives. Write one ADR in `docs/decisions/` naming what was chosen and what
step 1 proposed that you overrode. Do it now, not later.

## Then

Per-feature work continues in the `feature-flow` skill. Steps here never run again.
