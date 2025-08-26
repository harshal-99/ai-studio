import {type FC} from "react";
import type {StyleOption} from "../types.ts";

type PromptProps = {
	prompt: string;
	style: StyleOption;
	setPrompt: (prompt: string) => void;
	setStyle: (style: StyleOption) => void;
}
const STYLES: StyleOption[] = ["Editorial", "Streetwear", "Vintage"];


export const Prompt: FC<PromptProps> = ({prompt, setPrompt, setStyle, style}) => {
	return <div className="grid gap-3 sm:grid-cols-3">
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
}