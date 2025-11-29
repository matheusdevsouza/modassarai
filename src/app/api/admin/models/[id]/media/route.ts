import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, verifyAdminAccess } from '@/lib/auth'
import database from '@/lib/database'
import { uploadFile } from '@/lib/storage'

export const dynamic = 'force-dynamic';
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {

    const user = await authenticateUser(request)
    if (!user) {

      return NextResponse.json({ success: false, error: 'Acesso negado. Autenticação necessária.' }, { status: 401 })
    }
    
    const isAdmin = await verifyAdminAccess(user, database.query);
    if (!isAdmin) {

      return NextResponse.json({ success: false, error: 'Acesso negado. Apenas administradores autorizados.' }, { status: 403 })
    }
    const modelId = parseInt(params.id)
    if (isNaN(modelId)) {

      return NextResponse.json({ success: false, error: 'ID do modelo inválido' }, { status: 400 })
    }

    const existing = await database.query('SELECT id, name FROM models WHERE id = ?', [modelId])
    if (!existing || existing.length === 0) {

      return NextResponse.json({ success: false, error: 'Modelo não encontrado' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) {

      return NextResponse.json({ success: false, error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {

      return NextResponse.json({ success: false, error: 'Apenas imagens são suportadas' }, { status: 400 })
    }
    if (file.size > 20 * 1024 * 1024) { 

      return NextResponse.json({ success: false, error: 'Arquivo muito grande (máx. 20MB)' }, { status: 400 })
    }
    const timestamp = Date.now()
    const random = Math.random().toString(36).slice(2, 8)
    const originalExt = file.name.split('.').pop() || 'jpg'
    const ext = originalExt.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
    const fileName = `model_${modelId}_${timestamp}_${random}.${ext}`

    const blobPath = `models/${fileName}`

    const uploadResult = await uploadFile(file, blobPath, {
      contentType: file.type,
      addRandomSuffix: false,
    })

    const imageUrl = uploadResult.url

    await database.query('UPDATE models SET image_url = ?, updated_at = NOW() WHERE id = ?', [imageUrl, modelId])

    const updatedModel = await database.query('SELECT image_url FROM models WHERE id = ?', [modelId])
    if (updatedModel && updatedModel.length > 0) {

    }

    return NextResponse.json({ 
      success: true, 
      message: 'Imagem enviada com sucesso', 
      data: { image_url: imageUrl } 
    })
  } catch (error: any) {


    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}