//File: src/app/api/stripe/account-status/route.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return Response.json({
        success: false,
        error: 'Account ID is required',
      }, { status: 400 });
    }

    const account = await stripe.accounts.retrieve(accountId);

    return Response.json({
      success: true,
      account: {
        id: account.id,
        type: account.type,
        country: account.country,
        email: account.email,
        charges_enabled: account.charges_enabled,
        details_submitted: account.details_submitted,
        requirements: account.requirements,
      },
    });
  } catch (error) {
    console.error('Error retrieving account:', error);
    return Response.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}