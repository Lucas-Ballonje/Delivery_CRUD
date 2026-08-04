const TEM_COOKIES = typeof document !== 'undefined';

export function getCookie(nome) {
  if (!TEM_COOKIES) return null;
  const alvo = `${encodeURIComponent(nome)}=`;
  const partes = document.cookie.split('; ');
  const encontrada = partes.find((parte) => parte.startsWith(alvo));
  return encontrada ? decodeURIComponent(encontrada.slice(alvo.length)) : null;
}

export function setCookie(nome, valor, diasParaExpirar = 7) {
  if (!TEM_COOKIES) return;
  const expira = new Date(Date.now() + diasParaExpirar * 24 * 60 * 60 * 1000).toUTCString();
  const seguro = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${encodeURIComponent(nome)}=${encodeURIComponent(valor)}; expires=${expira}; path=/; SameSite=Lax${seguro}`;
}

export function removeCookie(nome) {
  if (!TEM_COOKIES) return;
  document.cookie = `${encodeURIComponent(nome)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}
