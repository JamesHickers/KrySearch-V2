// openSourceAI.js — Local-only open-source AI utilities

// assumes pipeline is already available globally (via CDN)
let summarizer = null;
let classifier = null;

async function loadModels() {
  if (!summarizer) {
    summarizer = await window.pipeline("summarization", "Xenova/distilbart-cnn-6-6");
  }
  if (!classifier) {
    classifier = await window.pipeline("text-classification", "Xenova/distilbert-base-uncased");
  }
}

async function generateSummary(text = "") {
  await loadModels();

  if (!text || text.trim().length < 10) return "No summary available.";

  try {
    const res = await summarizer(text, { max_length: 70 });
    return res[0].summary_text;
  } catch {
    return "Summary unavailable.";
  }
}

async function scoreLinkRisk(text = "") {
  await loadModels();

  try {
    const result = await classifier(text);
    const score = Math.round((result[0].score || 0) * 100);
    return score;
  } catch {
    return 0;
  }
}

// expose globally
window.generateSummary = generateSummary;
window.scoreLinkRisk = scoreLinkRisk;
