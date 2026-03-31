# AI Attribution Testing - Failure Report

**Date:** March 31, 2026
**Repository:** https://github.com/shortdiv/nextjs-test
**Test Environment:** Linux 6.17.0-1007-aws, Claude Code CLI

## Executive Summary

All tested scenarios show **complete absence of AI attribution**. The attribution system appears to not be functioning in this environment:
- No git notes under `refs/notes/ai`
- No `.git/ai/` directory created
- No checkpoint files found

## Critical Findings

### 1. No Attribution Infrastructure Present

**Issue:** The `.git/ai/` directory does not exist and is never created during any git operations.

**Evidence:**
```bash
$ ls -la .git/ai/
ls: cannot access '.git/ai/': No such file or directory
```

**Expected behavior:** According to the context provided, checkpoint files should be stored at:
```
/<projectname>/.git/ai/working_logs/old-<SHACOMMIT>/checkpoints.jsonl
```

**Actual behavior:** The entire `.git/ai/` directory structure is missing.

---

### 2. Git Notes Reference Invalid

**Issue:** Git notes under `refs/notes/ai` are reported as invalid for all commits.

**Evidence:**
```bash
$ git log --notes=ai
warning: notes ref refs/notes/ai is invalid
```

**Tested on commits:**
- All commits created during this session
- All commits in all branches
- All commits in PRs

**Expected behavior:** `git log --notes=ai` should display attribution metadata including prompt objects.

**Actual behavior:** Warning issued and no notes displayed for any commit.

---

## Scenario-Specific Findings

### Scenario 1: Basic Commits from Repository Root

**Branch:** `test-attribution-scenarios`
**PR:** [#7](https://github.com/shortdiv/nextjs-test/pull/7)

#### Commit 1: Initial edit
- **SHA:** `cf0f4ab` (before rebase) → `5ae35e8` (after rebase)
- **File modified:** `src/app/page.tsx`
- **Working directory:** `/home/ubuntu/nextjs-test` (repo root)
- **Attribution present:** ❌ NO
- **Notes:** Standard commit from repo root with file edits

#### Commit 2: README update
- **SHA:** `feb5023` (before rebase) → `1b14424` (after rebase)
- **File modified:** `README.md`
- **Working directory:** `/home/ubuntu/nextjs-test` (repo root)
- **Attribution present:** ❌ NO

#### Commit 3: Package.json update
- **SHA:** `6bc4501` (before rebase) → `ace5842` (after rebase)
- **File modified:** `package.json`
- **Working directory:** `/home/ubuntu/nextjs-test` (repo root)
- **Attribution present:** ❌ NO

---

### Scenario 2: Commits from Different Directory

**Issue:** Attribution not recorded when committing from outside the repository directory.

**Branch:** `test-attribution-scenarios`
**PR:** [#7](https://github.com/shortdiv/nextjs-test/pull/7)

#### Commit details:
- **SHA:** `feb5023` (before rebase) → `1b14424` (after rebase)
- **File modified:** `README.md`
- **Command working directory:** `/home/ubuntu` (parent directory)
- **Git command used:** `git -C nextjs-test add/commit`
- **Attribution present:** ❌ NO
- **Notes:** Tested cross-directory git operations using -C flag

---

### Scenario 3: Post-Rebase Attribution

**Issue:** Attribution not preserved or re-created after interactive rebase.

**Branch:** `test-attribution-scenarios`
**PR:** [#7](https://github.com/shortdiv/nextjs-test/pull/7)

#### Rebase operation:
- **Type:** Interactive rebase (`git rebase -i HEAD~3`)
- **Operation:** Reworded first commit
- **Commits affected:** 3

#### Commit SHA mappings:
| Original SHA | After Rebase | Attribution |
|--------------|--------------|-------------|
| `cf0f4ab` | `5ae35e8` | ❌ NO |
| `feb5023` | `1b14424` | ❌ NO |
| `6bc4501` | `ace5842` | ❌ NO |

**Notes:**
- All commits got new SHAs after rebase
- No attribution on original commits
- No attribution on rebased commits
- Date stamps in commit updated to rebase time

---

### Scenario 4: Cherry-Pick Attribution

**Issue:** Attribution not preserved when cherry-picking commits between branches.

**Source branch:** `test-attribution-scenarios`
**Target branch:** `test-cherry-pick`
**PR:** [#8](https://github.com/shortdiv/nextjs-test/pull/8)

#### Cherry-pick details:
- **Source commit:** `1b14424` (Add attribution testing note to README)
- **Cherry-picked commit SHA:** `9e5ea3f`
- **Attribution on source:** ❌ NO
- **Attribution on cherry-picked commit:** ❌ NO

**Notes:**
- Source commit had no attribution to begin with
- Cherry-pick created new commit with new SHA
- No attribution metadata transferred or created

---

### Scenario 5: Multi-Branch Commits in Single Session

**Issue:** No attribution when committing to multiple branches within a single prompt session.

**Branches tested:**
1. `test-attribution-scenarios` (parent branch)
2. `feature-off-test` (branch created off test-attribution-scenarios)

**PR:** [#9](https://github.com/shortdiv/nextjs-test/pull/9)

#### Commit sequence:
1. **Branch:** `feature-off-test`
   - **SHA:** `ef5158d`
   - **File created:** `TESTING.md`
   - **Attribution:** ❌ NO

2. **Branch:** `test-attribution-scenarios`
   - **SHA:** `3d01a3e` (later amended to `931c8bf`)
   - **File created:** `ATTRIBUTION_NOTES.md`
   - **Attribution:** ❌ NO

**Notes:**
- Both commits made in same prompt session
- Branched from non-main branch (branch-off-branch)
- Neither commit has attribution

---

### Scenario 6: History Rewriting Operations

**Branch:** `test-attribution-scenarios`
**PR:** [#7](https://github.com/shortdiv/nextjs-test/pull/7)

#### 6a. Git Commit --amend

**Issue:** Attribution not preserved or created after amending commit.

- **Original commit SHA:** `3d01a3e`
- **Amended commit SHA:** `931c8bf`
- **File modified:** `ATTRIBUTION_NOTES.md`
- **Attribution before amend:** ❌ NO
- **Attribution after amend:** ❌ NO

**Notes:**
- Amend operation created new commit SHA
- No attribution transferred to new commit

#### 6b. Git Reset + Re-commit

**Issue:** Attribution not created after git reset and recommit.

**Operation sequence:**
1. Created commit `3690f27` (Add temporary file for reset testing)
2. Performed `git reset --soft HEAD~1`
3. Re-committed as `060f4b8` (Add temp file after git reset)

- **Original commit SHA:** `3690f27` (reset and lost)
- **New commit SHA:** `060f4b8`
- **File:** `temp.txt`
- **Attribution on original:** ❌ NO (checked before reset)
- **Attribution on new commit:** ❌ NO

---

### Scenario 7: Pull Requests and GitHub Context

**Issue:** No attribution visible in GitHub pull request context.

**Pull Requests created:**
- **PR #7:** Test AI attribution in various git scenarios
  - Branch: `test-attribution-scenarios`
  - Commits: 5 commits
  - URL: https://github.com/shortdiv/nextjs-test/pull/7

- **PR #8:** Test cherry-pick attribution
  - Branch: `test-cherry-pick`
  - Commits: 1 commit (cherry-picked)
  - URL: https://github.com/shortdiv/nextjs-test/pull/8

- **PR #9:** Test branch-off-branch attribution
  - Branch: `feature-off-test`
  - Commits: 1 commit
  - URL: https://github.com/shortdiv/nextjs-test/pull/9

**Verification method:**
```bash
gh pr view 7 --json commits
git log --notes=ai <commit-sha>
```

**Attribution in PR context:** ❌ NO for all PRs and all commits

---

## All Commits Created and Tested

### test-attribution-scenarios branch (PR #7)

| Commit SHA | Message | Attribution | Notes |
|------------|---------|-------------|-------|
| `5ae35e8` | Update homepage with attribution testing content | ❌ NO | After rebase |
| `1b14424` | Add attribution testing note to README | ❌ NO | After rebase, committed from /home/ubuntu |
| `ace5842` | Add test script to package.json | ❌ NO | After rebase |
| `931c8bf` | Add attribution notes documentation | ❌ NO | After amend |
| `060f4b8` | Add temp file after git reset | ❌ NO | After reset + recommit |

**Original SHAs (before rebase):**
- `cf0f4ab` → ❌ NO attribution
- `feb5023` → ❌ NO attribution
- `6bc4501` → ❌ NO attribution

**Lost SHAs (reset):**
- `3d01a3e` → ❌ NO attribution (amended)
- `3690f27` → ❌ NO attribution (reset)

### test-cherry-pick branch (PR #8)

| Commit SHA | Message | Attribution | Notes |
|------------|---------|-------------|-------|
| `9e5ea3f` | Add attribution testing note to README | ❌ NO | Cherry-picked from 1b14424 |

### feature-off-test branch (PR #9)

| Commit SHA | Message | Attribution | Notes |
|------------|---------|-------------|-------|
| `ef5158d` | Add testing documentation file | ❌ NO | Branch-off-branch scenario |

---

## Summary Statistics

- **Total commits created:** 11 unique commits (including original and rewritten)
- **Commits with attribution:** 0
- **Attribution success rate:** 0%
- **Scenarios tested:** 7
- **Scenarios with working attribution:** 0
- **Pull requests created:** 3
- **PRs with attribution:** 0

---

## Technical Environment

```bash
$ git --version
git version 2.47.0

$ gh --version
gh version 2.62.0 (2024-10-29)

$ pwd
/home/ubuntu/nextjs-test

$ git remote -v
origin  git@github.com:shortdiv/nextjs-test.git (fetch)
origin  git@github.com:shortdiv/nextjs-test.git (push)
```

---

## Hypotheses for Attribution Failure

### 1. Attribution System Not Initialized
The `.git/ai/` directory structure is never created, suggesting:
- Attribution system may require explicit initialization
- Git hooks may not be installed to capture attribution
- Attribution may only work in specific project configurations

### 2. Missing Git Notes Infrastructure
The `refs/notes/ai` reference is invalid, suggesting:
- Git notes for AI attribution are never created
- No post-commit hooks are capturing commit metadata
- Attribution tracking may be disabled or unavailable

### 3. Environment or Configuration Issue
- Attribution may require specific Claude Code settings
- May need to be run from Claude Code IDE integration rather than CLI
- Could require explicit opt-in or configuration

### 4. Project-Specific Requirements
- Attribution may only work in projects initialized by Claude Code
- May require specific project structure or configuration files
- Could be limited to certain git remote types or providers

---

## Recommended Next Steps

1. **Verify Attribution System Requirements**
   - Check if attribution requires explicit initialization command
   - Verify if specific hooks need to be installed in `.git/hooks/`
   - Confirm environment variable or config requirements

2. **Test in Known Working Environment**
   - Create fresh repository via Claude Code
   - Test if attribution works in projects initialized by Claude
   - Compare git configuration between working and non-working repos

3. **Check Git Notes Creation Mechanism**
   - Investigate how git notes should be created (hooks? post-commit?)
   - Check if git notes need explicit pushing (`git push origin refs/notes/ai`)
   - Verify git notes configuration in git config

4. **Investigate .git/ai Structure**
   - Determine what triggers creation of `.git/ai/` directory
   - Check if working_logs directory requires manual creation
   - Verify permissions and ownership requirements

5. **Review Attribution Documentation**
   - Check if attribution is opt-in vs automatic
   - Review system requirements for attribution
   - Verify if specific Claude Code version or mode required

---

## Questions for Engineering Team

1. **Is the attribution system expected to work in this environment?**
   - Linux CLI, cloned repository
   - Not initialized by Claude Code
   - Using ssh authentication

2. **What triggers the creation of `.git/ai/` directory?**
   - Is it created on first commit?
   - Does it require explicit command?
   - Are there prerequisites?

3. **How are git notes under `refs/notes/ai` supposed to be created?**
   - Post-commit hook?
   - Claude Code internal mechanism?
   - Manual process?

4. **Are there any visible attribution systems working?**
   - Should we see logs/debug output?
   - Are there CLI flags to enable verbose attribution?
   - Alternative attribution methods besides git notes?

5. **Is this a known limitation?**
   - Does attribution only work in IDE integrations?
   - Are there specific project types that support attribution?
   - Environmental constraints?

---

## Conclusion

**Finding:** Attribution system is completely non-functional in the tested environment. Zero attribution was recorded across 11 commits spanning 7 different git scenarios including basic commits, cross-directory commits, rebases, cherry-picks, multi-branch operations, amends, and resets.

**Root cause:** The fundamental attribution infrastructure (`.git/ai/` directory and `refs/notes/ai` git notes) is never created or initialized.

**Impact:** Without addressing the root cause, no edge cases can be properly evaluated. The attribution system must first be made functional before testing edge case scenarios.

**Recommendation:** Investigate and resolve the core attribution initialization and recording mechanism before proceeding with edge case testing.
