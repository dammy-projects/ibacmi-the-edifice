import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useUserRoles";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, User, BookOpen, Users, Menu } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Header = () => {
  const { user, signOut } = useAuth();
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      console.log('Signing out...');
      const { error } = await signOut();
      if (error) {
        console.error('Sign out error:', error);
        alert('Failed to sign out. Please try again.');
        return;
      }
      console.log('Sign out successful');
      
      // Force a small delay to ensure state updates
      setTimeout(() => {
        navigate('/');
        setIsMobileMenuOpen(false);
        
        // Force reload if still signed in after 1 second
        setTimeout(() => {
          if (user) {
            console.log('User still signed in, forcing reload');
            window.location.reload();
          }
        }, 1000);
      }, 100);
    } catch (error) {
      console.error('Sign out error:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  const handleDirectSignOut = async () => {
    try {
      console.log('Direct sign out...');
      await supabase.auth.signOut();
      localStorage.clear();
      window.location.href = '/';
    } catch (error) {
      console.error('Direct sign out error:', error);
      window.location.href = '/';
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (!user) {
    return (
      <header className="bg-background shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-4">
              <img
                src="/514039771_653245024440471_7121227975316158855_n.png"
                alt="IBACMI Logo"
                className="h-8 w-auto sm:h-10 mr-1 sm:mr-2 bg-white border border-gray-300 rounded"
                onError={(e) => { e.currentTarget.style.display = 'none'; alert('Logo image not found at /514039771_653245024440471_7121227975316158855_n.png'); }}
              />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">IBACMI the edifice</h1>
            </Link>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link to="/auth">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-background shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 sm:space-x-4">
            <img
              src="/514039771_653245024440471_7121227975316158855_n.png"
              alt="IBACMI Logo"
              className="h-8 w-auto sm:h-10 mr-1 sm:mr-2 bg-white border border-gray-300 rounded"
              onError={(e) => { e.currentTarget.style.display = 'none'; alert('Logo image not found at /514039771_653245024440471_7121227975316158855_n.png'); }}
            />
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">IBACMI the edifice</h1>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Welcome, {user.email}</span>
            </div>
            {isAdmin && (
              <Link to="/user-management">
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Users
                </Button>
              </Link>
            )}
            <Button variant="outline" size="sm" onClick={handleProfileClick}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button variant="outline" size="sm" onClick={handleDirectSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground px-2">
                <User className="h-4 w-4" />
                <span className="truncate">Welcome, {user.email}</span>
              </div>
              {isAdmin && (
                <Link to="/user-management" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Users
                  </Button>
                </Link>
              )}
              <Button variant="outline" size="sm" onClick={handleProfileClick} className="w-full justify-start">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button variant="outline" size="sm" onClick={handleDirectSignOut} className="w-full justify-start">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;