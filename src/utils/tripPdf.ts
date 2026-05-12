import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Trip } from '@/types'

function fmt(val: string | null | undefined) {
  if (!val) return '—'
  return new Date(val).toLocaleString('es-PE')
}

function tempRange(min: number | null, max: number | null) {
  if (min === null && max === null) return 'N/A'
  const lo = min !== null ? `${min}°C` : '—'
  const hi = max !== null ? `${max}°C` : '—'
  return `${lo} / ${hi}`
}

export function generateTripPdf(trip: Trip) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const primaryColor: [number, number, number] = [37, 99, 235]
  const darkBg: [number, number, number] = [15, 23, 42]
  const white: [number, number, number] = [255, 255, 255]
  const lightGray: [number, number, number] = [241, 245, 249]
  const textDark: [number, number, number] = [15, 23, 42]

  const pageW = doc.internal.pageSize.getWidth()

  // Header background
  doc.setFillColor(...darkBg)
  doc.rect(0, 0, pageW, 40, 'F')

  // Logo area
  doc.setFillColor(...primaryColor)
  doc.roundedRect(14, 10, 20, 20, 3, 3, 'F')
  doc.setTextColor(...white)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('OT', 24, 23, { align: 'center' })

  // Title
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...white)
  doc.text('OmniTrack', 40, 19)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(148, 163, 184)
  doc.text('Fleet Intelligence Platform', 40, 26)

  // Report label (right side)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...white)
  doc.text('REPORTE DE VIAJE', pageW - 14, 19, { align: 'right' })
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(148, 163, 184)
  doc.text(`Generado: ${new Date().toLocaleString('es-PE')}`, pageW - 14, 26, { align: 'right' })

  let y = 50

  // Trip info section
  doc.setFillColor(...lightGray)
  doc.roundedRect(14, y, pageW - 28, 38, 3, 3, 'F')

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...textDark)
  doc.text(`Viaje #${trip.id}`, 20, y + 8)

  const statusColors: Record<string, [number, number, number]> = {
    COMPLETED: [16, 185, 129],
    IN_PROGRESS: [59, 130, 246],
    CANCELLED: [239, 68, 68],
    CREATED: [100, 116, 139],
  }
  const sc = statusColors[trip.status] ?? statusColors.CREATED
  doc.setFillColor(...sc)
  doc.roundedRect(pageW - 65, y + 3, 45, 8, 2, 2, 'F')
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...white)
  doc.text(trip.status.replace('_', ' '), pageW - 42.5, y + 8.5, { align: 'center' })

  const col1x = 20
  const col2x = pageW / 2

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text('Conductor', col1x, y + 18)
  doc.text('Punto de origen', col2x, y + 18)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...textDark)
  doc.text(trip.driverName || '—', col1x, y + 24)
  doc.text(trip.originPoint?.name || '—', col2x, y + 24)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text('Creado', col1x, y + 32)
  doc.text('Dirección de origen', col2x, y + 32)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...textDark)
  doc.text(fmt(trip.createdAt), col1x, y + 37)
  doc.text(trip.originPoint?.address || '—', col2x, y + 37)

  y += 48

  // Timeline section
  if (trip.startedAt || trip.completedAt) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...textDark)
    doc.text('Línea de tiempo', 14, y + 5)
    y += 10

    const timelineItems = [
      { label: 'Creado', value: fmt(trip.createdAt) },
      ...(trip.startedAt ? [{ label: 'Iniciado', value: fmt(trip.startedAt) }] : []),
      ...(trip.completedAt ? [{ label: 'Completado', value: fmt(trip.completedAt) }] : []),
    ]

    doc.setFillColor(...lightGray)
    doc.roundedRect(14, y, pageW - 28, timelineItems.length * 10 + 6, 3, 3, 'F')

    timelineItems.forEach((item, i) => {
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 116, 139)
      doc.text(item.label, 20, y + 8 + i * 10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...textDark)
      doc.text(item.value, 60, y + 8 + i * 10)
    })

    y += timelineItems.length * 10 + 14
  }

  // Delivery orders section
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...textDark)
  doc.text('Órdenes de Entrega', 14, y + 5)
  y += 10

  const orders = trip.deliveryOrders ?? []

  if (orders.length === 0) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(148, 163, 184)
    doc.text('Sin órdenes de entrega', 14, y + 6)
    y += 14
  } else {
    autoTable(doc, {
      startY: y,
      margin: { left: 14, right: 14 },
      head: [['#', 'Dirección', 'Email', 'Temperatura', 'Estado', 'Llegada']],
      body: orders.map(o => [
        String(o.sequenceOrder),
        o.address,
        o.clientEmail,
        tempRange(o.minTemperature, o.maxTemperature),
        o.status,
        fmt(o.arrivalAt),
      ]),
      headStyles: {
        fillColor: primaryColor,
        textColor: white,
        fontStyle: 'bold',
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: textDark,
      },
      alternateRowStyles: {
        fillColor: lightGray,
      },
      columnStyles: {
        0: { cellWidth: 10 },
        3: { cellWidth: 28 },
        4: { cellWidth: 22 },
        5: { cellWidth: 28 },
      },
      styles: { cellPadding: 3, lineColor: [226, 232, 240], lineWidth: 0.1 },
    })

    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 14
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  doc.line(14, footerY - 4, pageW - 14, footerY - 4)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(148, 163, 184)
  doc.text('OmniTrack — Fleet Intelligence Platform', 14, footerY)
  doc.text(`Página 1 | Viaje #${trip.id}`, pageW - 14, footerY, { align: 'right' })

  doc.save(`reporte-viaje-${trip.id}.pdf`)
}
