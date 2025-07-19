import { useMemo } from 'react';
import { apiClient } from '../../infrastructure/api/client';
import { OrdersService } from '../services/OrdersService';

export const useOrdersService = () => {
  const ordersService = useMemo(() => new OrdersService(apiClient), []);
  
  return ordersService;
}; 