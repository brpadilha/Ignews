import { query } from "faunadb";
import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";
import GithubProvider from "next-auth/providers/github";
import { fauna } from "../../../services/fauna";

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      authorization: {
        params: {
          //scope that we can access
          //here we can read the data of user, like email and name
          scope: "read:user",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      const { email } = user;
      try {
        //doing query to import user on faunaDB
        await fauna.query(
          // query to create a new user
          query.Create(
            // Collection users that we will insert our user
            query.Collection("users"),
            { data: { email } }
          )
        );

        return true;
      } catch {
        return false;
      }
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
});
