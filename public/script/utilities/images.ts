const imageCache: {
	[path: string]: HTMLImageElement;
} = {};

export function getImage(url: string, fromCache = true): HTMLImageElement {
	if (fromCache && imageCache[url]) {
		return imageCache[url];
	}

	const image = new Image();
	image.src = url;
	imageCache[url] = image;

	return image;
}
