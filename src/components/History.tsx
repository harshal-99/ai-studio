import {type FC} from "react";
import type {Generation} from "../types.ts";

type HistoryProps = {
	history: Generation[];
	restoreFromHistory: (g: Generation) => void;
};

export const History: FC<HistoryProps> = ({history, restoreFromHistory}) => {
	return <aside className="md:col-span-1">
		<div className="sticky top-4 rounded-lg border bg-white p-4">
			<h2 className="mb-3 font-semibold">History (Last 5)</h2>
			{history.length === 0 ? (
				<p className="text-sm text-gray-500">No history yet.</p>
			) : (
				<ul className="space-y-3" role="list">
					{history.map((h) => (
						<li key={h.id}>
							<button
								onClick={() => restoreFromHistory(h)}
								className="flex w-full items-center gap-3 rounded-md border p-2 text-left hover:bg-gray-50 focus-visible:bg-gray-50"
								aria-label={`Restore generation ${h.id}`}
							>
								<img
									src={h.imageUrl}
									alt=""
									className="h-14 w-14 rounded object-cover"
								/>
								<div className="min-w-0">
									<p className="truncate text-sm font-medium">{h.prompt}</p>
									<p className="text-xs text-gray-600">
										{h.style} • {new Date(h.createdAt).toLocaleString()}
									</p>
								</div>
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	</aside>
}