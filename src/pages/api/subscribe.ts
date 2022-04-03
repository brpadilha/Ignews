import { query } from 'faunadb';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { fauna } from '../../services/fauna';
import { stripe } from '../../services/stripe';

type User = {
  ref: {
    id: string
  }
  data: {
    stripe_customer_id: string 
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  //verify if the method is post
  if(req.method === 'POST'){

    // get user data from session / cookies
    const session = await getSession({req})

    // get user from fauna to know if dupplicated on stripe
    const user = await fauna.query<User>(
      query.Get(
        query.Match(
          query.Index("user_by_email"),
          query.Casefold(session.user.email)
        )
      )
    );
    
    let customerId = user.data.stripe_customer_id;

    // if user dont have a customer id, will create one
    // it will avoid that user is duplicated on stripe
    if(!customerId){
      const stripeCustomer = await stripe.customers.create({
        email: session.user.email,
      });

      // update User from faunaDB to add stripe customer id
      await fauna.query(
        query.Update(query.Ref(query.Collection("users"), user.ref.id), {
          data: {
            stripe_customer_id: stripeCustomer.id,
          },
        })
      );

      customerId = stripeCustomer.id;
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      billing_address_collection: "required",
      line_items: [
        {
          price: "price_1JDdDdCN91OfmpophCaRMSiG",
          quantity: 1,
        },
      ],
      mode: "subscription",
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    });
    return res.status(200).json({
      sessionId: checkoutSession.id,
    });
  }else{
    // if method is not post, will return a error
    res.setHeader('Allow', 'POST');
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};