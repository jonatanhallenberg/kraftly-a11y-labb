/**
 * Effektiv status för en faktura.
 * 'Betald' -> 'Betald'
 * 'Obetald' med förfallodag före idag -> 'Förfallen'
 * 'Obetald' annars -> 'Obetald'
 */
export const invoiceStatus = (invoice, today = new Date()) => {
  if (invoice.status === 'Betald') return 'Betald'
  const due = new Date(invoice.due)
  return due < startOfDay(today) ? 'Förfallen' : 'Obetald'
}

/** Summa av obetalda (inkl. förfallna) fakturor */
export const unpaidTotal = (invoices) =>
  invoices.filter((i) => i.status !== 'Betald').reduce((sum, i) => sum + i.amount, 0)

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
