/**
 * Maintenance Actions Hook
 * Handles mutations (create, update, start, complete, cancel, assign)
 */

import { useState, useCallback } from 'react';
import { useSWRConfig } from 'swr';
import { maintenanceService } from '../services/maintenanceService';

export const useMaintenanceActions = () => {
  const { mutate } = useSWRConfig();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const revalidateMaintenance = () => {
    mutate(
      key => typeof key === 'string' && (key.includes('/maintenance') || key.includes('/requests')),
      undefined,
      { revalidate: true }
    );
  };

  const makeAction = (action) => {
    return async (...args) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await action(...args);
        revalidateMaintenance();
        return result;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    };
  };

  const create = useCallback(makeAction(maintenanceService.create), []);
  const update = useCallback(makeAction((id, data) => maintenanceService.update(id, data)), []);
  const startWork = useCallback(makeAction(maintenanceService.startWork), []);
  const complete = useCallback(makeAction((id, data) => maintenanceService.complete(id, data)), []);
  const cancel = useCallback(makeAction((id, reason) => maintenanceService.cancel(id, reason)), []);
  const assignTechnician = useCallback(makeAction((id, techId) => maintenanceService.assignTechnician(id, techId)), []);

  return { create, update, startWork, complete, cancel, assignTechnician, assign: assignTechnician, isLoading, error };
};
