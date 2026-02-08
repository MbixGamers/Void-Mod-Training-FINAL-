import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useSubmissions, useAdminAction } from "@/hooks/use-submissions";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Check, 
  X, 
  Clock, 
  Search, 
  Filter,
  CheckCircle2,
  XCircle,
  MoreHorizontal
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: submissions, isLoading: dataLoading } = useSubmissions();
  const { mutate: performAction, isPending: actionPending } = useAdminAction();
  const [filter, setFilter] = useState("");

  if (!authLoading && (!user || !user.isAdmin)) {
    setLocation("/");
    return null;
  }

  const isLoading = authLoading || dataLoading;

  const filteredSubmissions = submissions?.filter(s => 
    s.user?.username.toLowerCase().includes(filter.toLowerCase()) || 
    s.status.includes(filter.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Review and manage player applications.</p>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search users..." 
                className="pl-9 bg-card border-border/50"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="shrink-0">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card className="border-white/5 bg-card/50 backdrop-blur shadow-xl">
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
            <CardDescription>
              Applications requiring review. {submissions?.filter(s => s.status === 'pending').length} pending.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="rounded-md border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader className="bg-secondary/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead>User</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                          No submissions found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSubmissions?.map((submission) => (
                        <TableRow key={submission.id} className="group hover:bg-white/5 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {submission.user?.avatarUrl ? (
                                <img src={submission.user.avatarUrl} alt="" className="w-8 h-8 rounded-full" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                                  <span className="text-xs font-bold text-muted-foreground">
                                    {submission.user?.username.substring(0, 2).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div>
                                <div className="font-medium">{submission.user?.username}</div>
                                <div className="text-xs text-muted-foreground">ID: {submission.userId.slice(0, 8)}...</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className={`font-bold ${
                                submission.passed ? "text-green-500" : "text-red-500"
                              }`}>
                                {submission.score}%
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {submission.passed ? "Pass" : "Fail"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={submission.status} />
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                            {format(new Date(submission.createdAt!), "PP p")}
                          </TableCell>
                          <TableCell className="text-right">
                            {submission.status === 'pending' ? (
                              <div className="flex justify-end gap-2 opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                                  onClick={() => performAction({ id: submission.id, action: "approve" })}
                                  disabled={actionPending}
                                >
                                  <Check className="h-4 w-4" />
                                  <span className="sr-only">Approve</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                  onClick={() => performAction({ id: submission.id, action: "deny" })}
                                  disabled={actionPending}
                                >
                                  <X className="h-4 w-4" />
                                  <span className="sr-only">Deny</span>
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Processed</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "approved":
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
        </Badge>
      );
    case "denied":
      return (
        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20">
          <XCircle className="w-3 h-3 mr-1" /> Denied
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20">
          <Clock className="w-3 h-3 mr-1" /> Pending
        </Badge>
      );
  }
}
