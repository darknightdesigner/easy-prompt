import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { createCheckoutSession } from '@/lib/stripe/subscriptions';

export async function POST(request: NextRequest) {
  try {
    const supabase = await supabaseServer();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get origin for redirect URLs
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL;
    
    // Create checkout session
    const session = await createCheckoutSession(
      user.id,
      `${origin}/home?checkout=success`,
      `${origin}/test-stripe?checkout=canceled`
    );
    
    return NextResponse.json({ 
      sessionId: session.id, 
      url: session.url 
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

