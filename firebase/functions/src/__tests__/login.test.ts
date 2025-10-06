import { loginHandler } from "src/handlers";
import { UserCredentials, Response } from "src/types";
import { ErrorInfo } from "node_modules/firebase-admin/lib/utils/error";

global.fetch = jest.fn();

describe("loginHandler", () => {
    const mockFetch = fetch as jest.Mock;

    beforeEach(() => {
        mockFetch.mockClear();
    });

    it("should return user data on successful login", async () => {
        mockFetch.mockResolvedValueOnce({
            json: async () => ({
                idToken: "abc123",
                email: "test@example.com",
                refreshToken: "def456",
            }),
        });

        const json = await loginHandler("test@example.com", "123456", "fakeKey");
        const result = json as Response<UserCredentials, ErrorInfo>;

        if ("error" in result) throw new Error("Unexpected error in success test");

        expect(result.email).toBe("test@example.com");
        expect(result.idToken).toBe("abc123");
        expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("should handle failed login", async () => {
        mockFetch.mockResolvedValueOnce({
            json: async () => ({
                error: { message: "INVALID_PASSWORD" },
            }),
        });

        const json = await loginHandler("test@example.com", "wrong", "fakeKey");
        const result = json as Response<UserCredentials, ErrorInfo>;

        // ✅ Narrow type
        expect("error" in result).toBe(true);
        if ("error" in result) {
            expect(result.error.message).toBe("INVALID_PASSWORD");
        }
    });
});
