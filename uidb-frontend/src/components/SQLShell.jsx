// // src/components/SQLShell.jsx
// import React, { useState, useRef, useEffect } from 'react';
// import {
//   Box,
//   VStack,
//   Input,
//   Text,
//   useToast,
//   Code,
//   Button,
//   Flex,
// } from '@chakra-ui/react';
// import api from '../services/api';

// const SQLShell = () => {
//   const [history, setHistory] = useState([]);
//   const [currentCommand, setCurrentCommand] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const toast = useToast();
//   const bottomRef = useRef(null);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [history]);

//   const executeCommand = async () => {
//     if (!currentCommand.trim()) return;

//     setIsLoading(true);
//     try {
//       const response = await api.post('/api/execute-sql', { query: currentCommand });
//       setHistory(prev => [...prev, 
//         { type: 'command', content: currentCommand },
//         { type: 'result', content: JSON.stringify(response.data, null, 2) }
//       ]);
//       setCurrentCommand('');
//     } catch (error) {
//       setHistory(prev => [...prev, 
//         { type: 'command', content: currentCommand },
//         { type: 'error', content: error.response?.data?.message || 'An error occurred' }
//       ]);
//       toast({
//         title: 'Error',
//         description: error.response?.data?.message || 'An error occurred',
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       executeCommand();
//     }
//   };

//   return (
//     <Box maxWidth="800px" margin="auto" mt={8}>
//       <VStack align="stretch" spacing={4}>
//         <Box 
//           height="400px" 
//           overflowY="auto" 
//           border="1px" 
//           borderColor="gray.200" 
//           borderRadius="md"
//           p={4}
//         >
//           {history.map((item, index) => (
//             <Box key={index} mb={2}>
//               {item.type === 'command' && (
//                 <Text color="blue.500" fontWeight="bold">
//                   {'>'} {item.content}
//                 </Text>
//               )}
//               {item.type === 'result' && (
//                 <Code p={2} borderRadius="md" whiteSpace="pre-wrap">
//                   {item.content}
//                 </Code>
//               )}
//               {item.type === 'error' && (
//                 <Text color="red.500">{item.content}</Text>
//               )}
//             </Box>
//           ))}
//           <div ref={bottomRef} />
//         </Box>
//         <Flex>
//           <Input
//             value={currentCommand}
//             onChange={(e) => setCurrentCommand(e.target.value)}
//             onKeyPress={handleKeyPress}
//             placeholder="Type your SQL command here..."
//             flex={1}
//             mr={2}
//           />
//           <Button 
//             onClick={executeCommand} 
//             isLoading={isLoading}
//             colorScheme="blue"
//           >
//             Execute
//           </Button>
//         </Flex>
//       </VStack>
//     </Box>
//   );
// };

// export default SQLShell;

// src/components/SQLShell.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  VStack,
  Input,
  Text,
  useToast,
  Button,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
} from '@chakra-ui/react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import sql from 'react-syntax-highlighter/dist/esm/languages/hljs/sql';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import api from '../services/api';

SyntaxHighlighter.registerLanguage('sql', sql);

const SQLShell = () => {
  const [history, setHistory] = useState([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const executeCommand = async () => {
    if (!currentCommand.trim()) return;

    setIsLoading(true);
    try {
      const response = await api.post('/api/execute-sql', { query: currentCommand });
      setHistory(prev => [...prev, 
        { type: 'command', content: currentCommand },
        { type: 'result', content: response.data.result, message: response.data.message }
      ]);
      setCurrentCommand('');
    } catch (error) {
      setHistory(prev => [...prev, 
        { type: 'command', content: currentCommand },
        { type: 'error', content: error.response?.data?.message || 'An error occurred' }
      ]);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      executeCommand();
    }
  };

  const renderResult = (result, message) => {
    return (
      <Box>
        <Badge colorScheme="green" mb={2}>{message}</Badge>
        {Array.isArray(result) && result.length > 0 ? (
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                {Object.keys(result[0]).map((column, index) => (
                  <Th key={index}>{column}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {result.map((row, rowIndex) => (
                <Tr key={rowIndex}>
                  {Object.values(row).map((value, colIndex) => (
                    <Td key={colIndex}>{value !== null ? value.toString() : 'NULL'}</Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : (
          <Text>No results returned.</Text>
        )}
      </Box>
    );
  };

  return (
    <Box maxWidth="800px" margin="auto" mt={8}>
      <VStack align="stretch" spacing={4}>
        <Box 
          height="400px" 
          overflowY="auto" 
          border="1px" 
          borderColor="gray.200" 
          borderRadius="md"
          p={4}
        >
          {history.map((item, index) => (
            <Box key={index} mb={4}>
              {item.type === 'command' && (
                <SyntaxHighlighter language="sql" style={docco}>
                  {item.content}
                </SyntaxHighlighter>
              )}
              {item.type === 'result' && (
                <Box mt={2} overflowX="auto">
                  {renderResult(item.content, item.message)}
                </Box>
              )}
              {item.type === 'error' && (
                <Text color="red.500">{item.content}</Text>
              )}
            </Box>
          ))}
          <div ref={bottomRef} />
        </Box>
        <Flex>
          <Input
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your SQL command here..."
            flex={1}
            mr={2}
          />
          <Button 
            onClick={executeCommand} 
            isLoading={isLoading}
            colorScheme="blue"
          >
            Execute
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
};

export default SQLShell;