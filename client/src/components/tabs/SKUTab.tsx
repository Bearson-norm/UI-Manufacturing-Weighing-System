import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { skuApi, uomApi } from '../../services/api';
import { SKU, CreateSKURequest } from '../../types';
import Button from '../ui/Button';
import Table from '../ui/Table';
import Modal from '../ui/Modal';
import Select from '../ui/Select';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import toast from 'react-hot-toast';

const SKUTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSKU, setEditingSKU] = useState<SKU | null>(null);
  const [formData, setFormData] = useState<CreateSKURequest>({
    sku_code: '',
    sku_name: '',
    sku_type: 'Raw Material',
    base_uom_id: 0,
  });

  // Fetch data
  const { data: skuList = [], isLoading } = useQuery(
    'skus',
    () => skuApi.getAll()
  );

  const { data: uomList = [] } = useQuery(
    'uom-list',
    () => uomApi.getAll()
  );

  // Mutations
  const createMutation = useMutation(
    (data: CreateSKURequest) => skuApi.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('skus');
        setIsModalOpen(false);
        resetForm();
        toast.success('SKU berhasil dibuat');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Gagal membuat SKU');
      },
    }
  );

  const updateMutation = useMutation(
    ({ id, data }: { id: number; data: CreateSKURequest }) => skuApi.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('skus');
        setIsModalOpen(false);
        resetForm();
        toast.success('SKU berhasil diupdate');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Gagal mengupdate SKU');
      },
    }
  );

  const deleteMutation = useMutation(
    (id: number) => skuApi.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('skus');
        toast.success('SKU berhasil dihapus');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Gagal menghapus SKU');
      },
    }
  );

  const resetForm = () => {
    setFormData({
      sku_code: '',
      sku_name: '',
      sku_type: 'Raw Material',
      base_uom_id: 0,
    });
    setEditingSKU(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sku_code || !formData.sku_name || formData.base_uom_id === 0) {
      toast.error('Mohon lengkapi semua field');
      return;
    }

    if (editingSKU) {
      updateMutation.mutate({ id: editingSKU.sku_id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (sku: SKU) => {
    setEditingSKU(sku);
    setFormData({
      sku_code: sku.sku_code,
      sku_name: sku.sku_name,
      sku_type: sku.sku_type,
      base_uom_id: sku.base_uom_id,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (sku: SKU) => {
    if (window.confirm('Yakin ingin menghapus SKU ini?')) {
      deleteMutation.mutate(sku.sku_id);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Raw Material':
        return <Badge variant="warning">{type}</Badge>;
      case 'Finished Goods':
        return <Badge variant="success">{type}</Badge>;
      case 'Semi Finished Goods':
        return <Badge variant="primary">{type}</Badge>;
      default:
        return <Badge variant="default">{type}</Badge>;
    }
  };

  const columns = [
    {
      key: 'sku_code',
      title: 'Kode',
      render: (value: string) => <span className="font-semibold">{value}</span>,
    },
    {
      key: 'sku_name',
      title: 'Nama',
    },
    {
      key: 'sku_type',
      title: 'Tipe',
      render: (value: string) => getTypeBadge(value),
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
      render: (value: any, record: SKU) => (
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

  const skuTypeOptions = [
    { value: 'Raw Material', label: 'Raw Material' },
    { value: 'Finished Goods', label: 'Finished Goods' },
    { value: 'Semi Finished Goods', label: 'Semi Finished Goods' },
  ];

  const uomOptions = uomList.map((uom) => ({
    value: uom.uom_id.toString(),
    label: `${uom.uom_name} (${uom.uom_code})`,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manajemen SKU</h2>
        <Button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          leftIcon={<Plus className="w-5 h-5" />}
        >
          Tambah SKU
        </Button>
      </div>

      <Table
        columns={columns}
        data={skuList}
        loading={isLoading}
        emptyText="Belum ada SKU"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingSKU ? 'Edit SKU' : 'Tambah SKU Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Kode SKU"
            value={formData.sku_code}
            onChange={(e) => setFormData({ ...formData, sku_code: e.target.value })}
            required
          />

          <Input
            label="Nama SKU"
            value={formData.sku_name}
            onChange={(e) => setFormData({ ...formData, sku_name: e.target.value })}
            required
          />

          <Select
            label="Tipe"
            value={formData.sku_type}
            onChange={(e) => setFormData({ ...formData, sku_type: e.target.value as any })}
            options={skuTypeOptions}
            required
          />

          <Select
            label="Unit of Measure"
            value={formData.base_uom_id.toString()}
            onChange={(e) => setFormData({ ...formData, base_uom_id: parseInt(e.target.value) })}
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
              {editingSKU ? 'Update' : 'Simpan'}
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

export default SKUTab;


