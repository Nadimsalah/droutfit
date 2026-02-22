import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export const generateInvoicePDF = async (data: any) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width

    try {
        // Render Logo
        const logoUrl = "https://dvbuiiaymvynzwecefup.supabase.co/storage/v1/object/public/listing-images/logo-black.png"
        try {
            doc.addImage(logoUrl, 'PNG', 15, 12, 35, 10)
        } catch (e) {
            // Fallback to text if logo fails to load
            doc.setFontSize(22)
            doc.setTextColor(59, 130, 246)
            doc.setFont('helvetica', 'bold')
            doc.text('DROUTFIT', 15, 20)
        }

        // Header Info
        doc.setFontSize(10)
        doc.setTextColor(100)
        doc.setFont('helvetica', 'normal')
        doc.text('PRO MERCHANT BILLING', pageWidth - 15, 15, { align: 'right' })
        doc.text('billing@droutfit.ai', pageWidth - 15, 20, { align: 'right' })
        doc.text('droutfit.ai', pageWidth - 15, 25, { align: 'right' })

        // Invoice Title
        doc.setFontSize(24)
        doc.setTextColor(0)
        doc.text('INVOICE', 15, 50)

        // Billed To & Invoice Details
        doc.setFontSize(10)
        doc.setTextColor(100)
        doc.text('BILLED TO', 15, 65)
        doc.text('INVOICE DETAILS', 120, 65)

        doc.setFontSize(11)
        doc.setTextColor(0)
        doc.text(data.user.full_name || 'Valued Merchant', 15, 72)
        doc.text(data.user.store_name || 'Independent Store', 15, 77)

        doc.setFontSize(10)
        doc.setTextColor(100)
        doc.text('Invoice #:', 120, 72)
        doc.text('Date:', 120, 77)
        doc.text('Status:', 120, 82)

        doc.setTextColor(0)
        doc.text(data.id.substring(0, 8).toUpperCase(), 150, 72)
        doc.text(new Date(data.created_at).toLocaleDateString(), 150, 77)
        doc.text(data.status.toUpperCase(), 150, 82)

        // Table
        const tableBody = [
            [data.description, '1', `$${parseFloat(data.amount).toFixed(2)}`, `$${parseFloat(data.amount).toFixed(2)}`]
        ]

        autoTable(doc, {
            startY: 95,
            head: [['Description', 'Qty', 'Unit Price', 'Total']],
            body: tableBody,
            headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
            bodyStyles: { textColor: 50 },
            alternateRowStyles: { fillColor: [245, 247, 250] },
            margin: { left: 15, right: 15 },
        })

        // Totals
        // @ts-ignore
        const finalY = doc.lastAutoTable.finalY + 10
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('Total Amount Paid:', 120, finalY + 5)
        doc.setFontSize(16)
        doc.setTextColor(59, 130, 246)
        doc.text(`$${data.amount.toFixed(2)}`, pageWidth - 15, finalY + 5, { align: 'right' })

        // Footer
        doc.setFontSize(10)
        doc.setTextColor(150)
        doc.setFont('helvetica', 'normal')
        const footerY = doc.internal.pageSize.height - 20
        doc.text('Thank you for choosing Droutfit AI.', pageWidth / 2, footerY, { align: 'center' })
        doc.text('This is a computer-generated invoice and does not require a signature.', pageWidth / 2, footerY + 5, { align: 'center' })

        // Save
        doc.save(`Invoice-Droutfit-${data.id.substring(0, 8)}.pdf`)

    } catch (error) {
        console.error('PDF Generation failed', error)
        throw error
    }
}
