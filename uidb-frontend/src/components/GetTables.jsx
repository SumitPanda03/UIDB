import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  useColorModeValue,
  Container,
  SimpleGrid,
  Skeleton,
  Button,
  useToast,
  Input,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTable, FaSync, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import api from '../services/api';

const TableCard = React.memo(({ tableName }) => {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Box
        bg={bg}
        borderWidth="1px"
        borderRadius="lg"
        borderColor={borderColor}
        p={4}
        transition="all 0.2s"
      >
        <VStack align="start" spacing={2}>
          <FaTable size="24px" color={useColorModeValue('blue.500', 'blue.300')} />
          <Text fontWeight="bold" fontSize="lg">{tableName}</Text>
        </VStack>
      </Box>
    </motion.div>
  );
});

const TableList = () => {
  const [tables, setTables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();

  const fetchTables = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/get-tables');
      setTables(response.data.tables);
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tables. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const filteredTables = useMemo(() => {
    return tables.filter(table => 
      table.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, tables]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Heading size="xl" mb={4}>Your Database Tables</Heading>
          <Button
            leftIcon={<FaSync />}
            onClick={fetchTables}
            isLoading={isLoading}
            loadingText="Refreshing"
            colorScheme="blue"
          >
            Refresh
          </Button>
        </Box>

        <Input
          placeholder="Search tables..."
          value={searchTerm}
          onChange={handleSearchChange}
          leftElement={<FaSearch color="gray.300" />}
        />

        {isLoading ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} height="100px" borderRadius="lg" />
            ))}
          </SimpleGrid>
        ) : (
          <AnimatePresence>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {filteredTables.map((table) => (
                <motion.div
                  key={table}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <TableCard tableName={table} />
                </motion.div>
              ))}
            </SimpleGrid>
          </AnimatePresence>
        )}

        {filteredTables.length === 0 && !isLoading && (
          <Box textAlign="center" py={10}>
            <Text fontSize="xl" fontWeight="medium">No tables found matching your search.</Text>
            <Text mt={2} color="gray.500">Try a different search term or create a new table.</Text>
          </Box>
        )}
      </VStack>
    </Container>
  );
};

export default TableList;