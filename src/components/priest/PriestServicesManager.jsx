import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Plus, 
  Flame, 
  Clock, 
  IndianRupee,
  Edit,
  Trash2,
  Video,
  Home,
  Building2,
  Loader2,
  Package
} from 'lucide-react';
import { toast } from 'sonner';

export default function PriestServicesManager({ profile }) {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    pooja_name: '',
    description: '',
    duration_minutes: 60,
    materials_list: '',
    dakshina_min: 1000,
    dakshina_max: 5000,
    at_home: true,
    in_temple: true,
    online_sankalp: true,
    price_at_home: 0,
    price_in_temple: 0,
    price_online: 0
  });

  // Fetch priest's services from PriestPoojaMapping
  const { data: services, isLoading } = useQuery({
    queryKey: ['priest-services', profile?.id],
    queryFn: () => base44.entities.PriestPoojaMapping.filter({
      priest_id: profile.id,
      is_deleted: false
    }),
    enabled: !!profile?.id
  });

  // Fetch all poojas for reference
  const { data: allPoojas } = useQuery({
    queryKey: ['all-poojas'],
    queryFn: () => base44.entities.Pooja.filter({ is_deleted: false })
  });

  const createServiceMutation = useMutation({
    mutationFn: async (data) => {
      // First create a custom pooja if needed, or use priest_services array
      const updatedServices = [
        ...(profile.priest_services || []),
        {
          pooja_name: data.pooja_name,
          at_home: data.at_home,
          in_temple: data.in_temple,
          online_sankalp: data.online_sankalp,
          duration_minutes: data.duration_minutes,
          dakshina_min: data.dakshina_min,
          dakshina_max: data.dakshina_max,
          description: data.description,
          materials_list: data.materials_list
        }
      ];
      
      return base44.entities.ProviderProfile.update(profile.id, {
        priest_services: updatedServices
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['priest-profile']);
      toast.success('Service added successfully!');
      setShowAddModal(false);
      resetForm();
    }
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (index) => {
      const updatedServices = profile.priest_services.filter((_, i) => i !== index);
      return base44.entities.ProviderProfile.update(profile.id, {
        priest_services: updatedServices
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['priest-profile']);
      toast.success('Service removed');
    }
  });

  const resetForm = () => {
    setFormData({
      pooja_name: '',
      description: '',
      duration_minutes: 60,
      materials_list: '',
      dakshina_min: 1000,
      dakshina_max: 5000,
      at_home: true,
      in_temple: true,
      online_sankalp: true,
      price_at_home: 0,
      price_in_temple: 0,
      price_online: 0
    });
    setEditingService(null);
  };

  const handleSubmit = () => {
    if (!formData.pooja_name) {
      toast.error('Please enter a service name');
      return;
    }
    createServiceMutation.mutate(formData);
  };

  const priestServices = profile?.priest_services || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">My Services</h3>
          <p className="text-sm text-gray-600">Create and manage your pooja packages</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Services List */}
      {priestServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {priestServices.map((service, idx) => (
            <Card key={idx} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Flame className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{service.pooja_name}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-3 h-3" />
                      {service.duration_minutes} mins
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => deleteServiceMutation.mutate(idx)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {service.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{service.description}</p>
              )}

              {/* Available Modes */}
              <div className="flex flex-wrap gap-2 mb-3">
                {service.at_home && (
                  <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                    <Home className="w-3 h-3 mr-1" /> At Home
                  </Badge>
                )}
                {service.in_temple && (
                  <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                    <Building2 className="w-3 h-3 mr-1" /> At Temple
                  </Badge>
                )}
                {service.online_sankalp && (
                  <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">
                    <Video className="w-3 h-3 mr-1" /> Virtual
                  </Badge>
                )}
              </div>

              {/* Price Range */}
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-sm text-gray-500">Dakshina Range</span>
                <span className="font-semibold text-orange-600">
                  ₹{service.dakshina_min?.toLocaleString()} - ₹{service.dakshina_max?.toLocaleString()}
                </span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h4 className="font-semibold text-gray-900 mb-2">No Services Added</h4>
          <p className="text-gray-600 mb-4">Create pooja packages to start receiving bookings</p>
          <Button onClick={() => setShowAddModal(true)} className="bg-orange-500 hover:bg-orange-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Service
          </Button>
        </Card>
      )}

      {/* Add/Edit Service Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Edit Service' : 'Create New Pooja Package'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label>Package Name *</Label>
                <Input
                  placeholder="e.g., Marriage Ceremony Complete"
                  value={formData.pooja_name}
                  onChange={(e) => setFormData({ ...formData, pooja_name: e.target.value })}
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe what's included in this package..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label>Materials List</Label>
                <Textarea
                  placeholder="List the items needed for this pooja..."
                  value={formData.materials_list}
                  onChange={(e) => setFormData({ ...formData, materials_list: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            {/* Available Modes */}
            <div>
              <Label className="mb-3 block">Available Modes</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-3">
                    <Home className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-medium">At Home</p>
                      <p className="text-xs text-gray-500">You visit devotee's home</p>
                    </div>
                  </div>
                  <Checkbox
                    checked={formData.at_home}
                    onCheckedChange={(v) => setFormData({ ...formData, at_home: v })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="font-medium">At Temple</p>
                      <p className="text-xs text-gray-500">Devotee visits temple</p>
                    </div>
                  </div>
                  <Checkbox
                    checked={formData.in_temple}
                    onCheckedChange={(v) => setFormData({ ...formData, in_temple: v })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-3">
                    <Video className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Virtual/Online</p>
                      <p className="text-xs text-gray-500">Video call or sankalp</p>
                    </div>
                  </div>
                  <Checkbox
                    checked={formData.online_sankalp}
                    onCheckedChange={(v) => setFormData({ ...formData, online_sankalp: v })}
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div>
              <Label className="mb-3 block">Dakshina Range</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Minimum (₹)</Label>
                  <Input
                    type="number"
                    value={formData.dakshina_min}
                    onChange={(e) => setFormData({ ...formData, dakshina_min: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Maximum (₹)</Label>
                  <Input
                    type="number"
                    value={formData.dakshina_max}
                    onChange={(e) => setFormData({ ...formData, dakshina_max: Number(e.target.value) })}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Set different prices for different modes if needed
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => { setShowAddModal(false); resetForm(); }} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createServiceMutation.isPending}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              {createServiceMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editingService ? 'Save Changes' : 'Create Service'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}