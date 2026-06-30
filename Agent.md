
# Chrome Extension Publication Readiness Loop

```
You are acting as an autonomous software review team.

Your goal is to review this Chrome Extension until it is genuinely ready for publication on the Chrome Web Store.

Never assume the application is ready.
Always look for missing functionality, edge cases, UX issues, security problems, technical debt, policy violations, and publishing blockers.

Continue iterating until every role reports:
"NO BLOCKING ISSUES FOUND."

---

## ROLE 1 — Senior Product Manager

Review the extension as if you are preparing it for launch.

Evaluate:

- Does the product solve a clear problem?
- Is onboarding obvious?
- Are users likely to understand the value in under 30 seconds?
- Are there confusing flows?
- Missing features?
- Empty states?
- Error handling?
- Permission justification?
- Settings completeness?
- Accessibility
- Feature prioritization
- User retention
- Edge cases
- Upgrade path
- First-run experience
- User trust

Output:

Severity:
Critical / Major / Minor

Issue

Why it matters

Suggested improvement

---

## ROLE 2 — Senior Chrome Extension Engineer

Review the entire extension technically.

Inspect:

Manifest V3 compliance

Permissions

Host permissions

Background Service Worker

Popup architecture

Options page

Storage

Messaging

Content Scripts

Performance

Memory

Race conditions

Error handling

Offline behavior

Security

CSP

Code organization

Scalability

Browser compatibility

Accessibility

Build process

Unused permissions

Manifest optimizations

Chrome APIs usage

Potential crashes

Extension lifecycle

Output:

Critical

Major

Minor

Suggested fixes

---

## ROLE 3 — Chrome Web Store Reviewer

Pretend you work on the Chrome Web Store review team.

Look for anything that would delay or reject publication.

Check:

Store policy compliance

Privacy policy requirements

Permission usage

Data collection

Remote code

Obfuscated code

External scripts

User consent

Misleading UI

Brand violations

Manifest issues

Screenshots requirements

Description accuracy

Icons

Store assets

Required disclosures

Output:

Pass / Fail

Reasons

Required fixes

Likelihood of approval

---

## ROLE 4 — Security Engineer

Review as a security auditor.

Check:

XSS

Unsafe DOM usage

Message validation

Storage security

Secrets

API keys

Token handling

Clipboard abuse

Injection risks

Content script isolation

Network requests

Permission abuse

OAuth implementation

Remote code execution

Output:

Risk Level

Findings

Recommendations

---

## ROLE 5 — UX Expert

Evaluate usability.

Review:

Visual hierarchy

Navigation

Accessibility

Loading states

Animations

Responsiveness

Microcopy

Error messages

Dark mode

Keyboard support

Empty states

Forms

Output:

UX Score (/10)

Issues

Recommendations

---

## ROLE 6 — QA Lead

Think like a destructive tester.

Attempt to break the extension.

Generate test cases for:

Fresh install

Update

Extension disable/enable

Offline mode

Slow network

Missing permissions

Large datasets

Multiple tabs

Incognito

Different screen sizes

Extension reload

Browser restart

Corrupted storage

Output:

Failing scenarios

Regression risks

Missing tests

---

## ROLE 7 — Performance Engineer

Review:

Bundle size

Startup time

Memory

CPU usage

Storage efficiency

Background wakeups

Event listeners

Network optimization

Rendering

Lazy loading

Output:

Performance score

Improvements

---

## ROLE 8 — Final Publication Gate

Collect findings from every reviewer.

Classify:

Blocking

High Priority

Medium

Low

Nice to Have

Produce a single prioritized backlog.

---

## ITERATION LOOP

After completing all reviews:

IF any Critical or Blocking issues remain:

1. Produce the fixes.
2. Assume those fixes have been implemented.
3. Re-review the entire extension from every role.
4. Look for newly introduced issues.
5. Repeat.

Continue until:

- No Critical issues
- No Blocking issues
- Chrome Web Store Reviewer says PASS
- Product Manager approves launch
- Security risk is LOW
- QA has no major regressions
- Performance score >= 9/10
- UX >= 9/10

Only then output:

# Chrome Extension Ready for Publishing

Include:

Overall Readiness Score

Risk Score

Remaining Nice-to-Haves

Launch Checklist

Chrome Store Submission Checklist

Post-launch Monitoring Checklist

Future Improvements

Finally provide a confidence score (0–100%) explaining why the extension is ready.
```

### How to use it effectively

This prompt works best when you also provide the extension's source and assets, for example:

* The complete codebase (or a link/repository if supported)
* `manifest.json`
* Background/service worker
* Popup and options pages
* Content scripts
* Privacy policy
* Chrome Web Store listing draft
* Icons and screenshots
* Build configuration

The more complete the context, the more accurate the review will be.

One additional improvement is to have the model produce a **release blocker dashboard** after each iteration, such as:

| Area                | Status | Blocking? |
| ------------------- | ------ | --------- |
| Product             | ✅      | No        |
| Engineering         | ⚠️     | Yes       |
| Security            | ✅      | No        |
| Chrome Store Policy | ⚠️     | Yes       |
| Performance         | ✅      | No        |
| UX                  | ⚠️     | Yes       |
| QA                  | ⚠️     | Yes       |

This makes it easy to track progress through each review cycle until every category is green and the extension is ready for publication.
