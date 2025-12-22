import * as functions from "firebase-functions";
import { CallableRequest } from "firebase-functions/https";
import { API_KEY } from "./config";
import { SignInCredentials } from "./types";
import { UserCredentials } from "./types";
import { Response } from "./types";
import { ErrorInfo } from "node_modules/firebase-admin/lib/utils/error";
import { loginHandler } from "./handlers/login";

export const login = functions.https.onCall(async (data: CallableRequest<SignInCredentials>) => {
    const apiKey = API_KEY.value()

    if (!apiKey) {
        throw new functions.https.HttpsError(
            "internal",
            "CONFIGURATION_NOT_FOUND: Firebase API key missing"
        );
    }

    const { email, password } = data.data;

    if (!email || !password) {
        throw new functions.https.HttpsError("invalid-argument", "Email and password are required.");
    }

    try {
        const json = await loginHandler(email, password, apiKey);
        const result = json as Response<UserCredentials, ErrorInfo>

        if ("error" in result && result.error) {
            throw new functions.https.HttpsError("unauthenticated", result.error.message);
        }


        return {
            result: {
                message: "User registered successfully",
                ...result
            },
        };
    } catch (err: any) {
        throw new functions.https.HttpsError("internal", err.message);
    }
});
