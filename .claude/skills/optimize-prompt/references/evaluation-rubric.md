# Prompt Evaluation Rubric

Use this rubric to score prompts. Each criterion is rated: **Strong**, **Needs Work**, or **Missing**.

Not every criterion applies to every prompt. Mark non-applicable criteria as "N/A" rather than penalizing.

---

## The 14 Criteria

### 1. Clarity
> Would a colleague with minimal context understand exactly what to do?

- **Strong:** Instructions are unambiguous. A human could follow them without asking questions.
- **Needs Work:** Intent is guessable but some instructions are vague or could be interpreted multiple ways.
- **Missing:** Unclear what the prompt is asking for.

### 2. Specificity
> Are format, length, tone, scope, and constraints explicitly defined?

- **Strong:** Output requirements are precisely stated (format, length, tone, audience, scope).
- **Needs Work:** Some requirements stated, others left to inference.
- **Missing:** No output requirements defined. "Summarize this" with no further guidance.

### 3. Context
> Is all necessary background, motivation, and domain knowledge included?

- **Strong:** The prompt includes all business rules, conventions, and background needed. Rules include their reasoning.
- **Needs Work:** Some context provided but key assumptions are unstated.
- **Missing:** Assumes knowledge the model doesn't have.

### 4. Structure
> Are instructions, context, examples, and inputs clearly separated?

- **Strong:** Uses XML tags, headers, or clear visual separation between sections.
- **Needs Work:** Some structure but sections bleed together.
- **Missing:** Single undifferentiated block of text mixing everything.

### 5. Examples
> Are diverse, relevant few-shot examples provided?

- **Strong:** 3-5 examples covering happy path, edge cases, and ambiguous inputs.
- **Needs Work:** 1-2 examples or examples that are too similar to each other.
- **Missing:** No examples where they would significantly help (classification, formatting, tone).
- **N/A:** Task is straightforward and doesn't benefit from examples.

### 6. Positive Framing
> Does the prompt say what to do rather than what not to do?

- **Strong:** All instructions are framed as positive actions.
- **Needs Work:** Mix of positive and negative framing.
- **Missing:** Primarily "don't do X" instructions without stating the desired alternative.

### 7. Task Scope
> Is the prompt focused on a single coherent task?

- **Strong:** One clear task or a well-structured multi-step task with explicit ordering.
- **Needs Work:** 2-3 tasks bundled but could be separated for better results.
- **Missing:** Many unrelated tasks crammed into one prompt.

### 8. Output Specification
> Is the expected output format explicitly described or demonstrated?

- **Strong:** Format is either described precisely or shown via example.
- **Needs Work:** General format mentioned but details unclear.
- **Missing:** No indication of desired output format.

### 9. Reasoning Guidance
> For complex tasks, is the model guided to reason step-by-step?

- **Strong:** Appropriate reasoning guidance (general or structured) for the task complexity.
- **Needs Work:** Complex task with no reasoning guidance.
- **Missing:** N/A for simple tasks.
- **N/A:** Task is simple enough that step-by-step reasoning isn't needed.

### 10. Self-Verification
> Does the prompt ask the model to verify its answer?

- **Strong:** Includes explicit verification criteria or self-check step.
- **Needs Work:** Implies quality but doesn't provide verification criteria.
- **Missing:** No verification for a task where errors would be costly.
- **N/A:** Low-stakes task where verification adds unnecessary overhead.

### 11. Safety Guardrails
> Are destructive or irreversible actions gated behind confirmation?

- **Strong:** Dangerous operations require explicit user confirmation.
- **Needs Work:** Some guardrails but gaps exist.
- **Missing:** Prompt could lead to destructive actions without safeguards.
- **N/A:** Prompt involves no destructive or irreversible actions.

### 12. Language Calibration
> Is the language appropriate for the target model?

- **Strong:** Natural, clear language without unnecessary emphasis markers (CRITICAL, MUST, etc.).
- **Needs Work:** Some over-emphasis or legacy patterns that may cause overtriggering.
- **Missing:** Heavy use of ALL CAPS, threats, or incentives that don't work on modern models.

### 13. Long-Context Handling
> For data-heavy prompts, is data at the top and query at the bottom?

- **Strong:** Reference data placed before instructions/query. Key constraints reiterated at the end.
- **Needs Work:** Data and instructions interleaved.
- **Missing:** Large data blocks placed after the query.
- **N/A:** Prompt is short and doesn't include reference data.

### 14. Iterative Readiness
> Has the prompt been tested and refined based on actual outputs?

- **Strong:** Evidence of iteration (edge case handling, specific constraints that address known failure modes).
- **Needs Work:** First draft with reasonable coverage but untested.
- **Missing:** Generic template with no task-specific refinement.

---

## Scoring Summary

Count the number of **Strong** ratings (excluding N/A criteria):

| Score | Assessment |
|-------|------------|
| 12-14 | Excellent -- minor tweaks at most |
| 9-11 | Good -- a few targeted improvements will help |
| 6-8 | Needs Work -- significant gaps to address |
| 0-5 | Major Rewrite -- fundamental restructuring needed |

**Priority order for improvements:** Fix Missing criteria first, then Needs Work, starting with criteria 1-4 (Clarity, Specificity, Context, Structure) as these have the highest impact.
