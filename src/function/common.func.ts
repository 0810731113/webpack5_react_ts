export function isNullOrUndefined(obj: any): obj is null | undefined {
  return typeof obj === "undefined" || obj === null;
}
// 将base64转换为file
export const dataURLtoFile = (dataurl: string) => {
  const arr = dataurl.split(",");
    const mime = arr[0]?.match(/:(.*?);/);
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    const type = mime ? mime[1] : undefined;
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  const theBlob: any = new Blob([u8arr], { type });
  theBlob.lastModifiedDate = new Date();
  theBlob.name = "模型快照.png";
  return theBlob;
};

export function IsPC() {
  const userAgentInfo = navigator.userAgent;
  const Agents = [
    "Android",
    "iPhone",
    "SymbianOS",
    "Windows Phone",
    "iPad",
    "iPod",
  ];
  let flag = true;
  for (let v = 0; v < Agents.length; v++) {
    if (userAgentInfo.indexOf(Agents[v]) > 0) {
      flag = false;
      break;
    }
  }
  return flag;
}
