// src/components/UpdateData.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
  Text,
  Select,
  HStack,
  IconButton,
  Code,
  Spinner,
  Switch,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { useTableList } from '../hooks/useTableList';
import api from '../services/api';

const UpdateData = () => {
  const [tableName, setTableName] = useState('');
  const [data, setData] = useState([{ key: '', value: '' }]);
  const [condition, setCondition] = useState([{ key: '', value: '' }]);
  const [columns, setColumns] = useState([]);
  const [queryPreview, setQueryPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isQueryEditable, setIsQueryEditable] = useState(false);
  const [editableQuery, setEditableQuery] = useState('');
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data: tables, isLoading: isLoadingTables, error: tablesError } = useTableList();

  useEffect(() => {
    if (tableName) {
      fetchTableData(tableName);
    }
  }, [tableName]);

  useEffect(() => {
    generateQueryPreview();
  }, [tableName, data, condition]);

  const fetchTableData = async (table) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/api/get-table-data/${table}`);
      setColumns(response.data.structure.map(col => col.Field));
      setIsLoading(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch table data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
    }
  };

  const generateQueryPreview = () => {
    if (!tableName) return;

    const setClause = data
      .filter((item) => item.key && item.value)
      .map((item) => `${item.key} = '${item.value}'`)
      .join(', ');

    const whereClause = condition
      .filter((item) => item.key && item.value)
      .map((item) => `${item.key} = '${item.value}'`)
      .join(' AND ');

    const query = `UPDATE ${tableName} SET ${setClause} WHERE ${whereClause}`;
    setQueryPreview(query);
    setEditableQuery(query);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onOpen(); // Open the confirmation modal
  };

  const confirmUpdate = async () => {
    try {
      const response = await api.post('/api/execute-custom-query', {
        query: isQueryEditable ? editableQuery : queryPreview,
      });

      toast({
        title: 'Success',
        description: `Query executed successfully. ${response.data.affectedRows} row(s) updated`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose(); // Close the confirmation modal
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

  const addField = (setState) => {
    setState((prev) => [...prev, { key: '', value: '' }]);
  };

  const removeField = (index, setState) => {
    setState((prev) => prev.filter((_, i) => i !== index));
  };

  const updateField = (index, field, value, setState) => {
    setState((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  if (isLoadingTables) {
    return <Spinner />;
  }

  if (tablesError) {
    return <Text>Error loading tables. Please try again.</Text>;
  }

  return (
    <Box maxWidth="600px" margin="auto" mt={8}>
      <Heading mb={4}>Update Data</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Table Name</FormLabel>
            <Select
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="Select a table"
            >
              {tables && tables.map((table) => (
                <option key={table} value={table}>
                  {table}
                </option>
              ))}
            </Select>
          </FormControl>

          {isLoading ? (
            <Spinner />
          ) : (
            <>
              <Text fontWeight="bold">Data to Update</Text>
              {data.map((item, index) => (
                <HStack key={index}>
                  <FormControl isRequired>
                    <Select
                      value={item.key}
                      onChange={(e) => updateField(index, 'key', e.target.value, setData)}
                      placeholder="Select a column"
                    >
                      {columns.map((column) => (
                        <option key={column} value={column}>
                          {column}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <Input
                      value={item.value}
                      onChange={(e) => updateField(index, 'value', e.target.value, setData)}
                      placeholder="Value"
                    />
                  </FormControl>
                  <IconButton
                    icon={<DeleteIcon />}
                    onClick={() => removeField(index, setData)}
                    aria-label="Remove field"
                  />
                </HStack>
              ))}
              <Button leftIcon={<AddIcon />} onClick={() => addField(setData)}>
                Add Field
              </Button>

              <Text fontWeight="bold">Condition</Text>
              {condition.map((item, index) => (
                <HStack key={index}>
                  <FormControl isRequired>
                    <Select
                      value={item.key}
                      onChange={(e) => updateField(index, 'key', e.target.value, setCondition)}
                      placeholder="Select a column"
                    >
                      {columns.map((column) => (
                        <option key={column} value={column}>
                          {column}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <Input
                      value={item.value}
                      onChange={(e) => updateField(index, 'value', e.target.value, setCondition)}
                      placeholder="Value"
                    />
                  </FormControl>
                  <IconButton
                    icon={<DeleteIcon />}
                    onClick={() => removeField(index, setCondition)}
                    aria-label="Remove field"
                  />
                </HStack>
              ))}
              <Button leftIcon={<AddIcon />} onClick={() => addField(setCondition)}>
                Add Condition
              </Button>

              <HStack justifyContent="space-between">
                <Text fontWeight="bold">Query Preview</Text>
                <HStack>
                  <Text fontSize="sm">Edit Query</Text>
                  <Switch
                    isChecked={isQueryEditable}
                    onChange={(e) => setIsQueryEditable(e.target.checked)}
                  />
                </HStack>
              </HStack>
              {isQueryEditable ? (
                <Textarea
                  value={editableQuery}
                  onChange={(e) => setEditableQuery(e.target.value)}
                  rows={4}
                />
              ) : (
                <Code p={2} borderRadius="md">
                  {queryPreview}
                </Code>
              )}

              <Button type="submit" colorScheme="blue">
                Update Data
              </Button>
            </>
          )}
        </VStack>
      </form>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Query</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to execute this query?</Text>
            <Code p={2} borderRadius="md" mt={2}>
              {isQueryEditable ? editableQuery : queryPreview}
            </Code>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={confirmUpdate}>
              Confirm
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UpdateData;