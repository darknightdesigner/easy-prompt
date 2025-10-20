import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { createPortalSession } from '@/lib/stripe/subscriptions';

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
    
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL;
    const returnUrl = `${origin}/home`;
    
    // Create portal session
    const portalUrl = await createPortalSession(user.id, returnUrl);
    
    return NextResponse.json({ url: portalUrl });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}

