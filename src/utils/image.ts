/** Read a File (png/jpg) to a data URL */
export async function fileToDataURL(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const fr = new FileReader();
		fr.onerror = () => reject(fr.error);
		fr.onload = () => resolve(String(fr.result));
		fr.readAsDataURL(file);
	});
}

/** Downscale an image (by dataURL) to a max dimension while preserving aspect ratio */
export async function downscaleDataURL(
	dataUrl: string,
	maxDim = 1920
): Promise<string> {
	const img = await loadImage(dataUrl);
	const {width, height} = fitWithin(img.width, img.height, maxDim);
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Canvas 2D not supported");
	ctx.drawImage(img, 0, 0, width, height);
	// Use quality ~0.92 (browser default) to keep things simple
	const outType = dataUrl.startsWith("data:image/png") ? "image/png" : "image/jpeg";
	return canvas.toDataURL(outType, 0.92);
}

function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error("Failed to load image"));
		img.src = src;
	});
}

function fitWithin(w: number, h: number, maxDim: number): { width: number; height: number } {
	if (w <= maxDim && h <= maxDim) return {width: w, height: h};
	const scale = w > h ? maxDim / w : maxDim / h;
	return {width: Math.round(w * scale), height: Math.round(h * scale)};
}
