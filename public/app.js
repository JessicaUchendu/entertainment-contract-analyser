const contractInput = document.getElementById('contractInput');
const charCount     = document.getElementById('charCount');
const analyzeBtn    = document.getElementById('analyzeBtn');
const inputSection  = document.getElementById('inputSection');
const resultsSection = document.getElementById('resultsSection');
const loadingOverlay = document.getElementById('loadingOverlay');
const errorBanner   = document.getElementById('errorBanner');
const errorMessage  = document.getElementById('errorMessage');
const clauseGrid    = document.getElementById('clauseGrid');
const overallSummary = document.getElementById('overallSummary');
const riskBadge     = document.getElementById('riskBadge');

const MAX_CHARS = 50000;

contractInput.addEventListener('input', () => {
  const len = contractInput.value.length;
  charCount.textContent = `${len.toLocaleString()} / ${MAX_CHARS.toLocaleString()}`;
  charCount.classList.toggle('over-limit', len > MAX_CHARS);
  analyzeBtn.disabled = len === 0 || len > MAX_CHARS;
});

async function analyzeContract() {
  const text = contractInput.value.trim();
  if (!text) return;

  showLoading(true);
  dismissError();

  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contractText: text }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || 'Something went wrong. Please try again.');
      return;
    }

    renderResults(data);
  } catch {
    showError('Network error. Please check your connection and try again.');
  } finally {
    showLoading(false);
  }
}

function renderResults(data) {
  clauseGrid.innerHTML = '';

  // Overall summary + risk badge
  overallSummary.textContent = data.summary || '';

  const risk = (data.overallRisk || 'medium').toLowerCase();
  const riskLabels = { low: 'Low Risk', medium: 'Medium Risk', high: 'High Risk' };
  riskBadge.textContent = riskLabels[risk] || 'Unknown Risk';
  riskBadge.className = `risk-badge risk-${risk}`;

  // Clause cards
  (data.clauses || []).forEach(clause => {
    clauseGrid.appendChild(buildClauseCard(clause));
  });

  inputSection.classList.add('hidden');
  resultsSection.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function buildClauseCard(clause) {
  const status = (clause.status || 'missing').toLowerCase();

  const badgeClass = { found: 'badge-found', flagged: 'badge-flagged', missing: 'badge-missing' }[status] || 'badge-missing';
  const badgeLabel = { found: 'Found', flagged: 'Flagged', missing: 'Missing' }[status] || 'Missing';

  const card = document.createElement('div');
  card.className = `clause-card status-${status}`;

  card.innerHTML = `
    <div class="clause-top">
      <span class="clause-name">${escHtml(clause.name)}</span>
      <span class="clause-badge ${badgeClass}">${badgeLabel}</span>
    </div>
    <p class="clause-summary">${escHtml(clause.summary)}</p>
    ${clause.excerpt ? `<div class="clause-excerpt">"${escHtml(truncate(clause.excerpt, 180))}"</div>` : ''}
    ${clause.concern ? `
      <div class="clause-concern">
        <svg class="concern-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        ${escHtml(clause.concern)}
      </div>` : ''}
  `;

  return card;
}

function resetApp() {
  resultsSection.classList.add('hidden');
  inputSection.classList.remove('hidden');
  contractInput.value = '';
  charCount.textContent = `0 / ${MAX_CHARS.toLocaleString()}`;
  analyzeBtn.disabled = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showLoading(show) {
  loadingOverlay.classList.toggle('hidden', !show);
  analyzeBtn.disabled = show;
}

function showError(msg) {
  errorMessage.textContent = msg;
  errorBanner.classList.remove('hidden');
}

function dismissError() {
  errorBanner.classList.add('hidden');
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function truncate(str, max) {
  return str.length > max ? str.slice(0, max) + '…' : str;
}
