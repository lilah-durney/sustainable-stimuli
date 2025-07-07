import fs from "fs/promises"
import path from "path"

const embeddings = new Map();

export async function loadGloveVectors(filePath) {
    const data = await fs.readFile(filePath, "utf8");
    const lines = data.split("\n");

    for (const line of lines) {
        const parts = line.trim().split(" ");
        const word = parts[0]
        const vector = parts.slice(1).map(Number);
        if (word && vector.length > 0) {
            embeddings.set(word, vector)
        }
    }

    console.log(`Loaded ${embeddings.size} word vectors`)
}



export function getVector(word) {
    return embeddings.get(word);
}

export function hasVector(word) {
    return embeddings.has(word);
}