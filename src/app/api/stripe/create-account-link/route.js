//File: src/app/api/stripe/create-account-link/route.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { accountId } = await request.json();

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/stripe/reauth`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/stripe/success`,
      type: 'account_onboarding',
    });

    return Response.json({
      success: true,
      url: accountLink.url,
    });
  } catch (error) {
    console.error('Error creating account link:', error);
    return Response.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}