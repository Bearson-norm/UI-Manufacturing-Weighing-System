import React, { useState, useEffect } from 'react';
import { Scale, Printer, Package, ClipboardList, BarChart3, PlayCircle, CheckCircle, FileText, Plus, Save, Edit, Trash2, Settings, X } from 'lucide-react';

// Simulasi koneksi database
const useDatabase = () => {
  const [data, setData] = useState({
    uom: [
      { uom_id: 1, uom_code: 'KG', uom_name: 'Kilogram' },
      { uom_id: 2, uom_code: 'PC', uom_name: 'Pieces' },
      { uom_id: 3, uom_code: 'L', uom_name: 'Liter' },
      { uom_id: 4, uom_code: 'GR', uom_name: 'Gram' }
    ],
    sku: [
      { sku_id: 1, sku_code: 'RM-001', sku_name: 'Tepung Terigu', sku_type: 'Raw Material', base_uom_id: 1 },
      { sku_id: 2, sku_code: 'RM-002', sku_name: 'Gula Pasir', sku_type: 'Raw Material', base_uom_id: 1 },
      { sku_id: 3, sku_code: 'RM-003', sku_name: 'Telur', sku_type: 'Raw Material', base_uom_id: 2 },
      { sku_id: 4, sku_code: 'RM-004', sku_name: 'Mentega', sku_type: 'Raw Material', base_uom_id: 1 },
      { sku_id: 5, sku_code: 'FG-001', sku_name: 'Kue Kering Premium', sku_type: 'Finished Goods', base_uom_id: 1 },
      { sku_id: 6, sku_code: 'SFG-001', sku_name: 'Adonan Kue', sku_type: 'Semi Finished Goods', base_uom_id: 1 }
    ],
    bom: [
      { bom_id: 1, fg_sku_id: 5, raw_sku_id: 1, quantity: 2.5, uom_id: 1, is_active: true },
      { bom_id: 2, fg_sku_id: 5, raw_sku_id: 2, quantity: 1.0, uom_id: 1, is_active: true },
      { bom_id: 3, fg_sku_id: 5, raw_sku_id: 3, quantity: 10, uom_id: 2, is_active: true },
      { bom_id: 4, fg_sku_id: 5, raw_sku_id: 4, quantity: 0.5, uom_id: 1, is_active: true }
    ],
    mo: [
      { mo_id: 1, mo_code: 'MO-2025-0001', fg_sku_id: 5, planned_qty: 10, produced_qty: 0, uom_id: 1, start_date: null, mo_status: 'Draft' }
    ],
    consumption: []
  });

  return { data, setData };
};

// Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// SKU Management Component
const SKUManagement = ({ data, setData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSKU, setEditingSKU] = useState(null);
  const [formData, setFormData] = useState({
    sku_code: '',
    sku_name: '',
    sku_type: 'Raw Material',
    base_uom_id: 1
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingSKU) {
      setData(prev => ({
        ...prev,
        sku: prev.sku.map(s => s.sku_id === editingSKU.sku_id ? { ...s, ...formData } : s)
      }));
    } else {
      const newSKU = {
        sku_id: Math.max(...data.sku.map(s => s.sku_id), 0) + 1,
        ...formData
      };
      setData(prev => ({
        ...prev,
        sku: [...prev.sku, newSKU]
      }));
    }
    
    setIsModalOpen(false);
    setEditingSKU(null);
    setFormData({ sku_code: '', sku_name: '', sku_type: 'Raw Material', base_uom_id: 1 });
  };

  const handleEdit = (sku) => {
    setEditingSKU(sku);
    setFormData({
      sku_code: sku.sku_code,
      sku_name: sku.sku_name,
      sku_type: sku.sku_type,
      base_uom_id: sku.base_uom_id
    });
    setIsModalOpen(true);
  };

  const handleDelete = (skuId) => {
    if (confirm('Yakin ingin menghapus SKU ini?')) {
      setData(prev => ({
        ...prev,
        sku: prev.sku.filter(s => s.sku_id !== skuId)
      }));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Package className="w-6 h-6 text-blue-600" />
          Manajemen SKU
        </h2>
        <button
          onClick={() => {
            setEditingSKU(null);
            setFormData({ sku_code: '', sku_name: '', sku_type: 'Raw Material', base_uom_id: 1 });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Tambah SKU
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Kode</th>
              <th className="px-4 py-3 text-left">Nama</th>
              <th className="px-4 py-3 text-left">Tipe</th>
              <th className="px-4 py-3 text-left">UoM</th>
              <th className="px-4 py-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.sku.map(sku => {
              const uom = data.uom.find(u => u.uom_id === sku.base_uom_id);
              return (
                <tr key={sku.sku_id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold">{sku.sku_code}</td>
                  <td className="px-4 py-3">{sku.sku_name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      sku.sku_type === 'Raw Material' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {sku.sku_type}
                    </span>
                  </td>
                  <td className="px-4 py-3">{uom?.uom_code}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(sku)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(sku.sku_id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSKU ? 'Edit SKU' : 'Tambah SKU Baru'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Kode SKU</label>
            <input
              type="text"
              value={formData.sku_code}
              onChange={(e) => setFormData({...formData, sku_code: e.target.value})}
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Nama SKU</label>
            <input
              type="text"
              value={formData.sku_name}
              onChange={(e) => setFormData({...formData, sku_name: e.target.value})}
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Tipe</label>
            <select
              value={formData.sku_type}
              onChange={(e) => setFormData({...formData, sku_type: e.target.value})}
              className="w-full p-3 border rounded-lg"
            >
              <option value="Raw Material">Raw Material</option>
              <option value="Finished Goods">Finished Goods</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Unit of Measure</label>
            <select
              value={formData.base_uom_id}
              onChange={(e) => setFormData({...formData, base_uom_id: Number(e.target.value)})}
              className="w-full p-3 border rounded-lg"
            >
              {data.uom.map(uom => (
                <option key={uom.uom_id} value={uom.uom_id}>
                  {uom.uom_name} ({uom.uom_code})
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
            >
              {editingSKU ? 'Update' : 'Simpan'}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold"
            >
              Batal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// BOM Management Component
const BOMManagement = ({ data, setData }) => {
  const [selectedFG, setSelectedFG] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBOM, setEditingBOM] = useState(null);
  const [formData, setFormData] = useState({
    raw_sku_id: '',
    quantity: '',
    uom_id: 1
  });

  const finishedGoods = data.sku.filter(s => s.sku_type === 'Finished Goods');
  const rawMaterials = data.sku.filter(s => s.sku_type === 'Raw Material');
  const bomItems = selectedFG ? data.bom.filter(b => b.fg_sku_id === Number(selectedFG) && b.is_active) : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedFG) {
      alert('Pilih produk terlebih dahulu!');
      return;
    }

    if (editingBOM) {
      setData(prev => ({
        ...prev,
        bom: prev.bom.map(b => b.bom_id === editingBOM.bom_id ? { ...b, ...formData } : b)
      }));
    } else {
      const newBOM = {
        bom_id: Math.max(...data.bom.map(b => b.bom_id), 0) + 1,
        fg_sku_id: Number(selectedFG),
        ...formData,
        raw_sku_id: Number(formData.raw_sku_id),
        quantity: Number(formData.quantity),
        is_active: true
      };
      setData(prev => ({
        ...prev,
        bom: [...prev.bom, newBOM]
      }));
    }
    
    setIsModalOpen(false);
    setEditingBOM(null);
    setFormData({ raw_sku_id: '', quantity: '', uom_id: 1 });
  };

  const handleEdit = (bom) => {
    setEditingBOM(bom);
    setFormData({
      raw_sku_id: bom.raw_sku_id,
      quantity: bom.quantity,
      uom_id: bom.uom_id
    });
    setIsModalOpen(true);
  };

  const handleDelete = (bomId) => {
    if (confirm('Yakin ingin menghapus item BOM ini?')) {
      setData(prev => ({
        ...prev,
        bom: prev.bom.map(b => b.bom_id === bomId ? { ...b, is_active: false } : b)
      }));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600" />
          Manajemen Bill of Materials (BOM)
        </h2>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">Pilih Produk (Finished Goods)</label>
        <select
          value={selectedFG}
          onChange={(e) => setSelectedFG(e.target.value)}
          className="w-full p-3 border rounded-lg"
        >
          <option value="">-- Pilih Produk --</option>
          {finishedGoods.map(fg => (
            <option key={fg.sku_id} value={fg.sku_id}>
              {fg.sku_code} - {fg.sku_name}
            </option>
          ))}
        </select>
      </div>

      {selectedFG && (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                setEditingBOM(null);
                setFormData({ raw_sku_id: '', quantity: '', uom_id: 1 });
                setIsModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Tambah Bahan
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Bahan Baku</th>
                  <th className="px-4 py-3 text-left">Kuantitas</th>
                  <th className="px-4 py-3 text-left">UoM</th>
                  <th className="px-4 py-3 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {bomItems.map(bom => {
                  const material = data.sku.find(s => s.sku_id === bom.raw_sku_id);
                  const uom = data.uom.find(u => u.uom_id === bom.uom_id);
                  return (
                    <tr key={bom.bom_id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">{material?.sku_name}</td>
                      <td className="px-4 py-3 font-semibold">{bom.quantity}</td>
                      <td className="px-4 py-3">{uom?.uom_code}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(bom)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(bom.bom_id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {bomItems.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                      Belum ada bahan baku untuk produk ini
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBOM ? 'Edit BOM Item' : 'Tambah Bahan Baku'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Bahan Baku</label>
            <select
              value={formData.raw_sku_id}
              onChange={(e) => setFormData({...formData, raw_sku_id: e.target.value})}
              className="w-full p-3 border rounded-lg"
              required
            >
              <option value="">-- Pilih Bahan Baku --</option>
              {rawMaterials.map(rm => (
                <option key={rm.sku_id} value={rm.sku_id}>
                  {rm.sku_code} - {rm.sku_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Kuantitas (per 1 unit produk)</label>
            <input
              type="number"
              step="0.0001"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Unit of Measure</label>
            <select
              value={formData.uom_id}
              onChange={(e) => setFormData({...formData, uom_id: Number(e.target.value)})}
              className="w-full p-3 border rounded-lg"
            >
              {data.uom.map(uom => (
                <option key={uom.uom_id} value={uom.uom_id}>
                  {uom.uom_name} ({uom.uom_code})
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
            >
              {editingBOM ? 'Update' : 'Simpan'}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold"
            >
              Batal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// MO Management Component
const MOManagement = ({ data, setData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fg_sku_id: '',
    planned_qty: '',
    uom_id: 1
  });

  const finishedGoods = data.sku.filter(s => s.sku_type === 'Finished Goods');

  const generateMOCode = () => {
    const year = new Date().getFullYear();
    const lastMO = data.mo.length > 0 ? Math.max(...data.mo.map(m => {
      const match = m.mo_code.match(/MO-\d+-(\d+)/);
      return match ? parseInt(match[1]) : 0;
    })) : 0;
    const nextNum = String(lastMO + 1).padStart(4, '0');
    return `MO-${year}-${nextNum}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newMO = {
      mo_id: Math.max(...data.mo.map(m => m.mo_id), 0) + 1,
      mo_code: generateMOCode(),
      fg_sku_id: Number(formData.fg_sku_id),
      planned_qty: Number(formData.planned_qty),
      produced_qty: 0,
      uom_id: Number(formData.uom_id),
      start_date: null,
      mo_status: 'Draft'
    };
    
    setData(prev => ({
      ...prev,
      mo: [...prev.mo, newMO]
    }));
    
    setIsModalOpen(false);
    setFormData({ fg_sku_id: '', planned_qty: '', uom_id: 1 });
  };

  const handleDelete = (moId) => {
    const mo = data.mo.find(m => m.mo_id === moId);
    if (mo.mo_status !== 'Draft') {
      alert('Hanya MO dengan status Draft yang dapat dihapus!');
      return;
    }
    
    if (confirm('Yakin ingin menghapus MO ini?')) {
      setData(prev => ({
        ...prev,
        mo: prev.mo.filter(m => m.mo_id !== moId),
        consumption: prev.consumption.filter(c => c.mo_id !== moId)
      }));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-blue-600" />
          Manajemen Manufacturing Order
        </h2>
        <button
          onClick={() => {
            setFormData({ fg_sku_id: '', planned_qty: '', uom_id: 1 });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Buat MO Baru
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Kode MO</th>
              <th className="px-4 py-3 text-left">Produk</th>
              <th className="px-4 py-3 text-left">Target</th>
              <th className="px-4 py-3 text-left">Aktual</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.mo.map(mo => {
              const product = data.sku.find(s => s.sku_id === mo.fg_sku_id);
              const uom = data.uom.find(u => u.uom_id === mo.uom_id);
              return (
                <tr key={mo.mo_id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold">{mo.mo_code}</td>
                  <td className="px-4 py-3">{product?.sku_name}</td>
                  <td className="px-4 py-3">{mo.planned_qty} {uom?.uom_code}</td>
                  <td className="px-4 py-3">{mo.produced_qty} {uom?.uom_code}</td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      mo.mo_status === 'Draft' ? 'bg-gray-200 text-gray-700' :
                      mo.mo_status === 'In Progress' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-green-200 text-green-800'
                    }`}>
                      {mo.mo_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {mo.mo_status === 'Draft' && (
                      <button
                        onClick={() => handleDelete(mo.mo_id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Manufacturing Order Baru">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <div className="text-sm text-gray-600">Kode MO yang akan dibuat:</div>
            <div className="text-xl font-bold text-blue-600">{generateMOCode()}</div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Produk (Finished Goods)</label>
            <select
              value={formData.fg_sku_id}
              onChange={(e) => setFormData({...formData, fg_sku_id: e.target.value})}
              className="w-full p-3 border rounded-lg"
              required
            >
              <option value="">-- Pilih Produk --</option>
              {finishedGoods.map(fg => (
                <option key={fg.sku_id} value={fg.sku_id}>
                  {fg.sku_code} - {fg.sku_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Kuantitas Target</label>
            <input
              type="number"
              step="0.0001"
              value={formData.planned_qty}
              onChange={(e) => setFormData({...formData, planned_qty: e.target.value})}
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Unit of Measure</label>
            <select
              value={formData.uom_id}
              onChange={(e) => setFormData({...formData, uom_id: Number(e.target.value)})}
              className="w-full p-3 border rounded-lg"
            >
              {data.uom.map(uom => (
                <option key={uom.uom_id} value={uom.uom_id}>
                  {uom.uom_name} ({uom.uom_code})
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
            >
              Buat MO
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold"
            >
              Batal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// Komponen Timbangan Digital
const DigitalScale = ({ onWeightCapture, currentMaterial, isActive }) => {
  const [weight, setWeight] = useState(0);
  const [isStable, setIsStable] = useState(false);

  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      const randomWeight = (Math.random() * 5 + 0.1).toFixed(3);
      setWeight(parseFloat(randomWeight));
      
      setTimeout(() => setIsStable(true), 2000);
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, currentMaterial]);

  const handleCapture = () => {
    if (isStable && weight > 0) {
      onWeightCapture(weight);
      setIsStable(false);
    }
  };

  return (
    <div className="bg-gray-800 text-white rounded-lg p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Scale className="w-6 h-6 text-blue-400" />
          <h3 className="text-lg font-semibold">Timbangan Digital</h3>
        </div>
        <div className={`w-3 h-3 rounded-full ${isStable ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
      </div>

      {currentMaterial ? (
        <>
          <div className="bg-gray-900 rounded p-4 mb-4">
            <div className="text-sm text-gray-400 mb-1">Material Saat Ini:</div>
            <div className="text-lg font-semibold">{currentMaterial.name}</div>
            <div className="text-sm text-blue-400">Target: {currentMaterial.target} {currentMaterial.uom}</div>
          </div>

          <div className="bg-black rounded-lg p-8 mb-4 text-center">
            <div className="text-6xl font-bold font-mono text-green-400">
              {weight.toFixed(3)}
            </div>
            <div className="text-2xl text-gray-400 mt-2">{currentMaterial.uom}</div>
          </div>

          <button
            onClick={handleCapture}
            disabled={!isStable || weight === 0}
            className={`w-full py-3 rounded-lg font-semibold transition-all ${
              isStable && weight > 0
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isStable ? 'Simpan Berat' : 'Menunggu Stabil...'}
          </button>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Scale className="w-16 h-16 mx-auto mb-3 opacity-50" />
          <p>Pilih MO dan mulai produksi untuk mengaktifkan timbangan</p>
        </div>
      )}
    </div>
  );
};

// Komponen Print Preview
const PrintPreview = ({ mo, materials, onPrint }) => {
  const generatePrintData = () => {
    const date = new Date().toLocaleString('id-ID');
    return {
      moCode: mo.mo_code,
      product: mo.product_name,
      plannedQty: mo.planned_qty,
      date: date,
      materials: materials
    };
  };

  const handlePrint = () => {
    const printData = generatePrintData();
    
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
    <div className="bg-white rounded-lg p-6 shadow-lg border-2 border-gray-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Printer className="w-5 h-5" />
          Print Preview - XPrinter 420
        </h3>
      </div>

      <div className="border-2 border-dashed border-gray-400 p-6 font-mono text-sm bg-gray-50">
        <div className="text-center mb-4 font-bold text-lg">
          === LABEL PRODUKSI ===
        </div>
        
        <div className="space-y-2 mb-4">
          <div><strong>MO:</strong> {mo.mo_code}</div>
          <div><strong>Produk:</strong> {mo.product_name}</div>
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

      <button
        onClick={handlePrint}
        className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
      >
        <Printer className="w-5 h-5" />
        Print Label (XPrinter 420)
      </button>
    </div>
  );
};

// Komponen Utama
const ManufacturingSystem = () => {
  const { data, setData } = useDatabase();
  const [selectedMO, setSelectedMO] = useState(null);
  const [currentMaterialIndex, setCurrentMaterialIndex] = useState(0);
  const [capturedWeights, setCapturedWeights] = useState([]);
  const [activeTab, setActiveTab] = useState('production');

  const activeMO = selectedMO ? data.mo.find(m => m.mo_id === selectedMO) : null;
  
  const getMaterialsForMO = (moId) => {
    if (!moId) return [];
    const mo = data.mo.find(m => m.mo_id === moId);
    if (!mo) return [];

    const bomItems = data.bom.filter(b => b.fg_sku_id === mo.fg_sku_id && b.is_active);
    
    return bomItems.map(bom => {
      const rawMaterial = data.sku.find(s => s.sku_id === bom.raw_sku_id);
      const uom = data.uom.find(u => u.uom_id === bom.uom_id);
      const consumption = data.consumption.find(c => 
        c.mo_id === moId && c.raw_sku_id === bom.raw_sku_id
      );
      
      return {
        raw_sku_id: bom.raw_sku_id,
        name: rawMaterial?.sku_name || '',
        target: (bom.quantity * mo.planned_qty).toFixed(3),
        actual: consumption?.consumed_qty || 0,
        uom: uom?.uom_code || '',
        uom_id: bom.uom_id
      };
    });
  };

  const currentMaterial = activeMO && activeMO.mo_status === 'In Progress' 
    ? getMaterialsForMO(selectedMO)[currentMaterialIndex] 
    : null;

  const handleStartProduction = () => {
    if (!selectedMO) return;
    
    setData(prev => ({
      ...prev,
      mo: prev.mo.map(m => 
        m.mo_id === selectedMO 
          ? { ...m, mo_status: 'In Progress', start_date: new Date().toISOString() }
          : m
      )
    }));
    setCapturedWeights([]);
    setCurrentMaterialIndex(0);
  };

  const handleWeightCapture = (weight) => {
    if (!currentMaterial) return;

    const newConsumption = {
      consumption_id: data.consumption.length + 1,
      mo_id: selectedMO,
      raw_sku_id: currentMaterial.raw_sku_id,
      consumed_qty: weight,
      uom_id: currentMaterial.uom_id,
      consumption_date: new Date().toISOString()
    };

    setData(prev => ({
      ...prev,
      consumption: [...prev.consumption, newConsumption]
    }));

    setCapturedWeights([...capturedWeights, { material: currentMaterial.name, weight }]);

    const materials = getMaterialsForMO(selectedMO);
    if (currentMaterialIndex < materials.length - 1) {
      setCurrentMaterialIndex(currentMaterialIndex + 1);
    }
  };

  const handleCompleteMO = () => {
    if (!selectedMO) return;
    
    setData(prev => ({
      ...prev,
      mo: prev.mo.map(m => 
        m.mo_id === selectedMO 
          ? { ...m, mo_status: 'Completed', produced_qty: m.planned_qty }
          : m
      )
    }));
  };

  const materials = selectedMO ? getMaterialsForMO(selectedMO) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Package className="w-8 h-8 text-blue-600" />
                Sistem Manajemen Manufacturing Order
              </h1>
              <p className="text-gray-600 mt-1">Terintegrasi dengan Timbangan & XPrinter 420</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Tanggal</div>
              <div className="text-lg font-semibold">{new Date().toLocaleDateString('id-ID')}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'production', label: 'Produksi', icon: PlayCircle },
            { id: 'mo', label: 'Kelola MO', icon: ClipboardList },
            { id: 'sku', label: 'Kelola SKU', icon: Package },
            { id: 'bom', label: 'Kelola BOM', icon: Settings },
            { id: 'monitor', label: 'Monitor', icon: BarChart3 },
            { id: 'history', label: 'Riwayat', icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'bg-blue-800 text-white hover:bg-blue-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'production' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                  Pilih Manufacturing Order
                </h3>
                <select
                  value={selectedMO || ''}
                  onChange={(e) => setSelectedMO(Number(e.target.value))}
                  className="w-full p-3 border rounded-lg mb-4"
                >
                  <option value="">-- Pilih MO --</option>
                  {data.mo.map(mo => {
                    const product = data.sku.find(s => s.sku_id === mo.fg_sku_id);
                    return (
                      <option key={mo.mo_id} value={mo.mo_id}>
                        {mo.mo_code} - {product?.sku_name} ({mo.mo_status})
                      </option>
                    );
                  })}
                </select>

                {activeMO && (
                  <>
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <div className="text-sm text-gray-600 mb-2">Status</div>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold ${
                        activeMO.mo_status === 'Draft' ? 'bg-gray-200 text-gray-700' :
                        activeMO.mo_status === 'In Progress' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-green-200 text-green-800'
                      }`}>
                        {activeMO.mo_status === 'In Progress' && <PlayCircle className="w-4 h-4" />}
                        {activeMO.mo_status === 'Completed' && <CheckCircle className="w-4 h-4" />}
                        {activeMO.mo_status}
                      </div>
                    </div>

                    {activeMO.mo_status === 'Draft' && (
                      <button
                        onClick={handleStartProduction}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                      >
                        <PlayCircle className="w-5 h-5" />
                        Mulai Produksi
                      </button>
                    )}

                    {activeMO.mo_status === 'In Progress' && (
                      <button
                        onClick={handleCompleteMO}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Selesaikan MO
                      </button>
                    )}
                  </>
                )}
              </div>

              {selectedMO && materials.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Daftar Bahan Baku</h3>
                  <div className="space-y-3">
                    {materials.map((material, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border-2 ${
                          idx === currentMaterialIndex && activeMO.mo_status === 'In Progress'
                            ? 'border-blue-500 bg-blue-50'
                            : material.actual > 0
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-semibold">{material.name}</div>
                          {material.actual > 0 && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          Target: {material.target} {material.uom}
                        </div>
                        {material.actual > 0 && (
                          <div className="text-sm font-semibold text-green-600 mt-1">
                            Aktual: {material.actual} {material.uom}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <DigitalScale
                onWeightCapture={handleWeightCapture}
                currentMaterial={currentMaterial}
                isActive={activeMO?.mo_status === 'In Progress'}
              />
            </div>

            <div>
              {selectedMO && materials.length > 0 && (
                <PrintPreview
                  mo={{
                    ...activeMO,
                    product_name: data.sku.find(s => s.sku_id === activeMO.fg_sku_id)?.sku_name
                  }}
                  materials={materials}
                  onPrint={() => console.log('Printing...')}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'mo' && <MOManagement data={data} setData={setData} />}
        {activeTab === 'sku' && <SKUManagement data={data} setData={setData} />}
        {activeTab === 'bom' && <BOMManagement data={data} setData={setData} />}

        {activeTab === 'monitor' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              Monitor Produksi Real-time
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="text-sm text-gray-600 mb-1">Total MO</div>
                <div className="text-3xl font-bold text-blue-600">{data.mo.length}</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-6">
                <div className="text-sm text-gray-600 mb-1">Sedang Produksi</div>
                <div className="text-3xl font-bold text-yellow-600">
                  {data.mo.filter(m => m.mo_status === 'In Progress').length}
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-6">
                <div className="text-sm text-gray-600 mb-1">Selesai</div>
                <div className="text-3xl font-bold text-green-600">
                  {data.mo.filter(m => m.mo_status === 'Completed').length}
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Kode MO</th>
                    <th className="px-4 py-3 text-left">Produk</th>
                    <th className="px-4 py-3 text-left">Target</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.mo.map(mo => {
                    const product = data.sku.find(s => s.sku_id === mo.fg_sku_id);
                    const uom = data.uom.find(u => u.uom_id === mo.uom_id);
                    return (
                      <tr key={mo.mo_id} className="border-t">
                        <td className="px-4 py-3 font-semibold">{mo.mo_code}</td>
                        <td className="px-4 py-3">{product?.sku_name}</td>
                        <td className="px-4 py-3">{mo.planned_qty} {uom?.uom_code}</td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            mo.mo_status === 'Draft' ? 'bg-gray-200 text-gray-700' :
                            mo.mo_status === 'In Progress' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-green-200 text-green-800'
                          }`}>
                            {mo.mo_status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Riwayat Konsumsi Bahan Baku
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Tanggal</th>
                    <th className="px-4 py-3 text-left">MO</th>
                    <th className="px-4 py-3 text-left">Bahan Baku</th>
                    <th className="px-4 py-3 text-left">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {data.consumption.map(cons => {
                    const mo = data.mo.find(m => m.mo_id === cons.mo_id);
                    const material = data.sku.find(s => s.sku_id === cons.raw_sku_id);
                    const uom = data.uom.find(u => u.uom_id === cons.uom_id);
                    return (
                      <tr key={cons.consumption_id} className="border-t">
                        <td className="px-4 py-3">
                          {new Date(cons.consumption_date).toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-3 font-semibold">{mo?.mo_code}</td>
                        <td className="px-4 py-3">{material?.sku_name}</td>
                        <td className="px-4 py-3">
                          {cons.consumed_qty} {uom?.uom_code}
                        </td>
                      </tr>
                    );
                  })}
                  {data.consumption.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                        Belum ada data konsumsi
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManufacturingSystem;