'use client'

import { useState } from 'react'
import { Upload, FileText, Calculator, Download, Loader2 } from 'lucide-react'

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

export default function Home() {
  const [step, setStep] = useState<'upload' | 'edit' | 'complete'>('upload')
  const [isProcessing, setIsProcessing] = useState(false)
  const [estimateData, setEstimateData] = useState<EstimateData>({
    customerName: '',
    items: []
  })

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || file.type !== 'application/pdf') {
      alert('PDFファイルを選択してください')
      return
    }

    setIsProcessing(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'アップロードに失敗しました')
      }

      if (result.success) {
        setEstimateData({
          customerName: '',
          items: result.extractedData.items
        })
        setStep('edit')
      } else {
        throw new Error('PDF処理に失敗しました')
      }
    } catch (error) {
      console.error('PDF処理エラー:', error)
      alert(error instanceof Error ? error.message : 'エラーが発生しました')
    } finally {
      setIsProcessing(false)
    }
  }

  const updateItemPrice = (id: string, unitPrice: number) => {
    setEstimateData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, unitPrice } : item
      )
    }))
  }

  const calculateTotals = () => {
    const totalCost = estimateData.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0)
    const totalPrice = estimateData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    const profit = totalPrice - totalCost
    const profitMargin = totalCost > 0 ? (profit / totalCost) * 100 : 0
    
    return { totalCost, totalPrice, profit, profitMargin }
  }

  const generatePDF = async () => {
    setIsProcessing(true)
    
    try {
      // ブラウザ側でPDF生成（クライアントサイド）
      const { generateEstimatePDFInBrowser } = await import('@/lib/pdf-generator')
      generateEstimatePDFInBrowser(estimateData)
      
      setStep('complete')
    } catch (error) {
      console.error('PDF生成エラー:', error)
      alert('PDF生成中にエラーが発生しました')
    } finally {
      setIsProcessing(false)
    }
  }

  const { totalCost, totalPrice, profit, profitMargin } = calculateTotals()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            mitsumori.AI
          </h1>
          <p className="text-gray-600">
            仕入れ見積書から自動で見積書を作成
          </p>
        </div>

        {/* ステップインジケーター */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step === 'upload' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              <Upload size={20} />
            </div>
            <div className="w-16 h-1 bg-gray-300"></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step === 'edit' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              <Calculator size={20} />
            </div>
            <div className="w-16 h-1 bg-gray-300"></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step === 'complete' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              <Download size={20} />
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {step === 'upload' && (
            <div className="text-center">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 mb-6">
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  仕入れ見積書PDFをアップロード
                </h3>
                <p className="text-gray-500 mb-6">
                  PDFファイルをドラッグ&ドロップまたはクリックして選択
                </p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={isProcessing}
                />
                <label
                  htmlFor="file-upload"
                  className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white ${
                    isProcessing 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                  } transition-colors`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      処理中...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2" size={20} />
                      ファイルを選択
                    </>
                  )}
                </label>
              </div>
            </div>
          )}

          {step === 'edit' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">見積書編集</h2>
              
              {/* 顧客名入力 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  お客様名
                </label>
                <input
                  type="text"
                  value={estimateData.customerName}
                  onChange={(e) => setEstimateData(prev => ({ ...prev, customerName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="お客様名を入力してください"
                />
              </div>

              {/* 項目一覧 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">見積項目</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">項目名</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">数量</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">原価</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">販売価格</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">小計</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estimateData.items.map((item) => (
                        <tr key={item.id}>
                          <td className="border border-gray-300 px-4 py-2">{item.itemName}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right">
                            ¥{item.unitCost.toLocaleString()}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateItemPrice(item.id, Number(e.target.value))}
                              className="w-full text-right border-none focus:outline-none"
                            />
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right">
                            ¥{(item.quantity * item.unitPrice).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 合計表示 */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">総原価</p>
                    <p className="text-lg font-semibold">¥{totalCost.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">総販売価格</p>
                    <p className="text-lg font-semibold">¥{totalPrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">利益</p>
                    <p className="text-lg font-semibold text-green-600">¥{profit.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">利益率</p>
                    <p className="text-lg font-semibold text-blue-600">{profitMargin.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              {/* アクションボタン */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setStep('upload')}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  戻る
                </button>
                <button
                  onClick={generatePDF}
                  disabled={!estimateData.customerName || isProcessing}
                  className={`flex-1 px-6 py-3 rounded-md text-white transition-colors ${
                    !estimateData.customerName || isProcessing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin mr-2 inline" size={20} />
                      PDF生成中...
                    </>
                  ) : (
                    'PDF生成'
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'complete' && (
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download size={32} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">見積書完成！</h2>
                <p className="text-gray-600">
                  見積書のPDFが生成されました
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    // TODO: PDF ダウンロード機能
                    alert('PDF ダウンロード機能は実装中です')
                  }}
                  className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  PDFダウンロード
                </button>
                <button
                  onClick={() => {
                    setStep('upload')
                    setEstimateData({ customerName: '', items: [] })
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  新しい見積書を作成
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

