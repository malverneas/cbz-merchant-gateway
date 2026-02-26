import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProfilesWithRoles } from '@/hooks/useProfiles';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { sendNewUserCredentialsEmail } from '@/lib/email';
import {
    Users,
    UserPlus,
    Mail,
    Lock,
    User,
    Shield,
    ClipboardCheck,
    Building2,
    Settings,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/lib/types';
import { useQueryClient } from '@tanstack/react-query';

const staffRoles: { value: UserRole; label: string; icon: React.ElementType; description: string }[] = [
    {
        value: 'onboarding_officer',
        label: 'Onboarding Officer',
        icon: ClipboardCheck,
        description: 'Reviews merchant applications'
    },
    {
        value: 'compliance_officer',
        label: 'Compliance Officer',
        icon: Shield,
        description: 'Performs compliance reviews'
    },
];

const roleIcons: Record<string, React.ElementType> = {
    merchant: Building2,
    onboarding_officer: ClipboardCheck,
    compliance_officer: Shield,
    admin: Settings,
};

const roleLabels: Record<string, string> = {
    merchant: 'Merchant',
    onboarding_officer: 'Onboarding Officer',
    compliance_officer: 'Compliance Officer',
    admin: 'Administrator',
};

const AdminUserManagement: React.FC = () => {
    const { data: users, isLoading } = useProfilesWithRoles();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserRole, setNewUserRole] = useState<UserRole>('onboarding_officer');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
            toast({ title: 'Error', description: 'Please fill in all fields.', variant: 'destructive' });
            return;
        }

        if (newUserPassword.length < 6) {
            toast({ title: 'Error', description: 'Password must be at least 6 characters.', variant: 'destructive' });
            return;
        }

        setIsCreating(true);

        try {
            // Create the user via Supabase auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: newUserEmail,
                password: newUserPassword,
                options: {
                    data: {
                        name: newUserName,
                        role: newUserRole,
                    },
                },
            });

            if (authError) throw authError;

            if (authData.user) {
                // Insert profile
                await supabase.from('profiles').upsert({
                    user_id: authData.user.id,
                    email: newUserEmail,
                    name: newUserName,
                });

                // Insert role
                await supabase.from('user_roles').upsert({
                    user_id: authData.user.id,
                    role: newUserRole,
                });

                // Send credentials email via EmailJS
                await sendNewUserCredentialsEmail(
                    newUserEmail,
                    newUserName,
                    newUserPassword,
                    roleLabels[newUserRole]
                );
            }

            toast({
                title: 'Staff Account Created!',
                description: `${newUserName} has been added as ${roleLabels[newUserRole]}. Login credentials have been sent to their email.`
            });

            // Reset form
            setNewUserName('');
            setNewUserEmail('');
            setNewUserPassword('');
            setNewUserRole('onboarding_officer');
            setShowCreateForm(false);

            // Refresh users list
            queryClient.invalidateQueries({ queryKey: ['profiles'] });
        } catch (error: any) {
            toast({
                title: 'Error Creating User',
                description: error.message || 'Failed to create user account.',
                variant: 'destructive'
            });
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <DashboardLayout allowedRoles={['admin']}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
                        <p className="text-muted-foreground">Manage system users and create staff accounts</p>
                    </div>
                    <Button
                        variant="hero"
                        onClick={() => setShowCreateForm(!showCreateForm)}
                    >
                        <UserPlus size={18} className="mr-2" />
                        {showCreateForm ? 'Cancel' : 'Create Staff Account'}
                    </Button>
                </div>

                {/* Create User Form */}
                {showCreateForm && (
                    <Card className="border-primary/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus size={20} className="text-primary" />
                                Create Staff Account
                            </CardTitle>
                            <CardDescription>
                                Create a new Onboarding or Compliance Officer account. Login credentials will be emailed automatically.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateUser} className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="staffName">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                            <Input
                                                id="staffName"
                                                value={newUserName}
                                                onChange={(e) => setNewUserName(e.target.value)}
                                                placeholder="Staff member name"
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="staffEmail">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                            <Input
                                                id="staffEmail"
                                                type="email"
                                                value={newUserEmail}
                                                onChange={(e) => setNewUserEmail(e.target.value)}
                                                placeholder="staff@cbz.co.zw"
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="staffPassword">Temporary Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                        <Input
                                            id="staffPassword"
                                            type="text"
                                            value={newUserPassword}
                                            onChange={(e) => setNewUserPassword(e.target.value)}
                                            placeholder="Create a temporary password"
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        This password will be sent to the staff member's email. They should change it after first login.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Staff Role</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {staffRoles.map((role) => {
                                            const Icon = role.icon;
                                            const isSelected = newUserRole === role.value;
                                            return (
                                                <button
                                                    key={role.value}
                                                    type="button"
                                                    onClick={() => setNewUserRole(role.value)}
                                                    className={cn(
                                                        'flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left',
                                                        isSelected
                                                            ? 'border-primary bg-primary/5'
                                                            : 'border-border hover:border-primary/50'
                                                    )}
                                                >
                                                    <Icon size={20} className={cn(
                                                        isSelected ? 'text-primary' : 'text-muted-foreground'
                                                    )} />
                                                    <div>
                                                        <p className="text-sm font-medium">{role.label}</p>
                                                        <p className="text-xs text-muted-foreground">{role.description}</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <Button type="submit" variant="hero" disabled={isCreating} className="w-full">
                                    {isCreating ? (
                                        <>
                                            <Loader2 size={18} className="mr-2 animate-spin" />
                                            Creating Account...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus size={18} className="mr-2" />
                                            Create Account & Send Credentials
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Users List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users size={20} className="text-primary" />
                            All Users ({users?.length || 0})
                        </CardTitle>
                        <CardDescription>All registered users in the system</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : !users || users.length === 0 ? (
                            <div className="text-center py-8">
                                <Users className="mx-auto text-muted-foreground mb-3" size={40} />
                                <p className="text-muted-foreground">No users found.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {users.map((u: any) => {
                                    const RoleIcon = roleIcons[u.role] || User;
                                    return (
                                        <div
                                            key={u.user_id}
                                            className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <RoleIcon size={18} className="text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">{u.name || 'Unnamed'}</p>
                                                    <p className="text-sm text-muted-foreground">{u.email}</p>
                                                </div>
                                            </div>
                                            <span className={cn(
                                                'text-xs font-medium px-3 py-1 rounded-full',
                                                u.role === 'admin' && 'bg-primary/10 text-primary',
                                                u.role === 'merchant' && 'bg-info/10 text-info',
                                                u.role === 'onboarding_officer' && 'bg-warning/10 text-warning',
                                                u.role === 'compliance_officer' && 'bg-status-compliance/10 text-status-compliance',
                                            )}>
                                                {roleLabels[u.role] || u.role}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default AdminUserManagement;
