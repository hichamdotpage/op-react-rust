import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  VStack,
  HStack,
  Box,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Spinner,
  useToast,
  InputGroup,
  InputLeftElement,
  Checkbox,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useApi } from '../../api/apiClient';
import { DomainInfo } from '../../types';

interface DomainSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (domain: DomainInfo) => void;
}

const DomainSearchModal: React.FC<DomainSearchModalProps> = ({
  isOpen,
  onClose,
  onRegister,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [withPrice, setWithPrice] = useState<boolean>(true);
  const [selectedTlds, setSelectedTlds] = useState<string[]>([
    'com', 'net', 'org', 'io', 'co', 'app'
  ]);
  
  const api = useApi();
  const toast = useToast();
  
  // Common TLD extensions
  const availableTlds = {
    popular: ['com', 'net', 'org', 'io', 'co', 'app', 'dev', 'info'],
    country: ['us', 'uk', 'ca', 'eu', 'de', 'fr', 'nl', 'es', 'it', 'au'],
    other: ['biz', 'mobi', 'name', 'tv', 'me', 'xyz', 'club', 'site', 'online', 'tech']
  };
  
  // Handle search form submission
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: 'Missing domain name',
        description: 'Please enter a domain name to search',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (selectedTlds.length === 0) {
      toast({
        title: 'No TLDs selected',
        description: 'Please select at least one TLD to search',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsSearching(true);
    setSearchResults([]);
    
    // Prepare domains to check
    const domains = selectedTlds.map(tld => ({
      name: searchTerm,
      extension: tld
    }));
    
    try {
      const response = await api.checkDomainAvailability(domains, withPrice);
      
      if (response.data.results && response.data.results.length > 0) {
        setSearchResults(response.data.results);
      } else {
        toast({
          title: 'No results found',
          description: 'No information available for the requested domains',
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error checking domains',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle TLD checkbox change
  const handleTldChange = (tld: string) => {
    if (selectedTlds.includes(tld)) {
      setSelectedTlds(selectedTlds.filter(t => t !== tld));
    } else {
      setSelectedTlds([...selectedTlds, tld]);
    }
  };
  
  // Handle domain selection for registration
  const handleSelectDomain = (domain: string) => {
    const [name, extension] = domain.split('.');
    onRegister({ name, extension });
  };
  
  // Format price display
  const formatPrice = (result: any) => {
    if (!result.price) return 'N/A';
    
    const { currency, price } = result.price.reseller;
    return `${currency} ${price.toFixed(2)}`;
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Check Domain Availability</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={6} align="stretch">
            <FormControl>
              <FormLabel>Domain Name</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.300" />
                </InputLeftElement>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter domain name (without extension)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                />
              </InputGroup>
              <FormHelperText>
                Search for availability across multiple TLDs at once
              </FormHelperText>
            </FormControl>
            
            <Box>
              <Text fontWeight="medium" mb={2}>Select TLDs to check</Text>
              
              <Box borderWidth="1px" borderRadius="md" p={4}>
                <Text fontWeight="bold" mb={2}>Popular</Text>
                <Grid templateColumns="repeat(4, 1fr)" gap={2}>
                  {availableTlds.popular.map(tld => (
                    <GridItem key={tld}>
                      <Checkbox
                        isChecked={selectedTlds.includes(tld)}
                        onChange={() => handleTldChange(tld)}
                      >
                        .{tld}
                      </Checkbox>
                    </GridItem>
                  ))}
                </Grid>
              </Box>
              
              <Box borderWidth="1px" borderRadius="md" p={4} mt={4}>
                <Text fontWeight="bold" mb={2}>Country</Text>
                <Grid templateColumns="repeat(4, 1fr)" gap={2}>
                  {availableTlds.country.map(tld => (
                    <GridItem key={tld}>
                      <Checkbox
                        isChecked={selectedTlds.includes(tld)}
                        onChange={() => handleTldChange(tld)}
                      >
                        .{tld}
                      </Checkbox>
                    </GridItem>
                  ))}
                </Grid>
              </Box>
              
              <Box borderWidth="1px" borderRadius="md" p={4} mt={4}>
                <Text fontWeight="bold" mb={2}>Other</Text>
                <Grid templateColumns="repeat(4, 1fr)" gap={2}>
                  {availableTlds.other.map(tld => (
                    <GridItem key={tld}>
                      <Checkbox
                        isChecked={selectedTlds.includes(tld)}
                        onChange={() => handleTldChange(tld)}
                      >
                        .{tld}
                      </Checkbox>
                    </GridItem>
                  ))}
                </Grid>
              </Box>
              
              <Checkbox
                mt={4}
                isChecked={withPrice}
                onChange={(e) => setWithPrice(e.target.checked)}
              >
                Include pricing information
              </Checkbox>
            </Box>
            
            <Button
              colorScheme="blue"
              onClick={handleSearch}
              isLoading={isSearching}
              leftIcon={<SearchIcon />}
            >
              Search Domains
            </Button>
            
            {isSearching && (
              <Box textAlign="center">
                <Spinner size="lg" />
                <Text mt={2}>Checking domain availability...</Text>
              </Box>
            )}
            
            {searchResults.length > 0 && (
              <Box>
                <Text fontWeight="bold" mb={2}>Search Results</Text>
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Domain</Th>
                        <Th>Status</Th>
                        <Th>Price</Th>
                        <Th>Action</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {searchResults.map((result, index) => (
                        <Tr key={index}>
                          <Td fontWeight="medium">{result.domain}</Td>
                          <Td>
                            {result.status === 'free' ? (
                              <Badge colorScheme="green">Available</Badge>
                            ) : (
                              <Badge colorScheme="red">Unavailable</Badge>
                            )}
                            {result.is_premium && (
                              <Badge colorScheme="purple" ml={2}>Premium</Badge>
                            )}
                          </Td>
                          <Td>{formatPrice(result)}</Td>
                          <Td>
                            {result.status === 'free' ? (
                              <Button
                                size="sm"
                                colorScheme="blue"
                                onClick={() => handleSelectDomain(result.domain)}
                              >
                                Register
                              </Button>
                            ) : (
                              <Button size="sm" isDisabled>
                                Unavailable
                              </Button>
                            )}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </Box>
            )}
          </VStack>
        </ModalBody>
        
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DomainSearchModal;
