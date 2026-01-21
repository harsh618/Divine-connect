import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react';

export default function PlatformHealthCheck() {
  const features = [
    // IMPLEMENTED ✅
    { name: 'Smart Priest Assignment (5-factor)', status: 'implemented', category: 'Core Logic' },
    { name: 'Cancellation & Refund System', status: 'implemented', category: 'Core Logic' },
    { name: 'Weekly Provider Payouts', status: 'implemented', category: 'Core Logic' },
    { name: 'Data Export (CSV)', status: 'implemented', category: 'Admin' },
    { name: 'Booking Flow (Virtual/Physical/Temple)', status: 'implemented', category: 'Core Logic' },
    { name: 'Provider Onboarding', status: 'implemented', category: 'Core Logic' },
    { name: 'Admin Dashboard', status: 'implemented', category: 'Admin' },
    { name: 'Temple Management', status: 'implemented', category: 'Core' },
    { name: 'Pooja Management', status: 'implemented', category: 'Core' },
    { name: 'Hotel Integration', status: 'implemented', category: 'Core' },
    
    // MISSING ❌
    { name: 'Escrow Payment System', status: 'missing', category: 'Payments', priority: 'high' },
    { name: 'Review System (Auto-request after 2 days)', status: 'missing', category: 'Reviews', priority: 'high' },
    { name: 'WhatsApp/SMS Notifications', status: 'missing', category: 'Notifications', priority: 'high' },
    { name: '24hr Booking Reminders', status: 'missing', category: 'Notifications', priority: 'high' },
    { name: 'Virtual Pooja Streaming (Zoom/Meet)', status: 'missing', category: 'Core Logic', priority: 'high' },
    { name: 'Meeting Link Generation', status: 'missing', category: 'Core Logic', priority: 'high' },
    { name: 'Dispute Resolution Workflow', status: 'missing', category: 'Support', priority: 'medium' },
    { name: 'Group Booking Logic (10% discount)', status: 'missing', category: 'Bookings', priority: 'medium' },
    { name: 'Festival Season Dynamic Pricing', status: 'missing', category: 'Pricing', priority: 'medium' },
    { name: 'Priest Verification Levels (3-tier)', status: 'missing', category: 'Verification', priority: 'medium' },
    { name: 'Google Calendar Sync', status: 'missing', category: 'Integration', priority: 'medium' },
    { name: 'Live Location Sharing (Home Poojas)', status: 'missing', category: 'Safety', priority: 'medium' },
    { name: 'Emergency Button', status: 'missing', category: 'Safety', priority: 'medium' },
    { name: 'Itinerary Planner (Multi-day)', status: 'partial', category: 'Travel', priority: 'low' },
    { name: 'Donation Progress Tracking', status: 'partial', category: 'Donations', priority: 'low' },
    { name: 'Premium Features (Priority Booking)', status: 'missing', category: 'Monetization', priority: 'low' },
    { name: 'Analytics Dashboard (User behavior)', status: 'partial', category: 'Analytics', priority: 'low' },
    { name: 'Real-time Priest Tracking', status: 'missing', category: 'Tracking', priority: 'low' },
  ];

  const statusConfig = {
    implemented: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Implemented' },
    partial: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Partial' },
    missing: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Missing' }
  };

  const categories = [...new Set(features.map(f => f.category))];
  
  const stats = {
    implemented: features.filter(f => f.status === 'implemented').length,
    partial: features.filter(f => f.status === 'partial').length,
    missing: features.filter(f => f.status === 'missing').length,
    total: features.length
  };

  const completionRate = Math.round((stats.implemented / stats.total) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Platform Health Check</h2>
        <p className="text-gray-600">Implementation status vs. complete logic document</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-green-700">{completionRate}%</p>
              <p className="text-sm text-green-600 mt-1">Completion Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.implemented}</p>
                <p className="text-sm text-gray-600">Implemented</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.partial}</p>
                <p className="text-sm text-gray-600">Partial</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.missing}</p>
                <p className="text-sm text-gray-600">Missing</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features by Category */}
      {categories.map(category => {
        const categoryFeatures = features.filter(f => f.category === category);
        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-lg">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categoryFeatures.map((feature, idx) => {
                  const config = statusConfig[feature.status];
                  const Icon = config.icon;
                  return (
                    <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${config.bg}`}>
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${config.color}`} />
                        <span className="font-medium">{feature.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {feature.priority && (
                          <Badge className={
                            feature.priority === 'high' ? 'bg-red-100 text-red-700' :
                            feature.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }>
                            {feature.priority}
                          </Badge>
                        )}
                        <Badge variant="outline" className={config.color}>
                          {config.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Priority Action Items */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            High Priority Missing Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-red-700">
            {features.filter(f => f.priority === 'high' && f.status === 'missing').map((f, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="font-bold mt-0.5">•</span>
                <span>{f.name}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}