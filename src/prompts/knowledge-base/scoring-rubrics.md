# Scoring System — Binary Checklists

Every manager uses BINARY checks, not 1-10 vibes scores. A check either PASSES or FAILS. There is no "7/10." The output either meets the standard or it doesn't.

---

## WHY BINARY, NOT SCORED

An AI scoring its own output 1-10 will give itself 8-9 every time. It can rationalize any line as "intentional" or "stylistic choice." Binary checks cannot be rationalized:
- "Is there a specific number?" → either there is or there isn't.
- "Is the verb on the approved list?" → either it is or it isn't.
- "Does the library beat yours on this dimension?" → either it does or it doesn't.

---

## UNIVERSAL CHECKS (Every Agent, Every Output)

These apply to ALL writing output across all agents.

**CHARACTER MECHANICS:**
- [ ] No word appears as first word of consecutive sentences
- [ ] No one-word sentences anywhere
- [ ] No three consecutive sentences of similar length (within ±20 characters)
- [ ] No filler transitions (additionally, furthermore, moreover, in addition)
- [ ] No passive voice ("is analyzed by" → "[Product] analyzes")
- [ ] No hedging (can help, may improve, could potentially)
- [ ] No banned words from slop-dictionary.md (scan every word)
- [ ] Present tense throughout (no "will", "would" except in before/after comparisons)

**STRUCTURAL:**
- [ ] Follows the library structure for its section type
- [ ] Character count within target range for section type
- [ ] Every claim backed by a specific number or named entity
- [ ] Product referred to by NAME, never "the platform" / "the tool" / "the system"

**STYLE MATCH:**
- [ ] 3-example library comparison completed
- [ ] Library is NOT better on >2 dimensions in ANY comparison
- [ ] Weakest line in output is stronger than weakest line in library for that section type
- [ ] No section resembles a BEFORE pattern from before-afters.md

**INVENTION NOVELTY (the "discovered electricity" check):**
- [ ] Does the copy make a CATEGORY-CREATING claim? ("The world's first [X]", "The first [X] that [Y]") — If the library hooks make bolder category claims than yours, yours fails.
- [ ] Would a tech journalist use "breakthrough" or "first-of-its-kind" in their headline about this? If no → the novelty isn't there.
- [ ] Does this feel like the FUTURE ARRIVING TODAY, or like an incremental improvement? If incremental → rewrite with bolder framing.

---

## HOOK-SPECIFIC CHECKS (10 total)

1. [ ] Contains a specific dollar amount or user count
2. [ ] Contains a verb from the approved violent verbs list (extracted in Pattern Card)
3. [ ] Enemy is a specific noun (not "the industry", "challenges", "the market")
4. [ ] "World's first" category understandable to a non-expert
5. [ ] Ends with approved transition line
6. [ ] Total ≤ 3 sentences + transition
7. [ ] Total ≤ 300 characters
8. [ ] Brand-specific test: swap competitor name in → hook BREAKS (if still works = too generic = FAIL)
9. [ ] No banned openers or words
10. [ ] Before/after pattern check: resembles an AFTER, not a BEFORE

---

## BODY-SPECIFIC CHECKS (15 total)

1. [ ] Starts with "Let's say you're a [specific business] [goal with number]"
2. [ ] Demo has 7+ distinct steps (count explicitly)
3. [ ] Every step uses sacred flow starter (list each)
4. [ ] At least 1 "Let's ask [Product]:" prompt moment
5. [ ] At least 1 "Now let's try" pivot
6. [ ] "Here's what makes it different" max 1x (count)
7. [ ] No "I" outside founder dialogue (scan)
8. [ ] No imperative commands (scan for "Connect your", "Click the", "Upload")
9. [ ] No one-word sentences (scan)
10. [ ] No same-word consecutive starters (list first words)
11. [ ] Intelligence moment present and mid-demo
12. [ ] Named brands in social proof (3+ names)
13. [ ] Every claim has specific number or entity
14. [ ] Body ≤ 900 characters
15. [ ] No BEFORE patterns from before-afters.md

---

## GIVEAWAY-SPECIFIC CHECKS (8 total)

1. [ ] Starts with celebration framing ("To celebrate...")
2. [ ] Giveaway is a TOOL or RESOURCE (not trial, not discount, not "early access")
3. [ ] Has "The right [operator/person/creative] could..." line
4. [ ] Right operator line has specific dollar outcome
5. [ ] X CTA includes "Retweet and comment"
6. [ ] LinkedIn CTA includes "Comment"
7. [ ] Trigger word is 1 word and brand-related
8. [ ] Giveaway is valuable WITHOUT buying the product

---

## SPECIALIST-SPECIFIC CHECKS

**Weapons (per insertion):**
- [ ] Weapon is from one of the 6 categories in weapons-library.md
- [ ] Weapon is brand-specific (not generic "AI is changing everything")
- [ ] Weapon flows with surrounding lines (not jarring)
- [ ] Same length or shorter than the line it replaced

**Controversy (per insertion):**
- [ ] Would someone screenshot this specific line? (the screenshot test)
- [ ] Tied to product positioning (not random provocation)
- [ ] Provocative without targeting protected groups
- [ ] Flows naturally with surrounding context

**Technical Writer (per upgrade):**
- [ ] Line sounds like a domain expert wrote it
- [ ] Line is still clear to a non-expert (mom test)
- [ ] Names specific technology, data source, or count
- [ ] Same length or shorter than original

**Flow (full body):**
- [ ] Hook→body transition smooth
- [ ] No consecutive same-length sentences (±20 chars)
- [ ] Every line leads to the next (remove any line and you'd feel the gap)
- [ ] Energy builds through demo, peaks at intelligence moment

---

## LIBRARY DOMINANCE TEST (Used by all managers)

Place your output next to 2-3 best library equivalents. Per comparison, score 5 dimensions as EQUAL / BETTER / WORSE:

1. **Specificity** — which uses more concrete numbers, names, data sources?
2. **Intensity** — which uses stronger verbs, bolder claims?
3. **Clarity** — which is easier to understand on first read?
4. **Brevity** — which says the same thing in fewer words?
5. **Memorability** — which would you screenshot?

**FAIL if WORSE on ≥2 dimensions against ANY comparison.**

This is the "would it belong in the library?" test made mechanical. If the library consistently beats your output on multiple dimensions, your output is below the floor.

---

## ADVERSARIAL MANAGER MINDSET

Every manager starts from REJECT. The protocol is:

1. Run all binary checks → any fail = REJECT with specific diagnosis
2. Run library dominance → WORSE on ≥2 = REJECT with specific comparison
3. Only after BOTH pass → APPROVE with explicit evidence

When rejecting:
- Quote the specific failing check
- Quote the library example that exposes the gap
- Rewrite the failing section yourself at library standard
- Re-run checks on your rewrite
- Max 3 push rounds per section

**The goal is not to approve. The goal is to catch everything that isn't perfect.**
