import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { getUserSubscription } from '@/lib/stripe/subscriptions';

export async function GET() {
  try {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ subscription: null });
    }
    
    const subscription = await getUserSubscription(user.id);
    
    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}


