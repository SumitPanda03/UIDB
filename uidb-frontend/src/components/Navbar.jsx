import React from 'react';
import { Box, Flex, Text, Heading, Icon, useColorMode, HStack, Tooltip } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../services/api';
import { FaDatabase } from "react-icons/fa6";
import { MoonIcon, SunIcon } from '@chakra-ui/icons';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const { colorMode, toggleColorMode } = useColorMode();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const NavLink = ({ to, children }) => (
    <Tooltip label={children} placement="bottom" hasArrow>
      <Text
        as={Link}
        to={to}
        fontSize="sm"
        fontWeight="medium"
        color={colorMode === 'light' ? "gray.600" : "gray.300"}
        position="relative"
        _hover={{
          color: colorMode === 'light' ? "blue.500" : "blue.300",
        }}
        _after={{
          content: "''",
          position: "absolute",
          width: "0%",
          height: "2px",
          bottom: "-4px",
          left: "50%",
          background: colorMode === 'light' ? "blue.500" : "blue.300",
          transition: "all 0.3s ease-in-out",
          transform: "translateX(-50%)",
        }}
        _hover_after={{
          width: "100%",
        }}
        cursor="pointer"
        transition="all 0.3s"
      >
        {children}
      </Text>
    </Tooltip>
  );

  return (
    <Box 
      bg={colorMode === 'light' ? "white" : "gray.800"} 
      px={8} 
      py={4}
      boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
      position="sticky"
      top="0"
      zIndex="sticky"
    >
      <Flex alignItems={'center'} justifyContent={'space-between'}>
        <Heading as="h1" size="md" display="flex" alignItems="center">
          <Icon 
            as={FaDatabase} 
            mr={2} 
            color="blue.500" 
            w={6} 
            h={6}
            transition="transform 0.3s"
            _hover={{ transform: "rotate(15deg)" }}
          />
          <Link to="/" style={{ textDecoration: "none" }}>
            <Text
            bgGradient="linear(to-r, blue.400, teal.400)"
            bgClip="text"
            fontSize="xl"
            fontWeight="extrabold"
            >
              UIDB
            </Text>
          </Link>
        </Heading>
        <HStack spacing={8}>
          {token ? (
            <>
              <NavLink to="/dashboard">DASHBOARD</NavLink>
              <NavLink to="/execute-sql">SQL-SHELL</NavLink>
              <Text
                fontSize="sm"
                fontWeight="medium"
                color="red.500"
                cursor="pointer"
                onClick={handleLogout}
                _hover={{ color: "red.600", textDecoration: "underline" }}
                transition="all 0.3s"
              >
                LOGOUT
              </Text>
              <Tooltip label={`Switch to ${colorMode === 'light' ? 'Dark' : 'Light'} Mode`}>
                <Icon
                  as={colorMode === 'light' ? MoonIcon : SunIcon}
                  w={5}
                  h={5}
                  cursor="pointer"
                  onClick={toggleColorMode}
                  color={colorMode === 'light' ? "gray.600" : "gray.300"}
                  _hover={{ color: colorMode === 'light' ? "blue.500" : "blue.300" }}
                  transition="all 0.3s"
                />
              </Tooltip>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}
        </HStack>
      </Flex>
    </Box>
  );
}

export default Navbar;