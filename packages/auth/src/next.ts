import { toNextJsHandler } from "better-auth/next-js";

export { getSessionCookie } from "better-auth/cookies";

import { auth } from "./index";

export const handlers = toNextJsHandler(auth);
