import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useState } from "react";

interface FlipbookSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
}

const FlipbookSearch = ({ value, onChange, onSearch, onClear }: FlipbookSearchProps) => {
  const [inputValue, setInputValue] = useState(value);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onChange(inputValue);
      onSearch();
    }
  };

  const handleSearch = () => {
    onChange(inputValue);
    onSearch();
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
    onClear();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
      <div className="relative flex-1">
        <Input
          placeholder="Search flipbooks..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pr-8"
        />
        {inputValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Button onClick={handleSearch} className="w-full sm:w-auto">
        <Search className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default FlipbookSearch;