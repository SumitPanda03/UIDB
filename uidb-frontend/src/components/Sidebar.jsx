import React from 'react';
import {
  Box,
  VStack,
  Button,
  Divider,
  Heading,
  IconButton,
  Tooltip,
  Flex,
  useColorModeValue,
  Text,
} from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons';
import { FiHome, FiDatabase, FiTable, FiList, FiSearch, FiBarChart2, FiPlusSquare, FiEdit2, FiTrash2, FiFilter, FiFolder } from 'react-icons/fi';
import '../ScrollbarStyles.css';

function Sidebar({ isCollapsed, setIsCollapsed }) {
  const location = useLocation();
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const sidebarItems = [
    { name: 'Dashboard', icon: FiHome, path: '/dashboard' },
    { name: 'Connect Database', icon: FiDatabase, path: '/connect-database' },
    { name: 'Create Table', icon: FiPlusSquare, path: '/create-table' },
    { name: 'Get Tables', icon: FiFolder, path: '/get-tables' },
    { name: 'Get Table Data', icon: FiList, path: '/get-table-data' },
    { name: 'Query Builder', icon: FiFilter, path: '/execute-query' },
    { name: 'Insert Data', icon: FiPlusSquare, path: '/insert-data' },
    { name: 'Update Data', icon: FiEdit2, path: '/update-data' },
    { name: 'Delete Data', icon: FiTrash2, path: '/delete-data' },
    { name: 'Aggregate Functions', icon: FiBarChart2, path: '/aggregate-functions' },
    { name: 'Full Text Search', icon: FiSearch, path: '/full-text-search' },
    { name: 'Order By', icon: FiFilter, path: '/orderby' },
    { name: 'Data Visualization', icon: FiBarChart2, path: '/chart-data' },
  ];

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('blue.50', 'gray.700');
  const activeBg = useColorModeValue('blue.100', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.200');

  return (
    <Box
      as="nav"
      // position="fixed"
      top="96px" // Adjust this value to match your navbar height
      left="0"
      h="calc(100vh - 64px)" // Adjust this value to match your navbar height
      pb="10"
      overflowX="hidden"
      overflowY="auto"
      bg={bg}
      borderColor={borderColor}
      borderRightWidth="1px"
      w={isCollapsed ? "70px" : "240px"}
      transition="all 0.3s"
      zIndex="sticky"
      boxShadow="0 4px 12px 0 rgba(0, 0, 0, 0.05)"
      className="custom-scrollbar"
    >
      <Flex justifyContent="flex-end" p={2}>
        <IconButton
          aria-label="Toggle Sidebar"
          icon={isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          onClick={toggleSidebar}
          variant="ghost"
          _hover={{ bg: hoverBg }}
        />
      </Flex>
      <VStack spacing={1} align="stretch" px={isCollapsed ? 2 : 4} py={4}>
        {!isCollapsed && (
          <>
            <Heading size="md" px={2} mb={4} color={textColor}>Database Ops</Heading>
            <Divider mb={4} />
          </>
        )}
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Tooltip key={item.name} label={isCollapsed ? item.name : ''} placement="right">
              <Button
                as={Link}
                to={item.path}
                leftIcon={<Box as={item.icon} boxSize={5} />}
                justifyContent={isCollapsed ? "center" : "flex-start"}
                variant="ghost"
                w="full"
                py={6}
                borderRadius="md"
                bg={isActive ? activeBg : 'transparent'}
                _hover={{ bg: hoverBg }}
                transition="all 0.2s"
              >
                {!isCollapsed && (
                  <Text fontSize="sm" fontWeight="medium">
                    {item.name}
                  </Text>
                )}
              </Button>
            </Tooltip>
          );
        })}
      </VStack>
    </Box>
  );
}

export default Sidebar;