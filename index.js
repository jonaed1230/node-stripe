const express = require('express');
const Stripe = require('stripe');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const memoryStore = require('memorystore')(session);
const app = express();

const stripe = new Stripe('sk_test_51MbsqWHCWPiCjuuzbJFOKpThaLNdVH3nhuOhoq9vbZHJwt33slaJOU8mXLnjJVY9EQISOJGAVHxBXVThniCM7T5V00tOxMqbTk');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
  saveUninitialized: true,
  cookie: { maxAge: 86400000 },
  store: new memoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  resave: false,
  secret: 'blablabla'
}));

app.post('/v1/subscribe',  async (req, res) => {
  try {
    // setupIntent
    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      payment_method_types: ['card', 'paypal'],
    });

    // create a subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: 'price_1OBDdnHCWPiCjuuzmLQICAwt' }],
      off_session: true,
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});

app.get('/', (req, res) => {
  // render the checkout page
  res.sendFile(path.join(__dirname + '/checkout.html'));
});

app.post('/login', async (req, res) => {
  // create a new customer
  const { email } = await req.body;
  const customer = await stripe.customers.create({
    email,
    description: 'My First Test Customer (created for API docs)',
  });
  req.session.customer = customer;
  req.session.email = email;

  res.redirect('/account');
})

// client javascript file
app.get('/account', (req, res) => {
  res.sendFile(path.join(__dirname + '/account.html'));
});

app.post('/checkout', async (req, res) => {
  try {
    let product;
    // create a payment intent
    if (req.body.product === 'basic') {
      product = 'price_1OBDdnHCWPiCjuuzmLQICAwt';
    } else {
      product = 'price_1OBDdnHCWPiCjuuzTyNrWWkY';
    }
    const { customer } = await req.session;
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer,
      line_items: [
        {
          price: product,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 30,
      },
      success_url: 'http://localhost:5000/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:5000/cancel',
    });
    console.log(session);
    res.send({ sessionId: session.id })
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});

app.get('/success', async (req, res) => {
  res.send('Success');
});

app.get('/cancel', async (req, res) => {
  res.send('Cancel');
});


app.listen(5000, () => console.log('Server is running on port 5000'));
