// src/App.jsx
import React, { useEffect, useState } from "react";
import { ChakraProvider, Box, Flex } from "@chakra-ui/react";
import {
    Route,
    Routes,
    Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import ConnectDatabase from "./components/ConnectDatabase";
import CreateTable from "./components/CreateTable";
import GetTables from "./components/GetTables";
import GetTableData from "./components/GetTableData";
import InsertData from "./components/InsertData";
import UpdateData from "./components/UpdateData";
import DeleteData from "./components/DeleteData";
import AggregateFunctions from "./components/AggregateFunctions";
import FullTextSearch from "./components/FullTextSearch";
import OrderBy from "./components/OrderBy";
import { QueryClient, QueryClientProvider } from 'react-query';
import QueryBuilder from "./components/QueryBuilder";
import SQLShell from "./components/SQLShell";
import ChartComponent from "./components/ChartComponent";


function ProtectedRoute({ children }) {
    const token = localStorage.getItem("token");
    return token ? children : <Navigate to="/login" />;
}

const queryClient = new QueryClient();

function App() {
    const isLoggedIn = localStorage.getItem("token") !== null;
    const token = localStorage.getItem("token");
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    useEffect(() => {
        const isLoggedIn = localStorage.getItem("token") !== null;
    }, [token]);

    return (
        <ChakraProvider>
            <Flex flexDirection="column" height="100vh">
                <Navbar />
                <Flex position="relative" flex={1} overflow="hidden">
                    {(
                        <Sidebar
                            isCollapsed={isSidebarCollapsed}
                            setIsCollapsed={setIsSidebarCollapsed}
                        />
                    )}
                    <Box
                        flex={1}
                        p={4}
                        overflow="auto"
                        ml={
                            isLoggedIn
                                ? isSidebarCollapsed
                                    ? "70px"
                                    : "240px"
                                : "0"
                        }
                        // pl={isSidebarCollapsed ? "70px" : "250px"}
                    >
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/connect-database"
                                element={
                                    <ProtectedRoute>
                                        <ConnectDatabase />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/create-table"
                                element={
                                    <ProtectedRoute>
                                        <CreateTable />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/get-tables"
                                element={
                                    <ProtectedRoute>
                                        <GetTables />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/get-table-data"
                                element={
                                    <ProtectedRoute>
                                      <QueryClientProvider client={queryClient}>
                                        <GetTableData />
                                      </QueryClientProvider>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/execute-query"
                                element={
                                    <ProtectedRoute>
                                      <QueryClientProvider client={queryClient}>
                                        <QueryBuilder />
                                      </QueryClientProvider>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/insert-data"
                                element={
                                    <ProtectedRoute>
                                      <QueryClientProvider client={queryClient}>
                                        <InsertData />
                                      </QueryClientProvider>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/update-data"
                                element={
                                    <ProtectedRoute>
                                      <QueryClientProvider client={queryClient}>
                                        <UpdateData />
                                      </QueryClientProvider>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/execute-sql"
                                element={
                                    <ProtectedRoute>
                                      <QueryClientProvider client={queryClient}>
                                        <SQLShell/>
                                      </QueryClientProvider>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/delete-data"
                                element={
                                    <ProtectedRoute>
                                        <QueryClientProvider client={queryClient}>
                                            <DeleteData />
                                        </QueryClientProvider>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/aggregate-functions"
                                element={
                                    <ProtectedRoute>
                                        <QueryClientProvider client={queryClient}>
                                            <AggregateFunctions />
                                        </QueryClientProvider>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/full-text-search"
                                element={
                                    <ProtectedRoute>
                                        <QueryClientProvider client={queryClient}>
                                            <FullTextSearch />
                                        </QueryClientProvider>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/orderby"
                                element={
                                    <ProtectedRoute>
                                        <QueryClientProvider client={queryClient}>
                                            <OrderBy />
                                        </QueryClientProvider>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/chart-data"
                                element={
                                    <ProtectedRoute>
                                        <QueryClientProvider client={queryClient}>
                                            <ChartComponent />
                                        </QueryClientProvider>
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </Box>
                </Flex>
            </Flex>
        </ChakraProvider>
    );
}

export default App;
