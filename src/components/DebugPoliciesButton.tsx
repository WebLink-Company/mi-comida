
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const DebugPoliciesButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const handleDebugPolicies = async () => {
    setIsLoading(true);
    try {
      // First try to get the raw SQL policies
      const { data: policiesData, error: policiesError } = await supabase.rpc(
        'get_policies_info',
        { target_table: 'profiles' }
      );

      if (policiesError) {
        throw policiesError;
      }

      setResults(policiesData);
      console.log('Policies data:', policiesData);
      
      toast({
        title: 'Policies retrieved',
        description: 'Check the console for detailed information about the policies',
      });
    } catch (error) {
      console.error('Error debugging policies:', error);
      
      // Try a simple query to see if we can get any response
      try {
        const { data, error: testError } = await supabase
          .from('profiles')
          .select('count(*)')
          .limit(1);
          
        if (testError) {
          console.error('Test query error:', testError);
          setResults({ error: 'Test query failed', details: testError });
        } else {
          setResults({ message: 'Test query succeeded but policy query failed', data });
        }
      } catch (testError) {
        console.error('Test query exception:', testError);
        setResults({ error: 'All queries failed', original_error: error });
      }
      
      toast({
        title: 'Error debugging policies',
        description: error instanceof Error ? error.message : 'Error retrieving policy information',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-border p-4 mb-4">
      <h2 className="text-xl font-semibold mb-2">Debug RLS Policies</h2>
      <p className="text-sm text-muted-foreground mb-4">
        This tool will help identify problematic RLS policies in the database.
      </p>
      
      <Button 
        onClick={handleDebugPolicies} 
        disabled={isLoading}
        variant="default"
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Debugging policies...
          </>
        ) : (
          'Debug RLS Policies'
        )}
      </Button>
      
      {results && (
        <div className="mt-4 p-3 bg-muted rounded-md overflow-auto max-h-[400px]">
          <h3 className="font-medium mb-2">Policy Information:</h3>
          <pre className="text-xs whitespace-pre-wrap">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DebugPoliciesButton;
