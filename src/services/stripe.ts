import Stripe from 'stripe'
import { version } from '../../package.json'

export const stripe = new Stripe(process.env.STRIPE_API_KEY, {
  apiVersion: "2020-08-27",
  appInfo: {
    //qual aplicação ta fazendo a requisicao
    name: "Ignews",
    version
  }
});