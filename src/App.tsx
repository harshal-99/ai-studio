import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {downscaleDataURL, fileToDataURL} from "./utils/image";
import {loadHistory, saveToHistory} from "./utils/storage";
import {mockGenerate} from "./mockApi";
import type {Generation, StyleOption} from "./types";
import {History} from "./components/History.tsx";
import {UploadInput} from "./components/UploadInput.tsx";
import {OutputPreview} from "./components/OutputPreview.tsx";

const STYLES: StyleOption[] = ["Editorial", "Streetwear", "Vintage"];

export default function App() {
	// Upload state
	const [fileError, setFileError] = useState<string | null>(null);
	const [inputDataUrl, setInputDataUrl] = useState<string | null>(null);

	// Prompt + style
	const [prompt, setPrompt] = useState("");
	const [style, setStyle] = useState<StyleOption>("Editorial");

	// Generation state
	const [isLoading, setIsLoading] = useState(false);
	const [statusMsg, setStatusMsg] = useState<string>("");
	const [current, setCurrent] = useState<Generation | null>(null);
	const [history, setHistory] = useState<Generation[]>([]);

	// Abort controller for in-flight request
	const currentAbort = useRef<AbortController | null>(null);

	useEffect(() => {
		setHistory(loadHistory());
	}, []);

	// Handle file selection + downscale if needed
	const onSelectFile = useCallback(async (file: File) => {
		setFileError(null);
		if (!/image\/(png|jpeg)/.test(file.type)) {
			setFileError("Please upload a PNG or JPG.");
			return;
		}
		// If file > 10MB, we must downscale client-side to <=1920px
		const rawDataUrl = await fileToDataURL(file);
		let dataUrl = rawDataUrl;
		if (file.size > 10 * 1024 * 1024) {
			try {
				dataUrl = await downscaleDataURL(rawDataUrl, 1920);
			} catch {
				setFileError("Failed to downscale image.");
				return;
			}
		}
		setInputDataUrl(dataUrl);
	}, []);

	const onFileInputChange = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const f = e.target.files?.[0];
			if (f) await onSelectFile(f);
		},
		[onSelectFile]
	);

	// Drag & drop
	const onDrop = useCallback(
		async (e: React.DragEvent<HTMLLabelElement>) => {
			e.preventDefault();
			const f = e.dataTransfer.files?.[0];
			if (f) await onSelectFile(f);
		},
		[onSelectFile]
	);

	const canGenerate = useMemo(
		() => !!inputDataUrl && prompt.trim().length > 0 && !isLoading,
		[inputDataUrl, prompt, isLoading]
	);

	// Exponential backoff up to 3 attempts for non-abort errors.
	const generateWithRetry = useCallback(
		async (imageDataUrl: string, promptText: string, chosenStyle: StyleOption) => {
			let attempt = 0;
			const maxAttempts = 3;

			// create a fresh controller for this run
			currentAbort.current?.abort();
			const controller = new AbortController();
			currentAbort.current = controller;

			setIsLoading(true);
			setStatusMsg("Starting generation…");

			while (attempt < maxAttempts) {
				attempt++;
				try {
					setStatusMsg(
						attempt === 1 ? "Generating…" : `Retrying (attempt ${attempt}/${maxAttempts})…`
					);
					const result = await mockGenerate(
						{imageDataUrl, prompt: promptText, style: chosenStyle},
						controller.signal
					);
					setCurrent(result);
					saveToHistory(result);
					setHistory(loadHistory());
					setStatusMsg("Done.");
					break;
				} catch (err: unknown) {
					// If aborted, stop immediately (no retry)
					if (err instanceof DOMException && err.name === "AbortError") {
						setStatusMsg("Request aborted.");
						break;
					}
					// Other errors: retry with exponential backoff (500ms, 1s)
					if (attempt >= maxAttempts) {
						const msg =
							typeof (err as any)?.message === "string"
								? (err as any).message
								: "Something went wrong";
						setStatusMsg(`Failed: ${msg}`);
						break;
					}
					const delay = 500 * 2 ** (attempt - 1);
					await sleep(delay);
				}
			}
			setIsLoading(false);
			currentAbort.current = null;
		},
		[]
	);

	const onGenerate = useCallback(async () => {
		if (!inputDataUrl) return;
		await generateWithRetry(inputDataUrl, prompt.trim(), style);
	}, [generateWithRetry, inputDataUrl, prompt, style]);

	const onAbort = useCallback(() => {
		currentAbort.current?.abort();
	}, []);

	const restoreFromHistory = useCallback((g: Generation) => {
		setCurrent(g);
		setInputDataUrl(g.imageUrl);
		setPrompt(g.prompt);
		setStyle(g.style);
		setStatusMsg("Restored from history.");
	}, []);

	return (
		<div className="min-h-screen p-4 sm:p-6">
			<div className="mx-auto max-w-6xl">
				<header className="mb-6">
					<h1 className="text-2xl font-semibold">AI Studio (Mock)</h1>
					<p className="text-sm text-gray-600">
						Upload → prompt → style → generate (with retries & abort).
					</p>
				</header>

				<main className="grid gap-6 md:grid-cols-3" role="main">
					{/* Left Column: Upload & Controls */}
					<section className="md:col-span-2 space-y-4">
						<UploadInput fileError={fileError} inputDataUrl={inputDataUrl} onDrop={onDrop}
						             onFileInputChange={onFileInputChange}/>

						{/* Prompt & Style */}
						<div className="grid gap-3 sm:grid-cols-3">
							<div className="sm:col-span-2">
								<label htmlFor="prompt" className="block text-sm font-medium">
									Prompt
								</label>
								<input
									id="prompt"
									value={prompt}
									onChange={(e) => setPrompt(e.target.value)}
									placeholder="e.g., ‘denim jacket with embroidered cranes’"
									className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2"
								/>
							</div>
							<div>
								<label htmlFor="style" className="block text-sm font-medium">
									Style
								</label>
								<select
									id="style"
									value={style}
									onChange={(e) => setStyle(e.target.value as StyleOption)}
									className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2"
								>
									{STYLES.map((s) => (
										<option key={s} value={s}>
											{s}
										</option>
									))}
								</select>
							</div>
						</div>

						{/* Live Summary */}
						<div
							className="rounded-lg border bg-white p-4"
							aria-live="polite"
							aria-atomic="true"
						>
							<h2 className="mb-2 font-semibold">Summary</h2>
							<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
								<div className="sm:w-48">
									{inputDataUrl ? (
										<img
											src={inputDataUrl}
											alt="Current input"
											className="h-32 w-auto rounded-md border"
										/>
									) : (
										<div className="flex h-32 items-center justify-center rounded-md border text-sm text-gray-500">
											No image
										</div>
									)}
								</div>
								<div className="flex-1">
									<p>
										<span className="font-medium">Prompt:</span> {prompt || "—"}
									</p>
									<p>
										<span className="font-medium">Style:</span> {style}
									</p>
								</div>
							</div>
						</div>

						{/* Actions */}
						<div className="flex items-center gap-3">
							<button
								onClick={onGenerate}
								disabled={!canGenerate}
								className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-blue-300"
								aria-disabled={!canGenerate}
							>
								{isLoading && (
									<span
										role="status"
										aria-label="Loading"
										className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
									/>
								)}
								Generate
							</button>
							<button
								onClick={onAbort}
								disabled={!isLoading}
								className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
							>
								Abort
							</button>
							<span className="text-sm text-gray-600" aria-live="polite">
                {statusMsg}
              </span>
						</div>

						<OutputPreview current={current}/>
					</section>
					<History history={history} restoreFromHistory={restoreFromHistory}/>
				</main>

				<footer className="mt-8 text-center text-xs text-gray-500">
					Keyboard-friendly: Tab through controls; focus rings are visible.
				</footer>
			</div>
		</div>
	);
}

function sleep(ms: number): Promise<void> {
	return new Promise((r) => setTimeout(r, ms));
}
