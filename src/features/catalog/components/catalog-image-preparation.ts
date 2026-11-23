export function catalogImageLeadMargin() {
  return `${Math.round(window.innerHeight * 1.75)}px 0px`;
}

export function prepareCardImage(card: Element) {
  const image = card.querySelector<HTMLImageElement>('img[loading="lazy"]');
  if (image && !(image.complete && image.naturalWidth)) image.loading = "eager";
}
