// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  useToast,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Card,
  CardHeader,
  CardBody,
  IconButton,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { logout, getUser } from '../services/api';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await getUser();
      setUser(response.data);
    } catch (error) {
      toast({
        title: 'Failed to fetch user data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      navigate('/login');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged out successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: 'Logout failed',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const maskPassword = (password) => {
    return '•'.repeat(password.length);
  };

  if (!user) return <Box>Loading...</Box>;

  return (
    <Box p={8}>
      <VStack spacing={8} align="stretch">
        <HStack justifyContent="space-between">
          <Heading>Dashboard</Heading>
          <Button onClick={handleLogout} colorScheme="red">
            Logout
          </Button>
        </HStack>

        <Card>
          <CardHeader>
            <Heading size="md">User Information</Heading>
          </CardHeader>
          <CardBody>
            <Text><strong>Username:</strong> {user.username}</Text>
            <Text><strong>User ID:</strong> {user._id}</Text>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">SQL Connection Details</Heading>
          </CardHeader>
          <CardBody>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Property</Th>
                    <Th>Value</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>Host</Td>
                    <Td>{user.sqlConnectionDetails.host}</Td>
                  </Tr>
                  <Tr>
                    <Td>User</Td>
                    <Td>{user.sqlConnectionDetails.user}</Td>
                  </Tr>
                  <Tr>
                    <Td>Database</Td>
                    <Td>{user.sqlConnectionDetails.database}</Td>
                  </Tr>
                  <Tr>
                    <Td>Password</Td>
                    <Td>
                      <HStack spacing={2}>
                        <Box 
                          fontFamily="monospace" 
                          letterSpacing="0.1em"
                          minWidth={`${user.sqlConnectionDetails.password.length}ch`}
                        >
                          {showPassword
                            ? user.sqlConnectionDetails.password
                            : maskPassword(user.sqlConnectionDetails.password)}
                        </Box>
                        <IconButton
                          icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                          onClick={togglePasswordVisibility}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          size="sm"
                        />
                      </HStack>
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}

export default Dashboard;