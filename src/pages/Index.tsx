import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Upload, Search, Settings, BookOpen, Loader2, ChevronLeft, ChevronRight, Filter, X } from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex flex-col">
        <div className="container mx-auto px-4 py-8 sm:py-16 flex-1">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 animate-fade-in">
            the edifice Flipbook Platform
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 animate-fade-in-delay">
              IBA College of Mindanao, Inc.
            </p>
          </div>

          {/* Public Flipbooks Preview */}
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">Featured Flipbooks</h2>
              <p className="text-muted-foreground px-4">Discover amazing flipbooks from our IBACMI community</p>
            </div>

            {flipbooksLoading ? (
              <div className="flex justify-center py-8 sm:py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : flipbooksError ? (
              <div className="text-center py-8 sm:py-12">
                <p className="text-muted-foreground">Failed to load flipbooks</p>
              </div>
            ) : flipbooksData && flipbooksData.flipbooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {flipbooksData.flipbooks.slice(0, 4).map((flipbook, index) => (
                  <div 
                    key={flipbook.id} 
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <FlipbookCard flipbook={flipbook} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <p className="text-muted-foreground">No flipbooks available yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Sign In Button at Bottom */}
        <div className="container mx-auto px-4 py-8 border-t border-primary/10 bg-white/50 backdrop-blur-sm">
          <div className="text-center">
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Link to="/auth">
                <Button variant="outline" size="lg" className="px-6 sm:px-8 w-full sm:w-auto hover:scale-105 transition-transform duration-200 hover:shadow-lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-8 sm:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 animate-fade-in">
            Discover Amazing Flipbooks
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 px-4 animate-fade-in-delay">
            Browse through our collection of digital flipbooks
          </p>
          
          {/* Search Bar */}
          <div className="flex justify-center mb-6 sm:mb-8 px-4">
            <FlipbookSearch
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              onClear={handleClearSearch}
            />
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
            <Link to="/my-flipbooks" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto hover:scale-105 transition-transform duration-200 hover:shadow-lg">
                <Upload className="h-4 w-4 mr-2" />
                Create Flipbook
              </Button>
            </Link>
            <Link to="/my-flipbooks" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto hover:scale-105 transition-transform duration-200 hover:shadow-lg">
                <Settings className="h-4 w-4 mr-2" />
                My Flipbooks
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Flipbooks Grid */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {flipbooksLoading ? (
          <div className="flex justify-center py-8 sm:py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : flipbooksError ? (
          <div className="text-center py-8 sm:py-12">
            <p className="text-muted-foreground">Failed to load flipbooks</p>
          </div>
        ) : flipbooksData && flipbooksData.flipbooks.length > 0 ? (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                {searchQuery ? `Search Results for "${searchQuery}"` : 'All Flipbooks'}
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                {flipbooksData.flipbooks.length} flipbook{flipbooksData.flipbooks.length !== 1 ? 's' : ''} found
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {flipbooksData.flipbooks.map((flipbook, index) => (
                <div 
                  key={flipbook.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <FlipbookCard flipbook={flipbook} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {flipbooksData.totalPages > 1 && (
              <div className="flex flex-wrap justify-center items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="hover:scale-105 transition-transform duration-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {Array.from({ length: flipbooksData.totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="min-w-[2rem] hover:scale-105 transition-transform duration-200"
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === flipbooksData.totalPages}
                  className="hover:scale-105 transition-transform duration-200"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
              {searchQuery ? 'No flipbooks found' : 'No flipbooks available'}
            </h3>
            <p className="text-muted-foreground mb-6 px-4">
              {searchQuery ? 'Try adjusting your search terms' : 'Be the first to create and share a flipbook!'}
            </p>
            {searchQuery && (
              <Button onClick={handleClearSearch} variant="outline" className="hover:scale-105 transition-transform duration-200">
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
