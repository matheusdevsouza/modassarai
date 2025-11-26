import { NextRequest, NextResponse } from 'next/server'
import { getSimilarProducts, getProductSizes } from '@/lib/database'
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const products = await getSimilarProducts(Number(id))
    const productsWithSizes = await Promise.all(
      products.map(async (product: any) => {
        const productSizes = await getProductSizes(product.id)
        const sizes = productSizes
          .filter((size: any) => size.is_active && size.stock_quantity > 0)
          .map((size: any) => size.size)
          .filter(Boolean)
        return {
          ...product,
          sizes
        }
      })
    )
    return NextResponse.json({
      success: true,
      data: productsWithSizes
    })
  } catch (error) {
    console.error('Erro ao buscar produtos semelhantes:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}