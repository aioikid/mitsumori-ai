import jsPDF from 'jspdf'

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

export class PDFGenerator {
  private doc: jsPDF

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
  }

  generateEstimatePDF(data: EstimateData): Uint8Array {
    // 日本語フォントの設定（簡易版）
    this.doc.setFont('helvetica')
    
    // ヘッダー
    this.addHeader()
    
    // 顧客情報
    this.addCustomerInfo(data.customerName)
    
    // 見積項目テーブル
    this.addItemsTable(data.items)
    
    // 合計金額
    this.addTotals(data.items)
    
    // フッター
    this.addFooter()

    return new Uint8Array(this.doc.output('arraybuffer') as ArrayBuffer)
  }

  private addHeader() {
    // タイトル
    this.doc.setFontSize(20)
    this.doc.text('見積書', 105, 30, { align: 'center' })
    
    // 日付
    const today = new Date()
    const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`
    this.doc.setFontSize(12)
    this.doc.text(dateStr, 160, 50)
    
    // 見積番号
    const estimateNo = `EST-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}-${String(today.getHours()).padStart(2, '0')}${String(today.getMinutes()).padStart(2, '0')}`
    this.doc.text(`見積番号: ${estimateNo}`, 160, 60)
  }

  private addCustomerInfo(customerName: string) {
    this.doc.setFontSize(14)
    this.doc.text(`${customerName} 御中`, 20, 80)
    
    // 発行者情報
    this.doc.setFontSize(10)
    this.doc.text('発行者: mitsumori.AI', 20, 100)
    this.doc.text('下記の通りお見積もりいたします。', 20, 110)
  }

  private addItemsTable(items: EstimateItem[]) {
    const startY = 130
    const rowHeight = 10
    const colX = [20, 100, 120, 150, 180]

    // テーブルヘッダー
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'bold')
    
    const headers = ['項目名', '数量', '単価', '小計']
    headers.forEach((header, index) => {
      this.doc.text(header, colX[index], startY)
    })

    // ヘッダー下線
    this.doc.line(20, startY + 2, 200, startY + 2)

    // テーブル内容
    this.doc.setFont('helvetica', 'normal')
    items.forEach((item, index) => {
      const y = startY + (index + 1) * rowHeight + 5
      
      this.doc.text(item.itemName, colX[0], y)
      this.doc.text(item.quantity.toString(), colX[1], y)
      this.doc.text(`¥${item.unitPrice.toLocaleString()}`, colX[2], y)
      this.doc.text(`¥${(item.quantity * item.unitPrice).toLocaleString()}`, colX[3], y)
    })

    // テーブル下線
    const tableEndY = startY + (items.length + 1) * rowHeight + 5
    this.doc.line(20, tableEndY, 200, tableEndY)
  }

  private addTotals(items: EstimateItem[]) {
    const totalPrice = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    const tax = Math.floor(totalPrice * 0.1)
    const totalWithTax = totalPrice + tax

    const startY = 180 + items.length * 10

    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    
    this.doc.text('小計:', 140, startY)
    this.doc.text(`¥${totalPrice.toLocaleString()}`, 170, startY)
    
    this.doc.text('消費税(10%):', 140, startY + 10)
    this.doc.text(`¥${tax.toLocaleString()}`, 170, startY + 10)
    
    this.doc.text('合計:', 140, startY + 20)
    this.doc.text(`¥${totalWithTax.toLocaleString()}`, 170, startY + 20)

    // 合計下線
    this.doc.line(140, startY + 22, 200, startY + 22)
  }

  private addFooter() {
    this.doc.setFontSize(8)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text('本見積書は mitsumori.AI により自動生成されました。', 105, 280, { align: 'center' })
  }
}

// ブラウザ用のPDF生成関数
export function generateEstimatePDFInBrowser(data: EstimateData): void {
  const generator = new PDFGenerator()
  const pdfBytes = generator.generateEstimatePDF(data)
  
  // Blobを作成してダウンロード
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `見積書_${data.customerName}_${new Date().toISOString().split('T')[0]}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

