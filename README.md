
# sustainable-stimuli

An interactive platform for generating sustainable design inspiration from text and/or sketches, combining structured matching with GenAI suggestions. Users can adjust conceptual and visual similarity, as well as novelty vs. practicality preferences. The platform also estimates the energy and carbon impact of each search to encourage mindful ideation.

---
## Project Goals

- Provide accessible tools for sustainable design inspiration.
- Let users control novelty vs practicality of returned results.
- Display structured sustainability guidelines and/or AI-generated ideas.
- Visualize estimated carbon emissions per user interaction.
- Enable extensibility for new models, datasets, and search types.
---

## How It Works

### Structured Engine
A deterministic engine using GloVe word embeddings and cosine similarity.

**Pipeline:**
1. (Optional) Sketch-to-text via GPT-4.1-mini (only non-local step).
2. Keyword extraction from user input.
3. Vector averaging using GloVe embeddings.
4. Cosine similarity with pre-embedded DfE guidelines.
5. Semantic distance filtering (novel vs practical).

### GenAI Engine
A generative engine using OpenAI and Replicate to generate suggestions and optional sketches.

**Pipeline:**
1. (Optional) Sketch-to-text via GPT-4.1-mini.
2. Construct GPT-4o prompt with:
   - User input
   - Guideline list
3. Return DfE guideline, category, explanation, suggestion, and (optionally) sketch via Flux 1.1 Pro.

---

## Energy & Emissions

This platform tracks the estimated carbon footprint of each search. Calculations follow the [CodeCarbon](https://github.com/mlco2/codecarbon) methodology, adapted for Node.js.

### Examples:
- **Structured only:** ~0.000005 g CO₂ per search
- **GPT-4o:** ~0.038 g CO₂ per ~300-word response
- **Replicate (Flux 1.1 Pro):** ~4 Wh → 0.36 g CO₂

Estimates vary depending on input type and response.

---

## Setup Instructions

### 1. Download GloVe Embeddings  
This project uses pre-trained [GloVe embeddings](https://github.com/stanfordnlp/GloVe?tab=readme-ov-file) for vector-based similarity.

To enable the structured processing features, run the following commands to download and extract the required file:

```bash
curl -L -o glove.6B.zip https://huggingface.co/stanfordnlp/glove/resolve/main/glove.6B.zip
unzip -j glove.6B.zip glove.6B.100d.txt -d backend/data
rm glove.6B.zip
```

After running the commands, make sure glove.6B.100d.txt exists at:

```bash
backend/data/glove.6B.100d.txt
```

### 2. Configure Environment  
Create a `.env` file with the following values:

```
MONGODB_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...

GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

DEFAULT_FALLBACK_FOLDER_ID=...
UPLOADED_SKETCHES_FOLDER_ID=...
GENERATED_SKETCHES_FOLDER_ID=...
AUTHORIZED_EMAILS=you@example.com,teammate@example.com

REPLICATE_API_TOKEN=r8_...
```
