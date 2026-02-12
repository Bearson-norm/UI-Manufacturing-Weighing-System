import React from 'react';
import { CheckCircle } from 'lucide-react';
import { ProductionMaterial } from '../../types';

interface MaterialListProps {
  materials: ProductionMaterial[];
  currentIndex: number;
  isActive: boolean;
}

const MaterialList: React.FC<MaterialListProps> = ({
  materials,
  currentIndex,
  isActive,
}) => {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Daftar Bahan Baku</h3>
      </div>
      <div className="card-content">
        <div className="space-y-3">
          {materials.map((material, idx) => (
            <div
              key={material.raw_sku_id}
              className={`p-4 rounded-lg border-2 ${
                idx === currentIndex && isActive
                  ? 'border-primary-500 bg-primary-50'
                  : material.actual > 0
                  ? 'border-success-300 bg-success-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-semibold">{material.name}</div>
                {material.actual > 0 && (
                  <CheckCircle className="w-5 h-5 text-success-600" />
                )}
              </div>
              <div className="text-sm text-gray-600">
                Target: {material.target} {material.uom}
              </div>
              {material.actual > 0 && (
                <div className="text-sm font-semibold text-success-600 mt-1">
                  Aktual: {material.actual.toFixed(3)} {material.uom}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MaterialList;


