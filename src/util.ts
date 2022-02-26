export const todo = (msg: string): never => {
  throw new Error(`TODO: ${msg}`);
};
