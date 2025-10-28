const HF_ENDPOINT = "https://router.huggingface.co/hf-inference/models/intfloat/multilingual-e5-large/pipeline/feature-extraction";
const HF_TOKEN = `${process.env.HF_TOKEN}`;

function l2Normalize(vector: number[]): number[] {
    let norm = 0;
    for (const v of vector) norm += v * v;
    norm = Math.sqrt(norm);
    if (norm <= 0) return vector;
    return vector.map((v) => v / norm);
}

function meanPool(tokenEmbeddings: number[][]): number[] {
    const tokenCount = tokenEmbeddings.length;
    if (tokenCount === 0) return [];
    const dim = Array.isArray(tokenEmbeddings[0]) ? tokenEmbeddings[0].length : 0;
    if (dim === 0) return [];
    const sums = new Array(dim).fill(0);
    for (const tokenVector of tokenEmbeddings) {
        for (let i = 0; i < dim; i++) sums[i] += Number(tokenVector[i] ?? 0);
    }
    for (let i = 0; i < dim; i++) sums[i] /= Math.max(1, tokenCount);
    return sums;
}

function toSentenceVector(embedding: any): number[] {
    if (!Array.isArray(embedding) || embedding.length === 0) {
        throw new Error("Empty or invalid embedding response.");
    }
    const first = embedding[0];
    if (typeof first === "number") {
        return (embedding as number[]).map((v) => Number(v));
    }
    if (Array.isArray(first)) {
        return meanPool(embedding as number[][]);
    }
    throw new Error("Unrecognized embedding shape.");
}

export async function embed(input: string | string[], normalize: boolean = true): Promise<number[] | number[][]> {
    const payloadInputs = Array.isArray(input)
        ? input.filter((t) => typeof t === "string" && t.trim() !== "")
        : input;

    if ((Array.isArray(payloadInputs) && payloadInputs.length === 0) || (!Array.isArray(payloadInputs) && String(payloadInputs).trim() === "")) {
        return Array.isArray(input) ? [] : [] as unknown as number[];
    }

    const res = await fetch(HF_ENDPOINT, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${HF_TOKEN}`,
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: payloadInputs }),
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Embedding API failed: ${res.status} ${body}`);
    }

    const body = await res.json();

    if (Array.isArray(input)) {
        if (!Array.isArray(body)) throw new Error("Unexpected embedding response for batch input.");
        const vectors = (body as any[]).map((item) => toSentenceVector(item));
        return normalize ? vectors.map(l2Normalize) : vectors;
    }

    const vector = toSentenceVector(body);
    return normalize ? l2Normalize(vector) : vector;
}

