import { NextRequest, NextResponse } from 'next/server';
import { getProductBySlug, getProductImages, getProductVideos, getProductVariants, getProductSizes, getProductReviews, getProductColorVariations } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;
    if (!slug) {
      return NextResponse.json({ error: 'Slug não informado' }, { status: 400 });
    }
    const product = await getProductBySlug(slug);
    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }
    const images = await getProductImages(product.id);
    const videos = await getProductVideos(product.id);
    const productSizes = await getProductSizes(product.id);
    const reviews = await getProductReviews(product.id, 10);
    const colorVariations = await getProductColorVariations(product.id);

    );

    const sizes = productSizes.map((size: any) => ({
      size: size.size,
      stock: size.stock_quantity,
      available: size.stock_quantity > 0 && size.is_active
    })).filter((s: any) => s.size);
    return NextResponse.json({
      id: product.id,
      name: product.name,
      description: product.description,
      shortDescription: product.short_description,
      price: product.price,
      priceFormatted: `R$ ${Number(product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      originalPrice: product.original_price,
      stockQuantity: product.stock_quantity,
      slug: product.slug,
      color: product.color,
      colorHex: product.color_hex,
      modelId: product.model_id,
      modelSlug: product.model_slug,
      images: images.map((img: any) => ({ url: img.image_url, alt: img.alt_text })),
      videos: videos.map((vid: any) => ({ 
        url: vid.video_url, 
        alt: vid.alt_text,
        duration: vid.duration,
        thumbnail: vid.thumbnail_url 
      })),
      sizes,
      reviews,
      colorVariations: colorVariations || [], 
    });
  } catch (error) {

    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}