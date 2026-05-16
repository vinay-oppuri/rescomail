import { toNextJsHandler } from "better-auth/next-js"

import { auth } from "./index"

export const handlers = toNextJsHandler(auth)
