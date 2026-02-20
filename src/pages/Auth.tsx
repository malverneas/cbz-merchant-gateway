import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  User, 
  Building2,
  ClipboardCheck,
  Shield,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

type AuthMode = 'login' | 'register';

const roleOptions: { value: UserRole; label: string; icon: React.ElementType; description: string }[] = [
  { 
    value: 'merchant', 
    label: 'Merchant', 
    icon: Building2, 
    description: 'Apply for e-commerce services' 
  },
  { 
    value: 'onboarding_officer', 
    label: 'Onboarding Officer', 
    icon: ClipboardCheck, 
    description: 'Review merchant applications' 
  },
  { 
    value: 'compliance_officer', 
    label: 'Compliance Officer', 
    icon: Shield, 
    description: 'Perform compliance reviews' 
  },
  { 
    value: 'admin', 
    label: 'Administrator', 
    icon: Settings, 
    description: 'Full system access' 
  },
];

const Auth: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, login, register, isLoading } = useAuth();
  const { toast } = useToast();
  
  const [mode, setMode] = useState<AuthMode>(searchParams.get('mode') === 'register' ? 'register' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('merchant');
  const [error, setError] = useState('');

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'register') {
      setMode('register');
    }
  }, [searchParams]);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      const result = await login(email, password);
      if (result.success) {
        toast({
          title: 'Welcome back!',
          description: 'You have successfully signed in.',
        });
        navigate('/dashboard');
      } else {
        setError(result.error || 'Login failed');
      }
    } else {
      if (!name.trim()) {
        setError('Please enter your name');
        return;
      }
      const result = await register(email, password, name, selectedRole);
      if (result.success) {
        toast({
          title: 'Account created!',
          description: 'Welcome to CBZ E-Commerce Services.',
        });
        navigate('/dashboard');
      } else {
        setError(result.error || 'Registration failed');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero p-12 flex-col justify-between">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors mb-12">
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-8">
            <div className="h-14 w-14 bg-primary-foreground/10 backdrop-blur rounded-xl flex items-center justify-center">
              <Building2 className="text-primary-foreground" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">CBZ Bank</h1>
              <p className="text-primary-foreground/70">E-Commerce Services</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-primary-foreground mb-4">
            {mode === 'login' ? 'Welcome Back' : 'Get Started'}
          </h2>
          <p className="text-primary-foreground/70 text-lg max-w-md">
            {mode === 'login' 
              ? 'Sign in to manage your merchant applications and track your approval status.'
              : 'Create an account to apply for merchant services and start accepting online payments.'}
          </p>
        </div>
        
        <div className="bg-primary-foreground/10 backdrop-blur rounded-xl p-6">
          <h3 className="text-primary-foreground font-medium mb-3">Secure & Reliable</h3>
          <p className="text-primary-foreground/70 text-sm">
            Your data is protected with industry-standard encryption. Our platform is trusted by thousands of merchants across Zimbabwe.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
              <ArrowLeft size={20} />
              Back
            </Link>
            <Logo size="lg" />
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl">
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </CardTitle>
              <CardDescription>
                {mode === 'login' 
                  ? 'Enter your credentials to access your account'
                  : 'Fill in your details to get started'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                          id="name"
                          type="text"
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Account Type</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {roleOptions.map((role) => {
                          const Icon = role.icon;
                          return (
                            <button
                              key={role.value}
                              type="button"
                              onClick={() => setSelectedRole(role.value)}
                              className={cn(
                                'flex flex-col items-start p-3 rounded-lg border-2 transition-all text-left',
                                selectedRole === role.value
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              )}
                            >
                              <Icon size={18} className={cn(
                                'mb-1',
                                selectedRole === role.value ? 'text-primary' : 'text-muted-foreground'
                              )} />
                              <span className="text-sm font-medium">{role.label}</span>
                              <span className="text-xs text-muted-foreground line-clamp-1">{role.description}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
                    {error}
                  </div>
                )}

                <Button 
                  type="submit" 
                  variant="hero" 
                  className="w-full" 
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                  <button
                    type="button"
                    onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                    className="text-primary font-medium ml-1 hover:underline"
                  >
                    {mode === 'login' ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
