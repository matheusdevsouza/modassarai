import { NextRequest, NextResponse } from 'next/server'
import { getProductsByModel, getProductSizes } from '@/lib/database'

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const products = await getProductsByModel(slug)

    const productsWithSizes = []
    for (const product of products) {
      const productSizes = await getProductSizes(product.id)
      const sizes = productSizes
        .filter((size: any) => size.is_active && size.stock_quantity > 0)
        .map((size: any) => size.size)
        .filter(Boolean)
      productsWithSizes.push({
        ...product,
        sizes: sizes
      })
    }
    return NextResponse.json({
      success: true,
      data: productsWithSizes
    })
  } catch (error) {

    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}