# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences of roughly equal weight, both of whom must succeed without the other:

- **Hiring managers and engineering leads** at AI labs and infrastructure teams, skimming for evidence that Ramshankar can build and scale training and inference systems. They arrive from an application, a referral, or a Substack post, usually with minutes to spare, and they are looking for specific numbers and whether those numbers name their baselines.
- **Machine readers** — recruiter-side ATS parsing, LLM screeners, and agents. The site is deliberately instrumented for them: `llms.txt`, JSON-LD `@graph` with a Person node, a WebMCP-annotated search form (`toolname="search-portfolio"`), an Agent Mode dashboard exposing a copyable system prompt and raw profile markdown, and an `agent-link` to `agnts.sh/ramshankar?raw`.

A secondary, non-governing audience: peer engineers from GPUMODE and the Substack readership.

## Product Purpose

A personal portfolio that converts a skim into contact. Ramshankar is **actively searching and open to most offers** in ML systems, training infrastructure, and inference engineering.

Success is **an inbound email or LinkedIn message** — not a booked call, not a subscription. The Cal.com scheduling link and the Substack CTA exist, but they are secondary paths; design decisions should be judged against whether a reader reaches out in their own channel.

## Positioning

Ramshankar works the full depth of the ML stack rather than one layer of it: distributed training pipelines and cluster orchestration at the top, model serving in the middle, and hand-written CUDA / HIP / Triton kernels at the bottom — with upstream commits in `huggingface/transformers` and LLVM to prove he operates inside other people's stacks, not only his own.

The differentiator a neighboring portfolio could not truthfully copy is **measurement discipline**: every performance claim on the site names the baseline it was measured against, and the benchmarking apparatus itself (a reward-hacking-resistant timing-and-correctness harness) is presented as the work, not just its output.

## Operating Context

- Readers arrive mid-triage, often with a job description open in another tab, comparing several candidates.
- The machine-reading path is real traffic, not a novelty: an LLM screener may summarize this site without a human ever loading the CSS. **Every substantive claim must survive tag-stripping** — nothing load-bearing may exist only inside an SVG, a background image, or JS-rendered DOM.
- Deployment is GitHub Pages via `.github/workflows/static.yml` on push to `main`. The live URL is `https://ramshankar07.github.io/portfoliov3/`.
- Public identity is the GitHub account **Ramshankar07**, which is not the committing git identity in this repo.

## Capabilities and Constraints

- Single-page site: `index.html` holds the entire experience (hero, about, projects, experience, notes, contact). `about.html`, `projects.html`, `blogs.html`, `contact.html` are `noindex` redirect stubs to `#` anchors. Two long-form posts live under `blogs/`.
- **All content is hardcoded HTML.** There is no data layer, template, or JSON. This is a deliberate choice: client-rendering would hide the strongest evidence from the machine-reading audience above. The correct trigger for introducing a data layer is a second consumer of the data, not file length.
- **`css/tailwind.min.css` is a frozen, hand-maintained subset.** Many ordinary Tailwind utilities are absent (`grid-cols-3/4` unprefixed, `tabular-nums`, `border-collapse`, `align-top`, `items-baseline`, `mt-*`, `pt-12`, `sticky`, `min-w-[...]`, `no-underline`). Any new class must be verified against that file or hand-written into `styles.css`. The `build:css` script in `package.json` outputs to `./dist/tailwind.css`, which the site does **not** load — the script is stale and is not the source of the shipped CSS.
- `styles.css` overrides many Tailwind utilities with `!important` to remap them onto CSS custom properties. This shim is load-bearing.
- Two JS behaviors impose hard contracts on markup: the scroll-spy (`script.js:141-169`) blanks the entire nav if a `<section id>` has no matching `#nav-links` href; the project filter (`script.js:171-203`) throws and disables all filtering if any direct child of `#projects-grid` lacks `data-category`.
- `three-bg.js` renders a Canvas 2D ASCII GPU-chip animation behind the hero — no WebGL, no library.
- The portfolio chatbot posts to a Cloudflare Worker whose URL is still **staging** (`portfolio-chatbot-staging...workers.dev`, `script.js:312`). Undecided whether this is intentional.
- No build step runs in CI; the deploy uploads the repo as-is.

## Brand Commitments

- Name and wordmark: `R` + serif-italic `B`.
- **Monochrome editorial / Swiss-print aesthetic is binding** — no chromatic accent anywhere. Inter throughout, with Times/serif italic reserved for accents in the logo, the name, and section titles. Numbered section rules. Hairline 1px borders. The user's standing instruction is refined polish over rebrand.
- Newsletter identity: "NerdingOut on AI" on Substack.
- Voice: plain, specific, numeric. Claims carry their baselines. No superlatives about rank or scale.

## Evidence on Hand

Real, verifiable, and already on the site:

- GPUMODE NVFP4 Blackwell leaderboards: 42nd (Grouped GEMM), 95th (Gated Dual GEMM); 3–6× over the challenge reference kernel.
- Qwen600 CUDA→ROCm/HIP port: 12.1 ms/token decode on a single MI300X at 79–83% of peak HBM bandwidth.
- vLLM serving-path optimization: inter-token latency spikes 70 ms → 48 ms; sustained capacity 12 → 32+ concurrent sessions on the same hardware.
- 8×A100 FSDP fine-tuning: 42% faster training, 85% fewer OOM failures.
- Three-cluster SkyPilot RL pipeline (trainer / FastAPI+Redis queue / preemptible spot GPU workers) with requeue-on-preemption.
- Merged: `huggingface/transformers` PR #46084. Open: `llvm/llvm-project` PR #175396.
- One portrait photo (`img/hero-section.*`), two long-form blog posts, four Substack posts.

**Absences future work must not fabricate:**

- **No resume or CV file exists in the repo.** The user has decided against adding one; the site is the resume.
- **No cost or GPU-spend figures are substantiable.** A "$12K monthly GPU cost" claim was deliberately removed from an earlier version. Never invent a cost-savings percentage.
- **No large-cluster experience.** The ceiling is 8×A100 single-node FSDP plus multi-cluster spot fleets. Never write "scaled training across large GPU clusters."
- **Observability depth is not substantiable.** The Prometheus / Grafana / OpenTelemetry work was model-*serving* observability in 2023. It must not be reframed as training-cluster observability.
- No testimonials, customer logos, press, pricing, or case studies. None may be invented.
- Multi-node runs beyond 8 GPUs exist but their node counts, interconnect, and scaling efficiency are **not yet captured anywhere**. Recording them is an open task, not a fact to guess at.

## Product Principles

1. **Every number names its baseline.** "3–6× over the challenge reference kernel", not "3–6× faster". A bare multiplier invites "than what?" and loses the room.
2. **Both readers, standalone.** A human with CSS and an LLM with tag-stripped text must each get the full argument. If a claim survives only one path, it is not shipped.
3. **The measurement is the work.** Benchmarking apparatus, profiling methodology, and reward-hacking resistance are the differentiator — present them as artifacts, not as footnotes to the speedups they produced.
4. **Understate scope, overstate specificity.** Print the rank, name the device, dash the unknown cell. Rigor reads as credibility; inflation is disqualifying the moment it is probed in an interview.
5. **Refine, never rebrand.** The monochrome editorial world is settled. New work sharpens within it.

## Accessibility & Inclusion

No standard was specified by the user, but the codebase carries existing commitments that future work must preserve: a skip link to `#main-content`, `:focus-visible` styling on interactive controls, `aria-pressed` on filter buttons, `aria-expanded`/`aria-controls` on the mobile menu, `sr-only` labels, and a global `prefers-reduced-motion: reduce` kill-switch with the scroll-driven timeline gated behind `prefers-reduced-motion: no-preference`.

## Open Decisions

- Whether the chatbot's **staging** Worker URL is intentional or an oversight.
- Whether to capture the multi-node training numbers (node counts, interconnect, scaling efficiency) that would close the site's weakest evidence gap.
- Whether the recent hard optimization toward one specific job description should be generalized, given the durable situation is a broad active search.
