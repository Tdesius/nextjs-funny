import nodemailer from 'nodemailer';
import Stripe from 'stripe';

// Initialize Stripe with the secret key from the environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Setup NodeMailer transport using environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(request) {
  console.log('=== Room Rental Payment Processing ===');
  
  try {
    const body = await request.json();
    console.log('Payment request:', body);
    
    const { 
      email, 
      amount, 
      propertyOwnerId, // The property owner's Stripe Connect account
      bookingDetails,  // Room details, dates, etc.
      platformFeePercent = 10 // Your platform fee percentage
    } = body;

    // Validate required fields
    if (!email || !amount || !bookingDetails) {
      return Response.json(
        { success: false, error: 'Missing required booking information' },
        { status: 400 }
      );
    }

    // Calculate fees
    const totalAmount = Math.round(parseFloat(amount) * 100); // Convert to cents
    const platformFeeAmount = Math.round(totalAmount * (platformFeePercent / 100));
    const ownerReceives = totalAmount - platformFeeAmount;

    console.log('Payment breakdown:', {
      totalAmount: totalAmount / 100,
      platformFee: platformFeeAmount / 100,
      ownerReceives: ownerReceives / 100
    });

    // Check if this is a demo/test scenario
    const isDemoAccount = !propertyOwnerId || propertyOwnerId.startsWith('acct_demo') || propertyOwnerId.length < 20;
    
    if (isDemoAccount) {
      console.log('Demo mode - simulating room rental payment');
      
      // Simulate successful booking payment
      const mockPaymentIntent = {
        id: `pi_rental_${Math.random().toString(36).substr(2, 9)}`,
        amount: totalAmount,
        currency: 'usd',
        status: 'succeeded',
        application_fee_amount: platformFeeAmount
      };
      
      // Send booking confirmation email
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Booking Confirmation - ${bookingDetails.roomName}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2563eb;">Booking Confirmed!</h1>
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h2>Booking Details</h2>
                  <p><strong>Room:</strong> ${bookingDetails.roomName}</p>
                  <p><strong>Check-in:</strong> ${bookingDetails.checkIn}</p>
                  <p><strong>Check-out:</strong> ${bookingDetails.checkOut}</p>
                  <p><strong>Guests:</strong> ${bookingDetails.guests}</p>
                  <p><strong>Total Nights:</strong> ${bookingDetails.nights}</p>
                </div>
                <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h2>Payment Summary</h2>
                  <p><strong>Room Total:</strong> $${(totalAmount / 100).toFixed(2)}</p>
                  <p><strong>Service Fee:</strong> $${(platformFeeAmount / 100).toFixed(2)}</p>
                  <p><strong>Transaction ID:</strong> ${mockPaymentIntent.id}</p>
                </div>
                <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Note:</strong> This is a demo booking for educational purposes.</p>
                </div>
                <p>Thank you for choosing our platform!</p>
              </div>
            `,
          });
          console.log('Booking confirmation email sent');
        } catch (emailError) {
          console.log('Email sending failed (demo mode):', emailError.message);
        }
      }
      
      return Response.json({ 
        success: true, 
        message: 'Room booking confirmed (Demo)',
        paymentIntentId: mockPaymentIntent.id,
        bookingId: `booking_${Math.random().toString(36).substr(2, 9)}`,
        amountPaid: totalAmount / 100,
        platformFee: platformFeeAmount / 100,
        note: 'This was a simulated booking for demo purposes'
      });
    }

    // Real Stripe Connect payment processing for production
    console.log('Processing real Stripe Connect payment...');
    console.log('Property Owner Account ID:', propertyOwnerId);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      receipt_email: email,
      application_fee_amount: platformFeeAmount,
      metadata: {
        booking_type: 'room_rental',
        room_name: bookingDetails.roomName,
        check_in: bookingDetails.checkIn,
        check_out: bookingDetails.checkOut,
        guests: bookingDetails.guests,
        nights: bookingDetails.nights,
        property_owner: propertyOwnerId
      },
      description: `Room rental: ${bookingDetails.roomName} (${bookingDetails.nights} nights)`
    }, {
      stripeAccount: propertyOwnerId // Send payment to property owner's account
    });

    console.log('Payment intent created:', paymentIntent.id);

    // Send booking confirmation email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: `Booking Confirmation - ${bookingDetails.roomName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #2563eb;">Booking Confirmed!</h1>
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2>Booking Details</h2>
                <p><strong>Room:</strong> ${bookingDetails.roomName}</p>
                <p><strong>Check-in:</strong> ${bookingDetails.checkIn}</p>
                <p><strong>Check-out:</strong> ${bookingDetails.checkOut}</p>
                <p><strong>Guests:</strong> ${bookingDetails.guests}</p>
                <p><strong>Total Nights:</strong> ${bookingDetails.nights}</p>
              </div>
              <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2>Payment Summary</h2>
                <p><strong>Room Total:</strong> $${(totalAmount / 100).toFixed(2)}</p>
                <p><strong>Service Fee:</strong> $${(platformFeeAmount / 100).toFixed(2)}</p>
                <p><strong>Transaction ID:</strong> ${paymentIntent.id}</p>
              </div>
              <p>We look forward to hosting you!</p>
            </div>
          `,
        });
        console.log('Booking confirmation email sent');
      } catch (emailError) {
        console.log('Email sending failed:', emailError.message);
        // Don't fail the whole transaction for email issues
      }
    }

    return Response.json({ 
      success: true, 
      message: 'Room booking confirmed',
      paymentIntentId: paymentIntent.id,
      bookingId: `booking_${Math.random().toString(36).substr(2, 9)}`,
      amountPaid: totalAmount / 100,
      platformFee: platformFeeAmount / 100,
    });

  } catch (error) {
    console.error('=== BOOKING ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    
    return Response.json(
      { 
        success: false, 
        error: 'Booking processing failed',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    );
  }
}