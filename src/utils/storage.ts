import type {Generation} from "../types";

const KEY = "ai-studio-history-v1";
const MAX = 5;

export function loadHistory(): Generation[] {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as Generation[];
		return Array.isArray(parsed) ? parsed.slice(0, MAX) : [];
	} catch {
		return [];
	}
}

export function saveToHistory(gen: Generation): void {
	const arr = loadHistory();
	const next = [gen, ...arr].slice(0, MAX);
	localStorage.setItem(KEY, JSON.stringify(next));
}
