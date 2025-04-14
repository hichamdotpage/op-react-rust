import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tag,
  IconButton,
  useDisclosure,
  useToast,
  HStack,
  Select,
  Text,
  Spinner,
} from '@chakra-ui/react';
import { SearchIcon, AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useApi } from '../api/apiClient';
import { Customer, ApiResponse, PaginatedResponse } from '../types';
import CustomerModal from '../components/customers/CustomerModal';

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCustomers, setTotalCustomers] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchField, setSearchField] = useState<string>('handle_pattern');
  const [limit, setLimit] = useState<number>(10);
  const [offset, setOffset] = useState<number>(0);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const api = useApi();
  const toast = useToast();

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = {
        limit,
        offset,
      };

      if (searchTerm) {
        params[searchField] = searchTerm;
      }

      const response = await api.getCustomers(params);
      setCustomers(response.data.results);
      setTotalCustomers(response.data.total);
    } catch (error) {
      toast({
        title: 'Error fetching customers',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [limit, offset]);

  const handleSearch = () => {
    setOffset(0);
    fetchCustomers();
  };

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    onOpen();
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    onOpen();
  };

  const handleDeleteCustomer = async (handle: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await api.deleteCustomer(handle);
        toast({
          title: 'Customer deleted',
          description: 'The customer has been successfully deleted.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        fetchCustomers();
      } catch (error) {
        toast({
          title: 'Error deleting customer',
          description: error instanceof Error ? error.message : 'An unexpected error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const handleSaveCustomer = async (customerData: Customer) => {
    try {
      if (selectedCustomer?.handle) {
        await api.updateCustomer(selectedCustomer.handle, customerData);
        toast({
          title: 'Customer updated',
          description: 'The customer has been successfully updated.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        await api.createCustomer(customerData);
        toast({
          title: 'Customer created',
          description: 'The customer has been successfully created.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
      onClose();
      fetchCustomers();
    } catch (error) {
      toast({
        title: selectedCustomer ? 'Error updating customer' : 'Error creating customer',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const totalPages = Math.ceil(totalCustomers / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <Container maxW="container.xl" py={5}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">Customer Handles</Heading>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={handleAddCustomer}
        >
          Add Customer
        </Button>
      </Flex>

      <Flex mb={6} gap={2}>
        <Select 
          value={searchField} 
          onChange={(e) => setSearchField(e.target.value)}
          w="200px"
        >
          <option value="handle_pattern">Handle</option>
          <option value="email_pattern">Email</option>
          <option value="first_name_pattern">First Name</option>
          <option value="last_name_pattern">Last Name</option>
          <option value="company_name_pattern">Company Name</option>
        </Select>
        <InputGroup flex={1}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
        </InputGroup>
        <Button colorScheme="blue" onClick={handleSearch}>
          Search
        </Button>
      </Flex>

      {isLoading ? (
        <Flex justify="center" align="center" h="200px">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <>
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Handle</Th>
                  <Th>Name</Th>
                  <Th>Company</Th>
                  <Th>Email</Th>
                  <Th>Country</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {customers.map((customer) => (
                  <Tr key={customer.handle}>
                    <Td>
                      <Link to={`/customers/${customer.handle}`}>
                        {customer.handle}
                      </Link>
                    </Td>
                    <Td>{customer.name.full_name}</Td>
                    <Td>{customer.company_name || '-'}</Td>
                    <Td>{customer.email}</Td>
                    <Td>{customer.address.country}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <IconButton
                          aria-label="Edit customer"
                          icon={<EditIcon />}
                          size="sm"
                          onClick={() => handleEditCustomer(customer)}
                        />
                        <IconButton
                          aria-label="Delete customer"
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          onClick={() => customer.handle && handleDeleteCustomer(customer.handle)}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

          <Flex justifyContent="space-between" alignItems="center" mt={4}>
            <Text>
              Showing {offset + 1}-{Math.min(offset + limit, totalCustomers)} of {totalCustomers} customers
            </Text>
            <HStack spacing={2}>
              <Button
                size="sm"
                onClick={() => setOffset(Math.max(0, offset - limit))}
                isDisabled={offset === 0}
              >
                Previous
              </Button>
              <Text>
                Page {currentPage} of {totalPages}
              </Text>
              <Button
                size="sm"
                onClick={() => setOffset(offset + limit)}
                isDisabled={offset + limit >= totalCustomers}
              >
                Next
              </Button>
              <Select
                size="sm"
                width="80px"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setOffset(0);
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </Select>
            </HStack>
          </Flex>
        </>
      )}

      <CustomerModal
        isOpen={isOpen}
        onClose={onClose}
        onSave={handleSaveCustomer}
        customer={selectedCustomer}
      />
    </Container>
  );
};

export default CustomersPage;
