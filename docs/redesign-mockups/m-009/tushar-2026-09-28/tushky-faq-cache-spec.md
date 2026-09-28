# Ask Tushky FAQ / suggested-question cache (Tushar, 2026-09-28, verbatim §44–66)

## 44. FAQ / SUGGESTED-QUESTION CACHE

Add a cache layer for:

- suggested questions
- high-frequency recruiter questions
- common profile questions
- common product questions

The goal is:

1. reduce response latency
2. reduce Gemini API usage
3. make common answers feel instant
4. keep answers consistent
5. still allow Gemini to handle open-ended or novel questions

The flow should be:

```
User question
↓
normalize question
↓
check exact / canonical FAQ match
↓
if cache hit:
    return cached grounded answer immediately
↓
if no cache hit:
    retrieve relevant profile context
↓
call Gemini
↓
return generated answer
↓
optionally cache eligible response
```

## 45. SUGGESTED QUESTIONS SHOULD BE PRE-CACHED

Every suggested question shown in the Ask Tushky UI should have a pre-generated / curated answer.

Examples:

- Who is Tushar?
- What products has Tushar built?
- What AI experience does he have?
- What are his strongest skills?
- Tell me about TeachSpark.
- Tell me about RailCite.
- What is his current role?
- What enterprise programs has he worked on?
- What cloud experience does he have?
- What certifications does he have?
- What is his product thinking process?
- What is his research background?

When a user clicks one of these suggested questions, do NOT wait for Gemini unless the cached answer is stale or missing.

Return the cached answer immediately.

## 46. CANONICAL FAQ DATA STRUCTURE

Create a source such as `/data/tushky/faq.json` or an equivalent structured file.

Example:

```json
[
  {
    "id": "who-is-tushar",
    "question": "Who is Tushar?",
    "aliases": [
      "Tell me about Tushar",
      "Who is Tushar Pathak?",
      "Give me an overview of Tushar",
      "Introduce Tushar"
    ],
    "answer": "...",
    "sources": [
      {
        "label": "About",
        "href": "/about"
      }
    ],
    "followUps": [
      "What products has he built?",
      "What is his AI experience?"
    ],
    "updatedAt": "..."
  }
]
```

Keep cached answers separate from UI code.

## 47. NORMALIZE FAQ QUESTIONS

Do not only match exact text.

Normalize incoming questions:

- lowercase
- trim whitespace
- remove unnecessary punctuation
- normalize apostrophes
- collapse repeated spaces

Then compare against:

- canonical FAQ question
- aliases
- suggested prompt IDs

For example, "Tell me about Tushar" and "Can you tell me about Tushar?" should resolve to the same canonical FAQ when confidence is high.

## 48. DO NOT USE LLM MATCHING FOR EVERY CACHE LOOKUP

The cache exists to reduce latency.

Do NOT call Gemini merely to decide whether a question matches the cache.

Use lightweight matching first, in priority order:

1. exact normalized match
2. alias match
3. deterministic keyword / intent matching
4. lightweight local similarity if already available
5. Gemini only if it is genuinely a new question

Do not make the cache lookup slower than the Gemini call itself.

## 49. CACHE RESPONSE FORMAT

Cached answers should use the same response contract as Gemini-generated answers.

Example:

```json
{
  "answer": "...",
  "sources": [...],
  "suggestedFollowUps": [...],
  "sourceType": "faq-cache"
}
```

Generated response:

```json
{
  "answer": "...",
  "sources": [...],
  "suggestedFollowUps": [...],
  "sourceType": "gemini"
}
```

This lets the frontend render both identically.

## 50. TUSHKY PERSONALITY IN CACHED ANSWERS

Cached answers should already be written in Tushky's voice.

They should preserve:

- warm professional tone
- concise structure
- evidence-first answers
- occasional subtle dog personality

Use "woof woof 🐾" sparingly.

Do NOT dynamically append "woof woof" to every cached answer.

The personality should be part of the curated answer itself.

## 51. CACHE INVALIDATION

This is critical.

Professional information changes. Cached answers must not become stale.

Tie cache validity to a profile/content version.

Example:

```
PROFILE_DATA_VERSION="2026-09-28-v1"
```

or generate a hash from the canonical data files.

Each cached answer should store:

- updatedAt
- profileVersion
- source dependencies

Example:

```json
{
  "id": "current-role",
  "profileVersion": "2026-09-28-v1",
  "dependsOn": [
    "experience",
    "profile"
  ]
}
```

If source content changes, invalidate/rebuild related FAQ answers.

Do NOT keep stale career information indefinitely.

## 52. STATIC VS RUNTIME CACHE

Use two levels if useful.

**LEVEL 1 — Curated static FAQ cache**

For suggested/common questions. Stored in repository / structured content.

Benefits:

- deterministic
- instant
- no Gemini dependency
- reviewable

**LEVEL 2 — Runtime response cache**

For repeated non-FAQ questions. Use only if the hosting stack supports it cleanly.

Possible:

- Redis / Upstash
- Vercel KV
- framework cache
- server memory only if deployment model makes it meaningful

Do NOT add infrastructure unnecessarily.

Start with static FAQ caching first.

## 53. RUNTIME CACHE KEY

If runtime caching is implemented, do not simply cache raw question text.

Create a normalized key using:

- profile version
- normalized question
- response language
- relevant configuration version

Conceptually:

```
tushky:
{profileVersion}:
{language}:
{normalizedQuestionHash}
```

This ensures old profile answers do not survive profile updates.

## 54. RUNTIME CACHE TTL

Use a sensible TTL.

For stable professional-profile questions, 24 hours to several days is reasonable.

But profile-version invalidation should remain the primary freshness mechanism.

Do NOT cache indefinitely without versioning.

## 55. WHAT SHOULD NOT BE CACHED

Do NOT cache:

- user-specific conversational follow-ups without enough context
- ambiguous pronoun questions such as "what about that one?"
- sensitive/private questions
- errors
- refusals caused by malformed inputs
- answers based on temporary state
- long multi-turn contextual questions

Only cache queries whose answer is context-independent and safely reusable.

## 56. CACHE-AWARE FOLLOW-UP LOGIC

Example:

User: "Tell me about RailCite."

This can use cached FAQ answer.

Then user: "What was the hardest decision?"

This depends on previous context.

Do NOT use a generic cache blindly.

Use conversation context + retrieval + Gemini.

## 57. CACHE HIT UX

For cached suggested questions, the answer should feel nearly instant.

Target:

- immediate bubble creation
- optional 100–250ms intentional UI delay if needed for naturalness
- no fake 2–3 second typing animation

Do NOT artificially slow down cached answers.

Tushky can briefly show:

"Found it 🐾"

or simply render immediately.

Prefer speed.

## 58. GEMINI FALLBACK

Cache should never block open-ended intelligence.

If no high-confidence FAQ match exists, go directly to retrieval + Gemini.

Do not force unrelated questions into the closest cached answer.

Correctness is more important than cache hit rate.

## 59. CACHE CONFIDENCE RULE

Only use a cached FAQ answer when match confidence is high.

If unsure, use Gemini.

Avoid cases such as:

Question: "What did Tushar learn from TeachSpark?"

incorrectly matching:

"Tell me about TeachSpark."

The second can be cached. The first may need generated reasoning grounded in TeachSpark evidence.

## 60. PRE-GENERATE FAQ ANSWERS

Create a small build/admin script or documented process to refresh FAQ answers.

Preferred workflow:

```
canonical profile data changes
↓
run FAQ refresh
↓
Gemini generates candidate FAQ answers
↓
validate against source context
↓
write/update FAQ cache
↓
human-review if needed
↓
deploy
```

Do NOT silently regenerate public answers on every production request.

## 61. FAQ ANSWER REVIEWABILITY

Because these are recruiter-facing answers, keep cached answers inspectable.

I should be able to open `faq.json` or equivalent and review/edit:

- question
- aliases
- answer
- sources
- follow-ups

without understanding chatbot internals.

## 62. ANALYTICS FOR CACHE EFFECTIVENESS

If Mixpanel/server analytics already exist, track:

`Ask Tushky Cache Hit`

Properties:

```json
{
  faq_id,
  question_category
}
```

`Ask Tushky Gemini Fallback`

Properties:

```json
{
  question_category
}
```

Do NOT log private raw question text unnecessarily.

This should help measure:

- cache-hit rate
- common questions
- where new FAQs should be added
- Gemini usage reduction

## 63. PERFORMANCE TARGET

Target behavior:

- Suggested question / FAQ cache hit: as close to instant as practical
- Generated Gemini response: stream first tokens quickly

The system should prioritize:

cache → retrieval → Gemini

not:

Gemini → cache

## 64. FULL REQUEST PIPELINE

The final pipeline should be:

```
User submits question
↓
validate input
↓
normalize question
↓
check suggested/FAQ cache
↓
CACHE HIT?
    YES
      → return cached structured answer immediately
    NO
      ↓
      determine whether question is cache-eligible
      ↓
      retrieve relevant Tushar context
      ↓
      send system instruction + retrieved context + question to Gemini
      ↓
      stream structured answer
      ↓
      optionally runtime-cache if safe and reusable
      ↓
      return to UI
```

## 65. CACHE TEST CASES

Test at minimum:

- **EXACT FAQ:** "What products has Tushar built?" → cache hit
- **ALIAS:** "Which products has Tushar built?" → cache hit if configured alias
- **CASE/PUNCTUATION:** "WHAT PRODUCTS HAS TUSHAR BUILT??" → cache hit
- **OPEN-ENDED:** "What product mistake taught Tushar the most?" → Gemini
- **FOLLOW-UP:**
  - "Tell me about RailCite." → cache
  - "What was hardest about it?" → Gemini using conversation context
- **UPDATED PROFILE:** change current role in source data → stale current-role FAQ must no longer be served

## 66. REPORT CACHE IMPLEMENTATION

After implementation, report:

1. Number of pre-cached FAQs
2. FAQ source file
3. Alias-matching strategy
4. Runtime cache used, if any
5. Cache TTL, if any
6. Profile-version invalidation method
7. Which questions are excluded from caching
8. Expected cache-hit path latency
9. Gemini fallback path
10. Analytics used to measure cache effectiveness
