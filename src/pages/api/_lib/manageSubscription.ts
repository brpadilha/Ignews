import { query } from "faunadb";
import { fauna } from "../../../services/fauna";
import { stripe } from "../../../services/stripe";

export async function saveSubscription(
  subscriptionId: string,
  customerId: string,
  createAction: boolean = false
){
  // Search a User on FaunaDB by customerId
  // Save the data on subscriptions Collections on FaunaDB

  const userReference = await fauna.query(
    query.Select(
      // Select only the ref data of user
      "ref",
      query.Get(
        query.Match(query.Index("user_by_stripe_customer_id"), customerId)
      )
    )
  );


  const allSubscriptionData = await stripe.subscriptions.retrieve(subscriptionId);

  const subscriptionDataToSave = {
    id: allSubscriptionData.id,
    userId: userReference,
    status: allSubscriptionData.status,
    price_id: allSubscriptionData.items.data[0].price.id,

  };


  if(createAction){
    await fauna.query(
      query.Create(query.Collection("subscriptions"), {
        data: subscriptionDataToSave,
      })
    );
  }else{
    try {
      //att one subscripiton
    await fauna.query(
      // replace will replace all the subscription
      // Update updates only one data
      query.Replace(
        query.Select(
          'ref',
          query.Get(
            query.Match(
              query.Index("subscription_by_id"),
              subscriptionId,
            )
          )
        ),
        {
          data: subscriptionDataToSave,
        }
      )
    );
    } catch (error) {
      console.error(error);
    }
      
  }
    
}
  
  