import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {downscaleDataURL, fileToDataURL} from "./utils/image";
import {loadHistory, saveToHistory} from "./utils/storage";
import {mockGenerate} from "./mockApi";
import type {Generation, StyleOption} from "./types";
import {History} from "./components/History.tsx";
import {UploadInput} from "./components/UploadInput.tsx";
import {OutputPreview} from "./components/OutputPreview.tsx";
import {ActionCTA} from "./components/ActionCTA.tsx";
import {Prompt} from "./components/Prompt.tsx";
import {LiveSummary} from "./components/LiveSummary.tsx";


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
					if (err instanceof Error) {
						if (attempt >= maxAttempts) {
							const msg =
								typeof err?.message === "string"
									? err.message
									: "Something went wrong";
							setStatusMsg(`Failed: ${msg}`);
							break;
						}
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

						<Prompt prompt={prompt} style={style} setPrompt={setPrompt} setStyle={setStyle}/>


						<LiveSummary inputDataUrl={inputDataUrl} prompt={prompt} style={style}/>
						<ActionCTA isLoading={isLoading} statusMsg={statusMsg} canGenerate={canGenerate} onGenerate={onGenerate}
						           onAbort={onAbort}/>

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
