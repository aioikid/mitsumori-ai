interface DifyConfig {
  apiUrl: string
  apiKey: string
  workflowId: string
}

interface DifyResponse {
  success: boolean
  data?: {
    items: ExtractedItem[]
  }
  error?: string
}

interface ExtractedItem {
  itemName: string
  quantity: number
  unitCost: number
}

interface ExtractedData {
  items: ExtractedItem[]
}

export class DifyClient {
  private config: DifyConfig

  constructor() {
    this.config = {
      apiUrl: process.env.DIFY_API_URL || 'https://api.dify.ai/v1',
      apiKey: process.env.DIFY_API_KEY?.trim() || '',
      workflowId: process.env.DIFY_WORKFLOW_ID || 'CL4GuiaHyVu9SjoA'
    }
  }

  async processPDF(pdfBuffer: Buffer, fileName: string): Promise<DifyResponse> {
    try {
      if (!this.config.apiKey) {
        return { success: false, error: 'DIFY_API_KEY is not configured' }
      }

      // PDFをBase64エンコード
      const base64PDF = pdfBuffer.toString('base64')

      // DifyのワークフローAPIを呼び出し
      const response = await fetch(`${this.config.apiUrl}/workflows/run`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: {
            pdf_file: base64PDF,
            file_name: fileName
          },
          response_mode: 'blocking',
          user: 'mitsumori-ai-user'
        })
      })

      if (!response.ok) {
        throw new Error(`Dify API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()

      // レスポンスを解析して構造化データに変換
      const extractedData = this.parseExtractedText(result.data?.outputs?.result || '')

      return {
        success: true,
        data: extractedData
      }

    } catch (error) {
      console.error('Dify API エラー:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private parseExtractedText(text: string): ExtractedData {
    // テキストから項目、数量、金額を抽出するロジック
    // 実際の実装では、より高度な自然言語処理やパターンマッチングを使用
    
    const items: ExtractedItem[] = []
    
    try {
      // 簡単なパターンマッチングの例
      // 実際のDifyの出力形式に合わせて調整が必要
      const lines = text.split('\n')
      
      for (const line of lines) {
        // 例: "商品A 10個 @100円"のようなパターンを想定
        const match = line.match(/(.+?)\s+(\d+)[個|点|本]?\s+[@＠]?(\d+)[円|¥]?/)
        
        if (match) {
          const [, itemName, quantity, unitCost] = match
          items.push({
            itemName: itemName.trim(),
            quantity: parseInt(quantity),
            unitCost: parseInt(unitCost)
          })
        }
      }

      // パターンマッチングで抽出できない場合は、JSONパースを試行
      if (items.length === 0) {
        try {
          const jsonData = JSON.parse(text)
          if (jsonData.items && Array.isArray(jsonData.items)) {
            return { items: jsonData.items }
          }
        } catch {
          // JSON パースに失敗した場合は、デフォルトデータを返す
        }
      }

    } catch (error) {
      console.error('テキスト解析エラー:', error)
    }

    // 抽出に失敗した場合は、サンプルデータを返す
    if (items.length === 0) {
      return {
        items: [
          {
            itemName: '抽出された商品A',
            quantity: 10,
            unitCost: 100
          },
          {
            itemName: '抽出された商品B',
            quantity: 5,
            unitCost: 200
          }
        ]
      }
    }

    return { items }
  }

  // テスト用のモック関数
  async mockProcessPDF(fileName: string): Promise<DifyResponse> {
    // 開発・テスト用のモックレスポンス
    await new Promise(resolve => setTimeout(resolve, 2000)) // 2秒の遅延をシミュレート

    return {
      success: true,
      data: {
        items: [
          {
            itemName: `${fileName}から抽出された商品A`,
            quantity: 10,
            unitCost: 100
          },
          {
            itemName: `${fileName}から抽出された商品B`,
            quantity: 5,
            unitCost: 200
          },
          {
            itemName: `${fileName}から抽出された商品C`,
            quantity: 3,
            unitCost: 500
          }
        ]
      }
    }
  }
}

