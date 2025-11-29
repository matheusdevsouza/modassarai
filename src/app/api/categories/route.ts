import { NextResponse } from 'next/server'
import database from '@/lib/database'

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await database.query(
      `SELECT * FROM categories WHERE is_active = TRUE ORDER BY name ASC`
    )
    const mappedCategories = categories.map((cat: any) => ({
      ...cat,
      is_active: Boolean(cat.is_active)
    }))
    return NextResponse.json({
      success: true,
      data: mappedCategories || []
    })
  } catch (error) {

    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      data: []
    }, { status: 500 })
  }
}
