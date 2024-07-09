import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  useToast,
  Text,
  List,
  ListItem,
  Heading,
} from '@chakra-ui/react';
import { z } from 'zod';
import axios from 'axios';
import api from '../services/api';

const formSchema = z.object({
  host: z.string().min(1, 'Host is required'),
  user: z.string().min(1, 'User is required'),
  password: z.string().min(1, 'Password is required'),
  database: z.string().min(1, 'Database name is required'),
});

const ConnectDatabase = () => {
  const [formData, setFormData] = useState({
    host: '',
    user: '',
    password: '',
    database: '',
  });
  const [existingConnections, setExistingConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchExistingConnections();
  }, []);

  const fetchExistingConnections = async () => {
    try {
      const response = await api.get('/api/connections');
      // console.log(response.data);
      setExistingConnections(response.data);
      console.log(existingConnections);
    } catch (error) {
      console.error('Error fetching existing connections:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch existing connections',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      formSchema.parse(formData);
      const response = await api.post('/api/connect-database', formData);
      toast({
        title: 'Connection Created',
        description: response.data.message,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      fetchExistingConnections();
      setFormData({ host: '', user: '', password: '', database: '' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast({
            title: 'Validation Error',
            description: err.message,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        });
      } else if (error.response && error.response.status === 400) {
        // Handle the case where the database already exists
        toast({
          title: 'Connection Error',
          description: error.response.data.error,
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Connection Error',
          description: error.response?.data?.error || 'An error occurred while creating the connection',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <HStack spacing={8} align="flex-start" p={8}>
      <Box flex={1}>
        <Heading size="md" mb={4}>Existing Connections</Heading>
        <List spacing={3}>
            <ListItem p={3} shadow="md" borderWidth="1px" borderRadius="md">
              <Text><strong>Host:</strong> {existingConnections.host}</Text>
              <Text><strong>User:</strong> {existingConnections.user}</Text>
              <Text><strong>Database:</strong> {existingConnections.database}</Text>
            </ListItem>
        </List>
      </Box>
      <Box flex={1}>
        <Heading size="md" mb={4}>Create New Connection</Heading>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Host</FormLabel>
              <Input name="host" value={formData.host} onChange={handleInputChange} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>User</FormLabel>
              <Input name="user" value={formData.user} onChange={handleInputChange} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <Input name="password" type="password" value={formData.password} onChange={handleInputChange} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Database</FormLabel>
              <Input name="database" value={formData.database} onChange={handleInputChange} />
            </FormControl>
            <Button type="submit" colorScheme="blue" isLoading={isLoading}>
              Create Connection
            </Button>
          </VStack>
        </form>
      </Box>
    </HStack>
  );
};

export default ConnectDatabase;