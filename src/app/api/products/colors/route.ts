import { NextResponse } from 'next/server';
import { getProductColors } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const colors = await getProductColors();
    return NextResponse.json({ success: true, data: colors });
  } catch (error) {

    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 });
  }
}