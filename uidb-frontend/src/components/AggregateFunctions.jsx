import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Select,
  Text,
  useToast,
  Code,
  Heading,
  Divider,
} from '@chakra-ui/react';
import { useQuery } from 'react-query';
import api from '../services/api';

const AggregateFunctions = () => {
  const [tableName, setTableName] = useState('');
  const [operation, setOperation] = useState('');
  const [column, setColumn] = useState('');
  const [conditions, setConditions] = useState([{ key: '', value: '' }]);
  const [result, setResult] = useState(null);
  const [query, setQuery] = useState('');
  const toast = useToast();

  const { data: tables } = useQuery('tables', () =>
    api.get('/api/get-tables').then(res => res.data.tables)
  );

  const { data: tableData, isLoading: isTableDataLoading } = useQuery(
    ['tableData', tableName],
    () => api.get(`/api/get-table-data/${tableName}`).then(res => res.data),
    { enabled: !!tableName }
  );

  const operations = ['COUNT', 'SUM', 'AVG', 'MAX', 'MIN'];

  const addCondition = () => {
    setConditions([...conditions, { key: '', value: '' }]);
  };

  const removeCondition = (index) => {
    const newConditions = [...conditions];
    newConditions.splice(index, 1);
    setConditions(newConditions);
  };

  const updateCondition = (index, field, value) => {
    const newConditions = [...conditions];
    newConditions[index][field] = value;
    setConditions(newConditions);
  };

  const handleSubmit = async () => {
    try {
      const conditionObject = conditions.reduce((acc, condition) => {
        if (condition.key && condition.value) {
          acc[condition.key] = condition.value;
        }
        return acc;
      }, {});

      const response = await api.post('/api/aggregate-functions', {
        operation,
        tableName,
        column,
        condition: Object.keys(conditionObject).length > 0 ? conditionObject : undefined,
      });

      setResult(response.data.result);
      setQuery(response.data.query);

      toast({
        title: 'Success',
        description: 'Aggregate function executed successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxWidth="600px" margin="auto" mt={8}>
      <Heading size="lg" mb={4}>Aggregate Functions</Heading>
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>Table Name</FormLabel>
          <Select
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="Select a table"
          >
            {tables && tables.map((table) => (
              <option key={table} value={table}>{table}</option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Operation</FormLabel>
          <Select
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
            placeholder="Select an operation"
          >
            {operations.map((op) => (
              <option key={op} value={op}>{op}</option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Column</FormLabel>
          <Select
            value={column}
            onChange={(e) => setColumn(e.target.value)}
            placeholder="Select a column"
            isDisabled={!tableData}
          >
            {tableData && tableData.structure.map((col) => (
              <option key={col.Field} value={col.Field}>{col.Field}</option>
            ))}
          </Select>
        </FormControl>

        <Divider />

        <Text fontWeight="bold">Conditions (optional)</Text>
        {conditions.map((condition, index) => (
          <HStack key={index}>
            <Select
              value={condition.key}
              onChange={(e) => updateCondition(index, 'key', e.target.value)}
              placeholder="Select column"
              isDisabled={!tableData}
            >
              {tableData && tableData.structure.map((col) => (
                <option key={col.Field} value={col.Field}>{col.Field}</option>
              ))}
            </Select>
            <Input
              value={condition.value}
              onChange={(e) => updateCondition(index, 'value', e.target.value)}
              placeholder="Value"
            />
            <Button onClick={() => removeCondition(index)} size="sm" colorScheme="red">
              Remove
            </Button>
          </HStack>
        ))}
        <Button onClick={addCondition} size="sm">
          Add Condition
        </Button>

        <Button colorScheme="blue" onClick={handleSubmit} isDisabled={!tableName || !operation || !column}>
          Execute Aggregate Function
        </Button>

        {result !== null && (
          <Box>
            <Text fontWeight="bold">Result: {result}</Text>
            <Text fontWeight="bold" mt={2}>Query:</Text>
            <Code p={2} borderRadius="md">
              {query}
            </Code>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default AggregateFunctions;