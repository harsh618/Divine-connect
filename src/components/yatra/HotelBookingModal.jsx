import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hotel, Wifi, Coffee, Utensils, Car, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function HotelBookingModal({ isOpen, onClose, hotel }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    check_in: '',
    check_out: '',
    guests: 2,
    rooms: 1,
    room_type: 'standard'
  });

  const bookingMutation = useMutation({
    mutationFn: (data) => base44.entities.Booking.create({
      ...data,
      booking_type: 'hotel',
      status: 'confirmed',
      payment_status: 'completed'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Hotel booked successfully!');
      onClose();
    }
  });

  const handleSubmit = () => {
    if (!formData.check_in || !formData.check_out) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    bookingMutation.mutate({
      hotel_id: hotel?.id,
      date: formData.check_in,
      special_requirements: `Check-out: ${formData.check_out}, Guests: ${formData.guests}, Rooms: ${formData.rooms}, Room Type: ${formData.room_type}`,
      total_amount: hotel?.price_per_night * formData.rooms || 2500
    });
  };

  if (!hotel) return null;

  const amenityIcons = {
    'wifi': Wifi,
    'breakfast': Coffee,
    'restaurant': Utensils,
    'parking': Car
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hotel className="w-5 h-5 text-orange-600" />
            Book {hotel.name}
          </DialogTitle>
        </DialogHeader>

        {/* Hotel Details */}
        <div className="space-y-4">
          <img
            src={hotel.thumbnail_url || hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
            alt={hotel.name}
            className="w-full h-48 object-cover rounded-lg"
          />

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">{hotel.name}</h3>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < (hotel.rating || 4) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-600">{hotel.location}</p>
            {hotel.distance_from_temple_km && (
              <p className="text-xs text-orange-600 mt-1">
                {hotel.distance_from_temple_km} km from temple
              </p>
            )}
          </div>

          {/* Amenities */}
          {hotel.amenities?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {hotel.amenities.map((amenity, idx) => {
                const Icon = amenityIcons[amenity.toLowerCase()] || Hotel;
                return (
                  <Badge key={idx} variant="outline" className="flex items-center gap-1">
                    <Icon className="w-3 h-3" />
                    {amenity}
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Booking Form */}
          <Card className="p-4 bg-orange-50 border-orange-200">
            <h4 className="font-semibold mb-3">Booking Details</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Check-in</Label>
                  <Input
                    type="date"
                    value={formData.check_in}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFormData(prev => ({ ...prev, check_in: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Check-out</Label>
                  <Input
                    type="date"
                    value={formData.check_out}
                    min={formData.check_in}
                    onChange={(e) => setFormData(prev => ({ ...prev, check_out: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Guests</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.guests}
                    onChange={(e) => setFormData(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Rooms</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.rooms}
                    onChange={(e) => setFormData(prev => ({ ...prev, rooms: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
              <div>
                <Label>Room Type</Label>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  value={formData.room_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, room_type: e.target.value }))}
                >
                  <option value="standard">Standard</option>
                  <option value="deluxe">Deluxe</option>
                  <option value="suite">Suite</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Price Summary */}
          <Card className="p-4 bg-gradient-to-br from-orange-500 to-amber-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Amount</p>
                <p className="text-2xl font-bold">₹{(hotel.price_per_night || 2500) * formData.rooms}</p>
                <p className="text-xs opacity-80">Per night × {formData.rooms} room(s)</p>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={bookingMutation.isPending}
                className="bg-white text-orange-600 hover:bg-gray-100"
              >
                {bookingMutation.isPending ? 'Booking...' : 'Confirm Booking'}
              </Button>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}