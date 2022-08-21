// Use process.env so that importing here doesn't cause issues like circular dependencies
export const isProduction = process.env.NODE_ENV === "production";

export const RERENDER_LOGS = false;
