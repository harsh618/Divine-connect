import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, ShoppingCart, Plus, Minus, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function PrasadOrderModal({ isOpen, onClose, templeId, templeName, initialItems = [] }) {
  const queryClient = useQueryClient();
  const [cartItems, setCartItems] = useState(
    initialItems.map(item => ({ ...item, quantity: 1 }))
  );
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: ''
  });

  const updateQuantity = (itemId, change) => {
    setCartItems(items => 
      items.map(item => 
        item.id === itemId 
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (itemId) => {
    setCartItems(items => items.filter(item => item.id !== itemId));
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const orderMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      
      return base44.entities.Booking.create({
        user_id: user.id,
        temple_id: templeId,
        booking_type: 'prasad',
        date: format(new Date(), 'yyyy-MM-dd'),
        delivery_date: deliveryDate ? format(deliveryDate, 'yyyy-MM-dd') : null,
        status: 'pending',
        payment_status: 'pending',
        total_amount: totalAmount,
        prasad_order_details: cartItems.map(item => ({
          prasad_item_id: item.id,
          prasad_item_name: item.name,
          quantity: item.quantity,
          unit_price: item.price
        })),
        delivery_address: deliveryAddress
      });
    },
    onSuccess: () => {
      toast.success('Prasad order placed successfully! You will receive confirmation soon.');
      queryClient.invalidateQueries(['bookings']);
      onClose();
    },
    onError: () => {
      toast.error('Failed to place order. Please try again.');
    }
  });

  const handleSubmit = () => {
    if (cartItems.length === 0) {
      toast.error('Please add items to your cart');
      return;
    }
    if (!deliveryAddress.full_name || !deliveryAddress.phone || !deliveryAddress.address_line1 || 
        !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.pincode) {
      toast.error('Please fill in all required delivery details');
      return;
    }
    if (!deliveryDate) {
      toast.error('Please select a delivery date');
      return;
    }
    orderMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Prasad from {templeName}</DialogTitle>
          <DialogDescription>
            Complete your order details for sacred prasad delivery
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Cart Items */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Order Items</Label>
            {cartItems.length > 0 ? (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1606491956689-2ea866880049?w=200'}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-orange-600">₹{item.price} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="font-semibold text-gray-900 w-20 text-right">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No items in cart</p>
            )}
          </div>

          {/* Delivery Address */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Delivery Address</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="mb-1 block text-sm">Full Name *</Label>
                <Input
                  value={deliveryAddress.full_name}
                  onChange={(e) => setDeliveryAddress({...deliveryAddress, full_name: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
              <div className="col-span-2">
                <Label className="mb-1 block text-sm">Phone Number *</Label>
                <Input
                  value={deliveryAddress.phone}
                  onChange={(e) => setDeliveryAddress({...deliveryAddress, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="col-span-2">
                <Label className="mb-1 block text-sm">Address Line 1 *</Label>
                <Input
                  value={deliveryAddress.address_line1}
                  onChange={(e) => setDeliveryAddress({...deliveryAddress, address_line1: e.target.value})}
                  placeholder="House/Flat number, Building name"
                />
              </div>
              <div className="col-span-2">
                <Label className="mb-1 block text-sm">Address Line 2</Label>
                <Input
                  value={deliveryAddress.address_line2}
                  onChange={(e) => setDeliveryAddress({...deliveryAddress, address_line2: e.target.value})}
                  placeholder="Street, Area, Landmark (Optional)"
                />
              </div>
              <div>
                <Label className="mb-1 block text-sm">City *</Label>
                <Input
                  value={deliveryAddress.city}
                  onChange={(e) => setDeliveryAddress({...deliveryAddress, city: e.target.value})}
                  placeholder="City"
                />
              </div>
              <div>
                <Label className="mb-1 block text-sm">State *</Label>
                <Input
                  value={deliveryAddress.state}
                  onChange={(e) => setDeliveryAddress({...deliveryAddress, state: e.target.value})}
                  placeholder="State"
                />
              </div>
              <div className="col-span-2">
                <Label className="mb-1 block text-sm">Pincode *</Label>
                <Input
                  value={deliveryAddress.pincode}
                  onChange={(e) => setDeliveryAddress({...deliveryAddress, pincode: e.target.value})}
                  placeholder="Enter pincode"
                />
              </div>
            </div>
          </div>

          {/* Delivery Date */}
          <div>
            <Label className="mb-2 block text-sm">Preferred Delivery Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deliveryDate ? format(deliveryDate, 'PPP') : 'Select delivery date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={deliveryDate}
                  onSelect={setDeliveryDate}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Order Summary */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total Amount:</span>
              <span className="text-orange-600">₹{totalAmount}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={orderMutation.isPending || cartItems.length === 0}
            className="flex-1 bg-orange-500 hover:bg-orange-600"
          >
            {orderMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <ShoppingCart className="w-4 h-4 mr-2" />
            )}
            Place Order (₹{totalAmount})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}