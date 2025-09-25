//File: src/app/api/stripe/create-account/route.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { type } = await request.json();

    const account = await stripe.accounts.create({
      type: type,
      country: 'US', //You can make this dynamic
      email: `test-${Date.now()}@example.com`, //For demo purposes
    });

    return Response.json({
      success: true,
      account: {
        id: account.id,
        type: account.type,
        country: account.country,
        email: account.email,
        charges_enabled: account.charges_enabled,
        details_submitted: account.details_submitted,
        created: account.created,
      },
    });
  } catch (error) {
    console.error('Error creating account:', error);
    return Response.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
