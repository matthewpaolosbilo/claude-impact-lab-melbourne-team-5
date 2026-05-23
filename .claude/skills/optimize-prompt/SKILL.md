---
name: optimize-prompt
description: |
  Analyze and optimize a prompt for clarity, structure, and effectiveness using
  evidence-based techniques from Anthropic's documentation and prompt engineering research.
  Use when asked to "optimize prompt", "improve prompt", "review my prompt",
  "make this prompt better", "prompt engineering help", "refine prompt",
  "fix my prompt", "prompt feedback", or when the user pastes a prompt and
  asks for improvements.
argument-hint: "[paste prompt text, or path to file containing prompt]"
---

# Prompt Optimizer

Analyze an input prompt and produce an optimized version with explanations for every change. Grounded in Anthropic's official prompt engineering guidance and research-backed techniques.

## Input

`$ARGUMENTS` -- the prompt to optimize. Can be:
- Inline text (pasted directly)
- A file path to read (`.md`, `.txt`, or any text file)
- Empty -- ask the user to provide a prompt

If `$ARGUMENTS` is empty or unclear, ask:
> "Paste the prompt you'd like me to optimize, or give me a file path to read."

## Process

### Phase 1: Analyze the Prompt

Score the input prompt against the evaluation rubric in [evaluation-rubric.md](references/evaluation-rubric.md). For each criterion, assign a rating (Strong / Needs Work / Missing) and note specific issues.

Present the analysis as a scorecard:

```
## Prompt Analysis

| Criterion | Rating | Notes |
|-----------|--------|-------|
| Clarity | Strong | ... |
| Specificity | Needs Work | Format not defined |
| ... | ... | ... |

**Overall: X/14 criteria strong**
**Priority improvements:** [top 3 issues to fix]
```

### Phase 2: Optimize the Prompt

Apply the optimization techniques from [techniques.md](references/techniques.md), prioritizing the highest-impact changes first. Work through these categories in order:

1. **Structure** -- Add XML tags, headers, or sections to separate concerns
2. **Clarity** -- Rewrite vague instructions to be specific and actionable
3. **Positive framing** -- Convert "don't do X" to "do Y instead"
4. **Context** -- Add missing background, motivation, or domain knowledge
5. **Examples** -- Add or improve few-shot examples if the task benefits from them
6. **Output specification** -- Define format, length, tone, and scope explicitly
7. **Reasoning guidance** -- Add chain-of-thought or self-verification where beneficial
8. **Long-context handling** -- Restructure data-heavy prompts (data at top, query at bottom)
9. **Safety** -- Add guardrails for destructive or irreversible actions if relevant

For each change, note WHY it improves the prompt (not just what changed).

### Phase 3: Present the Result

Output the optimized prompt and a changelog explaining every change:

```
## Optimized Prompt

<the full optimized prompt, ready to copy>

## Changelog

### Structure
- **Added XML tags** to separate instructions from input data -- reduces ambiguity when mixing context with directives
- ...

### Clarity
- **Specified output format** as markdown table -- removes guesswork about presentation
- ...

### Examples
- **Added 2 few-shot examples** covering happy path and edge case -- steers format and depth
- ...
```

### Phase 4: Offer Next Steps

After presenting the optimized prompt, offer:

1. **Iterate** -- "Want me to adjust anything? I can tweak tone, add more examples, or restructure."
2. **Test** -- "Want me to run the optimized prompt and compare outputs?"
3. **Variants** -- "Want me to generate alternative approaches (e.g., chain-of-thought vs. direct, system prompt vs. user prompt)?"

## Important Rules

- **Show, don't just tell.** Always produce the full optimized prompt, not just advice.
- **Preserve intent.** The optimized prompt must achieve the same goal as the original. Do not add features or change scope.
- **Explain every change.** Each modification needs a brief "why" so the user learns the technique.
- **Don't over-engineer.** If the prompt is already good, say so and suggest minor tweaks. Not every prompt needs XML tags and 5 examples.
- **Calibrate to the model.** For Claude 4+ models, use natural language over rigid directives. Avoid "CRITICAL:", "YOU MUST", "IMPORTANT:" unless genuinely needed -- these cause overtriggering on newer models.
- **One task per prompt.** If the input bundles multiple tasks, recommend splitting into separate prompts with a chaining strategy.

## Reference Files

- [techniques.md](references/techniques.md) -- catalog of optimization techniques with examples and when to apply each
- [evaluation-rubric.md](references/evaluation-rubric.md) -- the 14-criterion scoring rubric for prompt quality assessment
