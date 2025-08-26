import {type FC} from "react";

type ActionCTAProps = {
	isLoading: boolean;
	statusMsg: string;
	canGenerate: boolean;
	onGenerate: () => void;
	onAbort: () => void;
}

export const ActionCTA: FC<ActionCTAProps> = ({canGenerate, isLoading, onAbort, onGenerate, statusMsg}) => {
	return <div className="flex items-center gap-3">
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
		<span className="text-sm text-gray-600" aria-live="polite">{statusMsg}</span>
	</div>
}