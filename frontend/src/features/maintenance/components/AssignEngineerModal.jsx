/**
 * AssignEngineerModal
 * Modal for managers to assign an engineer to a work order
 */

import { useState, useEffect } from 'react';
import { Modal, Button, Select } from '@/components/common';
import { UserPlus } from 'lucide-react';
import { api } from '@/services/api';

const AssignEngineerModal = ({ isOpen, onClose, workOrder, onAssign, isLoading }) => {
  const [engineers, setEngineers] = useState([]);
  const [selectedEngineer, setSelectedEngineer] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) fetchEngineers();
  }, [isOpen]);

  const fetchEngineers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users', { params: { role: 'Engineer,Field_Engineer', status: 'Active', limit: 100 } });
      const users = res.data?.data || res.data?.users || res.data || [];
      setEngineers(Array.isArray(users) ? users : []);
    } catch (err) {
      setEngineers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => { setSelectedEngineer(''); onClose(); };

  const options = [
    { value: '', label: 'Select an engineer...' },
    ...engineers.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name} (${e.role?.replace(/_/g, ' ')})` }))
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Assign Engineer" size="md">
      <div className="space-y-4">
        {workOrder?.assigned_to_name && (
          <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/20">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              <span className="font-medium">Currently assigned:</span> {workOrder.assigned_to_name}
            </p>
          </div>
        )}

        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="font-medium text-gray-900 dark:text-white">{workOrder?.maintenance_type?.replace(/_/g, ' ')}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{workOrder?.equipment_name} • {workOrder?.equipment_serial}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Engineer</label>
          {loading ? (
            <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          ) : (
            <Select value={selectedEngineer} onChange={(e) => setSelectedEngineer(e.target.value)} options={options} />
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">Cancel</Button>
          <Button onClick={() => onAssign(selectedEngineer)} isLoading={isLoading} disabled={!selectedEngineer} className="w-full sm:w-auto">
            <UserPlus className="w-4 h-4 mr-2" />Assign
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AssignEngineerModal;
