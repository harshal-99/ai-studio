import type { RequestBody, Generation } from "./types";

/**
 * Mock API: resolves in ~1–2s, fails 20% with { message: "Model overloaded" }.
 * Supports AbortSignal: rejects with DOMException('AbortError') when aborted.
 */
export function mockGenerate(
	body: RequestBody,
	signal?: AbortSignal
): Promise<Generation> {
	return new Promise<Generation>((resolve, reject) => {
		if (signal?.aborted) return reject(new DOMException("Aborted", "AbortError"));

		const timeout = randomInt(1000, 2000);
		const onAbort = () => {
			clearTimeout(timer);
			reject(new DOMException("Aborted", "AbortError"));
		};
		signal?.addEventListener("abort", onAbort, { once: true });

		const timer = window.setTimeout(() => {
			signal?.removeEventListener("abort", onAbort);

			// 20% simulated overload
			if (Math.random() < 0.2) {
				reject({ message: "Model overloaded" });
				return;
			}

			// Generate a "result" image — for demo, we’ll reuse the input data url.
			// In a real app, this would be a returned URL; to mimic, append a cache-busting query.
			const id = crypto.randomUUID();
			const imageUrl = `${body.imageDataUrl}#gen=${id}`;
			resolve({
				id,
				imageUrl,
				prompt: body.prompt,
				style: body.style,
				createdAt: new Date().toISOString(),
			});
		}, timeout);
	});
}

function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
