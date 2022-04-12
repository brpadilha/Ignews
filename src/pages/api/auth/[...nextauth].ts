import { query } from "faunadb";
import NextAuth from "next-auth";
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
    //change data from session, to add more or remove
    // we will use to know if user already has subscription
    async session({session}) {
      try {
        const userActiveSubscription = await fauna.query(
          query.Get(
            query.Intersection([
              query.Match(
                query.Index("subscription_by_user_ref"),
                query.Select(
                  "ref",
                  query.Get(
                    query.Match(
                      query.Index("user_by_email"),
                      query.Casefold(session.user.email)
                    )
                  )
                )
              ),

              query.Match(query.Index("subscription_by_status"), "active"),
            ])
          )
        );


        return { ...session, activeSubscription: userActiveSubscription,};
      } catch(error) {
        console.log(error)
        return { ...session, activeSubscription: null, };
        
      }
    },
    async signIn({ user, account, profile }) {
      const { email } = user;
      try {
        //doing query to import user on faunaDB
        await fauna.query(
          // verify if already exists a user with this email
          // its bether than create const and make a query if userExists

          query.If(
            query.Not(
              query.Exists(
                query.Match(query.Index("user_by_email"), query.Casefold(email))
              )
            ),
            // query to create a new user
            query.Create(
              // Collection users that we will insert our user
              query.Collection("users"),
              { data: { email } }
            ),
            // if user exists, will get the data from this user
            query.Get(
              query.Match(query.Index("user_by_email"), query.Casefold(email))
            )
          )
        );

        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
});
