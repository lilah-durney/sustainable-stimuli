# sustainable-stimuli

## Downloading GloVe Word Vectors

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
