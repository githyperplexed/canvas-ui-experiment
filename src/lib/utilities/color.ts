/** Color as [r, g, b] in 0-1 range, the format the canvas effects use. */
export type Rgb = [number, number, number];

/** Interpolator factory for tweening between two colors. */
export const lerpRgb = (from: Rgb, to: Rgb) => (t: number) =>
	from.map((v, i) => v + (to[i] - v) * t) as Rgb;

/** CSS color string from an effect-format color. */
export const rgbCss = (color: Rgb, alpha = 1): string => {
	const [r, g, b] = color.map((v) => Math.round(v * 255));
	return alpha >= 1 ? `rgb(${r} ${g} ${b})` : `rgb(${r} ${g} ${b} / ${alpha})`;
};

/** Lighter variant for text on dark backgrounds, like the 400 shade of a palette. */
export const soften = (color: Rgb): Rgb => color.map((v) => v + (1 - v) * 0.45) as Rgb;

/** Darker variant for large surfaces, like the 900 shade of a palette. */
export const deepen = (color: Rgb): Rgb => color.map((v) => v * 0.3) as Rgb;
