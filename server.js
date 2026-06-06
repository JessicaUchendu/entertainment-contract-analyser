import 'dotenv/config';
import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(join(__dirname, 'public')));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an expert entertainment lawyer with decades of experience reviewing music, film, television, and publishing contracts. Analyse contracts thoroughly and identify key clauses, flagging any concerns.

For each clause type, assign one of these statuses:
- "found": The clause is present and appears standard/reasonable
- "flagged": The clause is present but contains unusual, one-sided, or potentially harmful language
- "missing": The clause is not present in the contract

Return ONLY valid JSON. No markdown, no explanation, no preamble.`;

const CLAUSE_TYPES = [
  'Royalty Rates',
  'Territory Restrictions',
  'Term Length',
  'Termination Rights',
  'IP Ownership',
  'Exclusivity',
  'Contract Adjustment',
  'Force Majeure',
  'Advance Recoupment',
];

app.post('/api/analyze', async (req, res) => {
  const { contractText } = req.body;

  if (!contractText || typeof contractText !== 'string' || !contractText.trim()) {
    return res.status(400).json({ error: 'Contract text is required.' });
  }

  if (contractText.length > 50000) {
    return res.status(400).json({ error: 'Contract text exceeds 50,000 characters. Please trim it down.' });
  }

  const userPrompt = `Analyse the following entertainment contract for these clause types:
${CLAUSE_TYPES.map((c, i) => `${i + 1}. ${c}`).join('\n')}

For each clause return:
- name: the clause type name (exactly as listed above)
- status: "found", "flagged", or "missing"
- summary: 1-2 sentences describing what was found or why it is concerning/missing
- excerpt: the most relevant verbatim text from the contract (empty string if missing)
- concern: if flagged, the specific legal concern in plain English; otherwise empty string

Also provide:
- overallRisk: "low", "medium", or "high" based on the contract as a whole
- summary: 2-3 sentence overall assessment

Return this exact JSON with no extra text:
{
  "clauses": [
    { "name": "", "status": "", "summary": "", "excerpt": "", "concern": "" }
  ],
  "overallRisk": "",
  "summary": ""
}

CONTRACT TEXT:
---
${contractText}
---`;

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const raw = message.content[0].text;
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in model response');

    const analysis = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(analysis.clauses)) throw new Error('Invalid response structure');

    res.json(analysis);
  } catch (err) {
    console.error('Analysis error:', err.message);

    if (err.status === 401) return res.status(500).json({ error: 'Invalid API key. Check your .env file.' });
    if (err.status === 429) return res.status(429).json({ error: 'Rate limit reached. Please wait a moment and try again.' });
    if (err instanceof SyntaxError) return res.status(500).json({ error: 'Failed to parse model response. Please try again.' });

    res.status(500).json({ error: 'Analysis failed. Please try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`\nEntertainment Contract Analyser running at http://localhost:${PORT}\n`);
});
