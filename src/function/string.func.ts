import { notification } from "antd";

export function uuidv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
      const v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function parseFileName(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex <= 0) return { name: "", extension: "" };

  const name = fileName.substring(0, dotIndex);
  const extension = fileName.substring(dotIndex + 1);
  return { name, extension };
}

export function renameFileName(fileName: string, fileNames: string[]) {
  const { name, extension } = parseFileName(fileName);
  const existedNames = fileNames.map((fileName) => {
    const { name } = parseFileName(fileName);
    return name;
  });
  return `${_rename(name, existedNames)}.${extension}`;
}

export function _rename(name: string, existedNames: string[]) {
  const regx = new RegExp(`${name}\\(([\\d]+)\\)`);
  let lastIndex: string | null = null;
  for (const n of existedNames.sort()) {
    const result = n.match(regx);
    if (result) {
      lastIndex = result[1];
    }
  }

  if (lastIndex) {
    const integer = parseInt(lastIndex);
    return `${name}(${integer + 1})`;
  } 
    return `${name}(1)`;
  
}

export function parseJSON(jsonString: string) {
  try {
    const result = JSON.parse(jsonString);
    if (typeof result === "object") {
      return result;
    } 
      notification.error({
        message: "JSON 解析失败",
        description: "无法解析为对象",
        placement: "topRight",
      });
    
  } catch (e) {
    console.error(e);
    notification.error({
      message: "JSON 解析失败",
      description: e.message,
      placement: "topRight",
    });
  }
}
