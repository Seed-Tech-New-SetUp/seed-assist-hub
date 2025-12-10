import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSchool } from "@/contexts/SchoolContext";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { UserPlus, Shield, Users, Mail, Calendar, ShieldAlert } from "lucide-react";
import { format } from "date-fns";

interface SchoolUser {
  id: string;
  user_id: string;
  role: string;
  is_primary: boolean;
  created_at: string;
  profile?: {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
}

export default function UserManagement() {
  const { currentSchool } = useSchool();
  const { isAdmin, isLoading: adminLoading } = useAdminStatus();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("representative");

  const { data: schoolUsers, isLoading } = useQuery({
    queryKey: ["school-users", currentSchool?.id],
    queryFn: async () => {
      if (!currentSchool?.id) return [];

      // First get user_schools
      const { data: userSchools, error } = await supabase
        .from("user_schools")
        .select("id, user_id, role, is_primary, created_at")
        .eq("school_id", currentSchool.id);

      if (error) throw error;
      if (!userSchools || userSchools.length === 0) return [];

      // Then fetch profiles for those users
      const userIds = userSchools.map((us) => us.user_id);
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .in("id", userIds);

      if (profileError) throw profileError;

      // Merge the data
      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
      return userSchools.map((us) => ({
        ...us,
        profile: profileMap.get(us.user_id),
      })) as SchoolUser[];
    },
    enabled: !!currentSchool?.id,
  });

  const addUserMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      // First find the user by email in profiles
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) throw new Error("User not found. They must sign up first.");

      // Check if user is already associated with this school
      const { data: existing } = await supabase
        .from("user_schools")
        .select("id")
        .eq("user_id", profile.id)
        .eq("school_id", currentSchool?.id)
        .maybeSingle();

      if (existing) throw new Error("User is already associated with this school.");

      // Add user to school
      const { error } = await supabase
        .from("user_schools")
        .insert({
          user_id: profile.id,
          school_id: currentSchool?.id,
          role: role,
          is_primary: false,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("User added successfully");
      setIsAddDialogOpen(false);
      setNewUserEmail("");
      setNewUserRole("representative");
      queryClient.invalidateQueries({ queryKey: ["school-users", currentSchool?.id] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleAddUser = () => {
    if (!newUserEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    addUserMutation.mutate({ email: newUserEmail, role: newUserRole });
  };

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email?.charAt(0).toUpperCase() || "U";
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default";
      case "manager":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (adminLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
          <p className="text-muted-foreground text-center max-w-md">
            You don't have permission to access this page. Only administrators can manage users.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage users associated with {currentSchool?.name}
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add User to School</DialogTitle>
                <DialogDescription>
                  Add an existing user to {currentSchool?.name}. The user must have already signed up.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">User Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={newUserRole} onValueChange={setNewUserRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="representative">Representative</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleAddUser}
                  disabled={addUserMutation.isPending}
                  className="w-full"
                >
                  {addUserMutation.isPending ? "Adding..." : "Add User"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{schoolUsers?.length || 0}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Admins</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">
                  {schoolUsers?.filter((u) => u.role === "admin").length || 0}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Representatives</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">
                  {schoolUsers?.filter((u) => u.role === "representative").length || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>School Users</CardTitle>
            <CardDescription>
              All users with access to {currentSchool?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {schoolUsers && schoolUsers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Primary</TableHead>
                    <TableHead>Added</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schoolUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.profile?.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(user.profile?.full_name || null, user.profile?.email || null)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {user.profile?.full_name || "Unknown User"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          {user.profile?.email || "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.is_primary && (
                          <Badge variant="outline" className="bg-primary/5">
                            Primary
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(user.created_at), "MMM d, yyyy")}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No users found for this school.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
