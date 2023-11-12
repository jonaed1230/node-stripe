const stripe = Stripe('sk_test_51MbsqWHCWPiCjuuzbJFOKpThaLNdVH3nhuOhoq9vbZHJwt33slaJOU8mXLnjJVY9EQISOJGAVHxBXVThniCM7T5V00tOxMqbTk', {});

const { error } = await stripe.confirmPayPalSetup(
  '{{SETUP_INTENT_CLIENT_SECRET}}',
  {
    return_url: 'http://localhost:5000/success',
    mandate_data: {
      customer_acceptance: {
        type: 'online',
        online: {
          infer_from_client: true,
        }
      }
    }
  }
);

if (error) {
  console.log({error});
}