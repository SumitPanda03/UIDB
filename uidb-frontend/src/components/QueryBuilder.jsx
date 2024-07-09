import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Select,
  Input,
  VStack,
  HStack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
} from '@chakra-ui/react';
import api from '../services/api';
import { DeleteIcon } from '@chakra-ui/icons';

const QueryBuilder = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [tableSchema, setTableSchema] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [whereConditions, setWhereConditions] = useState([{ column: '', operator: '=', value: '' }]);
  const [queryResults, setQueryResults] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      fetchTableSchema(selectedTable);
    }
  }, [selectedTable]);

  const fetchTables = async () => {
    try {
      const response = await api.get('/api/get-tables');
      setTables(response.data.tables);
    } catch (error) {
      toast({
        title: 'Error fetching tables',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const fetchTableSchema = async (tableName) => {
    try {
      const response = await api.get(`/api/get-table-data/${tableName}`);
      setTableSchema(response.data.structure);
    } catch (error) {
      toast({
        title: 'Error fetching table schema',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleTableChange = (e) => {
    setSelectedTable(e.target.value);
    setSelectedColumns([]);
    setWhereConditions([{ column: '', operator: '=', value: '' }]);
  };

  const handleColumnToggle = (column) => {
    setSelectedColumns(prev =>
      prev.includes(column)
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  };

  const handleWhereConditionChange = (index, field, value) => {
    const newConditions = [...whereConditions];
    newConditions[index][field] = value;
    setWhereConditions(newConditions);
  };

  const addWhereCondition = () => {
    setWhereConditions([...whereConditions, { column: '', operator: '=', value: '' }]);
  };

  const removeWhereCondition = (index) => {
    setWhereConditions(whereConditions.filter((_, i) => i !== index));
  };

  const buildQuery = () => {
    const columns = selectedColumns.length > 0 ? selectedColumns.join(', ') : '*';
    let query = `SELECT ${columns} FROM ${selectedTable}`;

    if (whereConditions.some(condition => condition.column && condition.value)) {
      const whereClause = whereConditions
        .filter(condition => condition.column && condition.value)
        .map(condition => `${condition.column} ${condition.operator} ?`)
        .join(' AND ');
      query += ` WHERE ${whereClause}`;
    }

    return query;
  };

  const executeQuery = async () => {
    const query = buildQuery();
    const params = whereConditions
      .filter(condition => condition.column && condition.value)
      .map(condition => condition.value);

    try {
      const response = await api.post('/api/execute-query', { query, params });
      setQueryResults(response.data);
    } catch (error) {
      toast({
        title: 'Error executing query',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      <VStack spacing={4} align="stretch">
      <Text fontWeight="bold">Select Table:</Text>
        <Select placeholder="Select a table" onChange={handleTableChange} value={selectedTable}>
          {tables.map(table => (
            <option key={table} value={table}>{table}</option>
          ))}
        </Select>

        {selectedTable && (
          <Box>
            <Text fontWeight="bold">Select Columns:</Text>
            <HStack mb={4} flexWrap="wrap">
              {tableSchema.map(column => (
                <Button
                  key={column.Field}
                  size="sm"
                  variant={selectedColumns.includes(column.Field) ? 'solid' : 'outline'}
                  onClick={() => handleColumnToggle(column.Field)}
                >
                  {column.Field}
                </Button>
              ))}
            </HStack>

            <Text fontWeight="bold">Where Conditions:</Text>

            {whereConditions.map((condition, index) => (
              <HStack mb={5} key={index}>
                <Select
                  value={condition.column}
                  onChange={(e) => handleWhereConditionChange(index, 'column', e.target.value)}
                >
                  <option value="">Select column</option>
                  {tableSchema.map(column => (
                    <option key={column.Field} value={column.Field}>{column.Field}</option>
                  ))}
                </Select>
                <Select
                  value={condition.operator}
                  onChange={(e) => handleWhereConditionChange(index, 'operator', e.target.value)}
                >
                  <option value="=">=</option>
                  <option value="<">{'<'}</option>
                  <option value=">">{'>'}</option>
                  <option value="<=">{'<='}</option>
                  <option value=">=">{'>='}</option>
                  <option value="LIKE">LIKE</option>
                </Select>
                <Input
                  value={condition.value}
                  onChange={(e) => handleWhereConditionChange(index, 'value', e.target.value)}
                  placeholder="Value"
                />
                <Button onClick={() => removeWhereCondition(index)} variant="ghost">
                    <DeleteIcon />
                </Button>

              </HStack>
            ))}
            <Box>
            <HStack spacing={4}>
                <Button onClick={addWhereCondition}>Add Condition</Button>
                <Button colorScheme="blue" onClick={executeQuery}>Execute Query</Button>
            </HStack>
            </Box>

            {queryResults && (
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      {queryResults.fields.map(field => (
                        <Th key={field.name}>{field.name}</Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {queryResults.results.map((row, rowIndex) => (
                      <Tr key={rowIndex}>
                        {Object.values(row).map((value, colIndex) => (
                          <Td key={colIndex}>{value}</Td>
                        ))}
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default QueryBuilder;
