# Prompt Optimization Techniques

Catalog of evidence-based techniques, ordered by impact. Each includes when to apply, how to apply, and a before/after example.

---

## 1. Structural Separation (XML Tags)

**When:** The prompt mixes instructions, context, examples, or variable inputs in a way that could be ambiguous.

**How:** Wrap distinct sections in descriptive XML tags. Use consistent naming across prompts.

**Common tags:**
- `<instructions>` -- what the model should do
- `<context>` -- background information
- `<input>` -- the variable data to process
- `<examples>` with nested `<example>` -- few-shot demonstrations
- `<output_format>` -- expected structure of the response
- `<constraints>` -- boundaries and rules

**Before:**
```
You are a code reviewer. Review the following code for bugs and style issues.
The code is in TypeScript and follows Angular conventions. Here's the code:
function getData() { return fetch('/api') }
Please be thorough and suggest fixes.
```

**After:**
```xml
<instructions>
Review the provided TypeScript code for bugs and style issues.
For each issue found, classify severity (critical/warning/suggestion) and provide a fix.
</instructions>

<context>
The codebase uses Angular with standalone components and OnPush change detection.
Follow Angular style guide conventions.
</context>

<input>
function getData() { return fetch('/api') }
</input>

<output_format>
For each issue:
- **Location:** line number or code snippet
- **Severity:** critical | warning | suggestion
- **Issue:** what's wrong
- **Fix:** corrected code
</output_format>
```

---

## 2. Specificity and Explicit Output Definition

**When:** The prompt uses vague language like "summarize this", "help with this", or "make it better" without defining format, length, tone, or scope.

**How:** Replace vague instructions with precise requirements. Define the output format explicitly.

**Checklist of things to specify:**
- Format (prose, bullet points, table, JSON, code)
- Length (word count, number of items, max paragraphs)
- Tone (formal, casual, technical, accessible)
- Audience (developer, executive, end-user)
- Scope (what to include, what to exclude)

**Before:**
```
Summarize this article.
```

**After:**
```
Summarize this article in 3-5 bullet points for a technical audience.
Each bullet should be one sentence covering a key finding or recommendation.
Use precise technical terms without simplifying.
```

---

## 3. Positive Framing

**When:** The prompt contains "don't", "never", "avoid", or other negative instructions.

**How:** Reframe as what the model SHOULD do. Then provide the reason WHY.

**Before:**
```
Don't use jargon. Don't make it too long. Never include code examples.
```

**After:**
```
Use plain language accessible to a general audience.
Keep the response under 200 words.
Focus on conceptual explanation rather than code -- the reader needs to understand the "why" before seeing implementation.
```

**Why this works:** LLMs respond more reliably to positive directives. Negative framing requires the model to infer the correct alternative, which introduces ambiguity.

---

## 4. Few-Shot Examples

**When:** The task requires specific formatting, tone, or judgment that's hard to describe in words. Especially valuable for brand voice, classification, and structured extraction.

**How:** Provide 3-5 examples wrapped in `<examples>` tags. Include:
- At least one happy-path example
- At least one edge case
- Diversity in inputs to prevent the model from latching onto surface patterns

**Before:**
```
Classify these customer messages as positive, negative, or neutral.
```

**After:**
```
Classify each customer message as positive, negative, or neutral.
Respond with just the label.

<examples>
<example>
Input: "The new dashboard is incredible, saved me hours this week!"
Output: positive
</example>
<example>
Input: "It works I guess. Nothing special."
Output: neutral
</example>
<example>
Input: "This broke all my templates and nobody warned us about the migration."
Output: negative
</example>
<example>
Input: "Thanks for the quick fix, though the original bug was frustrating."
Output: positive
</example>
</examples>
```

**Tip:** The last example shows a mixed-sentiment message to demonstrate how to handle ambiguity. Include at least one such edge case.

---

## 5. Context and Motivation

**When:** The prompt assumes knowledge the model doesn't have (business rules, project conventions, user preferences), or gives a rule without explaining why.

**How:** Add a context section with the relevant background. For rules, explain the reason -- Claude generalizes better from understanding than from rigid directives.

**Before:**
```
Always use snake_case for API responses.
```

**After:**
```
Use snake_case for all API response field names.
Our API consumers are primarily Python services that expect snake_case by convention, and our API gateway does not perform case transformation.
```

---

## 6. Chain of Thought / Reasoning Guidance

**When:** The task involves complex logic, multi-step reasoning, math, or decisions with tradeoffs.

**How:** For Claude 4+ models, prefer general guidance ("think through this step by step") over prescriptive multi-step instructions. The model's own reasoning often outperforms hand-written chains.

**For explicit CoT (when general guidance isn't enough):**

```
Before answering, reason through the problem step by step in <thinking> tags.
Then provide your final answer in <answer> tags.
```

**Self-verification pattern:**
```
After generating your answer, verify it against these criteria:
1. Does it handle the empty-input case?
2. Are all edge cases from the examples covered?
3. Is the output format consistent with the specification?
If any check fails, revise before presenting.
```

---

## 7. Role / Persona Assignment

**When:** The task benefits from a specific perspective, expertise level, or communication style.

**How:** Set the role in the system prompt with specific expertise and judgment criteria, not just a title.

**Before:**
```
You are an expert.
```

**After:**
```
You are a senior TypeScript developer with deep expertise in Angular and RxJS.
You prioritize runtime safety over brevity, prefer explicit types over inference,
and flag potential memory leaks in Observable subscriptions.
```

---

## 8. Task Decomposition

**When:** The prompt asks for multiple distinct tasks in one request (classify + extract + summarize + draft).

**How:** Either split into separate prompts chained together, or clearly delineate the sub-tasks with explicit ordering.

**Before:**
```
Read this support ticket, classify it, extract the key entities, determine priority, and draft a response.
```

**After (chained approach):**
```
Step 1: Classify this support ticket into one of: bug, feature-request, question, complaint.
Step 2: Extract key entities (product, version, error message, user action).
Step 3: Determine priority (P1-P4) based on user impact and frequency.
Step 4: Draft a response using the classification and priority to set the tone.

Present each step's output separately before moving to the next.
```

---

## 9. Long-Context Optimization

**When:** The prompt includes large amounts of reference data (documents, code, logs) alongside instructions.

**How:** Place data at the top, instructions and query at the bottom. This improves accuracy by up to 30% on retrieval tasks.

**Structure:**
```
<documents>
[all reference material here]
</documents>

<instructions>
[task instructions here]
</instructions>

<query>
[specific question or task]
</query>
```

**For very long contexts:** Ask the model to first quote relevant passages from the documents before answering. This grounds the response in source material and reduces hallucination.

---

## 10. Anchor Point Strategy

**When:** Prompts exceed ~1000 tokens. Models can lose focus on instructions buried in the middle.

**How:** State the primary goal at the top, place reference data in the middle, and reiterate formatting rules and output requirements at the bottom.

```
# Goal
[Primary objective -- 1-2 sentences]

# Context & Data
[All reference material, background, documents]

# Instructions
[Detailed task instructions]

# Output Requirements (Reminder)
[Reiterate format, length, and key constraints from the goal]
```

---

## 11. Calibrated Language for Modern Models

**When:** Always, when writing prompts for Claude 4+ models.

**How:** Use natural, clear language. Avoid the "shouting" patterns that were needed for older models.

**Patterns to avoid on Claude 4+:**
- `CRITICAL:`, `IMPORTANT:`, `YOU MUST`, `NEVER EVER` -- these cause overtriggering
- `I'll tip you $200 if you get this right` -- no effect on modern models
- ALL CAPS for emphasis -- use natural emphasis or structure instead
- Excessive repetition of the same instruction

**Instead:** Write clear, specific instructions with reasoning. One well-explained directive beats three repeated ones.

---

## 12. Self-Critique Loop (Multi-Turn)

**When:** High-stakes outputs where quality matters more than speed (reports, documentation, important communications).

**How:** Generate a draft, then have the model critique it against specific criteria, then revise.

```
Step 1: Draft the response.
Step 2: Review your draft against these criteria:
  - Is every claim supported by the provided data?
  - Is the tone appropriate for the audience?
  - Are there any logical gaps?
Step 3: List issues found.
Step 4: Rewrite addressing all issues.
Present only the final version.
```
