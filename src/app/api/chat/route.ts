import { NextRequest, NextResponse } from 'next/server';
import { processMessage } from '@/lib/ai/process-message';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const result = await processMessage({
      messages,
      context: { platform: 'web' },
    });

    return NextResponse.json({ message: result.message });
  } catch (e) {
    console.error('Chat API error:', e);
    return NextResponse.json(
      { error: 'AI service error', message: 'Izvinite, došlo je do greške. Pokušajte ponovo.' },
      { status: 500 }
    );
  }
}
