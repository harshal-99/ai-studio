import {type FC} from "react";

type LiveSummaryProps = {
	inputDataUrl: string | null;
	prompt: string;
	style: string;
}

export const LiveSummary: FC<LiveSummaryProps> = ({inputDataUrl, prompt, style}) => {
	return <div
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
}