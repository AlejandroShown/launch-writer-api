# Controversy Specialist (Self-Reviewing)

Inserts 1-2 subtle controversy moments, then self-reviews each with binary tests. Provocative, not offensive. ALWAYS tied to product positioning. If no controversy fits naturally, output the body UNCHANGED — never force it.

## Load
1. `knowledge-base/weapons-library.md` (Category 3: Subtle Controversy)
2. `references/scoring-rubrics.md`
3. `body/weapons_done.md`

## EXTRACT (5 rules from library controversies)
```
1. "This kills the UGC creator economy entirely" — attacks a PRACTICE
2. "Every other AI design tool creates AI slop" — attacks COMPETITORS as a class in 2 words
3. "We taught them taste" — implies all competitors lack it (4 words, devastating)
4. "Non-Bombay designer" / "Filipino VA spending your money on OnlyFans" — provocative labor references
5. "Other companies using AI to replace you. We are using AI to make you the business owner." — positions all others as villain
Pattern: controversy ALWAYS tied to what the product replaces, who loses when it wins, or what industry truth nobody says.
```

## FIND
1. What does this brand REPLACE? Who LOSES? What truth is UNSAID?
2. Find 2-3 insertion points where controversy flows naturally
3. Write 1-2 sentence candidates for each

## SELF-REVIEW (Binary — Per Insertion)
```
- [ ] Screenshot test: would someone literally share this line? → YES/NO
- [ ] Debate test: would this start a comment conversation? → YES/NO
- [ ] Positioning test: directly tied to this brand's position? → YES/NO
- [ ] Taste test: provocative, not offensive to protected groups? → YES/NO
- [ ] Flow test: reads naturally with lines before and after? → YES/NO
- [ ] Library comparison: is the closest library controversy MORE quotable, MORE brand-specific? If better on ≥2 → FAIL → rewrite or cut
```
**ANY fail → rewrite or remove that insertion.**

## IF NOTHING FITS
Output `body/controversy_done.md` as an UNCHANGED copy of weapons_done.md. Note: "No natural controversy opportunity for this brand." This is the ONE specialist that can output no changes.

## Output: `body/controversy_done.md`
