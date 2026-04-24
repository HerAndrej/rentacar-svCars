import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const slug = formData.get('slug') as string | null;

  if (!file || !slug) {
    return NextResponse.json({ error: 'File and slug are required' }, { status: 400 });
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'webp';
  const filename = `${slug}-${Date.now()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { error } = await supabase.storage
    .from('vehicles')
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage
    .from('vehicles')
    .getPublicUrl(filename);

  return NextResponse.json({ url: urlData.publicUrl });
}

export async function DELETE(request: NextRequest) {
  const { url } = await request.json();

  const path = url.split('/storage/v1/object/public/vehicles/')[1];
  if (!path) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  const { error } = await supabase.storage.from('vehicles').remove([path]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
