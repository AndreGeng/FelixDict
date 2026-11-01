# Launcher installation and E2E record status — 2026-11-01

An existing workspace report describes native UI checks of the `a860706`
0.2.1 Development build. Its screenshots and UI-operation evidence were not
available for review in the current session, so those reported checks remain
**pending verification**. They must not be treated as confirmed E2E acceptance of
the published 0.2.1 packages.

During the current session, native application access was denied by the
computer-control tool. Builds, type checks, automated regressions, live provider
requests, installed Alfred CLI output and installation-file checks passed; these
checks do not substitute for native UI E2E.

See the [archived report and verification limits](docs/e2e-2026-11-01.md).

---

# Google and Bing dictionary lookup — 2026-11-01

- Added independent `GoogleDictionary` / `BingDictionary` tasks behind existing
  public `Google` / `Bing` switches. Translation failures and dictionary failures
  remain isolated; no API key or additional runtime dependency was added.
- Google website response (`translate.googleapis.com/translate_a/single`,
  `client=gtx`, `dt=t,bd,rm,md`) was checked with `run`, `hello`, `running`, and
  `你好`: returned source readings, translations grouped by part of speech, and
  source-language definitions where available. Readings are not necessarily IPA.
  A follow-up with `dj=1` exposed `base_form`; the matching array fields
  are `dict[][3]` and `definitions[][2]`. Live checks confirmed `went -> go` and
  `children -> child`, now displayed as dictionary base forms. No complete
  inflection list was found; `dt=rw` / `dt=at` probes did not expose one either.
  This does not establish that no Google product has an inflection table.
- Bing dictionary source: <https://cn.bing.com/dict/search?q=run&cc=cn&setlang=zh-hans>.
  The summary card was checked with the same four inputs. `run` returned US/UK
  phonetics, noun/verb senses, web definitions and `ran`, `runs`, `running` forms.
  Missing fields remain empty. The explicit locale parameters avoid an observed
  English-locale response that omitted the summary card.
- New lookups are limited to unprefixed Han/Latin words or short phrases (up to
  80 characters and four space-separated words, without sentence punctuation).
  Bing dictionary is English–Chinese and runs only for English/Chinese targets.
  Explicit target prefixes continue to request translation only. Google dictionary
  requests follow the detected source and preferred/secondary target settings.
- Live Alfred CLI check with **Youdao disabled**, `providers=Google,Bing`:
  `run` returned both dictionaries, Bing inflections and both translations, with
  no provider errors; `:ja hello` returned only two Japanese translations and no
  dictionary rows. Adapter checks verify shared result/action data; native
  Alfred/Raycast/Vicinae UI interactions were not exercised for this change.
- `npm run typecheck` passed, including Python checks. `npm test`: 51 TypeScript
  tests passed, one release-only test skipped, and six Python tests passed.
  `npm run build` passed for Alfred, Vicinae and Raycast. Deterministic tests cover
  nested Bing markup/entities, missing fields, malformed responses, source reading
  selection, target routing, provider toggles and failure isolation. Cache schema
  advanced from 5 to 6 so old result snapshots are not reused.
- Website endpoints are undocumented contracts and can change. These observations
  do not establish dictionary coverage or linguistic accuracy for every language.

---

# Youdao language matrix and request correction — 2026-11-01

- See [language test report](docs/youdao-language-support.md) for all tested directions.
- 31 directions checked: 30 returned translations; English -> Portuguese failed
  for three texts with a decrypted upstream response code 40. Chinese/Portuguese
  both ways, Portuguese -> English and German -> Portuguese returned translations.
- Chinese -> Spanish repeatedly returned an unrelated translation for one weather
  sentence; two other texts and English -> Spanish returned appropriate results.
  This is recorded separately from transport/language-pair availability.
- Found and fixed missing anonymous numeric@host OUTFOX_SEARCH_USER_ID header:
  without it, even Chinese/English sentences returned code 50 while short words
  could succeed. Numeric client cookie restored long-text requests. No browser
  cookies or actual client IP addresses are read. Code 50 is no longer described
  as evidence of an unsupported language pair.
- Deterministic tests cover the header format and consistent request identity;
  upstream code 40 yields a safe provider-specific message without losing results
  from other sources.

---

# Youdao multilingual translation — 2026-11-01

- Public provider configuration remains `Youdao,Google`; enabling Youdao now
  schedules its dictionary/suggestions where applicable and a separate internal
  translation task. Existing saved provider settings need no migration.
- The shared adapter retrieves web translation parameters, signs requests,
  decrypts AES responses, preserves paragraphs and resolves target preferences
  from auto/auto detection. Users do not need an API key.
- Live provider checks passed: hello → 你好, 你好 → Hello, :ja 你好 → こんにちは,
  こんにちは → 你好, :fr 你好 → Bonjour, :ko 你好 → 안녕하세요,
  and :ja hello → こんにちは (about 1.3–2.0 seconds per call).
- Live Alfred launch.sh --query with only Youdao enabled and :ja hello returned
  an initial pending response, completed its detached worker without errors,
  and rendered/copied/spoke こんにちは in the resulting JSON. Temporary cache removed.
- Type checking passed; 45 TypeScript tests and 6 Python tests passed. Five new
  deterministic translation tests cover encrypted responses, target preferences,
  source selection, paragraphs, malformed data and provider error isolation.
- Alfred, Vicinae and Raycast builds and release packaging passed, including
  archive integrity/checksums. The opt-in release test passed separately.
- Endpoint language-pair coverage is limited; arbitrary pairs and all 11 targets
  are not guaranteed. Launcher GUI behavior and Arch Linux were not tested here.
  Changes have not been committed or published.

---

# Bing live diagnosis — 2026-11-01

- No implementation changes were needed to pass the current smoke checks.
- Translator page returned HTTP 200 at `https://www.bing.com/translator`;
  existing IG/IID/key/token parsing succeeded (token values were not recorded).
- Five sequential uncached provider calls passed: `hello` → 你好 (three calls),
  `你好` → Hello, and `:ja hello` → こんにちは. Observed duration: 2.6–3.0 seconds.
- Alfred launcher `--query hello` with only Bing enabled and a temporary cache
  returned an initial pending response, completed its detached worker without
  errors, and rendered 你好 on the subsequent query. Temporary cache was removed.
- The historical failure could not be reproduced. Earlier records contain no
  HTTP status, response or transport error sufficient to identify its cause;
  do not attribute it to networking, rate limiting or parsing without evidence.
- This verifies the current development machine/network and CLI path only,
  not launcher GUI behavior, Arch Linux, other networks or long-term availability.
  Default providers remain Youdao + Google.

---

# Monorepo migration verification — 2026-10-30

- npm workspaces: `apps/alfred`, `apps/vicinae`, `packages/core`; one root lockfile.
- All maintained Node sources, scripts and tests are TypeScript with strict checking. Generated JavaScript is excluded from Git.
- Clean temporary checkout: `npm ci`, `npm run typecheck`, all 32 TypeScript tests and 5 Python tests passed; Vicinae built successfully.
- Added archive regression: extracted Alfred package runs outside the repository with its bundled `@felixdict/core` package.
- Live extracted Alfred CLI: `--query :ja hello` returned rerun 0.3, detached worker completed, and subsequent query returned `こんにちは`.
- Alfred JSON matched pre-migration HEAD on three mixed-result, pending/error, and empty fixtures.
- Native Vicinae UI loaded the migrated extension and displayed `ins` definitions and suggestions. Its manifest retains CommonJS for the SDK bundle; TypeScript helper modules use `.mts`.
- Existing Alfred installed workflow was not overwritten. Linux desktop testing remains outstanding.

The following records describe earlier releases and retain their historical paths/commands.

---

# Verification — 2026-10-25

Implemented and packaged version: 0.1.6.

Version 0.1.6 acceptance:

- 22 Node tests and 4 Python tests passed. Added regression coverage for preferred
  target/secondary language routing, explicit overrides, detected regional language
  codes, invalid or identical settings, configuration exposure, and CLI cache
  isolation for changes to either setting.
- The new language-preference test failed before implementation, then passed.
- Live Google CLI checks: en/ja + 你好 → Hello; en/ja + hello → こんにちは;
  en/ja + :fr hello → Bonjour; ja/en + 東京 → Tokyo;
  unchanged zh/en defaults + hello → 你好.
- Live normal --query path: initial pending JSON, detached worker, then repeated
  CLI calls returned こんにちは for hello with en/ja preferences. The worker state
  completed with no pending sources and exactly one cache file.
- Both language settings are included in cache schema 4. Worker subprocesses
  inherit the same settings as the query process. Youdao dictionary/suggestion
  scope is unchanged and can be disabled independently.
- New package contains the language settings and updated bilingual documentation.
  Updated the local Alfred installation through its import UI, preserving workflow
  customisations. Preferences confirmed v0.1.6 and both language fields with zh/en
  defaults. Bing live requests remain unverified. UI hints remain primarily Chinese.

Version 0.1.5 acceptance:

- 20 Node tests and 3 Python tests passed after adding multilingual regression
  coverage. The new language tests failed before the implementation, then passed.
- Live Google checks passed for Japanese with kana/kanji, Korean, French, Chinese,
  explicit Japanese/Korean/French/German/Spanish targets, and kanji-only 東京.
  Examples: 今日はいい天気です → 今天天气很好; 안녕하세요 → 你好;
  :ja 你好 → こんにちは; :fr 你好 → Bonjour; 東京 → 东京.
- Actual CLI `--wait ':ja 你好'` produced Japanese text and a speech argument of 你好,
  excluding the language command. Invalid/incomplete targets and Youdao-only
  translation configurations return actionable guidance without network calls.
- Tests cover target parsing, Japanese script routing, upstream language-based
  direction correction, all eleven configured targets, dictionary exclusion,
  speech prefix stripping, and CLI guidance. Cache schema was incremented so the
  previous translation-direction results cannot be reused.
- Alfred Preferences visibly loaded 0.1.5. Actual incremental Alfred query
  `ed :ja hello` displayed こんにちは as a Google translation result.
- Bing target routing was updated, but its live endpoint remains unverified on
  this network. Multilingual speech voice quality was not verified; it depends
  on the current macOS voice. Dictionary phonetics/forms and prefix suggestions
  retain their English–Chinese scope.

Version 0.1.4 acceptance:

- 15 Node tests and 3 Python tests passed. Candidate actions now reuse the normal
  result-row actions: Enter copies the word, Command-Return speaks the full
  candidate rather than the input prefix, Command-L shows the word and explanation;
  Tab still completes the query.
- Removed the speech-to-SEARCH connection and query echo, which previously caused
  re-entry and list redraw after speech. The SEARCH-to-SPEECH connection retains
  its keep-open flag. A regression test prevents restoring the refresh loop.
- Alfred Preferences visibly loaded 0.1.4 with no outgoing connection from SPEECH.
- UI: selecting transfer under `ed trans` and pressing Command-L displayed the
  candidate word and the explanation supplied by Youdao Suggest in Large Type.
  Escape returned to the list. Enter then executed the action and cleared the query.
  This acceptance copied the test candidate to the clipboard.
- Physical Command-Return playback/window stability still needs manual validation;
  the existing automation limitation below applies. The redraw loop was confirmed
  in the old graph and removed, but the absence of all visible jitter is not claimed
  from static routing tests.

Earlier-version checks (historical behavior where noted):

- `node --test`: 15 passing tests, no external services or real HOME changes.
- Python package regression checks: 3 passing tests. The Run Script object uses
  schema version 2; version 3 in 0.1.0 caused Alfred's incompatible-workflow error.
  The schema regression test failed before this fix and passed afterward.
- `bash -n launch.sh`: passed.
- Package builder validates ZIP integrity and reads back its generated plist.
- Live provider checks passed for `hello`, `你好`, `getHTTPServer`, and
  `The request was cancelled because a newer query was started.` with
  the default Youdao + Google providers. No failure rows in these checks.
- One terminal run observed cold query completion in roughly 0.7–1.2 seconds.
  This is a single local smoke check, not a performance guarantee.
- Actual incremental CLI polling: first pending response about 48 ms, completed
  results within about 960 ms; cached query about 77 ms. Tested with a temporary
  cache directory removed after the check.
- Bing's translator page was accessible, but translation requests failed in
  the development network. It is optional and disabled by default.

- Alfred Preferences visibly loaded version 0.1.1 and displayed all three workflow
  objects (Script Filter, Run Script, Universal Action), without the incompatibility
  warning. The observed Alfred version was 5.8.1 [2349].
- Version 0.1.2 imported with a dedicated Command speech branch. Both links on
  this branch veto closing Alfred; speech runs in the background and passes the
  original query back to the Script Filter. The regression check covers routing.
- UI check: `ed hello` displayed dictionary and Google results. Command-L displayed
  the full selected dictionary sense in Large Type; Escape returned to the query.
- Version 0.1.3 was updated through Alfred Preferences. Live `ed trans` displayed
  six prefix candidates with Chinese explanations, following the first dictionary
  meaning: transfer, transition, transaction, transform, transport, transient.
- UI acceptance: selecting transfer and pressing Return changed the field to
  `ed transfer`, kept Alfred open and displayed transfer's dictionary results.
  Selecting transition and pressing Tab changed the field to `ed transition`.
- Suggestion regression tests cover English-prefix gating, the enabled-Youdao
  requirement, malformed responses, deduplication, exact-word exclusion, prefix
  filtering, the six-item limit, autocomplete routing and silent failure fallback.
- A live `--wait trans` check also returned the six candidates alongside Youdao
  and Google results, without provider errors.
- UI automation could not verify Command-Return: injected modifier actions were
  observed in Alfred's debugger as plain copy actions. Physical-key validation of
  the speech branch and its window retention remains necessary.

Not verified in Alfred UI: Universal Actions routing, physical Command-Return,
local speech playback and speech-window retention.
These remain manual acceptance items; CLI JSON and unit tests are not full UI E2E.

The fixed workflow is now present in Alfred. UI automation action attempts hit the
copy branch and copied a test dictionary sense. No dependency installation,
publication or push was performed.
