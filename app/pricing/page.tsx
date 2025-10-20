'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Zap } from 'lucide-react';
import { PageContainer } from '@/components/layout/page-container';
import { PLANS } from '@/lib/stripe/plans';
import { useRouter } from 'next/navigation';

interface Subscription {
  plan_type: 'free' | 'premium';
  status: string;
}

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    checkSubscription();
  }, []);
  
  const checkSubscription = async () => {
    try {
      const response = await fetch('/api/subscription');
      const data = await response.json();
      setSubscription(data.subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setCheckingAuth(false);
    }
  };
  
  const isPremium = subscription?.plan_type === 'premium' && 
                    subscription?.status === 'active';
  
  const handleUpgrade = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.error) {
        if (data.error === 'Unauthorized') {
          // Redirect to login
          router.push('/login?redirect=/pricing');
          return;
        }
        alert('Failed to start checkout. Please try again.');
        return;
      }
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleManageSubscription = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to open billing portal');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <PageContainer
      background={{
        wavy: true,
        animation: {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 3, delay: 0.5 }
        }
      }}
    >
      <PageContainer.Content>
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              Simple, transparent pricing
            </Badge>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Choose Your Plan
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free and upgrade when you need more power. No hidden fees, cancel anytime.
            </p>
          </div>
          
          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* Free Plan */}
            <Card className="p-8 relative hover:shadow-lg transition-shadow">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  {PLANS.FREE.name}
                  <Zap className="w-5 h-5 text-muted-foreground" />
                </h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-bold">${PLANS.FREE.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-muted-foreground">
                  Perfect for getting started with prompt templates
                </p>
              </div>
              
              <ul className="space-y-4 mb-8">
                {PLANS.FREE.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                variant="outline"
                className="w-full"
                disabled={!isPremium && !checkingAuth}
                onClick={() => !isPremium && router.push('/home')}
              >
                {checkingAuth ? 'Loading...' : 
                 isPremium ? 'Upgrade to use' : 'Current Plan'}
              </Button>
              
              {!isPremium && !checkingAuth && (
                <p className="text-xs text-center text-muted-foreground mt-3">
                  You're currently on the free plan
                </p>
              )}
            </Card>
            
            {/* Premium Plan */}
            <Card className="p-8 relative border-primary shadow-xl hover:shadow-2xl transition-shadow bg-gradient-to-br from-card to-primary/5">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground shadow-lg px-4 py-1">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  {PLANS.PREMIUM.name}
                  <Sparkles className="w-5 h-5 text-primary" />
                </h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-bold">
                    ${PLANS.PREMIUM.price / 100}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-muted-foreground">
                  For power users who need unlimited everything
                </p>
              </div>
              
              <ul className="space-y-4 mb-8">
                {PLANS.PREMIUM.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {isPremium ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleManageSubscription}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Manage Subscription'}
                </Button>
              ) : (
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                  onClick={handleUpgrade}
                  disabled={loading || checkingAuth}
                >
                  {loading ? 'Loading...' : checkingAuth ? 'Loading...' : 'Upgrade to Premium'}
                </Button>
              )}
              
              {isPremium && (
                <p className="text-xs text-center text-muted-foreground mt-3 flex items-center justify-center gap-1">
                  <Check className="w-3 h-3 text-primary" />
                  You're a premium member
                </p>
              )}
            </Card>
          </div>
          
          {/* Feature Comparison */}
          <div className="mt-24 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Compare Plans
            </h2>
            
            <div className="grid gap-6">
              <Card className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Saved Templates</h3>
                    <p className="text-sm text-muted-foreground">
                      Bookmark your favorite templates
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-muted-foreground">10</p>
                    <p className="text-xs text-muted-foreground">Free plan</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">Unlimited</p>
                    <p className="text-xs text-muted-foreground">Premium plan</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Variables per Template</h3>
                    <p className="text-sm text-muted-foreground">
                      Customize templates with variables
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-muted-foreground">5</p>
                    <p className="text-xs text-muted-foreground">Free plan</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">Unlimited</p>
                    <p className="text-xs text-muted-foreground">Premium plan</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Template Length</h3>
                    <p className="text-sm text-muted-foreground">
                      Maximum characters per template
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-muted-foreground">5,000</p>
                    <p className="text-xs text-muted-foreground">Free plan</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">Unlimited</p>
                    <p className="text-xs text-muted-foreground">Premium plan</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
          
          {/* FAQ Section */}
          <div className="mt-24 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes! You can cancel your subscription at any time from the billing portal. 
                  You'll keep premium access until the end of your billing period.
                </p>
              </Card>
              
              <Card className="p-6">
                <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-sm text-muted-foreground">
                  We accept all major credit cards (Visa, Mastercard, American Express) 
                  through Stripe, our secure payment processor.
                </p>
              </Card>
              
              <Card className="p-6">
                <h3 className="font-semibold mb-2">What happens if I downgrade?</h3>
                <p className="text-sm text-muted-foreground">
                  If you cancel Premium, you'll keep access until your billing period ends. 
                  After that, you'll be on the free plan. Your templates and data are safe - 
                  you just won't be able to save more than 10 templates or use advanced features.
                </p>
              </Card>
              
              <Card className="p-6">
                <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
                <p className="text-sm text-muted-foreground">
                  If you're not satisfied within the first 7 days, contact us for a full refund. 
                  We want you to be happy with your subscription!
                </p>
              </Card>
            </div>
          </div>
          
          {/* CTA Section */}
          <div className="mt-24 text-center">
            <Card className="p-12 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <h2 className="text-3xl font-bold mb-4">
                Ready to unlock unlimited prompts?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join hundreds of users creating better prompts with EasyPrompt Premium.
              </p>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                onClick={handleUpgrade}
                disabled={loading || isPremium || checkingAuth}
              >
                {loading ? 'Loading...' : 
                 isPremium ? '✓ You\'re Premium!' : 
                 checkingAuth ? 'Loading...' : 
                 'Get Premium Now'}
              </Button>
            </Card>
          </div>
          
        </div>
      </PageContainer.Content>
    </PageContainer>
  );
}

