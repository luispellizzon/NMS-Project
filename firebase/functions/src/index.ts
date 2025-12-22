import { setGlobalOptions } from "firebase-functions";
setGlobalOptions({ maxInstances: 10 });

import * as admin from "firebase-admin";
import { login } from "./auth";
import { register } from "./register";

admin.initializeApp();

// export functions
export { login, register };
