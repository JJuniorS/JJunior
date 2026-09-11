---
translationKey: plano-rollback
title: "Rollback: the plan you make before you need it"
description: "Why a way back has to exist before the incident — and what a rollback actually does (and does not do) in CI/CD."
pubDate: 2026-09-11
tags:
  - DevOps
  - CI/CD
  - GitHub Actions
draft: false
---

## We automate the way forward. The way back can wait.

This blog publishes itself. I push to `main`, GitHub Actions builds the static site, and GitHub Pages puts it live. It is the kind of flow we love for as long as it works: fast, predictable, no ceremony.

The problem is what happens in the minute after a bad deploy.

CSS that breaks the layout on mobile. An `astro.config` with the wrong `base` and every route returning 404. A post that goes out with a mistake you only notice once it is already live. None of that is a production disaster with thousands of users — but the reflex is the same: **you need to go back. Now.**

And that is exactly when most teams discover they do not have a rollback plan. They have a deploy plan.

> Rollback is not the panic button you invent during the incident. It is the decision you make **before**, while you are still calm enough to think.

## What a rollback plan actually is

A rollback plan answers three questions, in writing, ahead of time:

1. **Where do I go back to?** Which version was the last good one — tag, release, artifact, commit.
2. **How do I go back?** Which command, workflow, or UI action does that without improvising.
3. **What does rollback *not* fix?** Because republishing the old site does not undo the bad commit on `main`.

The third question is the one I see ignored most often.

Rolling back **what the user is looking at** and rolling back **what is in git** are different things. On GitHub Pages, I can republish the HTML from the previous release in a few minutes. That takes the problem off the air. But the code on `main` is still the new code. The next push — or even an innocent re-run of deploy — puts the error back.

So the plan has two beats:

| Beat | Goal | Example on this blog |
| ---- | ---- | -------------------- |
| **Mitigation** | Take the problem off the air | A manual workflow republishes the previous release to Pages |
| **Fix** | Stop the problem from coming back | `git revert` (or a hotfix) on `main`, then a real deploy |

If you only do the first, you bought time. If you only do the second, the user keeps seeing the error while you fix it. Together they are the plan.

## Why this has to exist *before* the incident

Under pressure, we choose badly.

Not because we are incompetent. Because an incident compresses time, mixes in ego (“I broke it”), and leaves no room to think about trade-offs. It is the worst moment to discover that GitHub Actions **does not** have a step that stays paused after deploy, waiting for you to click “go back”.

That is exactly what I wanted in this blog’s CI: a paused step, ready, that I trigger only if something goes wrong. The instinct is right. The implementation, on GitHub Actions, is something else.

When the deploy finishes, the workflow **ends**. There is no optional job that sits for hours or days waiting for a click. What exists — and what I ended up using — is a separate, manually triggered workflow (`workflow_dispatch`). It does not stay paused in the same run. It stays **always available** in the Actions tab, with an explicit name: *Rollback GitHub Pages*.

The difference looks small. In practice, it is the difference between “I need to invent a path now” and “I need to click the path that already exists”.

Three reasons I think this matters even on a personal project:

- **Memory is terrible in a crisis.** Six months from now I will not remember whether rollback is “re-run the old deploy”, “check out the tag”, or “a rushed `git revert`”.
- **The happy path biases the design.** We test the deploy. Almost nobody tests “what if this fails?”.
- **Speed of going back beats perfection.** Mitigating in five minutes and fixing calmly is better than spending 40 minutes on a hotfix with the site broken.

That is not pessimism. It is operational humility.

## What I set up here

In practice, this repository’s flow looks like this:

```
Push to main
  ├─ deploy.yml     → build + GitHub Pages
  └─ release.yml    → tag + GitHub Release

If something goes wrong
  └─ rollback.yml   → Actions → Run workflow
                      (empty tag = previous release)
```

The rollback **does not** create a new release. It does not touch `main`. It only checks out the previous tag, builds the site again, and publishes. It uses the same concurrency group as deploy (`pages`): if a bad deploy is still running, rollback cancels it and takes over.

Two notes I wrote down for future me:

1. **I need at least two releases.** With no history, there is no “previous version”.
2. **After rollback, `main` is still wrong.** Without a revert or a hotfix, the next push undoes the mitigation.

The button by itself is not the plan. The plan is knowing what the button does — and what it leaves for me to do afterwards.

## Rollback is not cowardice. It is operational seniority.

It is tempting to treat rollback as a big-system thing: databases, blue/green, feature flags, canaries. Those mechanisms are the same *principle* at different scales: **never leave the way forward without a known way back**.

On a static site, the way back is a tag and a manual workflow. On an API, it might be republishing the previous image. In an app with a database migration, sometimes rollback is *not even possible* — and then the plan changes its name: feature flag, migrate-forward, or “this change is irreversible, so the deploy needs a different kind of care”.

The useful question is not “which tool do I use?”. It is: **if this breaks in ten minutes, do I know exactly what to do without opening ChatGPT?**

If the answer is “I’ll figure it out on the spot”, you have a deploy. You still do not have a plan.

## What I take from this

Setting up rollback on this blog was disproportionately educational for the size of the project. Not because GitHub Pages is hard. Because it forced me to separate three ideas I used to mix together:

- **Publish** — put the new version live
- **Mitigate** — put what the user sees back to the last good version
- **Fix** — make the repo and the next deploy consistent with that version (or with the hotfix)

The first we love to automate. The second needs a conscious manual trigger — not an eternal job waiting for approval. The third is git, conversation, and, again, calm.

> The best rollback plan is the one you never use. The second best is the one you use without having to think.

This piece exists because I wanted the second. And because the first, on its own, is just hope.

---

*P.S. — 11 Sep 2026: if this paragraph is live, the site is on the new version. A rollback to the previous release should make exactly this P.S. disappear.*
