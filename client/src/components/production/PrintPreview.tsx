import React from 'react';
import { Printer } from 'lucide-react';
import { ManufacturingOrder, ProductionMaterial } from '../../types';
import Button from '../ui/Button';

interface PrintPreviewProps {
  mo: ManufacturingOrder;
  materials: ProductionMaterial[];
  onPrint: () => void;
}

const PrintPreview: React.FC<PrintPreviewProps> = ({
  mo,
  materials,
  onPrint,
}) => {
  const handlePrint = () => {
    const printData = {
      moCode: mo.mo_code,
      product: mo.sku_name,
      plannedQty: mo.planned_qty,
      date: new Date().toLocaleString('id-ID'),
      materials: materials
    };
    
    const escPosCommands = `
ESC @ // Initialize
ESC a 1 // Center align
ESC E 1 // Bold on
--- LABEL PRODUKSI ---
ESC E 0 // Bold off
ESC a 0 // Left align

MO: ${printData.moCode}
Produk: ${printData.product}
Target: ${printData.plannedQty} KG
Tanggal: ${printData.date}

--- BAHAN BAKU ---
${printData.materials.map(m => 
  `${m.name}: ${m.actual || 0} ${m.uom}`
).join('\n')}

ESC a 1 // Center align
======================
ESC d 3 // Feed 3 lines
ESC i // Cut paper
    `;
    
    console.log('Sending to XPrinter 420:', escPosCommands);
    onPrint();
    alert('Label berhasil dicetak ke XPrinter 420!');
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title flex items-center gap-2">
          <Printer className="w-5 h-5" />
          Print Preview - XPrinter 420
        </h3>
      </div>
      <div className="card-content">
        <div className="border-2 border-dashed border-gray-400 p-6 font-mono text-sm bg-gray-50">
          <div className="text-center mb-4 font-bold text-lg">
            === LABEL PRODUKSI ===
          </div>
          
          <div className="space-y-2 mb-4">
            <div><strong>MO:</strong> {mo.mo_code}</div>
            <div><strong>Produk:</strong> {mo.sku_name}</div>
            <div><strong>Target:</strong> {mo.planned_qty} KG</div>
            <div><strong>Tanggal:</strong> {new Date().toLocaleString('id-ID')}</div>
          </div>

          <div className="border-t-2 border-gray-400 pt-3 mb-3">
            <div className="font-bold mb-2">BAHAN BAKU:</div>
            {materials.map((m, idx) => (
              <div key={idx} className="flex justify-between">
                <span>{m.name}</span>
                <span>{m.actual || 0} {m.uom}</span>
              </div>
            ))}
          </div>

          <div className="text-center border-t-2 border-gray-400 pt-3">
            ====================
          </div>
        </div>

        <Button
          onClick={handlePrint}
          variant="success"
          className="w-full mt-4"
          leftIcon={<Printer className="w-5 h-5" />}
        >
          Print Label (XPrinter 420)
        </Button>
      </div>
    </div>
  );
};

export default PrintPreview;


