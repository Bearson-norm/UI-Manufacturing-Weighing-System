// Base API Response
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

// UoM (Unit of Measure)
export interface UoM {
  uom_id: number;
  uom_code: string;
  uom_name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUoMRequest {
  uom_code: string;
  uom_name: string;
}

export interface UpdateUoMRequest {
  uom_code?: string;
  uom_name?: string;
}

// SKU (Stock Keeping Unit)
export interface SKU {
  sku_id: number;
  sku_code: string;
  sku_name: string;
  sku_type: 'Raw Material' | 'Finished Goods' | 'Semi Finished Goods';
  base_uom_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  uom_code?: string;
  uom_name?: string;
}

export interface CreateSKURequest {
  sku_code: string;
  sku_name: string;
  sku_type: 'Raw Material' | 'Finished Goods' | 'Semi Finished Goods';
  base_uom_id: number;
}

export interface UpdateSKURequest {
  sku_code?: string;
  sku_name?: string;
  sku_type?: 'Raw Material' | 'Finished Goods' | 'Semi Finished Goods';
  base_uom_id?: number;
}

// BOM (Bill of Materials)
export interface BOM {
  bom_id: number;
  fg_sku_id: number;
  raw_sku_id: number;
  quantity: number;
  uom_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  fg_sku_code?: string;
  fg_sku_name?: string;
  raw_sku_code?: string;
  raw_sku_name?: string;
  uom_code?: string;
  uom_name?: string;
}

export interface CreateBOMRequest {
  fg_sku_id: number;
  raw_sku_id: number;
  quantity: number;
  uom_id: number;
}

export interface UpdateBOMRequest {
  raw_sku_id?: number;
  quantity?: number;
  uom_id?: number;
}

// Manufacturing Order
export interface ManufacturingOrder {
  mo_id: number;
  mo_code: string;
  fg_sku_id: number;
  planned_qty: number;
  produced_qty: number;
  uom_id: number;
  start_date?: string;
  end_date?: string;
  mo_status: 'Draft' | 'In Progress' | 'Completed' | 'Cancelled';
  created_at: string;
  updated_at: string;
  sku_code?: string;
  sku_name?: string;
  uom_code?: string;
  uom_name?: string;
}

export interface CreateMORequest {
  fg_sku_id: number;
  planned_qty: number;
  uom_id: number;
}

export interface UpdateMORequest {
  fg_sku_id?: number;
  planned_qty?: number;
  uom_id?: number;
}

// Material Consumption
export interface MaterialConsumption {
  consumption_id: number;
  mo_id: number;
  raw_sku_id: number;
  consumed_qty: number;
  uom_id: number;
  consumption_date: string;
  created_at: string;
  mo_code?: string;
  sku_code?: string;
  sku_name?: string;
  uom_code?: string;
  uom_name?: string;
}

export interface CreateConsumptionRequest {
  mo_id: number;
  raw_sku_id: number;
  consumed_qty: number;
  uom_id: number;
}

export interface UpdateConsumptionRequest {
  consumed_qty?: number;
  uom_id?: number;
}

// Production related types
export interface ProductionMaterial {
  raw_sku_id: number;
  name: string;
  target: string;
  actual: number;
  uom: string;
  uom_id: number;
}

export interface ProductionState {
  selectedMO: number | null;
  currentMaterialIndex: number;
  capturedWeights: Array<{ material: string; weight: number }>;
  isActive: boolean;
}

// UI State types
export interface TabConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface ModalState {
  isOpen: boolean;
  type: 'create' | 'edit' | 'delete' | null;
  data?: any;
}

// Form types
export interface FormErrors {
  [key: string]: string | undefined;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}


