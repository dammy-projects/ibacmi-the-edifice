
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Upload, Search, Settings, BookOpen } from "lucide-react";
import Header from "@/components/layout/Header";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Flipbook Platform
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Create, share, and discover amazing digital flipbooks
            </p>
            <div className="space-x-4">
              <Link to="/auth">
                <Button size="lg" className="px-8">
                  Get Started
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="lg" className="px-8">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <Upload className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Create Flipbooks</CardTitle>
                <CardDescription>
                  Upload PDFs or images to create stunning digital flipbooks
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Search className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle>Discover Content</CardTitle>
                <CardDescription>
                  Browse and search through thousands of flipbooks by category
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BookOpen className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Share & Engage</CardTitle>
                <CardDescription>
                  Like, comment, and share flipbooks with your community
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link to="/my-flipbooks">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <Upload className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Create Flipbook</CardTitle>
                <CardDescription>
                  Upload and create new flipbooks
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/my-flipbooks">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <Upload className="h-8 w-8 text-primary mb-2" />
                <CardTitle>My Flipbooks</CardTitle>
                <CardDescription>
                  Manage your created flipbooks
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <Search className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Browse</CardTitle>
              <CardDescription>
                Discover public flipbooks
              </CardDescription>
            </CardHeader>
          </Card>

          <Link to="/profile">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <Settings className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                  Manage your account settings
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest flipbook interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-center py-8">
              No recent activity. Start by creating your first flipbook!
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Index;
