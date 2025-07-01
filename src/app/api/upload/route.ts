import { NextRequest, NextResponse } from 'next/server'
import { DifyClient } from '@/lib/dify'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが見つかりません' },
        { status: 400 }
      )
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'PDFファイルのみアップロード可能です' },
        { status: 400 }
      )
    }

    // ファイルサイズ制限（10MB）
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'ファイルサイズが大きすぎます（10MB以下）' },
        { status: 400 }
      )
    }

    // ファイルをバッファに変換
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // DifyAPIでPDFを処理
    const difyClient = new DifyClient()
    
    // 開発環境では、実際のDifyAPIの代わりにモック関数を使用
    const isDevelopment = process.env.NODE_ENV === 'development'
    const difyResponse = isDevelopment 
      ? await difyClient.mockProcessPDF(file.name)
      : await difyClient.processPDF(buffer, file.name)

    if (!difyResponse.success || !difyResponse.data) {
      return NextResponse.json(
        { error: `PDF処理エラー: ${difyResponse.error || 'データが取得できませんでした'}` },
        { status: 500 }
      )
    }

    // 見積書IDを生成
    const estimateId = 'est_' + Date.now()

    // 抽出されたデータにIDを追加
    const extractedItems = difyResponse.data.items.map((item: { itemName: string; quantity: number; unitCost: number }, index: number) => ({
      id: (index + 1).toString(),
      itemName: item.itemName,
      quantity: item.quantity,
      unitCost: item.unitCost,
      unitPrice: item.unitCost // 初期値として原価と同じ値を設定
    }))

    const response = {
      success: true,
      estimateId,
      extractedData: {
        items: extractedItems
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('アップロードエラー:', error)
    return NextResponse.json(
      { error: 'ファイルの処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'PDF Upload API' })
}

