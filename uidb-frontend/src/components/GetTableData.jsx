// components/DatabaseExplorer.js
import React, { useState } from "react";
import {
    Box,
    Container,
    Heading,
    Select,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TabPanels,
    TabPanel,
    Tabs,
    TabList,
    Tab,
    Spinner,
    Text,
    Badge,
    Button,
    useColorModeValue,
    VStack,
    HStack,
    IconButton,
} from "@chakra-ui/react";
import { useQuery } from "react-query";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useTableList } from "../hooks/useTableList";
import api from "../services/api";

const ITEMS_PER_PAGE = 10; // You can adjust this value

const fetchTableData = async (tableName, page = 1) => {
    const response = await api.get(`/api/get-table-data/${tableName}`, {
        params: { page, itemsPerPage: ITEMS_PER_PAGE }
    });
    console.log(response.data);
    return response.data;
};

const DatabaseExplorer = () => {
    const [selectedTable, setSelectedTable] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const bgColor = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.700");

    const {
        data: tables,
        isLoading: isLoadingTables,
        error: tablesError,
    } = useTableList();

    const {
        data: tableData,
        isLoading: isLoadingTableData,
        error: tableDataError,
    } = useQuery(
        ["tableData", selectedTable, currentPage],
        () => fetchTableData(selectedTable, currentPage),
        {
            enabled: !!selectedTable,
        }
    );

    const totalPages = tableData ? Math.ceil(tableData.totalItems / ITEMS_PER_PAGE) : 0;

    const handlePreviousPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
    };

    if (isLoadingTables) return <Spinner />;
    if (tablesError)
        return <Text>Error loading tables: {tablesError.message}</Text>;

    return (
        <Container maxW="container.xl" py={8}>
            <VStack spacing={8} align="stretch">
                <Heading size="xl">Database Explorer</Heading>

                <Select
                    placeholder="Select a table"
                    value={selectedTable}
                    onChange={(e) => {
                        setSelectedTable(e.target.value);
                        setCurrentPage(1); // Reset to first page when changing tables
                    }}
                >
                    {tables.map((table) => (
                        <option key={table} value={table}>
                            {table}
                        </option>
                    ))}
                </Select>

                {selectedTable && (
                    <Tabs isFitted variant="enclosed">
                        <TabList mb="1em">
                            <Tab>Structure</Tab>
                            <Tab>Data</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                <Box
                                    overflowX="auto"
                                    borderWidth={1}
                                    borderColor={borderColor}
                                    borderRadius="md"
                                >
                                    {isLoadingTableData ? (
                                        <Spinner />
                                    ) : tableDataError ? (
                                        <Text>
                                            Error loading table structure:{" "}
                                            {tableDataError.message}
                                        </Text>
                                    ) : (
                                        <Table variant="simple">
                                            <Thead>
                                                <Tr>
                                                    <Th>Field</Th>
                                                    <Th>Type</Th>
                                                    <Th>Null</Th>
                                                    <Th>Key</Th>
                                                    <Th>Default</Th>
                                                    <Th>Extra</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {tableData.structure.map(
                                                    (column, index) => (
                                                        <Tr key={index}>
                                                            <Td>{column.Field}</Td>
                                                            <Td>{column.Type}</Td>
                                                            <Td>{column.Null}</Td>
                                                            <Td>
                                                                {column.Key && (
                                                                    <Badge colorScheme="green">
                                                                        {column.Key}
                                                                    </Badge>
                                                                )}
                                                            </Td>
                                                            <Td>{column.Default}</Td>
                                                            <Td>{column.Extra}</Td>
                                                        </Tr>
                                                    )
                                                )}
                                            </Tbody>
                                        </Table>
                                    )}
                                </Box>
                            </TabPanel>
                            <TabPanel>
                                <Box
                                    overflowX="auto"
                                    borderWidth={1}
                                    borderColor={borderColor}
                                    borderRadius="md"
                                >
                                    {isLoadingTableData ? (
                                        <Spinner />
                                    ) : tableDataError ? (
                                        <Text>
                                            Error loading table data:{" "}
                                            {tableDataError.message}
                                        </Text>
                                    ) : (
                                        <>
                                            <Table variant="simple">
                                                <Thead>
                                                    <Tr>
                                                        {tableData.structure.map(
                                                            (column) => (
                                                                <Th key={column.Field}>
                                                                    {column.Field}
                                                                </Th>
                                                            )
                                                        )}
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    {tableData.data.map(
                                                        (row, rowIndex) => (
                                                            <Tr key={rowIndex}>
                                                                {tableData.structure.map(
                                                                    (column) => (
                                                                        <Td key={column.Field}>
                                                                            {row[column.Field]}
                                                                        </Td>
                                                                    )
                                                                )}
                                                            </Tr>
                                                        )
                                                    )}
                                                </Tbody>
                                            </Table>
                                            <HStack justifyContent="center" mt={4}>
                                                <IconButton
                                                    icon={<ChevronLeftIcon />}
                                                    onClick={handlePreviousPage}
                                                    isDisabled={currentPage === 1}
                                                    aria-label="Previous page"
                                                />
                                                <Text>
                                                    Page {currentPage} of {totalPages}
                                                </Text>
                                                <IconButton
                                                    icon={<ChevronRightIcon />}
                                                    onClick={handleNextPage}
                                                    isDisabled={currentPage === totalPages}
                                                    aria-label="Next page"
                                                />
                                            </HStack>
                                        </>
                                    )}
                                </Box>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                )}
            </VStack>
        </Container>
    );
};

export default DatabaseExplorer;