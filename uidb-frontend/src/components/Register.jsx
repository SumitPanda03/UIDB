import React, { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, VStack, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/api';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [sqlConnectionDetails, setSqlConnectionDetails] = useState({
    host: '',
    user: '',
    password: '',
    database: ''
  });
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(username, password, sqlConnectionDetails);
      toast({
        title: 'Registered successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error.response?.data?.error || 'An error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={40} ml={75} mr={50}>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Username</FormLabel>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>SQL Host</FormLabel>
            <Input
              type="text"
              value={sqlConnectionDetails.host}
              onChange={(e) => setSqlConnectionDetails({...sqlConnectionDetails, host: e.target.value})}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>SQL User</FormLabel>
            <Input
              type="text"
              value={sqlConnectionDetails.user}
              onChange={(e) => setSqlConnectionDetails({...sqlConnectionDetails, user: e.target.value})}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>SQL Password</FormLabel>
            <Input
              type="password"
              value={sqlConnectionDetails.password}
              onChange={(e) => setSqlConnectionDetails({...sqlConnectionDetails, password: e.target.value})}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>SQL Database</FormLabel>
            <Input
              type="text"
              value={sqlConnectionDetails.database}
              onChange={(e) => setSqlConnectionDetails({...sqlConnectionDetails, database: e.target.value})}
            />
          </FormControl>
          <Button type="submit" colorScheme="blue">
            Register
          </Button>
        </VStack>
      </form>
    </Box>
  );
}

export default Register;