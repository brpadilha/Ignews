import styles from "./styles.module.scss";
import { useSession } from 'next-auth/react';
import { signIn } from "next-auth/react";
import { api } from '../../services/api';
import { getStripeJs } from "../../services/stripe-js";

interface SubscribeButtonProps {
  priceId: string;
}
export default function SubscribeButton({ priceId }: SubscribeButtonProps) {
  const {data: session} = useSession()

  async function handleSubscribe(){
    // if user is not logged in, sigin with github
    if(!session){
      signIn('github');
      return
    }

    try {
      const response = await api.post('/subscribe')

      const { sessionId } = response.data

      const stripe = await getStripeJs()

      await stripe.redirectToCheckout({sessionId})
      
    } catch (error) {
      alert(error)
    }


  }

  return (
    <button type="button" className={styles.subscribeButton} onClick={handleSubscribe}>
      Subscribe now
    </button>
  );
}
