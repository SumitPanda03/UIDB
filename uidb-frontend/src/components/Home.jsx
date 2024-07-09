import React from 'react';
import { Box, Heading, Text, VStack, Center } from '@chakra-ui/react';

function Home() {
  const isLoggedIn = localStorage.getItem('token') !== null;

  return (
    <Box p={8} height="calc(100vh - 64px)"> {/* Adjust 64px if your navbar height is different */}
      {isLoggedIn ? (
        <Center height="100%">
          <Heading size="3xl" fontWeight="bold">
            Welcome to UIDB
          </Heading>
        </Center>
      ) : (
        <VStack spacing={4} align="stretch">
          <Heading>Welcome to UIDB</Heading>
          <Text>Please login or register to continue.</Text>
        </VStack>
      )}
    </Box>
  );
}

export default Home;