import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Trash2, PlayCircle, CheckCircle, X } from 'lucide-react';
import { moApi, skuApi, uomApi } from '../../services/api';
import { ManufacturingOrder, CreateMORequest } from '../../types';
import Button from '../ui/Button';
import Table from '../ui/Table';
import Modal from '../ui/Modal';
import Select from '../ui/Select';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import toast from 'react-hot-toast';

const MOTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMO, setEditingMO] = useState<ManufacturingOrder | null>(null);
  const [formData, setFormData] = useState<CreateMORequest>({
    fg_sku_id: 0,
    planned_qty: 0,
    uom_id: 0,
  });

  // Fetch data
  const { data: moList = [], isLoading } = useQuery(
    'manufacturing-orders',
    () => moApi.getAll()
  );

  const { data: finishedGoods = [] } = useQuery(
    'finished-goods',
    () => skuApi.getByType('Finished Goods')
  );

  const { data: uomList = [] } = useQuery(
    'uom-list',
    () => uomApi.getAll()
  );

  // Mutations
  const createMutation = useMutation(
    (data: CreateMORequest) => moApi.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('manufacturing-orders');
        setIsModalOpen(false);
        resetForm();
        toast.success('Manufacturing Order berhasil dibuat');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Gagal membuat Manufacturing Order');
      },
    }
  );

  const deleteMutation = useMutation(
    (id: number) => moApi.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('manufacturing-orders');
        toast.success('Manufacturing Order berhasil dihapus');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Gagal menghapus Manufacturing Order');
      },
    }
  );

  const startMutation = useMutation(
    (id: number) => moApi.startProduction(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('manufacturing-orders');
        toast.success('Produksi berhasil dimulai');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Gagal memulai produksi');
      },
    }
  );

  const completeMutation = useMutation(
    (id: number) => moApi.completeProduction(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('manufacturing-orders');
        toast.success('Produksi berhasil diselesaikan');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Gagal menyelesaikan produksi');
      },
    }
  );

  const resetForm = () => {
    setFormData({
      fg_sku_id: 0,
      planned_qty: 0,
      uom_id: 0,
    });
    setEditingMO(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.fg_sku_id === 0 || formData.planned_qty <= 0 || formData.uom_id === 0) {
      toast.error('Mohon lengkapi semua field');
      return;
    }

    createMutation.mutate(formData);
  };

  const handleEdit = (mo: ManufacturingOrder) => {
    setEditingMO(mo);
    setFormData({
      fg_sku_id: mo.fg_sku_id,
      planned_qty: mo.planned_qty,
      uom_id: mo.uom_id,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (mo: ManufacturingOrder) => {
    if (mo.mo_status !== 'Draft') {
      toast.error('Hanya MO dengan status Draft yang dapat dihapus');
      return;
    }
    
    if (window.confirm('Yakin ingin menghapus MO ini?')) {
      deleteMutation.mutate(mo.mo_id);
    }
  };

  const handleStart = (mo: ManufacturingOrder) => {
    if (mo.mo_status !== 'Draft') {
      toast.error('Hanya MO dengan status Draft yang dapat dimulai');
      return;
    }
    
    startMutation.mutate(mo.mo_id);
  };

  const handleComplete = (mo: ManufacturingOrder) => {
    if (mo.mo_status !== 'In Progress') {
      toast.error('Hanya MO yang sedang berjalan yang dapat diselesaikan');
      return;
    }
    
    completeMutation.mutate(mo.mo_id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Draft':
        return <Badge variant="default">{status}</Badge>;
      case 'In Progress':
        return <Badge variant="warning">{status}</Badge>;
      case 'Completed':
        return <Badge variant="success">{status}</Badge>;
      case 'Cancelled':
        return <Badge variant="danger">{status}</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const columns = [
    {
      key: 'mo_code',
      title: 'Kode MO',
      render: (value: string, record: ManufacturingOrder) => (
        <span className="font-semibold">{value}</span>
      ),
    },
    {
      key: 'sku_name',
      title: 'Produk',
    },
    {
      key: 'planned_qty',
      title: 'Target',
      render: (value: number, record: ManufacturingOrder) => (
        <span>{value} {record.uom_code}</span>
      ),
    },
    {
      key: 'produced_qty',
      title: 'Aktual',
      render: (value: number, record: ManufacturingOrder) => (
        <span>{value} {record.uom_code}</span>
      ),
    },
    {
      key: 'mo_status',
      title: 'Status',
      render: (value: string) => getStatusBadge(value),
    },
    {
      key: 'actions',
      title: 'Aksi',
      render: (value: any, record: ManufacturingOrder) => (
        <div className="flex gap-2">
          {record.mo_status === 'Draft' && (
            <>
              <Button
                size="sm"
                variant="success"
                onClick={() => handleStart(record)}
                isLoading={startMutation.isLoading}
                leftIcon={<PlayCircle className="w-4 h-4" />}
              >
                Start
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit(record)}
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
            </>
          )}
          {record.mo_status === 'In Progress' && (
            <Button
              size="sm"
              variant="success"
              onClick={() => handleComplete(record)}
              isLoading={completeMutation.isLoading}
              leftIcon={<CheckCircle className="w-4 h-4" />}
            >
              Complete
            </Button>
          )}
        </div>
      ),
    },
  ];

  const fgOptions = finishedGoods.map((sku) => ({
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
        <h2 className="text-2xl font-bold">Manajemen Manufacturing Order</h2>
        <Button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          leftIcon={<Plus className="w-5 h-5" />}
        >
          Buat MO Baru
        </Button>
      </div>

      <Table
        columns={columns}
        data={moList}
        isLoading={isLoading}
        emptyText="Belum ada Manufacturing Order"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingMO ? 'Edit Manufacturing Order' : 'Buat Manufacturing Order Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Produk (Finished Goods)"
            value={formData.fg_sku_id.toString()}
            onChange={(e) => setFormData({ ...formData, fg_sku_id: parseInt(e.target.value) })}
            options={fgOptions}
            placeholder="-- Pilih Produk --"
            required
          />

          <Input
            label="Kuantitas Target"
            type="number"
            step="0.0001"
            value={formData.planned_qty}
            onChange={(e) => setFormData({ ...formData, planned_qty: parseFloat(e.target.value) })}
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
              isLoading={createMutation.isLoading}
              className="flex-1"
            >
              {editingMO ? 'Update' : 'Simpan'}
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

export default MOTab;


