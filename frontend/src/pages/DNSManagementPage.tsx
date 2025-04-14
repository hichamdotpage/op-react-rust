import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Badge,
  IconButton,
  useDisclosure,
  useToast,
  HStack,
  Select,
  Text,
  Spinner,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { SearchIcon, AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { useApi } from '../api/apiClient';
import { DnsZone, ApiResponse, PaginatedResponse } from '../types';
import CreateZoneModal from '../components/dns/CreateZoneModal';

const DNSManagementPage: React.FC = () => {
  const [zones, setZones] = useState<DnsZone[]>([]);
  const [totalZones, setTotalZones] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [limit, setLimit] = useState<number>(10);
  const [offset, setOffset] = useState<number>(0);
  const [zoneType, setZoneType] = useState<string>('');
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const api = useApi();
  const toast = useToast();
  const navigate = useNavigate();

  const fetchZones = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {
        limit,
        offset,
      };

      if (searchTerm) {
        params.name_pattern = searchTerm;
      }

      if (zoneType) {
        params.type = zoneType;
      }

      const response = await api.getDnsZones(params);
      setZones(response.data.results);
      setTotalZones(response.data.total);
    } catch (error) {
      toast({
        title: 'Error fetching DNS zones',
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
    fetchZones();
  }, [limit, offset, zoneType]);

  const handleSearch = () => {
    setOffset(0);
    fetchZones();
  };

  const handleDeleteZone = async (name: string) => {
    if (window.confirm(`Are you sure you want to delete the zone ${name}?`)) {
      try {
        await api.deleteDnsZone(name);
        toast({
          title: 'Zone deleted',
          description: 'The DNS zone has been successfully deleted.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        fetchZones();
      } catch (error) {
        toast({
          title: 'Error deleting zone',
          description: error instanceof Error ? error.message : 'An unexpected error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const handleCreateZone = async (zoneData: DnsZone) => {
    try {
      await api.createDnsZone(zoneData);
      toast({
        title: 'Zone created',
        description: 'The DNS zone has been successfully created.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onClose();
      fetchZones();
    } catch (error) {
      toast({
        title: 'Error creating zone',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleViewRecords = (zoneName: string) => {
    navigate(`/dns/${zoneName}`);
  };

  const totalPages = Math.ceil(totalZones / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <Container maxW="container.xl" py={5}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">DNS Zones</Heading>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={onOpen}
        >
          Create Zone
        </Button>
      </Flex>

      <Flex mb={6} gap={2}>
        <InputGroup flex={1}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search zones by name..."
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
        <Select 
          value={zoneType} 
          onChange={(e) => setZoneType(e.target.value)}
          w="150px"
          placeholder="All Types"
        >
          <option value="master">Master</option>
          <option value="slave">Slave</option>
        </Select>
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
                  <Th>Zone Name</Th>
                  <Th>Type</Th>
                  <Th>Creation Date</Th>
                  <Th>Last Modified</Th>
                  <Th>DNSSEC</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {zones.map((zone) => (
                  <Tr key={zone.id || zone.name}>
                    <Td>
                      <Link to={`/dns/${zone.name}`}>
                        {zone.name}
                      </Link>
                    </Td>
                    <Td>
                      <Badge colorScheme={zone.type === 'master' ? 'blue' : 'purple'}>
                        {zone.type.charAt(0).toUpperCase() + zone.type.slice(1)}
                      </Badge>
                    </Td>
                    <Td>
                      {zone.creation_date 
                        ? new Date(zone.creation_date).toLocaleDateString() 
                        : 'N/A'}
                    </Td>
                    <Td>
                      {zone.modification_date 
                        ? new Date(zone.modification_date).toLocaleDateString() 
                        : 'N/A'}
                    </Td>
                    <Td>
                      <Badge colorScheme={zone.secured ? 'green' : 'gray'}>
                        {zone.secured ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <IconButton
                          aria-label="Edit DNS Records"
                          icon={<EditIcon />}
                          size="sm"
                          colorScheme="blue"
                          onClick={() => handleViewRecords(zone.name)}
                        />
                        <IconButton
                          aria-label="Delete Zone"
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          onClick={() => handleDeleteZone(zone.name)}
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
              Showing {offset + 1}-{Math.min(offset + limit, totalZones)} of {totalZones} zones
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
                Page {currentPage} of {totalPages || 1}
              </Text>
              <Button
                size="sm"
                onClick={() => setOffset(offset + limit)}
                isDisabled={offset + limit >= totalZones}
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

      <CreateZoneModal
        isOpen={isOpen}
        onClose={onClose}
        onCreateZone={handleCreateZone}
      />
    </Container>
  );
};

export default DNSManagementPage;
