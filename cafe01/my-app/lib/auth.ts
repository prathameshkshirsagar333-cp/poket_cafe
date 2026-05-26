import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import InstagramProvider from "next-auth/providers/instagram";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Otp from "@/models/Otp";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
    InstagramProvider({
      clientId: process.env.INSTAGRAM_CLIENT_ID || "",
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || "",
      profile(profile: { id: string; username: string }) {
        return {
          id: profile.id,
          name: profile.username,
          email: `${profile.username}@instagram.local`,
          image: null,
        };
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        await connectToDatabase();

        const user = await User.findOne({
          email: credentials.email.trim().toLowerCase(),
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password.");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password.");
        }

        if (credentials.otp) {
          const otpRecord = await Otp.findOne({
            email: credentials.email.trim().toLowerCase(),
          }).sort({ createdAt: -1 });

          if (!otpRecord) {
            throw new Error("OTP expired or not requested.");
          }

          if (otpRecord.otp !== credentials.otp) {
            otpRecord.attempts += 1;
            await otpRecord.save();

            if (otpRecord.attempts >= 3) {
              await Otp.deleteMany({ email: credentials.email.trim().toLowerCase() });
              throw new Error("Maximum invalid attempts reached. Please login again.");
            }

            throw new Error(`Invalid code. ${3 - otpRecord.attempts} attempts remaining.`);
          }

          await Otp.deleteMany({ email: credentials.email.trim().toLowerCase() });
        } else {
          throw new Error("otp_required");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name ?? null,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "instagram") {
        try {
          await connectToDatabase();
          const existingUser = await User.findOne({ email: user.email?.toLowerCase() });

          if (!existingUser) {
            const newUser = new User({
              name: user.name,
              email: user.email?.toLowerCase(),
            });
            await newUser.save();
          }
          return true;
        } catch (error) {
          console.error(`Error saving ${account.provider} OAuth user to DB:`, error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;

        if (account?.provider === "google" || account?.provider === "instagram") {
          await connectToDatabase();
          const dbUser = await User.findOne({ email: user.email?.toLowerCase() });
          if (dbUser) {
            token.id = dbUser._id.toString();
          }
        } else {
          token.id = (user as { id?: string }).id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { id?: string }).id = token.id as string;
        session.user.email = token.email ?? "";
        session.user.name = token.name ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
