import { http } from "./apiClient.js";

export const getLocal = ({ signal } = {}) => http.get("/local", { signal });
