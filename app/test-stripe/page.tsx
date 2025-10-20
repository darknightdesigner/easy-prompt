'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function TestStripePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const testCheckoutSession = async () => {
    setLoading(true);
    setError('');
    setResult('');
    
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.error) {
        setError(`Error: ${data.error}`);
      } else if (data.url) {
        setResult(`✅ Checkout session created! Redirecting...`);
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        setResult(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      setError(`Request failed: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const testPortalSession = async () => {
    setLoading(true);
    setError('');
    setResult('');
    
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.error) {
        setError(`Error: ${data.error}`);
      } else if (data.url) {
        setResult(`✅ Portal session created! Redirecting...`);
        window.location.href = data.url;
      } else {
        setResult(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      setError(`Request failed: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const testSubscriptionStatus = async () => {
    setLoading(true);
    setError('');
    setResult('');
    
    try {
      const response = await fetch('/api/subscription');
      const data = await response.json();
      
      if (data.error) {
        setError(`Error: ${data.error}`);
      } else {
        setResult(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      setError(`Request failed: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-2">Stripe Integration Test Page</h1>
      <p className="text-muted-foreground mb-8">
        Test your Stripe payment integration endpoints
      </p>

      <div className="space-y-4 mb-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Test Checkout Session</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Creates a Stripe Checkout session for the Premium plan ($5/month).
            You'll be redirected to Stripe's hosted checkout page.
          </p>
          <Button 
            onClick={testCheckoutSession} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Loading...' : 'Test Checkout (Premium $5/mo)'}
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Test Customer Portal</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Opens Stripe Customer Portal where users can manage their subscription.
            (Only works if you have an active subscription)
          </p>
          <Button 
            onClick={testPortalSession} 
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? 'Loading...' : 'Open Customer Portal'}
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Check Subscription Status</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Fetches your current subscription status from the database.
          </p>
          <Button 
            onClick={testSubscriptionStatus} 
            disabled={loading}
            variant="secondary"
            className="w-full"
          >
            {loading ? 'Loading...' : 'Get Subscription Status'}
          </Button>
        </Card>
      </div>

      {error && (
        <Card className="p-6 bg-destructive/10 border-destructive">
          <h3 className="font-semibold text-destructive mb-2">Error</h3>
          <pre className="text-sm whitespace-pre-wrap">{error}</pre>
        </Card>
      )}

      {result && (
        <Card className="p-6 bg-primary/10">
          <h3 className="font-semibold mb-2">Result</h3>
          <pre className="text-sm whitespace-pre-wrap">{result}</pre>
        </Card>
      )}

      <Card className="p-6 mt-8 bg-muted">
        <h3 className="font-semibold mb-4">Test Card Information</h3>
        <div className="space-y-2 text-sm">
          <p><strong>Card Number:</strong> 4242 4242 4242 4242</p>
          <p><strong>Expiry:</strong> Any future date (e.g., 12/34)</p>
          <p><strong>CVC:</strong> Any 3 digits (e.g., 123)</p>
          <p><strong>ZIP:</strong> Any 5 digits (e.g., 12345)</p>
        </div>
      </Card>

      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded">
        <p className="text-sm">
          <strong>Note:</strong> You must be logged in to test these endpoints. 
          If you get "Unauthorized" errors, make sure you're signed in to your EasyPrompt account first.
        </p>
      </div>
    </div>
  );
}


