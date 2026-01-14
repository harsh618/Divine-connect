import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  IndianRupee, 
  TrendingUp, 
  Clock, 
  Download,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { toast } from 'sonner';

export default function PriestEarnings({ profile, bookings = [] }) {
  const [period, setPeriod] = useState('this_month');
  const [withdrawalRequested, setWithdrawalRequested] = useState(false);

  // Filter completed bookings
  const completedBookings = bookings.filter(b => b.status === 'completed');

  // Calculate earnings based on period
  const getEarningsForPeriod = () => {
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date();
        break;
      case 'this_week':
        startDate = subDays(now, 7);
        endDate = new Date();
        break;
      case 'this_month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'last_month':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      case 'all_time':
        return completedBookings;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }

    return completedBookings.filter(b => {
      if (!b.date) return false;
      const bookingDate = new Date(b.date);
      return isWithinInterval(bookingDate, { start: startDate, end: endDate });
    });
  };

  const periodBookings = getEarningsForPeriod();
  const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const periodEarnings = periodBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
  
  // Mock pending and available amounts
  const pendingAmount = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'in_progress')
    .reduce((sum, b) => sum + (b.total_amount || 0), 0);
  
  const platformFee = Math.round(periodEarnings * 0.1); // 10% platform fee
  const availableForWithdrawal = periodEarnings - platformFee;

  const handleWithdrawalRequest = () => {
    if (availableForWithdrawal < 500) {
      toast.error('Minimum withdrawal amount is ₹500');
      return;
    }
    setWithdrawalRequested(true);
    toast.success('Withdrawal request submitted! Amount will be transferred within 3-5 business days.');
  };

  // Mock transactions
  const recentTransactions = completedBookings.slice(0, 10).map(b => ({
    id: b.id,
    date: b.date,
    type: 'credit',
    amount: b.total_amount || 0,
    description: 'Pooja Completed',
    status: 'completed'
  }));

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Earnings Overview</h3>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="this_week">This Week</SelectItem>
            <SelectItem value="this_month">This Month</SelectItem>
            <SelectItem value="last_month">Last Month</SelectItem>
            <SelectItem value="all_time">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <IndianRupee className="w-5 h-5 text-green-600" />
            </div>
            <Badge className="bg-green-100 text-green-700">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              +12%
            </Badge>
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{periodEarnings.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Period Earnings</p>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{totalEarnings.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Total Earnings</p>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{pendingAmount.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Pending (In Progress)</p>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Wallet className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{availableForWithdrawal.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Available to Withdraw</p>
        </Card>
      </div>

      {/* Withdrawal Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-semibold">Request Withdrawal</h4>
            <p className="text-sm text-gray-600">Transfer earnings to your bank account</p>
          </div>
          <Button 
            onClick={handleWithdrawalRequest}
            disabled={availableForWithdrawal < 500 || withdrawalRequested}
            className="bg-green-600 hover:bg-green-700"
          >
            <Wallet className="w-4 h-4 mr-2" />
            {withdrawalRequested ? 'Request Pending' : 'Request Withdrawal'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-500">Gross Earnings</p>
            <p className="font-semibold">₹{periodEarnings.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Platform Fee (10%)</p>
            <p className="font-semibold text-red-600">-₹{platformFee.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Net Amount</p>
            <p className="font-semibold text-green-600">₹{availableForWithdrawal.toLocaleString()}</p>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          * Withdrawals are processed weekly (Monday) or on request. Minimum withdrawal: ₹500
        </p>
      </Card>

      {/* Transaction History */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-semibold">Transaction History</h4>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download Statement
          </Button>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((txn) => (
              <div 
                key={txn.id} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${
                    txn.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {txn.type === 'credit' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{txn.description}</p>
                    <p className="text-sm text-gray-500">
                      {txn.date ? format(new Date(txn.date), 'MMM d, yyyy') : '-'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    txn.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                  </p>
                  <Badge variant="outline" className={
                    txn.status === 'completed' ? 'text-green-600 border-green-200' : 'text-yellow-600 border-yellow-200'
                  }>
                    {txn.status === 'completed' ? (
                      <><CheckCircle className="w-3 h-3 mr-1" /> Completed</>
                    ) : (
                      <><AlertCircle className="w-3 h-3 mr-1" /> Pending</>
                    )}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600">No transactions yet</p>
          </div>
        )}
      </Card>

      {/* Tax Documents */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4">Tax Documents</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium">FY 2024-25 Earnings Report</p>
                <p className="text-sm text-gray-500">Generated automatically</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              PDF
            </Button>
          </div>
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium">TDS Certificate</p>
                <p className="text-sm text-gray-500">If applicable</p>
              </div>
            </div>
            <Button variant="outline" size="sm" disabled>
              <Download className="w-4 h-4 mr-1" />
              PDF
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}