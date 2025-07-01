import { NextRequest, NextResponse } from 'next/server'

interface EstimateItem {
  id: string
  itemName: string
  quantity: number
  unitCost: number
  unitPrice: number
}

interface EstimateData {
  id: string
  customerName: string
  items: EstimateItem[]
  createdAt: string
  updatedAt: string
  status: 'draft' | 'completed'
}

// 仮のデータストア（実際はSupabaseを使用）
const mockEstimates: { [key: string]: EstimateData } = {}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // TODO: Supabaseからデータを取得
    const estimate = mockEstimates[id]
    
    if (!estimate) {
      return NextResponse.json(
        { error: '見積書が見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json(estimate)

  } catch (error) {
    console.error('見積書取得エラー:', error)
    return NextResponse.json(
      { error: '見積書の取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    // TODO: Supabaseでデータを更新
    const existingEstimate = mockEstimates[id]
    
    if (!existingEstimate) {
      return NextResponse.json(
        { error: '見積書が見つかりません' },
        { status: 404 }
      )
    }

    const updatedEstimate: EstimateData = {
      ...existingEstimate,
      ...body,
      updatedAt: new Date().toISOString()
    }

    mockEstimates[id] = updatedEstimate

    return NextResponse.json(updatedEstimate)

  } catch (error) {
    console.error('見積書更新エラー:', error)
    return NextResponse.json(
      { error: '見積書の更新中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    // 新しい見積書を作成
    const newEstimate: EstimateData = {
      id,
      customerName: body.customerName || '',
      items: body.items || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft'
    }

    mockEstimates[id] = newEstimate

    return NextResponse.json(newEstimate)

  } catch (error) {
    console.error('見積書作成エラー:', error)
    return NextResponse.json(
      { error: '見積書の作成中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

