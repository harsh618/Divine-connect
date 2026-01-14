import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  Image, 
  BedDouble, 
  Plus, 
  X, 
  Save, 
  Loader2,
  Wifi,
  Car,
  Utensils,
  Tv,
  Wind,
  Waves,
  Coffee,
  Dumbbell,
  Upload,
  Edit,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

const AMENITIES = [
  { id: 'wifi', label: 'Free WiFi', icon: Wifi },
  { id: 'parking', label: 'Parking', icon: Car },
  { id: 'restaurant', label: 'Restaurant', icon: Utensils },
  { id: 'tv', label: 'TV', icon: Tv },
  { id: 'ac', label: 'Air Conditioning', icon: Wind },
  { id: 'pool', label: 'Swimming Pool', icon: Waves },
  { id: 'breakfast', label: 'Breakfast Included', icon: Coffee },
  { id: 'gym', label: 'Gym', icon: Dumbbell },
];

const ROOM_TYPES = ['STANDARD', 'DELUXE', 'SUITE', 'DORMITORY'];

export default function HotelPropertySetup({ hotel }) {
  const queryClient = useQueryClient();
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [hotelData, setHotelData] = useState({
    name: hotel?.name || '',
    description: hotel?.description || '',
    address: hotel?.address || '',
    city: hotel?.city || '',
    state: hotel?.state || '',
    pincode: hotel?.pincode || '',
    contact_phone: hotel?.contact_phone || '',
    contact_email: hotel?.contact_email || '',
    amenities: hotel?.amenities || [],
    images: hotel?.images || [],
    thumbnail_url: hotel?.thumbnail_url || ''
  });

  const [roomData, setRoomData] = useState({
    room_type: 'STANDARD',
    total_rooms: 10,
    available_rooms: 10,
    price_per_night: 2500,
    max_occupancy: 2,
    amenities: [],
    images: [],
    weekend_price: 0,
    festival_price: 0
  });

  const updateHotelMutation = useMutation({
    mutationFn: (data) => base44.entities.Hotel.update(hotel.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['hotel-profile']);
      toast.success('Hotel updated successfully!');
    }
  });

  const handleImageUpload = async (e, type) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(file_url);
      }

      if (type === 'hotel') {
        setHotelData(prev => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls]
        }));
      } else if (type === 'thumbnail') {
        setHotelData(prev => ({
          ...prev,
          thumbnail_url: uploadedUrls[0]
        }));
      } else if (type === 'room') {
        setRoomData(prev => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls]
        }));
      }
      toast.success(`${uploadedUrls.length} image(s) uploaded!`);
    } catch (error) {
      toast.error('Failed to upload images');
    }
    setUploading(false);
  };

  const removeImage = (type, index) => {
    if (type === 'hotel') {
      setHotelData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    } else if (type === 'room') {
      setRoomData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    }
  };

  const toggleAmenity = (amenityId) => {
    setHotelData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(a => a !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const handleSaveHotel = () => {
    updateHotelMutation.mutate(hotelData);
  };

  const handleAddRoom = () => {
    const currentRooms = hotel.room_inventory || [];
    const existingIndex = currentRooms.findIndex(r => r.room_type === roomData.room_type);
    
    let newRooms;
    if (existingIndex >= 0) {
      newRooms = [...currentRooms];
      newRooms[existingIndex] = roomData;
    } else {
      newRooms = [...currentRooms, roomData];
    }

    updateHotelMutation.mutate({ room_inventory: newRooms });
    setShowRoomModal(false);
    resetRoomForm();
  };

  const handleDeleteRoom = (index) => {
    const newRooms = hotel.room_inventory.filter((_, i) => i !== index);
    updateHotelMutation.mutate({ room_inventory: newRooms });
  };

  const resetRoomForm = () => {
    setRoomData({
      room_type: 'STANDARD',
      total_rooms: 10,
      available_rooms: 10,
      price_per_night: 2500,
      max_occupancy: 2,
      amenities: [],
      images: [],
      weekend_price: 0,
      festival_price: 0
    });
    setEditingRoom(null);
  };

  const openEditRoom = (room, index) => {
    setRoomData({
      ...room,
      images: room.images || [],
      amenities: room.amenities || []
    });
    setEditingRoom(index);
    setShowRoomModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Hotel Photos */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Image className="w-5 h-5 text-blue-600" />
              Hotel Photos
            </h3>
            <p className="text-sm text-gray-500">Minimum 8 photos recommended</p>
          </div>
          <Badge variant={hotelData.images.length >= 8 ? 'default' : 'destructive'}>
            {hotelData.images.length}/8 photos
          </Badge>
        </div>

        {/* Thumbnail */}
        <div className="mb-6">
          <Label className="mb-2 block">Main Photo (Thumbnail)</Label>
          <div className="flex items-center gap-4">
            {hotelData.thumbnail_url ? (
              <div className="relative w-32 h-24 rounded-lg overflow-hidden">
                <img src={hotelData.thumbnail_url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => setHotelData(prev => ({ ...prev, thumbnail_url: '' }))}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label className="w-32 h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400">
                <Upload className="w-6 h-6 text-gray-400" />
                <span className="text-xs text-gray-500 mt-1">Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, 'thumbnail')}
                />
              </label>
            )}
          </div>
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {hotelData.images.map((img, idx) => (
            <div key={idx} className="relative aspect-video rounded-lg overflow-hidden group">
              <img src={img} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage('hotel', idx)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <label className="aspect-video rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400">
            {uploading ? (
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            ) : (
              <>
                <Plus className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-500 mt-1">Add Photos</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleImageUpload(e, 'hotel')}
              disabled={uploading}
            />
          </label>
        </div>
      </Card>

      {/* Room Types */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <BedDouble className="w-5 h-5 text-blue-600" />
              Room Types
            </h3>
            <p className="text-sm text-gray-500">Configure your room categories and pricing</p>
          </div>
          <Button onClick={() => { resetRoomForm(); setShowRoomModal(true); }} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Room Type
          </Button>
        </div>

        {hotel.room_inventory?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hotel.room_inventory.map((room, idx) => (
              <Card key={idx} className="p-5 border-2">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{room.room_type}</h4>
                    <p className="text-sm text-gray-500">Max {room.max_occupancy} guests</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditRoom(room, idx)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteRoom(idx)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Rooms</span>
                    <span className="font-medium">{room.total_rooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available</span>
                    <span className="font-medium text-green-600">{room.available_rooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price/Night</span>
                    <span className="font-bold text-blue-600">₹{room.price_per_night?.toLocaleString()}</span>
                  </div>
                  {room.weekend_price > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Weekend Price</span>
                      <span className="font-medium">₹{room.weekend_price?.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <BedDouble className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600">No room types configured yet</p>
          </div>
        )}
      </Card>

      {/* Hotel Amenities */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Hotel Amenities</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {AMENITIES.map(amenity => {
            const Icon = amenity.icon;
            const isSelected = hotelData.amenities.includes(amenity.id);
            return (
              <button
                key={amenity.id}
                onClick={() => toggleAmenity(amenity.id)}
                className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                  isSelected 
                    ? 'bg-blue-50 border-blue-500 text-blue-700' 
                    : 'bg-white border-gray-200 hover:border-blue-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{amenity.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Contact Info */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Phone Number</Label>
            <Input
              value={hotelData.contact_phone}
              onChange={(e) => setHotelData({ ...hotelData, contact_phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={hotelData.contact_email}
              onChange={(e) => setHotelData({ ...hotelData, contact_email: e.target.value })}
              placeholder="hotel@example.com"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Full Address</Label>
            <Textarea
              value={hotelData.address}
              onChange={(e) => setHotelData({ ...hotelData, address: e.target.value })}
              placeholder="Street address, landmarks..."
              rows={2}
            />
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveHotel}
          disabled={updateHotelMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700 px-8"
        >
          {updateHotelMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Add/Edit Room Modal */}
      <Dialog open={showRoomModal} onOpenChange={setShowRoomModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRoom !== null ? 'Edit Room Type' : 'Add Room Type'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Room Type *</Label>
                <Select value={roomData.room_type} onValueChange={(v) => setRoomData({ ...roomData, room_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROOM_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Max Occupancy</Label>
                <Input
                  type="number"
                  value={roomData.max_occupancy}
                  onChange={(e) => setRoomData({ ...roomData, max_occupancy: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Total Rooms</Label>
                <Input
                  type="number"
                  value={roomData.total_rooms}
                  onChange={(e) => setRoomData({ ...roomData, total_rooms: Number(e.target.value), available_rooms: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Available Rooms</Label>
                <Input
                  type="number"
                  value={roomData.available_rooms}
                  onChange={(e) => setRoomData({ ...roomData, available_rooms: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Pricing</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Weekday Price (₹)</Label>
                  <Input
                    type="number"
                    value={roomData.price_per_night}
                    onChange={(e) => setRoomData({ ...roomData, price_per_night: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Weekend Price (₹)</Label>
                  <Input
                    type="number"
                    value={roomData.weekend_price}
                    onChange={(e) => setRoomData({ ...roomData, weekend_price: Number(e.target.value) })}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <Label>Festival Price (₹)</Label>
                  <Input
                    type="number"
                    value={roomData.festival_price}
                    onChange={(e) => setRoomData({ ...roomData, festival_price: Number(e.target.value) })}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>

            {/* Room Photos */}
            <div>
              <Label className="mb-2 block">Room Photos (5 recommended)</Label>
              <div className="grid grid-cols-3 gap-3">
                {roomData.images.map((img, idx) => (
                  <div key={idx} className="relative aspect-video rounded-lg overflow-hidden">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage('room', idx)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="aspect-video rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400">
                  <Plus className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-500">Add</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, 'room')}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowRoomModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleAddRoom} className="flex-1 bg-blue-600 hover:bg-blue-700">
              {editingRoom !== null ? 'Save Changes' : 'Add Room Type'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}