import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { stripe } from '../../services/stripe';

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  //verify if the method is post
  if(req.method === 'POST'){
    // get user data from session / cookies
    const session = await getSession({req})
    
    const stripeCustomer = await stripe.customers.create({
      email: session.user.email,
    })

    const checkoutSession = await stripe.checkout.sessions.create({
      customer:stripeCustomer.id,
      payment_method_types: ["card"],
      billing_address_collection: "required",
      line_items: [
        {
          price: "price_1JDdDdCN91OfmpophCaRMSiG",
          quantity:1
        },
      ],
      mode: "subscription",
      allow_promotion_codes:true,
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