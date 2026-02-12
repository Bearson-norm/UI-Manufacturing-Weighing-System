import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { PlayCircle, CheckCircle, Scale, Printer } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { moApi, consumptionApi } from '../../services/api';
import { ManufacturingOrder, ProductionMaterial } from '../../types';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Badge from '../ui/Badge';
import DigitalScale from '../production/DigitalScale';
import PrintPreview from '../production/PrintPreview';
import MaterialList from '../production/MaterialList';

const ProductionTab: React.FC = () => {
  const { state, dispatch } = useApp();
  const queryClient = useQueryClient();
  const [selectedMO, setSelectedMO] = useState<number | null>(state.production.selectedMO);

  // Fetch Manufacturing Orders
  const { data: moList = [], isLoading: moLoading } = useQuery(
    'manufacturing-orders',
    () => moApi.getAll(),
    {
      select: (data) => data.filter((mo: ManufacturingOrder) => mo.mo_status !== 'Cancelled'),
    }
  );

  // Fetch BOM materials for selected MO
  const { data: bomMaterials = [] } = useQuery(
    ['bom-materials', selectedMO],
    () => selectedMO ? moApi.getBOMMaterials(selectedMO) : Promise.resolve([]),
    {
      enabled: !!selectedMO,
    }
  );

  // Fetch consumption data for selected MO
  const { data: consumptionData = [] } = useQuery(
    ['consumption', selectedMO],
    () => selectedMO ? moApi.getConsumption(selectedMO) : Promise.resolve([]),
    {
      enabled: !!selectedMO,
    }
  );

  // Start production mutation
  const startProductionMutation = useMutation(
    (moId: number) => moApi.startProduction(moId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('manufacturing-orders');
        dispatch({ type: 'SET_IS_ACTIVE', payload: true });
      },
    }
  );

  // Complete production mutation
  const completeProductionMutation = useMutation(
    (moId: number) => moApi.completeProduction(moId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('manufacturing-orders');
        dispatch({ type: 'RESET_PRODUCTION' });
        setSelectedMO(null);
      },
    }
  );

  // Add consumption mutation
  const addConsumptionMutation = useMutation(
    (data: { mo_id: number; raw_sku_id: number; consumed_qty: number; uom_id: number }) =>
      consumptionApi.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['consumption', selectedMO]);
        queryClient.invalidateQueries('manufacturing-orders');
      },
    }
  );

  const activeMO = selectedMO ? moList.find((mo: ManufacturingOrder) => mo.mo_id === selectedMO) : null;

  // Prepare materials for production
  const productionMaterials: ProductionMaterial[] = bomMaterials.map((bom: any) => {
    const consumption = consumptionData.find((c: any) => c.raw_sku_id === bom.raw_sku_id);
    const totalConsumed = consumptionData
      .filter((c: any) => c.raw_sku_id === bom.raw_sku_id)
      .reduce((sum: number, c: any) => sum + c.consumed_qty, 0);

    return {
      raw_sku_id: bom.raw_sku_id,
      name: bom.raw_sku_name,
      target: (bom.quantity * (activeMO?.planned_qty || 0)).toFixed(3),
      actual: totalConsumed,
      uom: bom.uom_code,
      uom_id: bom.uom_id,
    };
  });

  const currentMaterial = activeMO?.mo_status === 'In Progress' 
    ? productionMaterials[state.production.currentMaterialIndex] 
    : null;

  const handleMOChange = (moId: string) => {
    const id = moId ? parseInt(moId) : null;
    setSelectedMO(id);
    dispatch({ type: 'SET_SELECTED_MO', payload: id });
  };

  const handleStartProduction = () => {
    if (selectedMO) {
      startProductionMutation.mutate(selectedMO);
    }
  };

  const handleCompleteProduction = () => {
    if (selectedMO) {
      completeProductionMutation.mutate(selectedMO);
    }
  };

  const handleWeightCapture = (weight: number) => {
    if (!currentMaterial || !selectedMO) return;

    addConsumptionMutation.mutate({
      mo_id: selectedMO,
      raw_sku_id: currentMaterial.raw_sku_id,
      consumed_qty: weight,
      uom_id: currentMaterial.uom_id,
    });

    dispatch({
      type: 'ADD_CAPTURED_WEIGHT',
      payload: { material: currentMaterial.name, weight },
    });

    // Move to next material
    if (state.production.currentMaterialIndex < productionMaterials.length - 1) {
      dispatch({
        type: 'SET_CURRENT_MATERIAL_INDEX',
        payload: state.production.currentMaterialIndex + 1,
      });
    }
  };

  const moOptions = moList.map((mo: ManufacturingOrder) => ({
    value: mo.mo_id.toString(),
    label: `${mo.mo_code} - ${mo.sku_name} (${mo.mo_status})`,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* MO Selection and Controls */}
      <div className="space-y-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-primary-600" />
              Pilih Manufacturing Order
            </h3>
          </div>
          <div className="card-content space-y-4">
            <Select
              label="Manufacturing Order"
              value={selectedMO?.toString() || ''}
              onChange={(e) => handleMOChange(e.target.value)}
              options={moOptions}
              placeholder="-- Pilih MO --"
              disabled={moLoading}
            />

            {activeMO && (
              <>
                <div className="bg-primary-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-2">Status</div>
                  <Badge
                    variant={
                      activeMO.mo_status === 'Draft' ? 'default' :
                      activeMO.mo_status === 'In Progress' ? 'warning' :
                      'success'
                    }
                  >
                    {activeMO.mo_status}
                  </Badge>
                </div>

                {activeMO.mo_status === 'Draft' && (
                  <Button
                    onClick={handleStartProduction}
                    loading={startProductionMutation.isLoading}
                    className="w-full"
                    leftIcon={<PlayCircle className="w-5 h-5" />}
                  >
                    Mulai Produksi
                  </Button>
                )}

                {activeMO.mo_status === 'In Progress' && (
                  <Button
                    onClick={handleCompleteProduction}
                    loading={completeProductionMutation.isLoading}
                    variant="success"
                    className="w-full"
                    leftIcon={<CheckCircle className="w-5 h-5" />}
                  >
                    Selesaikan MO
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Material List */}
        {selectedMO && productionMaterials.length > 0 && (
          <MaterialList
            materials={productionMaterials}
            currentIndex={state.production.currentMaterialIndex}
            isActive={activeMO?.mo_status === 'In Progress'}
          />
        )}
      </div>

      {/* Digital Scale */}
      <div>
        <DigitalScale
          onWeightCapture={handleWeightCapture}
          currentMaterial={currentMaterial}
          isActive={activeMO?.mo_status === 'In Progress'}
        />
      </div>

      {/* Print Preview */}
      <div>
        {selectedMO && productionMaterials.length > 0 && activeMO && (
          <PrintPreview
            mo={activeMO}
            materials={productionMaterials}
            onPrint={() => console.log('Printing...')}
          />
        )}
      </div>
    </div>
  );
};

export default ProductionTab;


