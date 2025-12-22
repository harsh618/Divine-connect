import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Search, 
  Plus,
  Loader2,
  Heart,
  Target,
  Eye,
  EyeOff
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import ImageUpload from './ImageUpload';

const categoryColors = {
  temple_renovation: 'bg-orange-100 text-orange-700',
  gaushala: 'bg-green-100 text-green-700',
  anna_daan: 'bg-pink-100 text-pink-700',
  education: 'bg-blue-100 text-blue-700',
  medical: 'bg-purple-100 text-purple-700'
};

export default function AdminDonations() {
  const queryClient = useQueryClient();
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    detailed_description: '',
    purpose: '',
    seva_details: '',
    location: '',
    goal_amount: '',
    category: 'temple_renovation',
    beneficiary_organization: '',
    deadline: '',
    images: [],
    thumbnail_url: ''
  });

  const { data: donations, isLoading: loadingDonations } = useQuery({
    queryKey: ['admin-donations-list'],
    queryFn: () => base44.entities.Donation.list('-created_date'),
  });

  const { data: campaigns, isLoading: loadingCampaigns } = useQuery({
    queryKey: ['admin-campaigns-list'],
    queryFn: () => base44.entities.DonationCampaign.filter({ is_deleted: false }),
  });

  const createCampaignMutation = useMutation({
    mutationFn: (data) => base44.entities.DonationCampaign.create(data),
    onSuccess: () => {
      toast.success('Campaign created successfully!');
      queryClient.invalidateQueries(['admin-campaigns-list']);
      resetForm();
    }
  });

  const updateCampaignMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.DonationCampaign.update(id, data),
    onSuccess: () => {
      toast.success('Campaign updated successfully!');
      queryClient.invalidateQueries(['admin-campaigns-list']);
      resetForm();
    }
  });

  const resetForm = () => {
    setShowCampaignModal(false);
    setEditingCampaign(null);
    setFormData({
      title: '',
      description: '',
      detailed_description: '',
      purpose: '',
      seva_details: '',
      location: '',
      goal_amount: '',
      category: 'temple_renovation',
      beneficiary_organization: '',
      deadline: '',
      images: [],
      thumbnail_url: ''
    });
  };

  const toggleCampaignVisibilityMutation = useMutation({
    mutationFn: ({ id, is_hidden }) => base44.entities.DonationCampaign.update(id, { is_hidden }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-campaigns-list']);
      toast.success('Campaign visibility updated');
    }
  });

  const handleEditCampaign = (campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      title: campaign.title || '',
      description: campaign.description || '',
      detailed_description: campaign.detailed_description || '',
      purpose: campaign.purpose || '',
      seva_details: campaign.seva_details || '',
      location: campaign.location || '',
      goal_amount: campaign.goal_amount?.toString() || '',
      category: campaign.category || 'temple_renovation',
      beneficiary_organization: campaign.beneficiary_organization || '',
      deadline: campaign.deadline || '',
      images: campaign.images || [],
      thumbnail_url: campaign.thumbnail_url || ''
    });
    setShowCampaignModal(true);
  };

  const handleSaveCampaign = () => {
    if (!formData.title || !formData.goal_amount) {
      toast.error('Please fill all required fields');
      return;
    }
    
    const campaignData = {
      ...formData,
      goal_amount: Number(formData.goal_amount),
      status: 'active'
    };

    if (editingCampaign) {
      updateCampaignMutation.mutate({ id: editingCampaign.id, data: campaignData });
    } else {
      createCampaignMutation.mutate({ ...campaignData, raised_amount: 0 });
    }
  };

  const totalRaised = donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-pink-100">
              <Heart className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">₹{totalRaised.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Total Raised</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-100">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{campaigns?.length || 0}</p>
              <p className="text-sm text-gray-500">Active Campaigns</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-100">
              <Heart className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{donations?.length || 0}</p>
              <p className="text-sm text-gray-500">Total Donations</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Campaigns */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Campaigns</h3>
        <Button onClick={() => setShowCampaignModal(true)} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Goal</TableHead>
              <TableHead>Raised</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingCampaigns ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : campaigns?.length > 0 ? (
              campaigns.map((campaign) => (
                <TableRow key={campaign.id} className={campaign.is_hidden ? 'opacity-50' : ''}>
                  <TableCell className="font-medium">{campaign.title}</TableCell>
                  <TableCell>
                    <Badge className={categoryColors[campaign.category]}>
                      {campaign.category?.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>₹{campaign.goal_amount?.toLocaleString()}</TableCell>
                  <TableCell>₹{(campaign.raised_amount || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="w-32 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${Math.min((campaign.raised_amount / campaign.goal_amount) * 100, 100)}%` }}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={!campaign.is_hidden ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                      {!campaign.is_hidden ? 'Visible' : 'Hidden'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditCampaign(campaign)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => toggleCampaignVisibilityMutation.mutate({ id: campaign.id, is_hidden: !campaign.is_hidden })}
                      >
                        {campaign.is_hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No campaigns yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Recent Donations */}
      <h3 className="text-lg font-semibold">Recent Donations</h3>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Donor</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Anonymous</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingDonations ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : donations?.length > 0 ? (
              donations.slice(0, 10).map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell className="font-medium">
                    {donation.is_anonymous ? 'Anonymous' : (donation.donor_name || 'N/A')}
                  </TableCell>
                  <TableCell className="text-green-600 font-semibold">
                    ₹{donation.amount?.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {donation.created_date ? format(new Date(donation.created_date), 'PP') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge className={donation.is_anonymous ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'}>
                      {donation.is_anonymous ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  No donations yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create Campaign Modal */}
      <Dialog open={showCampaignModal} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <ImageUpload
              images={formData.images}
              onImagesChange={(imgs) => setFormData({ ...formData, images: imgs })}
              thumbnailUrl={formData.thumbnail_url}
              onThumbnailChange={(url) => setFormData({ ...formData, thumbnail_url: url })}
            />

            <div>
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Campaign title"
              />
            </div>

            <div>
              <Label>Short Description (for cards)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Brief overview shown on campaign cards..."
                rows={2}
              />
            </div>

            <div>
              <Label>Detailed Description</Label>
              <Textarea
                value={formData.detailed_description}
                onChange={(e) => setFormData({...formData, detailed_description: e.target.value})}
                placeholder="Complete details about the campaign..."
                rows={4}
              />
            </div>

            <div>
              <Label>Purpose / Why This Campaign</Label>
              <Textarea
                value={formData.purpose}
                onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                placeholder="Explain why this campaign exists..."
                rows={3}
              />
            </div>

            <div>
              <Label>Seva Details</Label>
              <Textarea
                value={formData.seva_details}
                onChange={(e) => setFormData({...formData, seva_details: e.target.value})}
                placeholder="Details about the seva/service provided..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Goal Amount (₹) *</Label>
                <Input
                  type="number"
                  value={formData.goal_amount}
                  onChange={(e) => setFormData({...formData, goal_amount: e.target.value})}
                  placeholder="100000"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="temple_renovation">Temple Renovation</SelectItem>
                    <SelectItem value="gaushala">Gaushala</SelectItem>
                    <SelectItem value="anna_daan">Anna Daan</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g., Mumbai, Maharashtra"
                />
              </div>
              <div>
                <Label>Deadline</Label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label>Beneficiary Organization</Label>
              <Input
                value={formData.beneficiary_organization}
                onChange={(e) => setFormData({...formData, beneficiary_organization: e.target.value})}
                placeholder="Organization name"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveCampaign}
              disabled={createCampaignMutation.isPending || updateCampaignMutation.isPending}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {(createCampaignMutation.isPending || updateCampaignMutation.isPending) && (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              )}
              {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}