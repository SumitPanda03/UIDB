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
  Switch,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Tooltip,
  Alert,
  AlertIcon,
  AlertDescription,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { useQuery } from 'react-query';
import api from '../services/api';

const DeleteData = () => {
  const [tableName, setTableName] = useState('');
  const [conditionFields, setConditionFields] = useState([{ column: '', value: '' }]);
  const [queryPreview, setQueryPreview] = useState('');
  const [showQueryPreview, setShowQueryPreview] = useState(false);
  const [affectedRowsEstimate, setAffectedRowsEstimate] = useState(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data: tables } = useQuery('tables', () =>
    api.get('/api/get-tables').then(res => res.data.tables)
  );

  const { data: tableData, isLoading: isTableDataLoading } = useQuery(
    ['tableData', tableName],
    () => api.get(`/api/get-table-data/${tableName}`).then(res => res.data),
    { enabled: !!tableName }
  );

  useEffect(() => {
    if (tableName && conditionFields.length > 0 && tableData) {
      const whereClause = conditionFields
        .filter(field => field.column && field.value)
        .map(field => `${field.column} = '${field.value}'`)
        .join(' AND ');

      const query = `DELETE FROM ${tableName} WHERE ${whereClause}`;
      setQueryPreview(query);

      api.post('/api/estimate-affected-rows', { query })
        .then(res => setAffectedRowsEstimate(res.data.estimatedRows))
        .catch(err => console.error('Error estimating affected rows:', err));
    }
  }, [tableName, conditionFields, tableData]);

  const addField = () => {
    setConditionFields(prev => [...prev, { column: '', value: '' }]);
  };

  const removeField = (index) => {
    setConditionFields(prev => prev.filter((_, i) => i !== index));
  };

  const updateField = (index, key, value) => {
    setConditionFields(prev =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  };

  const handleSubmit = async () => {
    try {
      const condition = Object.fromEntries(
        conditionFields.filter(field => field.column && field.value)
          .map(field => [field.column, field.value])
      );

      const response = await api.post(`/api/delete-data/${tableName}`, { data: { condition } });
      
      toast({
        title: 'Success',
        description: `${response.data.affectedRows} row(s) deleted`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onClose();
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
          <>
            <Text fontWeight="bold">Condition Fields</Text>
            {conditionFields.map((field, index) => (
              <HStack key={index}>
                <Select
                  value={field.column}
                  onChange={(e) => updateField(index, 'column', e.target.value)}
                  placeholder="Select column"
                >
                  {tableData.structure.map((column) => (
                    <option key={column.Field} value={column.Field}>{column.Field}</option>
                  ))}
                </Select>
                <Input
                  value={field.value}
                  onChange={(e) => updateField(index, 'value', e.target.value)}
                  placeholder="Value"
                />
                <Tooltip label="Remove field">
                  <Button
                    onClick={() => removeField(index)}
                    size="sm"
                    colorScheme="red"
                  >
                    <DeleteIcon />
                  </Button>
                </Tooltip>
              </HStack>
            ))}
            <Button leftIcon={<AddIcon />} onClick={addField} size="sm">
              Add Condition Field
            </Button>

            <HStack justifyContent="space-between">
              <Text fontWeight="bold">Show Query Preview</Text>
              <Switch
                isChecked={showQueryPreview}
                onChange={(e) => setShowQueryPreview(e.target.checked)}
              />
            </HStack>
            
            {showQueryPreview && (
              <Code p={2} borderRadius="md">
                {queryPreview}
              </Code>
            )}

            {affectedRowsEstimate !== null && (
              <Alert status="info">
                <AlertIcon />
                <AlertDescription>
                  Estimated rows to be affected: {affectedRowsEstimate}
                </AlertDescription>
              </Alert>
            )}

            <Button colorScheme="red" onClick={onOpen}>Delete Data</Button>

            <Text fontWeight="bold" mt={4}>Table Preview (First 100 rows)</Text>
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    {tableData.structure.map(column => (
                      <Th key={column.Field}>{column.Field}</Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {tableData.data.map((row, rowIndex) => (
                    <Tr key={rowIndex}>
                      {tableData.structure.map(column => (
                        <Td key={column.Field}>{row[column.Field]}</Td>
                      ))}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </>
        )}
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to delete this data? This action cannot be undone.</Text>
            <Code p={2} borderRadius="md" mt={2}>
              {queryPreview}
            </Code>
            {affectedRowsEstimate !== null && (
              <Text mt={2} fontWeight="bold">
                Estimated rows to be affected: {affectedRowsEstimate}
              </Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={handleSubmit}>
              Confirm Delete
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default DeleteData;