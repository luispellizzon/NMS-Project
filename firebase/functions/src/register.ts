import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { API_KEY } from "./config"
import { UserCredentials } from "./types";
import { ErrorInfo } from "node_modules/firebase-admin/lib/utils/error";
import { Response } from "./types";
import { loginHandler } from "./handlers";
export const register = functions.https.onCall(async (data, context) => {
    const apiKey = API_KEY.value()

    if (!apiKey) {
        throw new functions.https.HttpsError(
            "internal",
            "CONFIGURATION_NOT_FOUND: Firebase API key missing"
        );
    }

    const { email, password, displayName } = data.data;

    if (!email || !password || !displayName) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Email, password and name are required."
        );
    }

    if (process.env.FUNCTIONS_EMULATOR === "true") {
        console.log("🧩 Registering new user...");
        console.log("📧 Email:", email);
    }

    try {
        // Option 1: Create user directly via Admin SDK
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName
        });

        const json = await loginHandler(email, password, apiKey)
        const result = json as Response<UserCredentials, ErrorInfo>

        if ("error" in result) {
            throw new functions.https.HttpsError(
                "internal",
                `User created, but login failed: ${result.error.message}`
            );
        }

        return {
            message: "User registered successfully",
            userId: userRecord.uid,
            ...result
        };
    } catch (err: any) {
        console.error("❌ Error registering user:", err);
        throw new functions.https.HttpsError("internal", err.message);
    }
});
