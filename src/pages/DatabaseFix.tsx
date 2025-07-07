import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";

const DatabaseFix = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const sqlCommands = [
    {
      title: "Add Missing INSERT Policy",
      description: "Critical fix: Allows users to create/update profiles",
      sql: `-- Add missing INSERT policy for profiles table
CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);`,
      priority: "critical"
    },
    {
      title: "Create Updated_at Function",
      description: "Automatically manages timestamp updates",
      sql: `-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';`,
      priority: "high"
    },
    {
      title: "Create Updated_at Trigger",
      description: "Triggers automatic timestamp updates on profile changes",
      sql: `-- Create trigger for profiles table
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();`,
      priority: "high"
    },
    {
      title: "Ensure Updated_at Column",
      description: "Adds updated_at column if it doesn't exist",
      sql: `-- Ensure updated_at column exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();`,
      priority: "medium"
    },
    {
      title: "Verify Fixes",
      description: "Check that all policies are properly applied",
      sql: `-- Verify that all policies are correctly applied
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles' 
ORDER BY cmd, policyname;`,
      priority: "info"
    }
  ];

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast({
        title: "Copied!",
        description: "SQL command copied to clipboard.",
      });
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const copyAllCommands = async () => {
    const allSql = sqlCommands
      .filter(cmd => cmd.priority !== "info")
      .map(cmd => cmd.sql)
      .join("\n\n");
    
    try {
      await navigator.clipboard.writeText(allSql);
      toast({
        title: "All Commands Copied!",
        description: "All SQL commands copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-500 text-white";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-yellow-500 text-white";
      case "info": return "bg-blue-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "critical": return <AlertCircle className="h-4 w-4" />;
      case "high": return <AlertCircle className="h-4 w-4" />;
      case "medium": return <CheckCircle className="h-4 w-4" />;
      case "info": return <CheckCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Database Fix Required</h1>
            <p className="text-muted-foreground">
              The Profile Module requires database fixes to function properly. Follow these steps to apply the fixes.
            </p>
          </div>

          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Important Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-red-700">Steps to Apply Database Fixes:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-red-600">
                  <li>Go to your <strong>Supabase Dashboard</strong></li>
                  <li>Navigate to <strong>SQL Editor</strong></li>
                  <li>Copy and paste each SQL command below (in order)</li>
                  <li>Run each command one by one</li>
                  <li>Verify the fixes with the verification query</li>
                </ol>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={copyAllCommands}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  Copy All Commands
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {sqlCommands.map((command, index) => (
              <Card key={index} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getPriorityIcon(command.priority)}
                      {command.title}
                    </CardTitle>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getPriorityColor(command.priority)}`}>
                      {command.priority.toUpperCase()}
                    </span>
                  </div>
                  <CardDescription>{command.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{command.sql}</code>
                    </pre>
                    <Button
                      onClick={() => copyToClipboard(command.sql, index)}
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                    >
                      {copiedIndex === index ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-700 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                After Applying Fixes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-green-600 text-sm">
                Once you've applied all the database fixes:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-green-600">
                <li>Profile information updates will work correctly</li>
                <li>Password changes will require current password validation</li>
                <li>Timestamps will be automatically managed</li>
                <li>All security policies will be properly enforced</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DatabaseFix;