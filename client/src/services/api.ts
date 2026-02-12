import axios, { AxiosResponse } from 'axios';
import { ApiResponse, UoM, SKU, BOM, ManufacturingOrder, MaterialConsumption, CreateUoMRequest, UpdateUoMRequest, CreateSKURequest, UpdateSKURequest, CreateBOMRequest, UpdateBOMRequest, CreateMORequest, UpdateMORequest, CreateConsumptionRequest, UpdateConsumptionRequest } from '../types';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Generic API methods
const handleApiResponse = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
  if (response.data.success) {
    return response.data.data as T;
  }
  throw new Error(response.data.message || 'API request failed');
};

// UoM API
export const uomApi = {
  getAll: (): Promise<UoM[]> => 
    api.get('/uom').then(response => handleApiResponse(response)),
  
  getById: (id: number): Promise<UoM> => 
    api.get(`/uom/${id}`).then(response => handleApiResponse(response)),
  
  create: (data: CreateUoMRequest): Promise<UoM> => 
    api.post('/uom', data).then(response => handleApiResponse(response)),
  
  update: (id: number, data: UpdateUoMRequest): Promise<UoM> => 
    api.put(`/uom/${id}`, data).then(response => handleApiResponse(response)),
  
  delete: (id: number): Promise<void> => 
    api.delete(`/uom/${id}`).then(() => undefined),
};

// SKU API
export const skuApi = {
  getAll: (includeInactive = false): Promise<SKU[]> => 
    api.get(`/sku?includeInactive=${includeInactive}`).then(response => handleApiResponse(response)),
  
  getById: (id: number): Promise<SKU> => 
    api.get(`/sku/${id}`).then(response => handleApiResponse(response)),
  
  getByType: (type: string): Promise<SKU[]> => 
    api.get(`/sku/type/${type}`).then(response => handleApiResponse(response)),
  
  create: (data: CreateSKURequest): Promise<SKU> => 
    api.post('/sku', data).then(response => handleApiResponse(response)),
  
  update: (id: number, data: UpdateSKURequest): Promise<SKU> => 
    api.put(`/sku/${id}`, data).then(response => handleApiResponse(response)),
  
  delete: (id: number): Promise<void> => 
    api.delete(`/sku/${id}`).then(() => undefined),
  
  hardDelete: (id: number): Promise<void> => 
    api.delete(`/sku/${id}/hard`).then(() => undefined),
};

// BOM API
export const bomApi = {
  getByFG: (fgSkuId: number, includeInactive = false): Promise<BOM[]> => 
    api.get(`/bom/fg/${fgSkuId}?includeInactive=${includeInactive}`).then(response => handleApiResponse(response)),
  
  getById: (id: number): Promise<BOM> => 
    api.get(`/bom/${id}`).then(response => handleApiResponse(response)),
  
  create: (data: CreateBOMRequest): Promise<BOM> => 
    api.post('/bom', data).then(response => handleApiResponse(response)),
  
  update: (id: number, data: UpdateBOMRequest): Promise<BOM> => 
    api.put(`/bom/${id}`, data).then(response => handleApiResponse(response)),
  
  delete: (id: number): Promise<void> => 
    api.delete(`/bom/${id}`).then(() => undefined),
  
  hardDelete: (id: number): Promise<void> => 
    api.delete(`/bom/${id}/hard`).then(() => undefined),
};

// Manufacturing Order API
export const moApi = {
  getAll: (status?: string): Promise<ManufacturingOrder[]> => 
    api.get(`/manufacturing-order${status ? `?status=${status}` : ''}`).then(response => handleApiResponse(response)),
  
  getById: (id: number): Promise<ManufacturingOrder> => 
    api.get(`/manufacturing-order/${id}`).then(response => handleApiResponse(response)),
  
  getBOMMaterials: (id: number): Promise<BOM[]> => 
    api.get(`/manufacturing-order/${id}/bom`).then(response => handleApiResponse(response)),
  
  getConsumption: (id: number): Promise<MaterialConsumption[]> => 
    api.get(`/manufacturing-order/${id}/consumption`).then(response => handleApiResponse(response)),
  
  create: (data: CreateMORequest): Promise<ManufacturingOrder> => 
    api.post('/manufacturing-order', data).then(response => handleApiResponse(response)),
  
  update: (id: number, data: UpdateMORequest): Promise<ManufacturingOrder> => 
    api.put(`/manufacturing-order/${id}`, data).then(response => handleApiResponse(response)),
  
  startProduction: (id: number): Promise<ManufacturingOrder> => 
    api.post(`/manufacturing-order/${id}/start`).then(response => handleApiResponse(response)),
  
  completeProduction: (id: number): Promise<ManufacturingOrder> => 
    api.post(`/manufacturing-order/${id}/complete`).then(response => handleApiResponse(response)),
  
  cancel: (id: number): Promise<ManufacturingOrder> => 
    api.post(`/manufacturing-order/${id}/cancel`).then(response => handleApiResponse(response)),
  
  delete: (id: number): Promise<void> => 
    api.delete(`/manufacturing-order/${id}`).then(() => undefined),
};

// Material Consumption API
export const consumptionApi = {
  getAll: (): Promise<MaterialConsumption[]> => 
    api.get('/consumption').then(response => handleApiResponse(response)),
  
  getByMO: (moId: number): Promise<MaterialConsumption[]> => 
    api.get(`/consumption/mo/${moId}`).then(response => handleApiResponse(response)),
  
  getByMaterial: (rawSkuId: number): Promise<MaterialConsumption[]> => 
    api.get(`/consumption/material/${rawSkuId}`).then(response => handleApiResponse(response)),
  
  getSummary: (moId: number): Promise<any[]> => 
    api.get(`/consumption/summary/mo/${moId}`).then(response => handleApiResponse(response)),
  
  getById: (id: number): Promise<MaterialConsumption> => 
    api.get(`/consumption/${id}`).then(response => handleApiResponse(response)),
  
  create: (data: CreateConsumptionRequest): Promise<MaterialConsumption> => 
    api.post('/consumption', data).then(response => handleApiResponse(response)),
  
  update: (id: number, data: UpdateConsumptionRequest): Promise<MaterialConsumption> => 
    api.put(`/consumption/${id}`, data).then(response => handleApiResponse(response)),
  
  delete: (id: number): Promise<void> => 
    api.delete(`/consumption/${id}`).then(() => undefined),
};

export default api;


