import { UserCredentials } from "src/types";
import { Response } from "src/types";
import { ErrorInfo } from "node_modules/firebase-admin/lib/utils/error";


export async function loginHandler(
    email: string,
    password: string,
    apiKey: string
): Promise<Response<UserCredentials, ErrorInfo>> {
    const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email,
                password,
                returnSecureToken: true,
            }),
        }
    );

    const data = (await response.json()) as Response<UserCredentials, ErrorInfo>;
    return data;
}