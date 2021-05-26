import Cookies from "js-cookie";

export function getCookie(name: string) {
  return Cookies.get(name);
}

export function setCookie(name: string, value: any) {
  Cookies.set(name, value, {});
}

export function removeCookie(name: string) {
  Cookies.remove(name);
}

export function getUrlParms(key: string) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(key);
}