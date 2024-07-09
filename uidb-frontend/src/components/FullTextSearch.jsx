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
  Checkbox,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { useQuery } from 'react-query';
import api from '../services/api';

const FullTextSearch = () => {
  const [tableName, setTableName] = useState('');
  const [indexColumns, setIndexColumns] = useState([]);
  const [searchColumns, setSearchColumns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [mode, setMode] = useState('');
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

  const searchModes = ['NATURAL', 'BOOLEAN', 'QUERY_EXPANSION'];

  const handleColumnToggle = (column, setter) => {
    setter(prev =>
      prev.includes(column)
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  };

  const createFullTextIndex = async () => {
    try {
      await api.post('/api/create-fulltext-index', {
        tableName,
        columns: indexColumns,
      });

      toast({
        title: 'Success',
        description: 'FULLTEXT index created successfully',
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

  const handleSearch = async () => {
    try {
      const response = await api.post('/api/full-text-search', {
        tableName,
        searchColumns,
        searchTerm,
        mode,
      });

      setResults(response.data.results);
      setQuery(response.data.query);

      toast({
        title: 'Success',
        description: `Found ${response.data.count} results`,
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
      <Heading size="lg" mb={4}>Full-Text Search</Heading>
      <Alert status="info" mb={4}>
        <AlertIcon />
        <AlertTitle mr={2}>How to use:</AlertTitle>
        <AlertDescription>
          1. Select a table and create a FULLTEXT index on desired columns.
          2. Perform full-text search on the indexed columns.
        </AlertDescription>
      </Alert>
      <Tabs>
        <TabList>
          <Tab>Create FULLTEXT Index</Tab>
          <Tab>Perform Search</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
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

              {tableData && (
                <FormControl>
                  <FormLabel>Columns for FULLTEXT Index</FormLabel>
                  <VStack align="start">
                    {tableData.structure.map((column) => (
                      <Checkbox
                        key={column.Field}
                        isChecked={indexColumns.includes(column.Field)}
                        onChange={() => handleColumnToggle(column.Field, setIndexColumns)}
                      >
                        {column.Field}
                      </Checkbox>
                    ))}
                  </VStack>
                </FormControl>
              )}

              <Button
                colorScheme="blue"
                onClick={createFullTextIndex}
                isDisabled={!tableName || indexColumns.length === 0}
              >
                Create FULLTEXT Index
              </Button>
            </VStack>
          </TabPanel>

          <TabPanel>
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

              {tableData && (
                <FormControl>
                  <FormLabel>Search Columns (must be FULLTEXT indexed)</FormLabel>
                  <VStack align="start">
                    {tableData.structure.map((column) => (
                      <Checkbox
                        key={column.Field}
                        isChecked={searchColumns.includes(column.Field)}
                        onChange={() => handleColumnToggle(column.Field, setSearchColumns)}
                      >
                        {column.Field}
                      </Checkbox>
                    ))}
                  </VStack>
                </FormControl>
              )}

              <FormControl>
                <FormLabel>Search Term</FormLabel>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter search term"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Search Mode</FormLabel>
                <Select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  placeholder="Select search mode"
                >
                  {searchModes.map((searchMode) => (
                    <option key={searchMode} value={searchMode}>{searchMode}</option>
                  ))}
                </Select>
              </FormControl>

              <Button
                colorScheme="blue"
                onClick={handleSearch}
                isDisabled={!tableName || searchColumns.length === 0 || !searchTerm}
              >
                Search
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
                          {tableData.structure.map((column) => (
                            <Th key={column.Field}>{column.Field}</Th>
                          ))}
                        </Tr>
                      </Thead>
                      <Tbody>
                        {results.map((row, rowIndex) => (
                          <Tr key={rowIndex}>
                            {tableData.structure.map((column) => (
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
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default FullTextSearch;