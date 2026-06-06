# Entertainment Contract Analyser

An AI-powered web app that reviews entertainment contracts and flags key legal clauses. Paste any music, film, television, or publishing agreement and get an instant clause-by-clause analysis powered by Claude AI.

## What it does

The app scans your contract for nine critical clause types and labels each one:

| Status | Meaning |
|--------|---------|
| **Found** | Clause is present and appears standard |
| **Flagged** | Clause is present but contains unusual or potentially harmful language |
| **Missing** | Clause is absent from the contract |

### Clauses analysed

- Royalty Rates
- Territory Restrictions
- Term Length
- Termination Rights
- IP Ownership
- Exclusivity
- Contract Adjustment
- Force Majeure
- Advance Recoupment

Results include a quoted excerpt from the contract, a plain-English summary, a specific concern for flagged clauses, and an overall risk rating (Low / Medium / High).

## Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd entertainment-contract-analyser
npm install
```

### 2. Add your API key

Copy `.env.example` to `.env` and add your Anthropic API key:

```bash
cp .env.example .env
```

Then edit `.env`:

```
ANTHROPIC_API_KEY=sk-ant-...
PORT=3000
```

Get an API key at [console.anthropic.com](https://console.anthropic.com).

### 3. Run the server

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

For development with auto-reload:

```bash
npm run dev
```

## Project structure

```
entertainment-contract-analyser/
├── server.js          # Express backend + Anthropic API integration
├── package.json
├── .env.example       # API key template
├── .gitignore
└── public/
    ├── index.html     # UI
    ├── style.css      # Styles
    └── app.js         # Frontend logic
```

## Tech stack

- **Backend**: Node.js, Express, `@anthropic-ai/sdk`
- **AI model**: Claude Opus 4.8
- **Frontend**: Vanilla HTML/CSS/JS (no build step needed)

## Security

The Anthropic API key is stored in a `.env` file and only accessed server-side. It is never exposed to the browser. The `.env` file is excluded from version control via `.gitignore`.

## Disclaimer

This tool is for informational purposes only. It does not constitute legal advice. Always consult a qualified entertainment lawyer before signing any contract.
