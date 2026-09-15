<div align="center">

<h1>PaperLoom</h1>

<p><em>Weave papers into proof-linked experiences.</em></p>

<p><strong>Name a paper. Get an interactive site where every claim points back to a page and a quote.</strong></p>

<p>
PaperLoom turns research papers into verifiable, learnable, runnable workspaces —
powered by the coding agent you already use, with no second API key.
</p>

<p>
  <img src="https://img.shields.io/badge/Node.js-20%2B-2E7254?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node 20+"/>
  <img src="https://img.shields.io/badge/Next.js-16-191B18?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js 16"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/License-MIT-E75B37?style=for-the-badge" alt="MIT License"/>
</p>

<p><strong>Works with the agent you already have</strong></p>

<p>
  <a href="#claude-code"><img src="https://img.shields.io/badge/Claude_Code-D97757?style=for-the-badge&logo=claude&logoColor=fff" alt="Claude Code"/></a>
  <a href="#codex"><img src="https://img.shields.io/badge/Codex-412991?style=for-the-badge&logo=openai&logoColor=fff" alt="Codex"/></a>
  <a href="#antigravity-cli"><img src="https://img.shields.io/badge/Antigravity_CLI-4285F4?style=for-the-badge&logo=google&logoColor=fff" alt="Antigravity CLI"/></a>
</p>

</div>

---

## The problem

Summarising a paper takes seconds. **Trusting the summary takes hours.**

Ask any model to summarise a paper and you get fluent prose you cannot check. Which sentence
came from which page? Is this something the authors measured, or something they suggested?
To find out you have to go back to the paper — so the summary saved you nothing.

**PaperLoom inverts that.** Every claim carries the page and the exact quote it rests on. Measured
results, author interpretation and background are labelled separately. Anything the excerpt does
not directly support is never marked verified.

---

## One sentence is the whole interface

You do not need the PDF.

```text
Explain Attention Is All You Need using the PaperLoom plugin.
```

PaperLoom finds the paper on arXiv, downloads it, gathers published context (version history, DOI,
venue, citation counts), reads it page by page, and opens a finished local site in your browser.

---

## What you actually get

### Run the paper's own equations

Drag sliders on live playgrounds built from the paper's own formulas. Parameters start at verified
values and warn you when you leave the region the paper actually tested.

### Learn what the paper assumes

Prerequisites ordered so nothing depends on something you have not read yet. Each one explains
why *this* paper needs it — not a generic definition. LaTeX renders as native MathML.

### Check whether you understood it

Every quiz question links to evidence. Get one wrong and PaperLoom shows the page and the original
quote behind the right answer.

### Read it as a narrative

Figures sit beside the paragraph that argues them — joined by shared claims, not guessed placement.

### See where the evidence is thin

The evidence health panel is auditable: verified vs needs-review counts, uncited page ranges,
unused claims, and single-claim sections — all computed from project data, offline-safe.

### Compare two papers without picking a winner

Line up benchmarks under the same unit, duplicate definitions, and each side's limitations.
Every number carries its source page; both papers stay visible.

### Send someone a link to one claim

Every claim and story section has its own anchor in the studio and in the portable single-file copy.

---

## Install in under a minute

Pick your agent. Two commands, then restart — the plugin is the same on all three.

<a id="claude-code"></a>

### Claude Code

```bash
claude plugin marketplace add keshav-077/paperloom --scope user
claude plugin install paperloom@paperloom-tools --scope user
```

Restart Claude Code. That is it.

<a id="codex"></a>

### Codex

```bash
codex plugin marketplace add keshav-077/paperloom --ref main
codex plugin add paperloom@paperloom-tools
```

Restart Codex or open a new session. You can also invoke the skill with `$paperloom`.

<a id="antigravity-cli"></a>

### Antigravity CLI

Antigravity installs plugins from a directory, so clone first:

```bash
git clone https://github.com/keshav-077/paperloom.git
cd paperloom
agy plugin install plugins/paperloom
```

Confirm with `agy plugin list`, then restart the CLI or open a new session.

**Requirements:** Node.js 20+, and `pdftotext` (Poppler) for page-accurate extraction.

```bash
brew install poppler        # macOS
sudo apt install poppler-utils   # Debian / Ubuntu
```

### Then ask

```text
Explain Attention Is All You Need using the PaperLoom plugin.
```

```text
Take this paper and give me the output using the PaperLoom plugin: ./paper.pdf
```

When it finishes, the browser opens — self-contained site plus full application, project in your Library.
Nothing to export, import, or start manually. A portable `.trace.json` lives alongside for archiving.

---

## Why it is different

| | Typical AI summary | PaperLoom |
| --- | --- | --- |
| Provenance | Prose you have to trust | Page + exact quote per claim |
| Claim types | Blended together | Measured / interpretation / background |
| Uncertainty | Hidden | Unsupported stays `needs-review` |
| Your role | Read | Read, run equations, test yourself |
| Missing data | Plausible guess | Source dropped, not guessed |
| Cost | Another API key | Your agent's existing model |

---

## The full application

The plugin is one way in. The web app adds generation with your own provider keys, an editable
narrative, and a local library under `~/.trace/library`.

```bash
git clone https://github.com/keshav-077/paperloom.git
cd paperloom
npm install
npm run dev
```

Open `http://localhost:3000`. Press *Open the example project* (or `?sample=1`) for the fully enriched
*Attention Is All You Need* demo.

**Workspaces:** `Lab` inspects evidence · `Story` edits narrative · `Preview` is the reading experience.

---

## Development

```bash
npm run dev              # development server
npm run lint             # eslint
npm run test             # vitest
npm run build            # production build
npm run check            # full CI locally
```

---

## License

[MIT](LICENSE) © Kesavardhan Makireddi

<div align="center">
<br>
<sub>Built for researchers who verify before they trust.</sub>
</div>
