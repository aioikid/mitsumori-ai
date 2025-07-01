import { NextRequest, NextResponse } from 'next/server'
import { PDFGenerator } from '@/lib/pdf-generator'

interface EstimateItem {
  id: string
  itemName: string
  quantity: number
  unitCost: number
  unitPrice: number
}

interface EstimateData {
  customerName: string
  items: EstimateItem[]
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json() as EstimateData

    if (!body.customerName) {
      return NextResponse.json(
        { error: '顧客名が必要です' },
        { status: 400 }
      )
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: '見積項目が必要です' },
        { status: 400 }
      )
    }

    // PDF生成
    const generator = new PDFGenerator()
    const pdfBytes = generator.generateEstimatePDF(body)

    // ファイル名を生成
    const fileName = `見積書_${body.customerName}_${new Date().toISOString().split('T')[0]}.pdf`

    // PDFをレスポンスとして返す
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
        'Content-Length': pdfBytes.length.toString(),
      },
    })

  } catch (error) {
    console.error('PDF生成エラー:', error)
    return NextResponse.json(
      { error: 'PDF生成中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({ 
    message: 'PDF Generation API',
    estimateId: params.id 
  })
}

