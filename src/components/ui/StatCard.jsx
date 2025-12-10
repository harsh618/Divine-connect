import React from 'react';
import { Card } from "@/components/ui/card";

export default function StatCard({ icon: Icon, value, label, color = "text-orange-500" }) {
  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </Card>
  );
}