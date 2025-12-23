import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Loader2, 
  Plus, 
  Minus, 
  CheckCircle, 
  MapPin,
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { toast } from 'sonner';

const PRASAD_STAGES = {
  SELECT_ITEMS: 1,
  DELIVERY_DETAILS: 2,
  PAYMENT: 3,
  CONFIRMATION: 4
};

export default function PrasadOrderModal({ open, onClose, templeId, prasadItems }) {
  const queryClient = useQueryClient();
  const [currentStage, setCurrentStage] = useState(PRASAD_STAGES.SELECT_ITEMS);
  const [selectedItems, setSelectedItems] = useState({});
  const [deliveryDetails, setDeliveryDetails] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [specialInstructions, setSpecialInstructions] = useState('');

  const orderMutation = useMutation({
    mutationFn: async (orderData) => {
      const user = await base44.auth.me();
      return base44.entities.Booking.create({
        ...orderData,
        user_id: user.id,
        temple_id: templeId,
        booking_type: 'prasad',
        status: 'confirmed',
        payment_status: 'completed'
      });
    },
    onSuccess: () => {
      setCurrentStage(PRASAD_STAGES.CONFIRMATION);
      queryClient.invalidateQueries(['bookings']);
    },
    onError: () => {
      toast.error('Order failed. Please try again.');
    }
  });

  const updateQuantity = (itemId, change) => {
    setSelectedItems(prev => {
      const current = prev[itemId] || 0;
      const newQty = Math.max(0, current + change);
      if (newQty === 0) {
        const { [itemId]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: newQty };
    });
  };

  const calculateTotal = () => {
    return Object.entries(selectedItems).reduce((total, [itemId, qty]) => {
      const item = prasadItems.find(p => p.id === itemId);
      return total + (item?.price || 0) * qty;
    }, 0);
  };

  const handleNext = () => {
    if (currentStage === PRASAD_STAGES.SELECT_ITEMS) {
      if (Object.keys(selectedItems).length === 0) {
        toast.error('Please select at least one item');
        return;
      }
      setCurrentStage(PRASAD_STAGES.DELIVERY_DETAILS);
    } else if (currentStage === PRASAD_STAGES.DELIVERY_DETAILS) {
      if (!deliveryDetails.full_name || !deliveryDetails.phone || !deliveryDetails.address_line1 || 
          !deliveryDetails.city || !deliveryDetails.state || !deliveryDetails.pincode || !deliveryDate) {
        toast.error('Please fill all required fields');
        return;
      }
      setCurrentStage(PRASAD_STAGES.PAYMENT);
    } else if (currentStage === PRASAD_STAGES.PAYMENT) {
      handleOrder();
    }
  };

  const handleBack = () => {
    if (currentStage > PRASAD_STAGES.SELECT_ITEMS) {
      setCurrentStage(currentStage - 1);
    }
  };

  const handleOrder = () => {
    const orderDetails = Object.entries(selectedItems).map(([itemId, qty]) => {
      const item = prasadItems.find(p => p.id === itemId);
      return {
        prasad_item_id: itemId,
        prasad_item_name: item.name,
        quantity: qty,
        unit_price: item.price
      };
    });

    orderMutation.mutate({
      prasad_order_details: orderDetails,
      delivery_address: deliveryDetails,
      delivery_date: format(deliveryDate, 'yyyy-MM-dd'),
      special_requirements: specialInstructions,
      total_amount: calculateTotal(),
      date: format(deliveryDate, 'yyyy-MM-dd')
    });
  };

  const handleClose = () => {
    setCurrentStage(PRASAD_STAGES.SELECT_ITEMS);
    setSelectedItems({});
    setDeliveryDetails({
      full_name: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      pincode: ''
    });
    setDeliveryDate(null);
    setSpecialInstructions('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {currentStage === PRASAD_STAGES.CONFIRMATION ? 'Order Confirmed!' : 'Order Prasad'}
          </DialogTitle>
        </DialogHeader>

        {/* Progress */}
        {currentStage !== PRASAD_STAGES.CONFIRMATION && (
          <div className="flex items-center gap-2 mb-6">
            {Array(3).fill(0).map((_, idx) => (
              <div key={idx} className="flex-1">
                <div className={`h-2 rounded-full transition-all ${
                  idx < currentStage ? 'bg-orange-500' : 'bg-gray-200'
                }`} />
              </div>
            ))}
          </div>
        )}

        <div className="py-4">
          {currentStage === PRASAD_STAGES.SELECT_ITEMS && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">Select prasad items and quantities</p>
              {prasadItems?.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  {item.image_url && (
                    <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <p className="text-orange-600 font-bold mt-1">₹{item.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, -1)}
                      disabled={!selectedItems[item.id]}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center font-semibold">
                      {selectedItems[item.id] || 0}
                    </span>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentStage === PRASAD_STAGES.DELIVERY_DETAILS && (
            <div className="space-y-6">
              <p className="text-gray-600 mb-4">Enter delivery address and preferred date</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block">Full Name *</Label>
                  <Input
                    value={deliveryDetails.full_name}
                    onChange={(e) => setDeliveryDetails({...deliveryDetails, full_name: e.target.value})}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Phone Number *</Label>
                  <Input
                    value={deliveryDetails.phone}
                    onChange={(e) => setDeliveryDetails({...deliveryDetails, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Address Line 1 *</Label>
                <Input
                  value={deliveryDetails.address_line1}
                  onChange={(e) => setDeliveryDetails({...deliveryDetails, address_line1: e.target.value})}
                  placeholder="House/Flat number, Street"
                />
              </div>

              <div>
                <Label className="mb-2 block">Address Line 2 (Optional)</Label>
                <Input
                  value={deliveryDetails.address_line2}
                  onChange={(e) => setDeliveryDetails({...deliveryDetails, address_line2: e.target.value})}
                  placeholder="Landmark, Area"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="mb-2 block">City *</Label>
                  <Input
                    value={deliveryDetails.city}
                    onChange={(e) => setDeliveryDetails({...deliveryDetails, city: e.target.value})}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">State *</Label>
                  <Input
                    value={deliveryDetails.state}
                    onChange={(e) => setDeliveryDetails({...deliveryDetails, state: e.target.value})}
                    placeholder="State"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Pincode *</Label>
                  <Input
                    value={deliveryDetails.pincode}
                    onChange={(e) => setDeliveryDetails({...deliveryDetails, pincode: e.target.value})}
                    placeholder="Pincode"
                  />
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Preferred Delivery Date *</Label>
                <Calendar
                  mode="single"
                  selected={deliveryDate}
                  onSelect={setDeliveryDate}
                  disabled={(date) => date < addDays(new Date(), 2)}
                  className="rounded-lg border"
                />
              </div>

              <div>
                <Label className="mb-2 block">Special Instructions (Optional)</Label>
                <Textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Any delivery instructions..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {currentStage === PRASAD_STAGES.PAYMENT && (
            <div className="space-y-6">
              <p className="text-gray-600 mb-4">Review your order and proceed to payment</p>
              
              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold">Order Summary</h3>
                {Object.entries(selectedItems).map(([itemId, qty]) => {
                  const item = prasadItems.find(p => p.id === itemId);
                  return (
                    <div key={itemId} className="flex justify-between text-sm">
                      <span>{item?.name} x {qty}</span>
                      <span className="font-medium">₹{(item?.price * qty).toLocaleString()}</span>
                    </div>
                  );
                })}
                <div className="pt-3 border-t flex justify-between font-bold">
                  <span>Total Amount:</span>
                  <span className="text-orange-600">₹{calculateTotal().toLocaleString()}</span>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-start gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold">{deliveryDetails.full_name}</p>
                    <p className="text-gray-600">{deliveryDetails.phone}</p>
                    <p className="text-gray-600 mt-1">
                      {deliveryDetails.address_line1}, {deliveryDetails.address_line2 && `${deliveryDetails.address_line2}, `}
                      {deliveryDetails.city}, {deliveryDetails.state} - {deliveryDetails.pincode}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                  <CalendarIcon className="w-4 h-4" />
                  <span>Delivery by {deliveryDate && format(deliveryDate, 'PPP')}</span>
                </div>
              </div>
            </div>
          )}

          {currentStage === PRASAD_STAGES.CONFIRMATION && (
            <div className="text-center py-6">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h3>
              <p className="text-gray-600 mb-6">
                Your prasad order has been placed successfully. You will receive tracking details via email and WhatsApp.
              </p>
              <div className="bg-orange-50 p-4 rounded-lg mb-6 text-left">
                <p className="text-sm text-gray-700">
                  <strong>What's Next:</strong><br/>
                  • You'll receive order confirmation via email<br/>
                  • Prasad will be dispatched within 24 hours<br/>
                  • Expected delivery: {deliveryDate && format(deliveryDate, 'PPP')}<br/>
                  • Track your order in My Bookings section
                </p>
              </div>
              <Button onClick={handleClose} className="bg-orange-500 hover:bg-orange-600">
                Close
              </Button>
            </div>
          )}
        </div>

        {currentStage !== PRASAD_STAGES.CONFIRMATION && (
          <div className="flex gap-3 mt-6">
            {currentStage > PRASAD_STAGES.SELECT_ITEMS && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <Button 
              onClick={handleNext}
              disabled={orderMutation.isPending}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              {orderMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...</>
              ) : currentStage === PRASAD_STAGES.PAYMENT ? (
                <>Pay ₹{calculateTotal()}</>
              ) : (
                <>Continue <ChevronRight className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}