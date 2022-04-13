export const todo = (msg: string): never => {
  throw new Error(`TODO: ${msg}`);
};

export const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
