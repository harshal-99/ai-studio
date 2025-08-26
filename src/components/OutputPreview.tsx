import {type FC} from "react";
import type {Generation} from "../types.ts";

type OutputPreviewProps = {
	current: Generation | null;
}

export const OutputPreview: FC<OutputPreviewProps> = ({current}) => {
	return <div className="rounded-lg border bg-white p-4">
		<h2 className="mb-2 font-semibold">Output</h2>
		{current ? (
			<div className="flex flex-col gap-3 sm:flex-row">
				<img
					src={current.imageUrl}
					alt="Generated result"
					className="h-52 w-auto rounded-md border"
				/>
				<div className="text-sm text-gray-700">
					<p>
						<span className="font-medium">ID:</span> {current.id}
					</p>
					<p className="break-words">
						<span className="font-medium">Prompt:</span> {current.prompt}
					</p>
					<p>
						<span className="font-medium">Style:</span> {current.style}
					</p>
					<p>
						<span className="font-medium">Created:</span>{" "}
						{new Date(current.createdAt).toLocaleString()}
					</p>
				</div>
			</div>
		) : (
			<p className="text-sm text-gray-500">Nothing yet. Generate to see output.</p>
		)}
	</div>
}