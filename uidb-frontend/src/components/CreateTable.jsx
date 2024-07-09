import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  useToast,
  Heading,
  Text,
  IconButton,
  Select,
  Code,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import axios from 'axios';
import api from '../services/api';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import sql from 'react-syntax-highlighter/dist/esm/languages/hljs/sql';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

SyntaxHighlighter.registerLanguage('sql', sql);

const TableCreator = ({ connectionDetails }) => {
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState([{ name: '', type: 'VARCHAR(255)' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [sqlQuery, setSqlQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  const handleAddColumn = () => {
    setColumns([...columns, { name: '', type: 'VARCHAR(255)' }]);
  };

  const handleRemoveColumn = (index) => {
    const newColumns = columns.filter((_, i) => i !== index);
    setColumns(newColumns);
  };

  const handleColumnChange = (index, field, value) => {
    const newColumns = [...columns];
    newColumns[index][field] = value;
    setColumns(newColumns);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post(
        '/api/create-table',
        { tableName, columns: Object.fromEntries(columns.map(col => [col.name, col.type])) },
        { headers: connectionDetails }
      );

      toast({
        title: 'Table Created',
        description: response.data.message,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setSqlQuery(response.data.sqlCommand);
      setIsModalOpen(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'An error occurred while creating the table',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxWidth="600px" margin="auto" mt={8}>
      <Heading size="lg" mb={6}>Create New Table</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={6} align="stretch">
          <FormControl isRequired>
            <FormLabel>Table Name</FormLabel>
            <Input
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="Enter table name"
            />
          </FormControl>

          <Box>
            <Heading size="md" mb={4}>Columns</Heading>
            {columns.map((column, index) => (
              <HStack key={index} spacing={4} mb={4}>
                <FormControl isRequired>
                  <Input
                    placeholder="Column name"
                    value={column.name}
                    onChange={(e) => handleColumnChange(index, 'name', e.target.value)}
                  />
                </FormControl>
                <FormControl isRequired>
                  <Select
                    value={column.type}
                    onChange={(e) => handleColumnChange(index, 'type', e.target.value)}
                  >
                    <option value="VARCHAR(255)">VARCHAR(255)</option>
                    <option value="INT">INT</option>
                    <option value="TEXT">TEXT</option>
                    <option value="DATE">DATE</option>
                    <option value="BOOLEAN">BOOLEAN</option>
                  </Select>
                </FormControl>
                <IconButton
                  icon={<DeleteIcon />}
                  onClick={() => handleRemoveColumn(index)}
                  aria-label="Remove column"
                  colorScheme="red"
                />
              </HStack>
            ))}
            <Button leftIcon={<AddIcon />} onClick={handleAddColumn} colorScheme="teal" size="sm">
              Add Column
            </Button>
          </Box>

          <Button type="submit" colorScheme="blue" isLoading={isLoading}>
            Create Table
          </Button>
        </VStack>
      </form>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>SQL Query Used</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={2}>The following SQL query was used to create the table:</Text>
            <Box borderRadius="md" overflow="hidden">
              <SyntaxHighlighter language="sql" style={docco} customStyle={{
                padding: '16px',
                borderRadius: '8px',
                fontSize: '14px',
              }}>
                {sqlQuery}
              </SyntaxHighlighter>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TableCreator;