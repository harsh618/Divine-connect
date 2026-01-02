import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Hotel, Plus, Edit, Trash2, Eye, EyeOff, Star, Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminHotels() {
  const [showModal, setShowModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    state: '',
    address: '',
    description: '',
    star_rating: 3,
    images: [],
    amenities: [],
    room_types: [],
    contact_phone: '',
    contact_email: '',
    check_in_time: '2:00 PM',
    check_out_time: '11:00 AM',
    is_featured: false
  });
  const [newAmenity, setNewAmenity] = useState('');
  const [newRoom, setNewRoom] = useState({ type: '', price_per_night: 0, capacity: 2, amenities: [] });

  const queryClient = useQueryClient();

  const { data: hotels, isLoading } = useQuery({
    queryKey: ['admin-hotels'],
    queryFn: () => base44.entities.Hotel.filter({ is_deleted: false }, '-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Hotel.create(data),
    onSuccess: () => {
      toast.success('Hotel created successfully');
      queryClient.invalidateQueries(['admin-hotels']);
      setShowModal(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Hotel.update(id, data),
    onSuccess: () => {
      toast.success('Hotel updated successfully');
      queryClient.invalidateQueries(['admin-hotels']);
      setShowModal(false);
      resetForm();
    }
  });

  const toggleHiddenMutation = useMutation({
    mutationFn: ({ id, is_hidden }) => base44.entities.Hotel.update(id, { is_hidden }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-hotels']);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Hotel.update(id, { is_deleted: true }),
    onSuccess: () => {
      toast.success('Hotel deleted');
      queryClient.invalidateQueries(['admin-hotels']);
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      city: '',
      state: '',
      address: '',
      description: '',
      star_rating: 3,
      images: [],
      amenities: [],
      room_types: [],
      contact_phone: '',
      contact_email: '',
      check_in_time: '2:00 PM',
      check_out_time: '11:00 AM',
      is_featured: false
    });
    setEditingHotel(null);
  };

  const handleEdit = (hotel) => {
    setEditingHotel(hotel);
    setFormData(hotel);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingHotel) {
      updateMutation.mutate({ id: editingHotel.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const addAmenity = () => {
    if (newAmenity.trim()) {
      setFormData({ ...formData, amenities: [...formData.amenities, newAmenity.trim()] });
      setNewAmenity('');
    }
  };

  const removeAmenity = (index) => {
    setFormData({ ...formData, amenities: formData.amenities.filter((_, i) => i !== index) });
  };

  const addRoom = () => {
    if (newRoom.type && newRoom.price_per_night > 0) {
      setFormData({ ...formData, room_types: [...formData.room_types, newRoom] });
      setNewRoom({ type: '', price_per_night: 0, capacity: 2, amenities: [] });
    }
  };

  const removeRoom = (index) => {
    setFormData({ ...formData, room_types: formData.room_types.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Hotel className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Hotels Management</h2>
            <p className="text-sm text-muted-foreground">{hotels?.length || 0} hotels</p>
          </div>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Hotel
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hotels?.map((hotel) => (
            <Card key={hotel.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{hotel.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin className="w-3 h-3" />
                    {hotel.city}, {hotel.state}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {Array(hotel.star_rating || 3).fill(0).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    {hotel.is_featured && <Badge className="bg-amber-500">Featured</Badge>}
                    {hotel.is_hidden && <Badge variant="secondary">Hidden</Badge>}
                  </div>
                </div>
              </div>

              {hotel.room_types?.[0] && (
                <p className="text-sm text-muted-foreground mb-3">
                  From ₹{hotel.room_types[0].price_per_night}/night
                </p>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(hotel)} className="flex-1">
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleHiddenMutation.mutate({ id: hotel.id, is_hidden: !hotel.is_hidden })}
                >
                  {hotel.is_hidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm('Delete this hotel?')) deleteMutation.mutate(hotel.id);
                  }}
                >
                  <Trash2 className="w-3 h-3 text-red-500" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showModal} onOpenChange={(open) => { setShowModal(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingHotel ? 'Edit Hotel' : 'Add New Hotel'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Hotel Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Star Rating</Label>
                <Select value={String(formData.star_rating)} onValueChange={(v) => setFormData({ ...formData, star_rating: Number(v) })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(n => (
                      <SelectItem key={n} value={String(n)}>{n} Star</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>City *</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>State *</Label>
                <Input
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Contact Phone</Label>
                <Input
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label>Amenities</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  placeholder="Add amenity"
                />
                <Button type="button" onClick={addAmenity}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.amenities.map((amenity, i) => (
                  <Badge key={i} variant="secondary">
                    {amenity}
                    <button type="button" onClick={() => removeAmenity(i)} className="ml-2">×</button>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Room Types</Label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                <Input
                  placeholder="Room type"
                  value={newRoom.type}
                  onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Price"
                  value={newRoom.price_per_night}
                  onChange={(e) => setNewRoom({ ...newRoom, price_per_night: Number(e.target.value) })}
                />
                <Input
                  type="number"
                  placeholder="Capacity"
                  value={newRoom.capacity}
                  onChange={(e) => setNewRoom({ ...newRoom, capacity: Number(e.target.value) })}
                />
                <Button type="button" onClick={addRoom}>Add</Button>
              </div>
              <div className="space-y-2">
                {formData.room_types.map((room, i) => (
                  <Card key={i} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{room.type}</p>
                      <p className="text-sm text-muted-foreground">₹{room.price_per_night}/night • {room.capacity} guests</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeRoom(i)}>×</Button>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
              />
              <Label htmlFor="featured">Feature this hotel</Label>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1">
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {editingHotel ? 'Update' : 'Create'} Hotel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}