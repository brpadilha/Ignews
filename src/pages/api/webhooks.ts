
import { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'stream';
import Stripe from 'stripe';
import { stripe } from '../../services/stripe';

// create strings of the stream and convert to a buffer
// this is to be more readable in the code
async function buffer(readable: Readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(
      typeof chunk === 'string' ? Buffer.from(chunk) : chunk
    );
  }

  return Buffer.concat(chunks);
}

export const config = {
  api: {
    bodyParser: false,
  }
}

const relevantEvents = new Set([
  'checkout.session.completed',
])

// eslint-disable-next-line import/no-anonymous-default-export
export default async(req: NextApiRequest, res: NextApiResponse)=>{

  if(req.method === 'POST'){
    // transform the events to a readable string
    const buff = await buffer(req);

    const secret = req.headers['stripe-signature'];

    let event: Stripe.Event;

    try {
      // verify if the stripe webhook is valid
      event = stripe.webhooks.constructEvent(buff, secret, process.env.STRIPE_WEBHOOK_SECRET);
    }catch(error){
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    const { type } = event;

    if(relevantEvents.has(type)){
      try {
        switch (type) {
        case 'checkout.session.completed':
          break;

        default:
          throw new Error('Unhandled event type');
      }
      } catch (error) {
        console.error(error);
        return res.status(500).send('Webhook Error');
      }
    }

    res.json({
      received: true
    })
  }else {
    res.setHeader('Allow', 'POST');
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

