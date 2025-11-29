import { NextRequest, NextResponse } from 'next/server';
import { getVariationImages } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const variationId = parseInt(params.id);
    if (isNaN(variationId)) {
      return NextResponse.json({ error: 'ID da variação inválido' }, { status: 400 });
    }

    const { query } = await import('@/lib/database');
    const variationSql = `
      SELECT product_id 
      FROM product_color_variations 
      WHERE id = ? AND is_active = TRUE
    `;
    const variationResults = await query(variationSql, [variationId]);
    
    if (variationResults.length === 0) {
      return NextResponse.json({ error: 'Variação não encontrada' }, { status: 404 });
    }

    const productId = variationResults[0].product_id;
    const images = await getVariationImages(productId, variationId);

    return NextResponse.json({
      success: true,
      images: images.map((img: any) => ({ 
        url: img.image_url, 
        alt: img.alt_text || '',
        isPrimary: img.is_primary 
      }))
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

