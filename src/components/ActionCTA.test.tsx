import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, vi, expect } from "vitest";
import { ActionCTA } from "./ActionCTA";

describe("ActionCTA", () => {
	it("renders Generate and Abort buttons and status message", () => {
		render(
			<ActionCTA
				canGenerate={true}
				isLoading={false}
				statusMsg="Ready"
				onGenerate={() => {}}
				onAbort={() => {}}
			/>
		);
		expect(screen.getByRole("button", { name: /generate/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /abort/i })).toBeInTheDocument();
		expect(screen.getByText("Ready")).toBeInTheDocument();
	});

	it("disables Generate button when canGenerate is false", () => {
		render(
			<ActionCTA
				canGenerate={false}
				isLoading={false}
				statusMsg=""
				onGenerate={() => {}}
				onAbort={() => {}}
			/>
		);
		expect(screen.getByRole("button", { name: /generate/i })).toBeDisabled();
	});

	it("calls onGenerate when Generate button is clicked", () => {
		const onGenerate = vi.fn();
		render(
			<ActionCTA
				canGenerate={true}
				isLoading={false}
				statusMsg=""
				onGenerate={onGenerate}
				onAbort={() => {}}
			/>
		);
		fireEvent.click(screen.getByRole("button", { name: /generate/i }));
		expect(onGenerate).toHaveBeenCalled();
	});

	it("shows loading spinner when isLoading is true", () => {
		render(
			<ActionCTA
				canGenerate={true}
				isLoading={true}
				statusMsg=""
				onGenerate={() => {}}
				onAbort={() => {}}
			/>
		);
		expect(screen.getByRole("status", { name: /loading/i })).toBeInTheDocument();
	});

	it("disables Abort button when isLoading is false", () => {
		render(
			<ActionCTA
				canGenerate={true}
				isLoading={false}
				statusMsg=""
				onGenerate={() => {}}
				onAbort={() => {}}
			/>
		);
		expect(screen.getByRole("button", { name: /abort/i })).toBeDisabled();
	});

	it("calls onAbort when Abort button is clicked", () => {
		const onAbort = vi.fn();
		render(
			<ActionCTA
				canGenerate={true}
				isLoading={true}
				statusMsg=""
				onGenerate={() => {}}
				onAbort={onAbort}
			/>
		);
		fireEvent.click(screen.getByRole("button", { name: /abort/i }));
		expect(onAbort).toHaveBeenCalled();
	});
});