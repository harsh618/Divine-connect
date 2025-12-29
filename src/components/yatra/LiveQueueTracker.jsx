import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, TrendingDown, TrendingUp } from 'lucide-react';

const MOCK_QUEUE_DATA = {
  currentWait: 45,
  queueLength: 120,
  trend: 'decreasing',
  peakHours: '6 AM - 9 AM',
  estimatedSlot: '2:30 PM'
};

export default function LiveQueueTracker({ templeName }) {
  const waitPercentage = Math.min((MOCK_QUEUE_DATA.currentWait / 120) * 100, 100);

  return (
    <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-600" />
          Live Queue Status
        </h3>
        <Badge className="bg-green-500 text-white animate-pulse">
          <div className="w-2 h-2 bg-white rounded-full mr-2" />
          Live
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold text-orange-600">
            {MOCK_QUEUE_DATA.currentWait} mins
          </span>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            {MOCK_QUEUE_DATA.trend === 'decreasing' ? (
              <><TrendingDown className="w-4 h-4 text-green-600" /> Decreasing</>
            ) : (
              <><TrendingUp className="w-4 h-4 text-red-600" /> Increasing</>
            )}
          </div>
        </div>
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-1000 rounded-full"
            style={{ width: `${waitPercentage}%` }}
          >
            <div className="absolute inset-0 bg-white/30 animate-shimmer" />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">Current waiting time at the temple</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/60 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-gray-600" />
            <span className="text-xs text-gray-600">Queue Length</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{MOCK_QUEUE_DATA.queueLength} people</p>
        </div>
        <div className="bg-white/60 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-gray-600" />
            <span className="text-xs text-gray-600">Peak Hours</span>
          </div>
          <p className="text-sm font-bold text-gray-900">{MOCK_QUEUE_DATA.peakHours}</p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-900">
          💡 <strong>Best Time:</strong> Visit after {MOCK_QUEUE_DATA.estimatedSlot} for shorter wait
        </p>
      </div>
    </Card>
  );
}