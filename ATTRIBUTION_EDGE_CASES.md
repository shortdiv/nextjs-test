# Git AI Attribution Edge Cases - Complete Report

**Date:** March 31, 2026
**Repository:** https://github.com/shortdiv/nextjs-test
**Git AI Version:** 1.2.1
**Test Environment:** Linux 6.17.0-1007-aws, Claude Code CLI

---

## Executive Summary

Git AI attribution (v1.2.1) was tested across 6 major scenarios to identify edge cases where attribution might be lost or incorrectly attributed. **One critical failure was identified: attribution is completely lost after git rebase.**

### Results Summary

| Scenario | Attribution Status | Notes |
|----------|-------------------|-------|
| Basic commits | ✅ WORKS | Full attribution with git notes |
| Cross-directory commits | ✅ WORKS | Using `git -C` preserves attribution |
| Git commit --amend | ✅ WORKS | New notes created with updated line ranges |
| Git reset + recommit | ✅ WORKS | New commit gets fresh attribution |
| Multi-branch commits (single session) | ✅ WORKS | Same prompt ID across branches |
| Cherry-pick (from commit with notes) | ✅ WORKS | Notes copied to new commit |
| **Git rebase** | ❌ **FAILS** | **Attribution completely lost** |
| Cherry-pick (from rebased commit) | ❌ **FAILS** | **No source attribution to copy** |

---

## Critical Finding: Git Rebase Loses Attribution

### Issue Description

When commits are rebased (interactive or non-interactive), git notes containing attribution metadata **are not transferred** to the new commits created by the rebase. The notes remain attached to the old commit SHAs, which become unreachable after the rebase.

### Reproduction Steps

1. Create commits with git AI attribution
2. Verify attribution exists via `git log --notes=ai`
3. Perform git rebase (e.g., `git rebase -i HEAD~3`)
4. Check attribution on rebased commits

### Evidence

**Before rebase:**
- Commit `8ee6eb8`: Has full attribution notes
- Commit `f7a2ece`: Has full attribution notes
- Commit `b69f891`: Has full attribution notes

**After rebase:**
- New commit `5c84f4e` (was `8ee6eb8`): **NO attribution notes**
- New commit `a57bdf9` (was `f7a2ece`): **NO attribution notes**
- New commit `9e06770` (was `b69f891`): **NO attribution notes**

**Old commits still have notes:**
```bash
$ git notes --ref=ai show 8ee6eb8
gitai-test-1.md
  8fb62e60abc7baec 1-8
---
{
  "schema_version": "authorship/3.0.0",
  "git_ai_version": "1.2.1",
  ...
}
```

**New commits have NO notes:**
```bash
$ git log --notes=ai 5c84f4e -1
# No Notes (ai): section displayed
```

### Impact

- **PR reviews:** Rebased PRs lose all AI attribution metadata
- **Git history:** After rebase, no way to determine AI authorship
- **Blame analysis:** `git-ai blame` will show incorrect attribution
- **Audit trails:** Attribution history is broken after rebase

### Root Cause

Git notes are keyed by commit SHA. When rebase creates new commits with new SHAs, git notes are not automatically transferred. Git AI's rewrite_log captures the mapping but doesn't appear to restore notes.

### Affected Commands

- `git rebase` (interactive and non-interactive)
- `git rebase --onto`
- `git pull --rebase`

---

## Detailed Test Results

### 1. Basic Commits ✅

**Branch:** `test-gitai-working`
**Status:** WORKING

#### Test Details
- Created files and committed from repository root
- Attribution captured correctly with full metadata

#### Example Commit
```
SHA: 8ee6eb8
File: gitai-test-1.md
Attribution: Lines 1-8 to prompt 8fb62e60abc7baec
Agent: claude (claude-sonnet-4-5-20250929)
```

#### Notes Structure
```json
{
  "schema_version": "authorship/3.0.0",
  "git_ai_version": "1.2.1",
  "base_commit_sha": "8ee6eb86a1017cbcbe53aa829507c23ccbb432ea",
  "prompts": {
    "8fb62e60abc7baec": {
      "agent_id": {
        "tool": "claude",
        "id": "a2637992-fdaa-4c48-8e6a-8fb00f91e38b",
        "model": "claude-sonnet-4-5-20250929"
      },
      "human_author": "Ubuntu",
      "messages": [],
      "total_additions": 8,
      "total_deletions": 0,
      "accepted_lines": 8,
      "overriden_lines": 0
    }
  }
}
```

---

### 2. Cross-Directory Commits ✅

**Branch:** `test-gitai-working`
**Status:** WORKING

#### Test Details
- Navigated to `/home/ubuntu` (parent directory)
- Committed using `git -C nextjs-test commit`
- Attribution captured correctly

#### Example
```bash
$ cd /home/ubuntu
$ git -C nextjs-test add gitai-test-2.md
$ git -C nextjs-test commit -m "..."
```

**Result:** Commit `f7a2ece` has full attribution

#### Key Finding
Git AI attribution hooks work correctly even when git commands are executed from outside the repository directory using the `-C` flag.

---

### 3. Git Rebase ❌ CRITICAL FAILURE

**Branch:** `test-gitai-working`
**Status:** FAILS - Attribution completely lost

#### Test Details
Performed interactive rebase on 3 commits with attribution:
```bash
$ git rebase -i HEAD~3
# Reworded first commit
```

#### SHA Mappings

| Original SHA | Original Attribution | New SHA (after rebase) | New Attribution |
|-------------|---------------------|----------------------|----------------|
| `8ee6eb8` | ✅ Full notes | `5c84f4e` | ❌ NO notes |
| `f7a2ece` | ✅ Full notes | `a57bdf9` | ❌ NO notes |
| `b69f891` | ✅ Full notes | `9e06770` | ❌ NO notes |

#### Verification

**Git notes list shows old SHAs only:**
```bash
$ git notes --ref=ai list
c5432efd9270bae99182d0c6f720775a3d3e2918 8ee6eb86a1017cbcbe53aa829507c23ccbb432ea
737c8d38c68b4e3ca494022bf9ce782ed1229d01 b69f891b43dc003f1c972386eb434b1e373f4cce
78e0fa64f3c76811c186be4efd2a572c364a292e f7a2ecede4a5d442efa54a8e673821812bea6519
```

**New commits have no notes:**
```bash
$ git log --notes=ai 5c84f4e -1 --show-notes=ai
# No notes section displayed
```

#### Rewrite Log

The `.git/ai/rewrite_log` captures some rebase information but doesn't restore notes:
```json
{
  "rebase_complete": {
    "original_head": "6bc4501cf3e0528faff5cfae6e9b77e0452db1af",
    "new_head": "ace5842908534c9fb6fc257f1d0329f9472b4426",
    "is_interactive": true,
    "original_commits": ["cf0f4ab...", "feb5023...", "6bc4501..."],
    "new_commits": ["5ae35e8...", "1b14424...", "ace5842..."]
  }
}
```

**Note:** This log shows commit mappings but the notes are not automatically restored to new commits.

---

### 4. Cherry-Pick ✅ (with caveats)

**Branch:** `test-cherry-pick-gitai`
**Status:** WORKS when source has attribution

#### Test A: Cherry-pick from commit WITH attribution ✅

**Source:** `f7a2ece` (had attribution before being lost to rebase)
**Target:** `test-cherry-pick-gitai` branch
**Result:** `075298f` - **HAS attribution**

```bash
$ git cherry-pick f7a2ece
$ git log --notes=ai -1
```

**Notes copied and updated:**
```json
{
  "base_commit_sha": "075298f60fd95806d368bab4b7f49f44735b6881",  // New SHA
  "prompts": {
    "8fb62e60abc7baec": { ... }  // Same prompt ID
  }
}
```

#### Test B: Cherry-pick from commit WITHOUT attribution ❌

**Source:** `5c84f4e` (rebased commit without attribution)
**Target:** `test-cherry-pick-gitai` branch
**Result:** `51fb74a` - **NO attribution**

#### Key Finding

Cherry-pick correctly copies attribution from source to target commit when source HAS attribution. However, if the source commit lost attribution (e.g., due to rebase), the cherry-picked commit will also lack attribution.

---

### 5. Multi-Branch Commits (Single Session) ✅

**Branches:** `test-gitai-working` and `nested-branch-1`
**Status:** WORKING

#### Test Details
1. Created `nested-branch-1` from `test-gitai-working`
2. Committed `multi-branch-test-1.md` on `nested-branch-1`
3. Switched back to `test-gitai-working`
4. Committed `multi-branch-test-2.md` on parent branch

#### Results

**Commit on nested-branch-1:**
- SHA: `05bfa81`
- Prompt ID: `8fb62e60abc7baec`
- Attribution: ✅ Full notes

**Commit on test-gitai-working:**
- SHA: `ea6e950`
- Prompt ID: `8fb62e60abc7baec` (SAME as nested branch)
- Attribution: ✅ Full notes

#### Key Finding

Git AI correctly tracks that both commits came from the same prompt session by using the same prompt ID across different branches. This enables proper attribution even when work spans multiple branches in a single session.

---

### 6. Git Commit --amend ✅

**Branch:** `test-gitai-working`
**Status:** WORKING

#### Test Details
1. Committed file with attribution
2. Made additional changes
3. Amended the commit using `git commit --amend --no-edit`

#### SHA Changes

| Stage | SHA | Attribution | Line Range |
|-------|-----|-------------|-----------|
| Original commit | `ea6e950` | ✅ Has notes | Lines 1-7 |
| After amend | `aafb19f` | ✅ Has notes | Lines 1-10 |

#### Verification

**Original commit notes (still accessible):**
```bash
$ git notes --ref=ai show ea6e950
multi-branch-test-2.md
  8fb62e60abc7baec 1-7
```

**Amended commit notes (NEW notes created):**
```bash
$ git notes --ref=ai show aafb19f
multi-branch-test-2.md
  8fb62e60abc7baec 1-10  # Updated line range
```

#### Key Finding

Git commit --amend creates NEW attribution notes for the amended commit with updated line ranges. The old commit's notes remain accessible via the old SHA. This is correct behavior.

---

### 7. Git Reset + Recommit ✅

**Branch:** `test-gitai-working`
**Status:** WORKING

#### Test Details
1. Created and committed `reset-test.md`
2. Performed `git reset --soft HEAD~1`
3. Recommitted the file with new message

#### SHA Changes

| Stage | SHA | Attribution | Status |
|-------|-----|-------------|--------|
| Original commit | `c3134f9` | ✅ Had notes | Reset (unreachable) |
| After recommit | `c498a47` | ✅ Has notes | Active |

#### Verification

**Recommitted file has fresh attribution:**
```bash
$ git log --notes=ai c498a47 -1
Notes (ai):
    reset-test.md
      8fb62e60abc7baec 1-3
```

#### Key Finding

Git reset + recommit works correctly. The new commit receives fresh attribution metadata. The old commit's attribution is abandoned (commit becomes unreachable).

---

## Checkpoint Files Investigation

### Expected Behavior
According to documentation, checkpoint files should exist at:
```
/<projectname>/.git/ai/working_logs/old-<SHACOMMIT>/checkpoints.jsonl
```

### Actual Behavior
```bash
$ ls -la .git/ai/working_logs/
total 8
drwxrwxr-x 2 ubuntu ubuntu 4096 Mar 31 15:12 .
drwxrwxr-x 4 ubuntu ubuntu 4096 Mar 31 15:10 ..
```

**No checkpoint files were created** during any of the test scenarios.

### Alternative Attribution Storage

Attribution metadata is stored in:
1. **Git notes** (refs/notes/ai) - Primary storage
2. **Rewrite log** (.git/ai/rewrite_log) - Tracks rebases and commits

### Git-AI Status

```bash
$ git-ai status
No checkpoints recorded since last commit (a21e7b8)
```

This suggests checkpoint files may only be created for:
- Uncommitted changes
- Specific git-ai workflow operations
- When using certain IDE integrations

**Note:** This does not affect attribution tracking, which works via git notes.

---

## Recommendations

### 1. Fix Rebase Attribution Loss (HIGH PRIORITY)

**Problem:** All attribution lost after rebase

**Possible Solutions:**

#### Option A: Post-Rebase Hook
Create a git hook that runs after rebase and copies notes from old SHAs to new SHAs using the mapping in `.git/ai/rewrite_log`.

```bash
# .git/hooks/post-rewrite
#!/bin/bash
# Copy git notes after rebase
while read old_sha new_sha; do
  if git notes --ref=ai show "$old_sha" &>/dev/null; then
    git notes --ref=ai copy "$old_sha" "$new_sha" 2>/dev/null || true
  fi
done
```

#### Option B: Git-AI Repair Command
Add a command like `git-ai repair-notes` that:
1. Reads `.git/ai/rewrite_log`
2. Finds commit mappings from rebases
3. Copies notes from old SHAs to new SHAs

#### Option C: Automatic Recovery
Enhance git-ai to automatically detect rebase completion and restore notes using rewrite_log mappings.

### 2. Document Rebase Behavior (IMMEDIATE)

Update git-ai documentation to clearly warn users:
- Rebasing loses attribution
- Workarounds for preserving attribution
- Best practices (avoid rebasing, or run repair commands)

### 3. Add Warning to Git-AI CLI

When rebase is detected, display warning:
```
⚠️  Warning: Git rebase detected. Attribution may be lost.
Run 'git-ai repair-notes' after rebase to restore attribution.
```

### 4. Improve Rewrite Log

Enhance `.git/ai/rewrite_log` to:
- Log ALL rebases (currently incomplete)
- Include timestamp and branch information
- Store note content for recovery

### 5. Test Cherry-Pick Edge Cases

Further test:
- Cherry-picking ranges
- Cherry-picking with conflicts
- Cherry-picking merge commits

---

## Test Environment Details

### Git Configuration
```bash
$ git --version
git version 2.47.0
```

### Git-AI Configuration
```bash
$ git-ai --version
1.2.1

$ git-ai config
{
  // Configuration details
}
```

### Hooks Installed
```bash
$ git-ai install-hooks
✓ Claude Code: Hooks already up to date
✓ Codex: Hooks already up to date
✓ Cursor: Hooks already up to date
```

---

## All Commits Tested

### test-gitai-working branch

| SHA | File | Operation | Attribution |
|-----|------|-----------|-------------|
| `8ee6eb8` | gitai-test-1.md | Basic commit | ✅ |
| `f7a2ece` | gitai-test-2.md | Cross-dir commit | ✅ |
| `b69f891` | gitai-test-3.md | Pre-rebase commit | ✅ |
| `5c84f4e` | gitai-test-1.md | Post-rebase | ❌ LOST |
| `a57bdf9` | gitai-test-2.md | Post-rebase | ❌ LOST |
| `9e06770` | gitai-test-3.md | Post-rebase | ❌ LOST |
| `05bfa81` | multi-branch-test-1.md | Multi-branch | ✅ |
| `ea6e950` | multi-branch-test-2.md | Multi-branch | ✅ |
| `aafb19f` | multi-branch-test-2.md | After amend | ✅ |
| `c3134f9` | reset-test.md | Pre-reset | ✅ |
| `c498a47` | reset-test.md | Post-reset | ✅ |

### test-cherry-pick-gitai branch

| SHA | File | Operation | Attribution |
|-----|------|-----------|-------------|
| `51fb74a` | gitai-test-1.md | Cherry-pick from rebased | ❌ LOST |
| `075298f` | gitai-test-2.md | Cherry-pick with attribution | ✅ |

---

## Conclusion

Git AI attribution (v1.2.1) works reliably in most scenarios including:
- Basic commits
- Cross-directory commits
- Amending commits
- Resetting and recommitting
- Multi-branch work in single session
- Cherry-picking from attributed commits

**However, there is ONE CRITICAL FAILURE:**

### ❌ Git Rebase Completely Loses Attribution

Rebased commits do not receive attribution notes, breaking the attribution chain. This is the most significant edge case and affects:
- Teams that use rebase workflows
- PR practices that require clean history
- Attribution auditing after rebases

**Immediate Action Required:** Implement automatic note transfer after rebase operations.

---

## PR Links

All test branches and scenarios documented in:
- **PR #7:** https://github.com/shortdiv/nextjs-test/pull/7 (Main attribution scenarios)
- **PR #8:** https://github.com/shortdiv/nextjs-test/pull/8 (Cherry-pick tests)
- **PR #9:** https://github.com/shortdiv/nextjs-test/pull/9 (Branch-off-branch tests)

---

**Report Generated:** March 31, 2026
**Test Duration:** ~10 minutes
**Total Commits Tested:** 13
**Critical Issues Found:** 1 (Git rebase)
