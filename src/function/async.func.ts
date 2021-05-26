export function wait<T = any>(millSeconds = 1000, value?: T) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(value);
    }, millSeconds);
  });
}
