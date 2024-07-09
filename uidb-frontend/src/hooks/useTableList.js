// hooks/useTableList.js
import { useQuery } from 'react-query';
import api from '../services/api';

const fetchTables = async () => {
  const response = await api.get('/api/get-tables');
  return response.data.tables;
};

export const useTableList = () => {
  return useQuery('tables', fetchTables, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};