import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { PublicFlipbook } from "@/hooks/usePublicFlipbooks";
import { format } from "date-fns";

interface FlipbookCardProps {
  flipbook: PublicFlipbook;
}

const FlipbookCard = ({ flipbook }: FlipbookCardProps) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
      <CardHeader className="p-0 flex-shrink-0">
        <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg">
          {flipbook.cover_image ? (
            <img
              src={flipbook.cover_image}
              alt={flipbook.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Eye className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50" />
                <p className="text-xs sm:text-sm">No Cover Image</p>
              </div>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              {format(new Date(flipbook.updated_at), 'MMM dd')}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 flex-1 flex flex-col">
        <CardTitle className="text-base sm:text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {flipbook.title}
        </CardTitle>
        {flipbook.description && (
          <p className="text-muted-foreground text-xs sm:text-sm mb-4 line-clamp-3 flex-1">
            {flipbook.description}
          </p>
        )}
        <Link to={`/view/${flipbook.id}`} className="w-full mt-auto">
          <Button className="w-full text-xs sm:text-sm" variant="default">
            <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            View Flipbook
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default FlipbookCard;