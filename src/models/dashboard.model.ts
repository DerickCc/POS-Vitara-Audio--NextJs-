export interface OverviewMetricsResult {
  newCustomers: number;
  newProducts: number;
  totalSales: number;
  onGoingPo: number;
}

export interface IncompletePaymentModel {
  soId: string;
  soCode: string;
  customerName: string;
  grandTotal: number;
  paidAmount: number;
}

export interface LowStockProductModel {
  id: string;
  name: string;
  stock: number;
  uom: string;
}

export interface TopProfitGeneratingProductModel {
  label: string; // productName
  itemSold: number;
  totalProfit: number;
  uom: string;
}