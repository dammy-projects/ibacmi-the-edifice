
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Upload, Search, Settings, BookOpen, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/layout/Header";
import { usePublicFlipbooks } from "@/hooks/usePublicFlipbooks";
import FlipbookCard from "@/components/flipbooks/FlipbookCard";
import FlipbookSearch from "@/components/flipbooks/FlipbookSearch";

const Index = () => {
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const { 
    data: flipbooksData, 
    isLoading: flipbooksLoading,
    error: flipbooksError 
  } = usePublicFlipbooks({
    search: searchQuery,
    page: currentPage,
    limit: 8
  });

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-foreground mb-4">
              Flipbook Platform
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
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

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
            <Card>
              <CardHeader>
                <Upload className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Create Flipbooks</CardTitle>
                <CardDescription>
                  Upload images to create stunning digital flipbooks
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Search className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Discover Content</CardTitle>
                <CardDescription>
                  Browse and search through thousands of flipbooks
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BookOpen className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Share & Engage</CardTitle>
                <CardDescription>
                  Like, comment, and share flipbooks with your community
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Public Flipbooks Preview */}
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">Featured Flipbooks</h2>
              <p className="text-muted-foreground">Discover amazing flipbooks from our community</p>
            </div>

            {flipbooksLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : flipbooksError ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Failed to load flipbooks</p>
              </div>
            ) : flipbooksData && flipbooksData.flipbooks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {flipbooksData.flipbooks.slice(0, 4).map((flipbook) => (
                  <FlipbookCard key={flipbook.id} flipbook={flipbook} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No flipbooks available yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Discover Amazing Flipbooks
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Browse through our collection of digital flipbooks
          </p>
          
          {/* Search Bar */}
          <div className="flex justify-center mb-8">
            <FlipbookSearch
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              onClear={handleClearSearch}
            />
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/my-flipbooks">
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Create Flipbook
              </Button>
            </Link>
            <Link to="/my-flipbooks">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                My Flipbooks
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Flipbooks Grid */}
      <div className="container mx-auto px-4 py-12">
        {flipbooksLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : flipbooksError ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Failed to load flipbooks</p>
          </div>
        ) : flipbooksData && flipbooksData.flipbooks.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                {searchQuery ? `Search Results for "${searchQuery}"` : 'All Flipbooks'}
              </h2>
              <p className="text-muted-foreground">
                {flipbooksData.totalCount} flipbook{flipbooksData.totalCount !== 1 ? 's' : ''} found
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {flipbooksData.flipbooks.map((flipbook) => (
                <FlipbookCard key={flipbook.id} flipbook={flipbook} />
              ))}
            </div>

            {/* Pagination */}
            {flipbooksData.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {Array.from({ length: flipbooksData.totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="min-w-[2rem]"
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === flipbooksData.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchQuery ? 'No flipbooks found' : 'No flipbooks available'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery 
                ? 'Try adjusting your search terms or browse all flipbooks'
                : 'Be the first to create and share a flipbook!'
              }
            </p>
            {searchQuery && (
              <Button onClick={handleClearSearch} variant="outline">
                Clear Search
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
