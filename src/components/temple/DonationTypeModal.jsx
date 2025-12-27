import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const donationTypes = [
  { id: 'anna_daan', label: 'Anna Daan', icon: '🍚', description: 'Provide meals to devotees', category: 'anna_daan' },
  { id: 'temple_renovation', label: 'Temple Maintenance', icon: '🏛️', description: 'Support temple upkeep', category: 'temple_renovation' },
  { id: 'gaushala', label: 'Gaushala', icon: '🐄', description: 'Support cow protection', category: 'gaushala' },
  { id: 'education', label: 'Education', icon: '📚', description: 'Support learning initiatives', category: 'education' },
  { id: 'medical', label: 'Medical Aid', icon: '⚕️', description: 'Healthcare for devotees', category: 'medical' },
  { id: 'general', label: 'General Donation', icon: '💝', description: 'Support overall activities', category: null }
];

export default function DonationTypeModal({ isOpen, onClose, templeId, templeName }) {
  const navigate = useNavigate();

  const handleTypeSelect = (typeId) => {
    const type = donationTypes.find(t => t.id === typeId);
    const category = type?.category || 'all';
    onClose();
    navigate(createPageUrl(`Donate?category=${category}`));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Choose Donation Category
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {donationTypes.map((type) => (
            <Card
              key={type.id}
              onClick={() => handleTypeSelect(type.id)}
              className="p-6 cursor-pointer hover:border-primary transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-4xl mb-3">{type.icon}</div>
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                    {type.label}
                  </h3>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}