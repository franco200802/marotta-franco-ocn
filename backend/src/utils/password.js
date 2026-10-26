import bcrypt from "bcryptjs";
import { config } from "./config.js";

export const hashearPassword = (password) => bcrypt.hash(password, config.bcryptRounds);

export const hashearPasswordSync = (password) => bcrypt.hashSync(password, config.bcryptRounds);

export const compararPassword = (password, hash) => bcrypt.compare(password, hash);
