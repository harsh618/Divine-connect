import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
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
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from './ImageUpload';
import logAuditAction from './useAuditLog';

const COMMON_AMENITIES = [
  'Free WiFi', 'Parking', 'Air Conditioning', 'Restaurant', 'Room Service',
  '24/7 Front Desk', 'Temple Shuttle', 'Prasad Delivery', 'Prayer Room',
  'Hot Water', 'TV', 'Laundry', 'Swimming Pool', 'Gym', 'Spa',
  'Conference Room', 'Garden', 'CCTV', 'Power Backup', 'Elevator'
];

const ROOM_TYPES = ['STANDARD', 'DELUXE', 'SUITE', 'DORMITORY'];

const initialFormData = {
  name: '',
  description: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  contact_phone: '',
  contact_email: '',
  amenities: [],
  images: [],
  thumbnail_url: '',
  room_inventory: [
    { room_type: 'STANDARD', total_rooms: 0, available_rooms: 0, price_per_night: 0, max_occupancy: 2 }
  ],
  distance_to_temple: {
    temple_id: '',
    temple_name: '',
    distance_km: 0,
    walking_time_mins: 0
  },
  is_active: true
};

export default function AdminHotelForm({ open, onOpenChange, editingHotel }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(initialFormData);

  const { data: temples } = useQuery({
    queryKey: ['temples-list'],
    queryFn: () => base44.entities.Temple.filter({ is_deleted: false })
  });

  useEffect(() => {
    if (editingHotel) {
      setFormData({
        ...initialFormData,
        ...editingHotel,
        room_inventory: editingHotel.room_inventory?.length > 0 
          ? editingHotel.room_inventory 
          : initialFormData.room_inventory,
        distance_to_temple: editingHotel.distance_to_temple || initialFormData.distance_to_temple
      });
    } else {
      setFormData(initialFormData);
    }
  }, [editingHotel]);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const result = await base44.entities.Hotel.create(data);
      const user = await base44.auth.me();
      await logAuditAction(user, 'create', 'Hotel', result.id, { name: data.name });
      return result;
    },
    onSuccess: () => {
      toast.success('Hotel created successfully!');
      queryClient.invalidateQueries(['admin-hotels']);
      onOpenChange(false);
      setFormData(initialFormData);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      await base44.entities.Hotel.update(id, data);
      const user = await base44.auth.me();
      await logAuditAction(user, 'update', 'Hotel', id, { name: data.name });
    },
    onSuccess: () => {
      toast.success('Hotel updated successfully!');
      queryClient.invalidateQueries(['admin-hotels']);
      onOpenChange(false);
      setFormData(initialFormData);
    }
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const addRoom = () => {
    setFormData(prev => ({
      ...prev,
      room_inventory: [
        ...prev.room_inventory,
        { room_type: 'STANDARD', total_rooms: 0, available_rooms: 0, price_per_night: 0, max_occupancy: 2 }
      ]
    }));
  };

  const updateRoom = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.room_inventory];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, room_inventory: updated };
    });
  };

  const removeRoom = (index) => {
    setFormData(prev => ({
      ...prev,
      room_inventory: prev.room_inventory.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.city) {
      toast.error('Please fill required fields');
      return;
    }

    if (editingHotel) {
      updateMutation.mutate({ id: editingHotel.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingHotel ? 'Edit Hotel' : 'Add New Hotel'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Hotel Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Hotel name"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Hotel description"
                rows={3}
              />
            </div>

            <div className="md:col-span-2">
              <Label>Address</Label>
              <Textarea
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="Full address"
                rows={2}
              />
            </div>

            <div>
              <Label>City *</Label>
              <Input
                value={formData.city}
                onChange={(e) => updateField('city', e.target.value)}
                placeholder="City"
                required
              />
            </div>

            <div>
              <Label>State</Label>
              <Input
                value={formData.state}
                onChange={(e) => updateField('state', e.target.value)}
                placeholder="State"
              />
            </div>

            <div>
              <Label>Contact Phone</Label>
              <Input
                value={formData.contact_phone}
                onChange={(e) => updateField('contact_phone', e.target.value)}
                placeholder="+91 XXXXX XXXXX"
              />
            </div>

            <div>
              <Label>Contact Email</Label>
              <Input
                type="email"
                value={formData.contact_email}
                onChange={(e) => updateField('contact_email', e.target.value)}
                placeholder="hotel@email.com"
              />
            </div>
          </div>

          {/* Temple Association */}
          <Card className="p-4 bg-orange-50">
            <Label className="mb-3 block font-semibold">Nearest Temple</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Temple</Label>
                <Select
                  value={formData.distance_to_temple.temple_id}
                  onValueChange={(val) => {
                    const temple = temples?.find(t => t.id === val);
                    updateField('distance_to_temple', {
                      ...formData.distance_to_temple,
                      temple_id: val,
                      temple_name: temple?.name || ''
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select temple" />
                  </SelectTrigger>
                  <SelectContent>
                    {temples?.map(temple => (
                      <SelectItem key={temple.id} value={temple.id}>
                        {temple.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Distance (km)</Label>
                <Input
                  type="number"
                  value={formData.distance_to_temple.distance_km}
                  onChange={(e) => updateField('distance_to_temple', {
                    ...formData.distance_to_temple,
                    distance_km: parseFloat(e.target.value) || 0
                  })}
                />
              </div>
              <div>
                <Label>Walking Time (mins)</Label>
                <Input
                  type="number"
                  value={formData.distance_to_temple.walking_time_mins}
                  onChange={(e) => updateField('distance_to_temple', {
                    ...formData.distance_to_temple,
                    walking_time_mins: parseInt(e.target.value) || 0
                  })}
                />
              </div>
            </div>
          </Card>

          {/* Amenities */}
          <div>
            <Label className="mb-3 block font-semibold">Amenities</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {COMMON_AMENITIES.map(amenity => (
                <label key={amenity} className="flex items-center gap-2 cursor-pointer text-sm">
                  <Checkbox
                    checked={formData.amenities.includes(amenity)}
                    onCheckedChange={() => toggleAmenity(amenity)}
                  />
                  {amenity}
                </label>
              ))}
            </div>
          </div>

          {/* Room Inventory */}
          <div>
            <Label className="mb-3 block font-semibold">Room Inventory</Label>
            <div className="space-y-3">
              {formData.room_inventory.map((room, index) => (
                <Card key={index} className="p-3">
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
                    <div>
                      <Label className="text-xs">Type</Label>
                      <Select
                        value={room.room_type}
                        onValueChange={(val) => updateRoom(index, 'room_type', val)}
                      >
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
                      <Label className="text-xs">Total</Label>
                      <Input
                        type="number"
                        value={room.total_rooms}
                        onChange={(e) => updateRoom(index, 'total_rooms', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Available</Label>
                      <Input
                        type="number"
                        value={room.available_rooms}
                        onChange={(e) => updateRoom(index, 'available_rooms', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Price/Night</Label>
                      <Input
                        type="number"
                        value={room.price_per_night}
                        onChange={(e) => updateRoom(index, 'price_per_night', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Max Guests</Label>
                      <Input
                        type="number"
                        value={room.max_occupancy}
                        onChange={(e) => updateRoom(index, 'max_occupancy', parseInt(e.target.value) || 2)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRoom(index)}
                      className="text-red-600"
                      disabled={formData.room_inventory.length <= 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addRoom}>
                <Plus className="w-4 h-4 mr-2" /> Add Room Type
              </Button>
            </div>
          </div>

          {/* Images */}
          <div>
            <Label className="mb-3 block font-semibold">Hotel Images</Label>
            <ImageUpload
              images={formData.images}
              onChange={(images) => {
                updateField('images', images);
                if (images.length > 0 && !formData.thumbnail_url) {
                  updateField('thumbnail_url', images[0]);
                }
              }}
              multiple={true}
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-2">
            <Checkbox
              checked={formData.is_active}
              onCheckedChange={(checked) => updateField('is_active', checked)}
            />
            <Label>Hotel is Active (visible to users)</Label>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {(createMutation.isPending || updateMutation.isPending) ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</>
              ) : (
                editingHotel ? 'Update Hotel' : 'Create Hotel'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}