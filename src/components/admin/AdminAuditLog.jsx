import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2, Activity, User, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';

const actionColors = {
  create: 'bg-green-100 text-green-700',
  update: 'bg-blue-100 text-blue-700',
  delete: 'bg-red-100 text-red-700',
  login: 'bg-purple-100 text-purple-700',
  verify: 'bg-orange-100 text-orange-700',
  default: 'bg-gray-100 text-gray-700'
};

export default function AdminAuditLog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const { data: logs, isLoading } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: () => base44.entities.AuditLog.list('-created_date', 100),
  });

  const filteredLogs = logs?.filter(log => {
    const matchesSearch = 
      log.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity_type?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const uniqueActions = [...new Set(logs?.map(l => l.action).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Audit Log</h2>
        <p className="text-gray-500">Track all administrative actions on the platform</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {uniqueActions.map(action => (
              <SelectItem key={action} value={action} className="capitalize">{action}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredLogs?.length > 0 ? (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm">
                    {log.created_date ? format(new Date(log.created_date), 'PP p') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <span className="text-sm">{log.user_email || 'System'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={actionColors[log.action] || actionColors.default}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm capitalize">{log.entity_type?.replace('_', ' ')}</span>
                    {log.entity_id && (
                      <p className="text-xs text-gray-400">{log.entity_id.slice(0, 8)}...</p>
                    )}
                  </TableCell>
                  <TableCell>
                    {log.details && Object.keys(log.details).length > 0 ? (
                      <div className="text-xs text-gray-500 max-w-xs truncate">
                        {JSON.stringify(log.details)}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No audit logs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}