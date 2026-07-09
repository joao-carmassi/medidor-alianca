const externalUrlPattern = /^(?:[a-z][a-z\d+\-.]*:)?\/\//i;
const specialLinkPattern = /^(?:mailto|sms|tel):/i;

function trimTrailingSlashes(value: string): string {
  if (value === '/') {
    return '';
  }

  return value.replace(/\/+$/, '');
}

export function withBase(path: string): string {
  if (
    path === '' ||
    path.startsWith('#') ||
    externalUrlPattern.test(path) ||
    specialLinkPattern.test(path)
  ) {
    return path;
  }

  const base = trimTrailingSlashes(import.meta.env.BASE_URL);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${base}${normalizedPath}`;
}

export function withBaseAnchor(anchor: string): string {
  if (!anchor.startsWith('#') || anchor === '#') {
    return anchor;
  }

  const base = trimTrailingSlashes(import.meta.env.BASE_URL);

  return `${base || '/'}${anchor}`;
}
