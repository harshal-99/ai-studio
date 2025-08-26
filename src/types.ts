export type StyleOption = "Editorial" | "Streetwear" | "Vintage";

export interface Generation {
	id: string;
	imageUrl: string; // final (mock) output URL
	prompt: string;
	style: StyleOption;
	createdAt: string; // ISO
}

export interface RequestBody {
	imageDataUrl: string;
	prompt: string;
	style: StyleOption;
}
