import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Hotel, 
  Calendar, 
  DollarSign, 
  Users,
  Star,
  Plus,
  Edit,
  Trash2,
  Image,
  BedDouble,
  CheckCircle,
  Clock,
  MapPin,
  Settings
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function HotelDashboard() {
  const queryClient = useQueryClient();
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({
    room_type: 'STANDARD',
    total_rooms: 10,
    available_rooms: 10,
    price_per_night: 1500,
    max_occupancy: 2
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: hotels, isLoading } = useQuery({
    queryKey: ['my-hotels', user?.id],
    queryFn: async () => {
      return base44.entities.Hotel.filter({ 
        admin_user_id: user.id, 
        is_deleted: false 
      });
    },
    enabled: !!user
  });

  const hotel = hotels?.[0]; // Primary hotel

  const { data: bookings } = useQuery({
    queryKey: ['hotel-bookings', hotel?.id],
    queryFn: async () => {
      // Get bookings that mention this hotel
      const allBookings = await base44.entities.Booking.filter({
        booking_type: 'temple_visit',
        is_deleted: false
      }, '-created_date', 50);
      
      return allBookings.filter(b => 
        b.special_requirements?.includes(hotel.name)
      );
    },
    enabled: !!hotel
  });

  const updateHotelMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Hotel.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-hotels']);
      toast.success('Hotel updated successfully');
    }
  });

  const upcomingBookings = bookings?.filter(b => 
    new Date(b.date) >= new Date() && ['confirmed', 'pending'].includes(b.status)
  ) || [];

  const completedBookings = bookings?.filter(b => b.status === 'completed') || [];

  const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);

  const handleRoomUpdate = () => {
    if (!hotel) return;
    
    const updatedInventory = [...(hotel.room_inventory || [])];
    
    if (editingRoom !== null) {
      updatedInventory[editingRoom] = roomForm;
    } else {
      updatedInventory.push(roomForm);
    }

    updateHotelMutation.mutate({
      id: hotel.id,
      data: { room_inventory: updatedInventory }
    });

    setShowRoomModal(false);
    setEditingRoom(null);
    setRoomForm({
      room_type: 'STANDARD',
      total_rooms: 10,
      available_rooms: 10,
      price_per_night: 1500,
      max_occupancy: 2
    });
  };

  const handleDeleteRoom = (index) => {
    if (!hotel) return;
    const updatedInventory = hotel.room_inventory.filter((_, i) => i !== index);
    updateHotelMutation.mutate({
      id: hotel.id,
      data: { room_inventory: updatedInventory }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
        <Hotel className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-serif text-gray-900 mb-2">No Hotel Registered</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          You haven't registered a hotel yet. Contact admin to set up your property.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
              <Hotel className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-white mb-1">
                {hotel.name}
              </h1>
              <p className="text-white/90 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {hotel.city}, {hotel.state}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-6 -mt-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-100">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{upcomingBookings.length}</p>
                <p className="text-sm text-gray-500">Upcoming Bookings</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-100">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{completedBookings.length}</p>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-yellow-100">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{hotel.rating_average || 4.5}</p>
                <p className="text-sm text-gray-500">Rating</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-100">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Total Revenue</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="rooms" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Rooms Tab */}
          <TabsContent value="rooms">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Room Inventory</h3>
                <Button 
                  onClick={() => {
                    setEditingRoom(null);
                    setRoomForm({
                      room_type: 'STANDARD',
                      total_rooms: 10,
                      available_rooms: 10,
                      price_per_night: 1500,
                      max_occupancy: 2
                    });
                    setShowRoomModal(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Room Type
                </Button>
              </div>

              {hotel.room_inventory?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hotel.room_inventory.map((room, idx) => (
                    <Card key={idx} className="p-4 border">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <BedDouble className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{room.room_type}</h4>
                            <p className="text-sm text-gray-500">Max {room.max_occupancy} guests</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={() => {
                              setEditingRoom(idx);
                              setRoomForm(room);
                              setShowRoomModal(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost"
                            className="text-red-600"
                            onClick={() => handleDeleteRoom(idx)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Price/Night</p>
                          <p className="font-semibold text-green-600">₹{room.price_per_night}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total</p>
                          <p className="font-semibold">{room.total_rooms}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Available</p>
                          <p className="font-semibold text-blue-600">{room.available_rooms}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BedDouble className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No room types added yet</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6">Recent Bookings</h3>
              {upcomingBookings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <div key={booking.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">Booking #{booking.id.slice(0, 8)}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(booking.date), 'PPP')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {booking.num_devotees} guests
                            </span>
                          </div>
                        </div>
                        <Badge className={
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          'bg-yellow-100 text-yellow-700'
                        }>
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No upcoming bookings</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6">Hotel Settings</h3>
              <div className="space-y-4">
                <div>
                  <Label>Hotel Name</Label>
                  <Input value={hotel.name} disabled />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>City</Label>
                    <Input value={hotel.city} disabled />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input value={hotel.state} disabled />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea 
                    value={hotel.description || ''} 
                    onChange={(e) => updateHotelMutation.mutate({
                      id: hotel.id,
                      data: { description: e.target.value }
                    })}
                    placeholder="Describe your hotel..."
                  />
                </div>
                <div>
                  <Label>Amenities</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {hotel.amenities?.join(', ') || 'No amenities listed'}
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Room Modal */}
      <Dialog open={showRoomModal} onOpenChange={setShowRoomModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRoom !== null ? 'Edit Room Type' : 'Add Room Type'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Room Type</Label>
              <Select 
                value={roomForm.room_type} 
                onValueChange={(val) => setRoomForm(prev => ({ ...prev, room_type: val }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STANDARD">Standard</SelectItem>
                  <SelectItem value="DELUXE">Deluxe</SelectItem>
                  <SelectItem value="SUITE">Suite</SelectItem>
                  <SelectItem value="DORMITORY">Dormitory</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Total Rooms</Label>
                <Input 
                  type="number"
                  value={roomForm.total_rooms}
                  onChange={(e) => setRoomForm(prev => ({ ...prev, total_rooms: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label>Available Rooms</Label>
                <Input 
                  type="number"
                  value={roomForm.available_rooms}
                  onChange={(e) => setRoomForm(prev => ({ ...prev, available_rooms: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price per Night (₹)</Label>
                <Input 
                  type="number"
                  value={roomForm.price_per_night}
                  onChange={(e) => setRoomForm(prev => ({ ...prev, price_per_night: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label>Max Occupancy</Label>
                <Input 
                  type="number"
                  value={roomForm.max_occupancy}
                  onChange={(e) => setRoomForm(prev => ({ ...prev, max_occupancy: Number(e.target.value) }))}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowRoomModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleRoomUpdate} className="flex-1 bg-blue-600 hover:bg-blue-700">
              {editingRoom !== null ? 'Update' : 'Add'} Room
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}