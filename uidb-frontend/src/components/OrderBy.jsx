import React, { useState } from 'react';
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { useQuery } from 'react-query';
import api from '../services/api';

const OrderBy = () => {
  const [tableName, setTableName] = useState('');
  const [orderBy, setOrderBy] = useState([{ column: '', direction: 'ASC' }]);
  const [limit, setLimit] = useState('');
  const [offset, setOffset] = useState('');
  const [results, setResults] = useState(null);
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

  const handleOrderByChange = (index, field, value) => {
    const newOrderBy = [...orderBy];
    newOrderBy[index][field] = value;
    setOrderBy(newOrderBy);
  };

  const addOrderByField = () => {
    setOrderBy([...orderBy, { column: '', direction: 'ASC' }]);
  };

  const removeOrderByField = (index) => {
    const newOrderBy = orderBy.filter((_, i) => i !== index);
    setOrderBy(newOrderBy);
  };

  const handleSubmit = async () => {
    try {
      const response = await api.post('/api/orderby', {
        tableName,
        orderBy,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      });

      setResults(response.data.results);
      setQuery(response.data.query);

      toast({
        title: 'Success',
        description: `Retrieved ${response.data.count} results`,
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
    <Box maxWidth="800px" margin="auto" mt={8}>
      <Heading size="lg" mb={4}>Order By Query</Heading>
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

        <Text fontWeight="bold">Order By</Text>
        {orderBy.map((item, index) => (
          <HStack key={index}>
            <Select
              value={item.column}
              onChange={(e) => handleOrderByChange(index, 'column', e.target.value)}
              placeholder="Select column"
              isDisabled={!tableData}
            >
              {tableData && tableData.structure.map((column) => (
                <option key={column.Field} value={column.Field}>{column.Field}</option>
              ))}
            </Select>
            <Select
              value={item.direction}
              onChange={(e) => handleOrderByChange(index, 'direction', e.target.value)}
            >
              <option value="ASC">Ascending</option>
              <option value="DESC">Descending</option>
            </Select>
            <IconButton
              icon={<DeleteIcon />}
              onClick={() => removeOrderByField(index)}
              aria-label="Remove order by field"
            />
          </HStack>
        ))}
        <Button leftIcon={<AddIcon />} onClick={addOrderByField} size="sm">
          Add Order By Field
        </Button>

        <HStack>
          <FormControl>
            <FormLabel>Limit</FormLabel>
            <NumberInput min={0} value={limit} onChange={(valueString) => setLimit(valueString)}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
          <FormControl>
            <FormLabel>Offset</FormLabel>
            <NumberInput min={0} value={offset} onChange={(valueString) => setOffset(valueString)}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        </HStack>

        <Button
          colorScheme="blue"
          onClick={handleSubmit}
          isDisabled={!tableName || orderBy.some(item => !item.column)}
        >
          Execute Query
        </Button>

        {results && (
          <Box>
            <Text fontWeight="bold">Query:</Text>
            <Code p={2} borderRadius="md" mb={4}>
              {query}
            </Code>
            <Text fontWeight="bold" mb={2}>Results ({results.length}):</Text>
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    {tableData && tableData.structure.map((column) => (
                      <Th key={column.Field}>{column.Field}</Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {results.map((row, rowIndex) => (
                    <Tr key={rowIndex}>
                      {tableData && tableData.structure.map((column) => (
                        <Td key={column.Field}>{row[column.Field]}</Td>
                      ))}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default OrderBy;