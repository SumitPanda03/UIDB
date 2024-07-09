import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, FormControl, FormLabel, Input, Select, VStack, Heading,
  useToast, Container, SimpleGrid, Textarea, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Table, Thead, Tbody, Tr, Th, Td, useDisclosure
} from '@chakra-ui/react';
import { useTableList } from '../hooks/useTableList';
import api from '../services/api';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DataInsertionForm = () => {
  const { data: tables, isLoading: isLoadingTables } = useTableList();
  const [selectedTable, setSelectedTable] = useState('');
  const [tableStructure, setTableStructure] = useState([]);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bulkData, setBulkData] = useState([]);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (selectedTable) {
      fetchTableStructure(selectedTable);
    }
  }, [selectedTable]);





  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

// Add this function
const handleBulkSubmit = async () => {
  if (bulkData.length === 0) {
    toast({
      title: 'No data to insert',
      description: 'Please upload a CSV file first',
      status: 'warning',
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  setIsBulkSubmitting(true);
  try {
    await api.post(`/api/bulk-insert/${selectedTable}`, { data: bulkData });
    toast({
      title: 'Success',
      description: `${bulkData.length} rows inserted successfully`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    setBulkData([]);
  } catch (error) {
    toast({
      title: 'Error inserting bulk data',
      description: error.message,
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  } finally {
    setIsBulkSubmitting(false);
  }
};



  const fetchTableStructure = async (tableName) => {
    try {
      const response = await api.get(`/api/get-table-data/${tableName}?page=1&itemsPerPage=1`);
      setTableStructure(response.data.structure);
      setFormData({});
    } catch (error) {
      toast({
        title: 'Error fetching table structure',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleTableChange = (e) => {
    setSelectedTable(e.target.value);
  };

  const handleInputChange = (e, field) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleDateChange = (date, field) => {
    setFormData({ ...formData, [field]: date });
  };

  const validateForm = () => {
    const errors = [];
    tableStructure.forEach((column) => {
      if (column.Null === 'NO' && column.Key !== 'PRI' && (!formData[column.Field] || formData[column.Field].toString().trim() === '')) {
        errors.push(`${column.Field} is required`);
      }
    });
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach((error) => {
        toast({
          title: 'Validation Error',
          description: error,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      });
      return;
    }

    onOpen(); // Open preview modal
  };

  const confirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.post(`/api/insert/${selectedTable}`, { data: formData });
      toast({
        title: 'Success',
        description: 'Data inserted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setFormData({});
      onClose();
    } catch (error) {
      toast({
        title: 'Error inserting data',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    Papa.parse(file, {
      complete: (results) => {
        setBulkData(results.data);
        toast({
          title: 'File Uploaded',
          description: `${results.data.length} rows parsed successfully`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      },
      header: true,
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const renderField = (column) => {
    switch (column.Type.toLowerCase()) {
      case 'date':
        return (
          <DatePicker
            selected={formData[column.Field]}
            onChange={(date) => handleDateChange(date, column.Field)}
            dateFormat="yyyy-MM-dd"
          />
        );
      case 'text':
        return (
          <Textarea
            value={formData[column.Field] || ''}
            onChange={(e) => handleInputChange(e, column.Field)}
          />
        );
      default:
        return (
          <Input
            type="text"
            value={formData[column.Field] || ''}
            onChange={(e) => handleInputChange(e, column.Field)}
            isDisabled={column.Key === 'PRI' && column.Extra === 'auto_increment'}
          />
        );
    }
  };

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          Data Insertion Form
        </Heading>
        <FormControl>
          <FormLabel>Select Table</FormLabel>
          <Select
            placeholder="Choose a table"
            onChange={handleTableChange}
            value={selectedTable}
            isDisabled={isLoadingTables}
          >
            {tables && tables.map((table) => (
              <option key={table} value={table}>
                {table}
              </option>
            ))}
          </Select>
        </FormControl>
        {selectedTable && (
          <>
            <form onSubmit={handleSubmit}>
              <SimpleGrid columns={[1, 2, 3]} spacing={6}>
                {tableStructure.map((column) => (
                  <FormControl key={column.Field} isRequired={column.Null === 'NO' && column.Key !== 'PRI'}>
                    <FormLabel>{column.Field}</FormLabel>
                    {renderField(column)}
                  </FormControl>
                ))}
              </SimpleGrid>
              <Box mt={6}>
                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={isSubmitting}
                  loadingText="Inserting..."
                  width="full"
                >
                  Preview and Insert
                </Button>
              </Box>
            </form>
            <Box
              {...getRootProps()}
              border="2px dashed"
              borderColor={isDragActive ? "blue.500" : "gray.200"}
              borderRadius="md"
              p={4}
              textAlign="center"
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Drop the CSV file here ...</p>
              ) : (
                <p>Drag 'n' drop a CSV file here, or click to select files</p>
              )}
            </Box>
            <Button
              onClick={handleBulkSubmit}
              colorScheme="green"
              isLoading={isBulkSubmitting}
              loadingText="Inserting..."
              mt={4}
              isDisabled={bulkData.length === 0}
            >
              Insert Bulk Data
            </Button>
          </>
        )}
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Preview Data</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Field</Th>
                  <Th>Value</Th>
                </Tr>
              </Thead>
              <Tbody>
                {Object.entries(formData).map(([key, value]) => (
                  <Tr key={key}>
                    <Td>{key}</Td>
                    <Td>{value instanceof Date ? value.toISOString().split('T')[0] : value}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={confirmSubmit}>
              Confirm Insert
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default DataInsertionForm;