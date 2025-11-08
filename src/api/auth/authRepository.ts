import type { User } from "@/api/auth/authModel";
import { db } from "@/common/config/database";

export const users: User[] = [
    {
        id: 1,
        email: "alice@example.com",
        password: "1234",
        username: "alice",
        reset_token: null,
        reset_token_expiry: null,
        phone: "1234567890",
        role: "user",
        google_id: null,
        created_at: new Date(),
        updated_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    {
        id: 2,
        email: "robert@example.com",
        password: "1234",
        username: "robert",
        reset_token: null,
        reset_token_expiry: null,
        phone: "1234567890",
        role: "user",
        google_id: null,
        created_at: new Date(),
        updated_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
];

export class AuthRepository {
    async findByIdAsync(id: number): Promise<User | null> {
        try {
            const user = await db<User>('users')
                .where({ id })
                .first();

            return user ?? null;
        } catch (error) {
            throw error;
        }
    }

    async createAsync(user: { email: string; phone: string; password: string; age: number }) {
        try {
            await db("users").insert({
                email: user.email,
                password: user.password,
                phone: user.phone,
                age: user.age,
                username: user.email.split("@")[0],
                is_active: true,
                role: "user"
            });
        } catch (error) {
            throw error;
        }
    }

    async findOne(condition: { email: string }) {
        try {
            const result = await db("users")
                .where(condition)
                .first();
            console.log("🔥 result:", result);
            return result ?? null;
        } catch (error) {
            throw error;
        }
    }

    async findById(id: number): Promise<User | null> {
        try {
            const user = await db<User>("users").where({ id }).first();
            return user ?? null;
        } catch (error) {
            throw error;
        }
    }

    async findByGoogleId(googleId: number): Promise<User | null> {
        try {
            return await db("users").where({ google_id: googleId }).first();
        } catch (error) {
            throw error;
        }
    };

    async createUser(newUser: Omit<User, "id" | "created_at" | "updated_at">): Promise<number> {
        try {
            console.log(newUser);
            const result = await db("users").insert({
                ...newUser,
                created_at: new Date(),
                updated_at: new Date()
            });
            return result[0];
        } catch (error) {
            throw error;
        }
    }

    async updateResetToken(email: string, token: string, expiry: number) {
        try {
            return await db("users")
                .where({ email })
                .update({ reset_token: token, reset_token_expiry: expiry });
        } catch (error) {
            throw error;
        }
    }

    async findByResetToken(token: string): Promise<User | null> {
        try {
            const user = await db<User>("users").where({ reset_token: token }).first();
            return user || null;
        } catch (error) {
            throw error;
        }
    }

    async resetPasswordByToken(token: string, hashedPassword: string) {
        try {
            return await db("users")
                .where({ reset_token: token })
                .update({
                    password: hashedPassword,
                    reset_token: null,
                    reset_token_expiry: null
                });
        } catch (error) {
            throw error;
        }
    }

    async addTokenToBlacklist(token: string, expiresAt: number) {
        try {
            await db("token_blacklist").insert({ token, expires_at: expiresAt });

        } catch (error) {
            throw error;
        }
    }

    async isTokenBlacklisted(token: string): Promise<boolean> {
        try {
            const result = await db("token_blacklist").where({ token }).first();
            return !!result;
        } catch (error) {
            throw error;
        }
    }
}
