import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { bomApi, skuApi, uomApi } from '../../services/api';
import { BOM, CreateBOMRequest } from '../../types';
import Button from '../ui/Button';
import Table from '../ui/Table';
import Modal from '../ui/Modal';
import Select from '../ui/Select';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import toast from 'react-hot-toast';

const BOMTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBOM, setEditingBOM] = useState<BOM | null>(null);
  const [selectedFG, setSelectedFG] = useState<string>('');
  const [formData, setFormData] = useState<CreateBOMRequest>({
    fg_sku_id: 0,
    raw_sku_id: 0,
    quantity: 0,
    uom_id: 0,
  });

  // Fetch data
  const { data: finishedGoods = [] } = useQuery(
    'finished-goods',
    () => skuApi.getByType('Finished Goods')
  );

  const { data: rawMaterials = [] } = useQuery(
    'raw-materials',
    () => skuApi.getByType('Raw Material')
  );

  const { data: uomList = [] } = useQuery(
    'uom-list',
    () => uomApi.getAll()
  );

  const { data: bomList = [], isLoading } = useQuery(
    ['bom-list', selectedFG],
    () => selectedFG ? bomApi.getByFG(parseInt(selectedFG)) : Promise.resolve([]),
    {
      enabled: !!selectedFG,
    }
  );

  // Mutations
  const createMutation = useMutation(
    (data: CreateBOMRequest) => bomApi.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['bom-list', selectedFG]);
        setIsModalOpen(false);
        resetForm();
        toast.success('BOM item berhasil dibuat');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Gagal membuat BOM item');
      },
    }
  );

  const updateMutation = useMutation(
    ({ id, data }: { id: number; data: CreateBOMRequest }) => bomApi.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['bom-list', selectedFG]);
        setIsModalOpen(false);
        resetForm();
        toast.success('BOM item berhasil diupdate');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Gagal mengupdate BOM item');
      },
    }
  );

  const deleteMutation = useMutation(
    (id: number) => bomApi.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['bom-list', selectedFG]);
        toast.success('BOM item berhasil dihapus');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Gagal menghapus BOM item');
      },
    }
  );

  const resetForm = () => {
    setFormData({
      fg_sku_id: 0,
      raw_sku_id: 0,
      quantity: 0,
      uom_id: 0,
    });
    setEditingBOM(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFG || formData.raw_sku_id === 0 || formData.quantity <= 0 || formData.uom_id === 0) {
      toast.error('Mohon lengkapi semua field');
      return;
    }

    const data = {
      ...formData,
      fg_sku_id: parseInt(selectedFG),
    };

    if (editingBOM) {
      updateMutation.mutate({ id: editingBOM.bom_id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (bom: BOM) => {
    setEditingBOM(bom);
    setFormData({
      fg_sku_id: bom.fg_sku_id,
      raw_sku_id: bom.raw_sku_id,
      quantity: bom.quantity,
      uom_id: bom.uom_id,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (bom: BOM) => {
    if (window.confirm('Yakin ingin menghapus BOM item ini?')) {
      deleteMutation.mutate(bom.bom_id);
    }
  };

  const columns = [
    {
      key: 'raw_sku_name',
      title: 'Bahan Baku',
    },
    {
      key: 'quantity',
      title: 'Kuantitas',
      render: (value: number) => <span className="font-semibold">{value}</span>,
    },
    {
      key: 'uom_code',
      title: 'UoM',
    },
    {
      key: 'is_active',
      title: 'Status',
      render: (value: boolean) => (
        <Badge variant={value ? 'success' : 'danger'}>
          {value ? 'Aktif' : 'Tidak Aktif'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      title: 'Aksi',
      render: (value: any, record: BOM) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(record)}
            leftIcon={<Edit className="w-4 h-4" />}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(record)}
            isLoading={deleteMutation.isLoading}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Hapus
          </Button>
        </div>
      ),
    },
  ];

  const fgOptions = finishedGoods.map((sku) => ({
    value: sku.sku_id.toString(),
    label: `${sku.sku_code} - ${sku.sku_name}`,
  }));

  const rawMaterialOptions = rawMaterials.map((sku) => ({
    value: sku.sku_id.toString(),
    label: `${sku.sku_code} - ${sku.sku_name}`,
  }));

  const uomOptions = uomList.map((uom) => ({
    value: uom.uom_id.toString(),
    label: `${uom.uom_name} (${uom.uom_code})`,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manajemen Bill of Materials (BOM)</h2>
      </div>

      <div className="card">
        <div className="card-content">
          <Select
            label="Pilih Produk (Finished Goods)"
            value={selectedFG}
            onChange={(e) => setSelectedFG(e.target.value)}
            options={fgOptions}
            placeholder="-- Pilih Produk --"
          />
        </div>
      </div>

      {selectedFG && (
        <>
          <div className="flex justify-end">
            <Button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              leftIcon={<Plus className="w-5 h-5" />}
            >
              Tambah Bahan
            </Button>
          </div>

          <Table
            columns={columns}
            data={bomList}
            isLoading={isLoading}
            emptyText="Belum ada bahan baku untuk produk ini"
          />
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingBOM ? 'Edit BOM Item' : 'Tambah Bahan Baku'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Bahan Baku"
            value={formData.raw_sku_id.toString()}
            onChange={(e) => setFormData({ ...formData, raw_sku_id: parseInt(e.target.value) })}
            options={rawMaterialOptions}
            placeholder="-- Pilih Bahan Baku --"
            required
          />

          <Input
            label="Kuantitas (per 1 unit produk)"
            type="number"
            step="0.0001"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
            required
          />

          <Select
            label="Unit of Measure"
            value={formData.uom_id.toString()}
            onChange={(e) => setFormData({ ...formData, uom_id: parseInt(e.target.value) })}
            options={uomOptions}
            placeholder="-- Pilih UoM --"
            required
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              isLoading={createMutation.isLoading || updateMutation.isLoading}
              className="flex-1"
            >
              {editingBOM ? 'Update' : 'Simpan'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="flex-1"
            >
              Batal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BOMTab;
