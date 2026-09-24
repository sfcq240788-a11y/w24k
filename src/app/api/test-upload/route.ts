import { NextResponse } from 'next/server';
import { uploadFotoAction } from '@/lib/data/media';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // Call the action
    const result = await uploadFotoAction(formData);
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
