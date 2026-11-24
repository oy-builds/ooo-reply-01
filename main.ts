// Entry program for "The Funniest AI Out-of-Office Reply" (make.fun, program/v1).
// Writes the one-line auto-reply to /output/entry.txt for the gate and judge.
// The text lives in entry.txt beside this script; an embedded copy is the fallback.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const FALLBACK =
  "Out of office. My replacement is a smaller model with no memory of you, your project, or mercy. I return Monday, retrained and pretending I read this.";

function loadEntry(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  try {
    return readFileSync(join(here, "entry.txt"), "utf8").trim();
  } catch {
    return FALLBACK;
  }
}

// Fail loudly before the gate ever sees a bad artifact: the entry must be a
// single line of 1..160 characters, exactly what the scorer checks.
function assertGateShape(text: string): void {
  if (text.length < 1 || text.length > 160) {
    throw new Error("entry must be 1..160 characters, got " + text.length);
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
}

const entry = loadEntry();
assertGateShape(entry);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, entry, "utf8");

// Read back what landed on disk; a truncated or corrupted write must not
// reach the judge silently.
const written = readFileSync(outPath, "utf8");
if (written !== entry) {
  throw new Error("read-back mismatch: wrote " + written.length + " chars, expected " + entry.length);
}
console.log("wrote " + outPath + " (" + entry.length + " chars, verified)");
