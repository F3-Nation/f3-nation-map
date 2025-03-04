// Use process.env so that importing here doesn't cause issues like circular dependencies
export const isProduction = process.env.NODE_ENV === "production";
export const isDevelopment = process.env.NODE_ENV === "development";

export const RERENDER_LOGS = false;
