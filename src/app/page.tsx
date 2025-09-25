'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Home, 
  Calendar, 
  Users, 
  DollarSign, 
  MapPin, 
  Star, 
  CheckCircle, 
  AlertCircle,
  CreditCard,
  Building,
  Bed,
  Wifi,
  Car,
  Coffee
} from 'lucide-react';

const RoomRentalSystem = () => {
  // Booking state
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingData, setBookingData] = useState({
    email: '',
    checkIn: '',
    checkOut: '',
    guests: 1
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(null);
  const [bookingResult, setBookingResult] = useState(null);

  // Sample room data for demo
  const rooms = [
    {
      id: 1,
      name: "Luxury City Suite",
      type: "Apartment",
      price: 89,
      rating: 4.8,
      reviews: 124,
      location: "Downtown District",
      image: "🏢",
      amenities: ["wifi", "parking", "kitchen", "gym"],
      maxGuests: 4,
      propertyOwnerId: "acct_demo_owner1",
      description: "Modern apartment with city views, fully equipped kitchen, and premium amenities."
    },
    {
      id: 2,
      name: "Cozy Beach House",
      type: "House",
      price: 129,
      rating: 4.9,
      reviews: 89,
      location: "Coastal Area",
      image: "🏖️",
      amenities: ["wifi", "parking", "beach_access", "bbq"],
      maxGuests: 6,
      propertyOwnerId: "acct_demo_owner2",
      description: "Charming beach house steps from the ocean, perfect for family getaways."
    },
    {
      id: 3,
      name: "Mountain Cabin Retreat",
      type: "Cabin",
      price: 75,
      rating: 4.7,
      reviews: 156,
      location: "Mountain View",
      image: "🏔️",
      amenities: ["wifi", "fireplace", "hiking", "hot_tub"],
      maxGuests: 8,
      propertyOwnerId: "acct_demo_owner3",
      description: "Rustic cabin surrounded by nature, ideal for outdoor enthusiasts."
    }
  ];

  const calculateStayDetails = () => {
    if (!bookingData.checkIn || !bookingData.checkOut || !selectedRoom) return null;
    
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    if (nights <= 0) return null;
    
    const subtotal = selectedRoom.price * nights;
    const serviceFee = subtotal * 0.1; // 10% platform fee
    const total = subtotal + serviceFee;
    
    return { nights, subtotal, serviceFee, total };
  };

  const handleBookRoom = async () => {
    if (!selectedRoom || !bookingData.email || !bookingData.checkIn || !bookingData.checkOut) {
      alert('Please fill in all booking details');
      return;
    }

    const stayDetails = calculateStayDetails();
    if (!stayDetails || stayDetails.nights <= 0) {
      alert('Please select valid check-in and check-out dates');
      return;
    }

    setIsProcessing(true);
    setBookingStatus('processing');

    try {
      const response = await fetch('/api/stripe/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: bookingData.email,
          amount: stayDetails.total.toFixed(2),
          propertyOwnerId: selectedRoom.propertyOwnerId,
          platformFeePercent: 10,
          bookingDetails: {
            roomName: selectedRoom.name,
            roomType: selectedRoom.type,
            checkIn: bookingData.checkIn,
            checkOut: bookingData.checkOut,
            guests: bookingData.guests,
            nights: stayDetails.nights,
            location: selectedRoom.location
          }
        }),
      });

      const result = await response.json();
      console.log('Booking result:', result);

      if (result.success) {
        setBookingStatus('success');
        setBookingResult(result);
      } else {
        setBookingStatus('failed');
        console.error('Booking failed:', result);
      }
    } catch (error) {
      console.error('Booking error:', error);
      setBookingStatus('failed');
    }

    setIsProcessing(false);
  };

  const resetBooking = () => {
    setSelectedRoom(null);
    setBookingStatus(null);
    setBookingResult(null);
    setBookingData({
      email: '',
      checkIn: '',
      checkOut: '',
      guests: 1
    });
  };

  const getAmenityIcon = (amenity) => {
    const icons = {
      wifi: <Wifi className="h-4 w-4" />,
      parking: <Car className="h-4 w-4" />,
      kitchen: <Coffee className="h-4 w-4" />,
      gym: <Building className="h-4 w-4" />
    };
    return icons[amenity] || <Home className="h-4 w-4" />;
  };

  const stayDetails = calculateStayDetails();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Home className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">RoomRent Pro</h1>
                <p className="text-sm text-gray-600">Room Rental Management System</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Final Assignment Demo</p>
              <p className="text-xs text-gray-500">Stripe Connect Integration</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Room Selection */}
        {!selectedRoom && bookingStatus !== 'success' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Available Rooms</h2>
              <p className="text-gray-600">Choose from our premium selection of rental properties</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedRoom(room)}>
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-6xl">
                    {room.image}
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{room.name}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {room.location}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">${room.price}</div>
                        <div className="text-sm text-gray-500">per night</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{room.rating}</span>
                        <span className="text-gray-500">({room.reviews})</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{room.maxGuests} guests</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{room.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {room.amenities.slice(0, 3).map((amenity, index) => (
                        <div key={index} className="flex items-center space-x-1 text-xs bg-gray-100 px-2 py-1 rounded">
                          {getAmenityIcon(amenity)}
                          <span className="capitalize">{amenity.replace('_', ' ')}</span>
                        </div>
                      ))}
                      {room.amenities.length > 3 && (
                        <div className="text-xs text-gray-500 px-2 py-1">
                          +{room.amenities.length - 3} more
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Booking Form */}
        {selectedRoom && bookingStatus !== 'success' && (
          <div className="max-w-4xl mx-auto">
            <Button 
              variant="outline" 
              onClick={() => setSelectedRoom(null)}
              className="mb-6"
            >
              ← Back to Room Selection
            </Button>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Room Details */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">{selectedRoom.image}</div>
                    <div>
                      <CardTitle>{selectedRoom.name}</CardTitle>
                      <CardDescription className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {selectedRoom.location}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Room Type:</span>
                      <span className="font-medium">{selectedRoom.type}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Price per night:</span>
                      <span className="font-medium">${selectedRoom.price}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Max guests:</span>
                      <span className="font-medium">{selectedRoom.maxGuests}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Rating:</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="font-medium">{selectedRoom.rating} ({selectedRoom.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Booking Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Book Your Stay
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={bookingData.email}
                      onChange={(e) => setBookingData({...bookingData, email: e.target.value})}
                      placeholder="your@email.com"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="checkin">Check-in</Label>
                      <Input
                        id="checkin"
                        type="date"
                        value={bookingData.checkIn}
                        onChange={(e) => setBookingData({...bookingData, checkIn: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <Label htmlFor="checkout">Check-out</Label>
                      <Input
                        id="checkout"
                        type="date"
                        value={bookingData.checkOut}
                        onChange={(e) => setBookingData({...bookingData, checkOut: e.target.value})}
                        min={bookingData.checkIn}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="guests">Number of Guests</Label>
                    <Input
                      id="guests"
                      type="number"
                      value={bookingData.guests}
                      onChange={(e) => setBookingData({...bookingData, guests: parseInt(e.target.value)})}
                      min="1"
                      max={selectedRoom.maxGuests}
                    />
                  </div>

                  {/* Price Breakdown */}
                  {stayDetails && (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <h4 className="font-medium">Price Breakdown</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>${selectedRoom.price} × {stayDetails.nights} nights</span>
                          <span>${stayDetails.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Service Fee (10%)</span>
                          <span>${stayDetails.serviceFee.toFixed(2)}</span>
                        </div>
                        <hr className="my-2" />
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span>${stayDetails.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  {bookingStatus === 'processing' ? (
                    <div className="w-full text-center">
                      <div className="inline-flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        <span>Processing booking...</span>
                      </div>
                    </div>
                  ) : bookingStatus === 'failed' ? (
                    <div className="w-full space-y-3">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                        <AlertCircle className="h-5 w-5 text-red-600 mx-auto mb-1" />
                        <p className="text-red-800 text-sm">Booking failed. Please try again.</p>
                      </div>
                      <Button onClick={() => setBookingStatus(null)} variant="outline" className="w-full">
                        Try Again
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleBookRoom} 
                      disabled={!stayDetails || isProcessing}
                      className="w-full"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Book Now - ${stayDetails?.total.toFixed(2) || '0.00'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>
          </div>
        )}

        {/* Success State */}
        {bookingStatus === 'success' && bookingResult && (
          <div className="max-w-2xl mx-auto text-center">
            <Card className="border-green-200">
              <CardHeader>
                <div className="flex flex-col items-center space-y-4">
                  <CheckCircle className="h-16 w-16 text-green-600" />
                  <div>
                    <CardTitle className="text-2xl text-green-800">Booking Confirmed!</CardTitle>
                    <CardDescription>Your room has been successfully booked</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg text-left">
                  <h4 className="font-semibold mb-2">Booking Details</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Booking ID:</span>
                      <span className="font-mono">{bookingResult.bookingId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment ID:</span>
                      <span className="font-mono">{bookingResult.paymentIntentId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount Paid:</span>
                      <span>${bookingResult.amountPaid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform Fee:</span>
                      <span>${bookingResult.platformFee}</span>
                    </div>
                  </div>
                </div>
                
                {bookingResult.note && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">{bookingResult.note}</p>
                  </div>
                )}

                <p className="text-sm text-gray-600">
                  A confirmation email has been sent to {bookingData.email}
                </p>
              </CardContent>
              <CardFooter>
                <Button onClick={resetBooking} className="w-full">
                  Book Another Room
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomRentalSystem;