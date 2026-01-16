import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, CheckCircle, Loader2, Plus, Trash2, MapPin, Phone, Mail, Image } from 'lucide-react';
import { toast } from 'sonner';
import BackButton from '../components/ui/BackButton';
import ImageUpload from '../components/admin/ImageUpload';

const COMMON_AMENITIES = [
  'Free WiFi', 'Parking', 'Air Conditioning', 'Restaurant', 'Room Service',
  '24/7 Front Desk', 'Temple Shuttle', 'Prasad Delivery', 'Prayer Room',
  'Hot Water', 'TV', 'Laundry', 'Swimming Pool', 'Gym', 'Spa',
  'Conference Room', 'Garden', 'CCTV', 'Power Backup', 'Elevator'
];

const ROOM_TYPES = ['STANDARD', 'DELUXE', 'SUITE', 'DORMITORY'];

export default function HotelOnboarding() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
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
    }
  });

  const { data: temples } = useQuery({
    queryKey: ['temples-for-hotel'],
    queryFn: () => base44.entities.Temple.filter({ is_deleted: false })
  });

  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('id');

  const { data: existingHotel } = useQuery({
    queryKey: ['hotel-edit', editId],
    queryFn: () => base44.entities.Hotel.filter({ id: editId }),
    enabled: !!editId
  });

  useEffect(() => {
    if (existingHotel?.[0]) {
      setFormData(existingHotel[0]);
    }
  }, [existingHotel]);

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      
      if (editId) {
        await base44.entities.Hotel.update(editId, data);
      } else {
        await base44.entities.Hotel.create({
          ...data,
          admin_user_id: user.id,
          is_active: false, // Pending approval
          is_deleted: false
        });
      }
    },
    onSuccess: () => {
      toast.success(editId ? 'Hotel updated successfully!' : 'Hotel registration submitted! Our team will review and activate your listing within 2-3 business days.');
      setTimeout(() => window.location.href = '/HotelDashboard', 2000);
    },
    onError: () => {
      toast.error('Submission failed. Please try again.');
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

  const handleSubmit = () => {
    if (!formData.name || !formData.city || !formData.contact_phone || !formData.contact_email) {
      toast.error('Please fill all required fields');
      return;
    }
    if (formData.room_inventory.length === 0) {
      toast.error('Please add at least one room type');
      return;
    }
    if (!formData.thumbnail_url) {
      toast.error('Please upload at least one hotel image');
      return;
    }

    submitMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <BackButton label="Back to Home" />
          <div className="flex items-center gap-4 mt-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
                {editId ? 'Edit Hotel' : 'Register Your Hotel'}
              </h1>
              <p className="text-white/90">List your property for temple pilgrims and devotees</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white border-b">
        <div className="container mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1">
                <div className={`h-2 rounded-full transition-all ${
                  s <= step ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gray-200'
                }`} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Basic Info</span>
            <span>Rooms & Pricing</span>
            <span>Images & Submit</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-6 py-8">
        <Card className="p-6 md:p-8">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Basic Information</h2>
                <p className="text-gray-600">Tell us about your hotel</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Hotel Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Enter hotel name"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Describe your hotel, its unique features, and why pilgrims should stay here..."
                    rows={4}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Full Address *</Label>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="Complete address with landmarks"
                    rows={2}
                  />
                </div>

                <div>
                  <Label>City *</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="City"
                  />
                </div>

                <div>
                  <Label>State *</Label>
                  <Input
                    value={formData.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    placeholder="State"
                  />
                </div>

                <div>
                  <Label>Pincode</Label>
                  <Input
                    value={formData.pincode}
                    onChange={(e) => updateField('pincode', e.target.value)}
                    placeholder="Pincode"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Contact Phone *
                  </Label>
                  <Input
                    value={formData.contact_phone}
                    onChange={(e) => updateField('contact_phone', e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Contact Email *
                  </Label>
                  <Input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => updateField('contact_email', e.target.value)}
                    placeholder="hotel@email.com"
                  />
                </div>
              </div>

              {/* Temple Association */}
              <Card className="p-4 bg-orange-50 border-orange-200">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  Nearest Temple (Optional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label>Select Temple</Label>
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
                        <SelectValue placeholder="Select nearest temple" />
                      </SelectTrigger>
                      <SelectContent>
                        {temples?.map(temple => (
                          <SelectItem key={temple.id} value={temple.id}>
                            {temple.name} - {temple.city}
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
                      placeholder="0.5"
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
                      placeholder="10"
                    />
                  </div>
                </div>
              </Card>

              {/* Amenities */}
              <div>
                <Label className="mb-3 block">Hotel Amenities</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {COMMON_AMENITIES.map(amenity => (
                    <label
                      key={amenity}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.amenities.includes(amenity)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <Checkbox
                        checked={formData.amenities.includes(amenity)}
                        onCheckedChange={() => toggleAmenity(amenity)}
                      />
                      <span className="text-sm">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Rooms & Pricing */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Rooms & Pricing</h2>
                <p className="text-gray-600">Add your room types and set pricing</p>
              </div>

              <div className="space-y-4">
                {formData.room_inventory.map((room, index) => (
                  <Card key={index} className="p-4 border-2">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold">Room Type {index + 1}</h3>
                      {formData.room_inventory.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRoom(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <Label>Type *</Label>
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
                        <Label>Total Rooms *</Label>
                        <Input
                          type="number"
                          value={room.total_rooms}
                          onChange={(e) => updateRoom(index, 'total_rooms', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label>Available *</Label>
                        <Input
                          type="number"
                          value={room.available_rooms}
                          onChange={(e) => updateRoom(index, 'available_rooms', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label>Price/Night (₹) *</Label>
                        <Input
                          type="number"
                          value={room.price_per_night}
                          onChange={(e) => updateRoom(index, 'price_per_night', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label>Max Guests</Label>
                        <Input
                          type="number"
                          value={room.max_occupancy}
                          onChange={(e) => updateRoom(index, 'max_occupancy', parseInt(e.target.value) || 2)}
                        />
                      </div>
                    </div>
                  </Card>
                ))}

                <Button variant="outline" onClick={addRoom} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Room Type
                </Button>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Pricing Tips</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Set competitive prices based on your location and amenities</li>
                  <li>• Consider special rates for pilgrimage seasons</li>
                  <li>• Dormitory rooms are popular among budget travelers</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 3: Images & Submit */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Images & Verification</h2>
                <p className="text-gray-600">Upload hotel images and submit for approval</p>
              </div>

              <div>
                <Label className="mb-3 block flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Hotel Images *
                </Label>
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
                <p className="text-sm text-gray-500 mt-2">
                  Upload at least one image. First image will be used as thumbnail.
                </p>
              </div>

              {formData.images.length > 1 && (
                <div>
                  <Label className="mb-2 block">Select Thumbnail</Label>
                  <div className="flex gap-2 flex-wrap">
                    {formData.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => updateField('thumbnail_url', img)}
                        className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          formData.thumbnail_url === img ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Before You Submit</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Our team will review your hotel listing within 2-3 business days. We may contact you for:
                </p>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• Verification of hotel registration/license</li>
                  <li>• Physical verification visit (if required)</li>
                  <li>• Additional property details</li>
                </ul>
              </div>

              <Card className="p-4 bg-green-50 border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">What happens next?</h4>
                <ol className="text-sm text-green-700 space-y-1">
                  <li>1. You'll receive a confirmation email</li>
                  <li>2. Our team reviews your listing (2-3 days)</li>
                  <li>3. Once approved, your hotel goes live</li>
                  <li>4. You can manage bookings from your dashboard</li>
                </ol>
              </Card>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
              >
                Continue
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
              >
                {submitMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting...</>
                ) : (
                  <><CheckCircle className="w-4 h-4 mr-2" /> {editId ? 'Update Hotel' : 'Submit for Approval'}</>
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}