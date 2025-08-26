import React, {type FC} from "react";

type UploadInputProps = {
	onDrop: (e: React.DragEvent<HTMLLabelElement>) => Promise<void>;
	onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
	fileError: string | null;
	inputDataUrl: string | null;
}

export const UploadInput: FC<UploadInputProps> = ({fileError, inputDataUrl, onDrop, onFileInputChange}) => {
	return <div>
		<label
			htmlFor="file"
			onDragOver={(e) => e.preventDefault()}
			onDrop={onDrop}
			className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center hover:bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500"
			aria-label="Upload an image"
		>
			<div>
				<p className="font-medium">Upload PNG/JPG (≤10MB)</p>
				<p className="text-sm text-gray-600">Drag & drop or click to browse</p>
			</div>
			<input
				id="file"
				name="file"
				type="file"
				accept="image/png,image/jpeg"
				onChange={onFileInputChange}
				className="sr-only"
			/>
		</label>
		{fileError && <p className="mt-2 text-sm text-red-600">{fileError}</p>}
		{inputDataUrl && (
			<div className="mt-3">
				<img
					src={inputDataUrl}
					alt="Uploaded preview"
					className="max-h-72 w-auto rounded-lg border"
				/>
			</div>
		)}
	</div>
}