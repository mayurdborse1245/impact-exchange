import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Moon, Sun, User, Shield, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export const Navbar = () => {
  const { user, profile, roles, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<{ id: string; message: string; read_status: boolean }[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = roles.includes('admin');
  const isSubmitter = roles.includes('project_submitter');

  useEffect(() => {
    if (!user) return;
    supabase.from('notifications').select('*').eq('user_id', user.id).eq('read_status', false).order('created_at', { ascending: false }).limit(5)
      .then(({ data }) => setNotifications(data || []));
  }, [user]);

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ read_status: true }).eq('id', id);
    setNotifications(n => n.filter(x => x.id !== id));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl">FIX</span>
        </Link>

        {user && (
          <div className="hidden md:flex items-center gap-6">
            <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
            <Link to="/projects" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Projects</Link>
            {(isAdmin || isSubmitter) && <Link to="/submit-project" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Submit Project</Link>}
            {isAdmin && <Link to="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Admin</Link>}
            <Link to="/portfolio" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Portfolio</Link>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {user && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-4 h-4" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">
                        {notifications.length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">No new notifications</div>
                  ) : (
                    notifications.map(n => (
                      <DropdownMenuItem key={n.id} onClick={() => markRead(n.id)} className="cursor-pointer">
                        <span className="text-sm">{n.message}</span>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-3 py-2 border-b">
                    <p className="text-sm font-medium">{profile?.username || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{profile?.email}</p>
                    <div className="flex gap-1 mt-1">
                      {roles.map(r => <Badge key={r} variant="secondary" className="text-[10px]">{r}</Badge>)}
                    </div>
                  </div>
                  <DropdownMenuItem className="text-sm text-muted-foreground">
                    Wallet: ₹{profile?.wallet_balance?.toLocaleString('en-IN') || '0'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </>
          )}

          {!user && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Log In</Button>
              <Button size="sm" onClick={() => navigate('/signup')}>Sign Up</Button>
            </div>
          )}
        </div>
      </div>

      {mobileOpen && user && (
        <div className="md:hidden border-t bg-card p-4 space-y-2">
          <Link to="/dashboard" className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>Dashboard</Link>
          <Link to="/projects" className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>Projects</Link>
          {(isAdmin || isSubmitter) && <Link to="/submit-project" className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>Submit Project</Link>}
          {isAdmin && <Link to="/admin" className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>Admin</Link>}
          <Link to="/portfolio" className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>Portfolio</Link>
        </div>
      )}
    </nav>
  );
};
