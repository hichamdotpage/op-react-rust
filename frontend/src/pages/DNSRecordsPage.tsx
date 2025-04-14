import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
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
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react';
import { 
  AddIcon, 
  DeleteIcon, 
  EditIcon, 
  ChevronRightIcon, 
  ArrowBackIcon 
} from '@chakra-ui/icons';
import { useApi } from '../api/apiClient';
import { DnsZone, DnsRecord } from '../types';
import RecordModal from '../components/dns/RecordModal';

const DNSRecordsPage: React.FC = () => {
  const { zoneName } = useParams<{ zoneName: string }>();
  const [zone, setZone] = useState<DnsZone | null>(null);
  const [records, setRecords] = useState<DnsRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<DnsRecord | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const api = useApi();
  const toast = useToast();
  const navigate = useNavigate();

  const fetchZoneDetails = async () => {
    if (!zoneName) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.getDnsZone(zoneName, true);
      setZone(response.data);
      
      // Extract records array from response
      if (response.data.records && Array.isArray(response.data.records)) {
        setRecords(response.data.records);
      } else {
        setRecords([]);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      toast({
        title: 'Error fetching DNS records',
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
    fetchZoneDetails();
  }, [zoneName]);

  const handleAddRecord = () => {
    setSelectedRecord(null);
    onOpen();
  };

  const handleEditRecord = (record: DnsRecord) => {
    setSelectedRecord(record);
    onOpen();
  };

  const handleDeleteRecord = async (record: DnsRecord) => {
    if (!zoneName) return;
    
    if (window.confirm(`Are you sure you want to delete this ${record.type} record?`)) {
      try {
        // For DNS, we need to update the zone with a "remove" record operation
        await api.updateDnsZone(zoneName, {
          name: zoneName,
          records: {
            remove: [record]
          }
        });
        
        toast({
          title: 'Record deleted',
          description: 'The DNS record has been successfully deleted.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        fetchZoneDetails();
      } catch (error) {
        toast({
          title: 'Error deleting record',
          description: error instanceof Error ? error.message : 'An unexpected error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const handleSaveRecord = async (recordData: DnsRecord) => {
    if (!zoneName) return;
    
    try {
      // Determine if we are adding a new record or updating an existing one
      if (selectedRecord) {
        // Update existing record
        await api.updateDnsZone(zoneName, {
          name: zoneName,
          records: {
            update: [{
              original_record: selectedRecord,
              record: recordData
            }]
          }
        });
        toast({
          title: 'Record updated',
          description: 'The DNS record has been successfully updated.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        // Add new record
        await api.updateDnsZone(zoneName, {
          name: zoneName,
          records: {
            add: [recordData]
          }
        });
        toast({
          title: 'Record added',
          description: 'The DNS record has been successfully added.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
      
      onClose();
      fetchZoneDetails();
    } catch (error) {
      toast({
        title: selectedRecord ? 'Error updating record' : 'Error adding record',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Group records by type for better organization
  const groupedRecords: Record<string, DnsRecord[]> = {};
  records.forEach(record => {
    if (!groupedRecords[record.type]) {
      groupedRecords[record.type] = [];
    }
    groupedRecords[record.type].push(record);
  });

  // Sort record types for consistent display
  const recordTypes = Object.keys(groupedRecords).sort();
  
  // Get badge color by record type
  const getRecordTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'A': return 'green';
      case 'AAAA': return 'teal';
      case 'CNAME': return 'blue';
      case 'MX': return 'purple';
      case 'TXT': return 'orange';
      case 'SRV': return 'cyan';
      case 'NS': return 'gray';
      case 'CAA': return 'pink';
      default: return 'gray';
    }
  };

  return (
    <Container maxW="container.xl" py={5}>
      <Breadcrumb separator={<ChevronRightIcon color="gray.500" />} mb={4}>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/dns">DNS Zones</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>{zoneName}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">{zoneName}</Heading>
        <HStack spacing={2}>
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="outline"
            onClick={() => navigate('/dns')}
          >
            Back to Zones
          </Button>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={handleAddRecord}
          >
            Add Record
          </Button>
        </HStack>
      </Flex>

      {error && (
        <Alert status="error" mb={6}>
          <AlertIcon />
          <AlertTitle mr={2}>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <Flex justify="center" align="center" h="200px">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <>
          {zone && (
            <Box mb={6} p={4} bg="gray.50" borderRadius="md">
              <Text fontSize="sm" fontWeight="bold" mb={2}>Zone Information</Text>
              <Flex flexWrap="wrap" gap={4}>
                <Box>
                  <Text fontSize="xs" color="gray.500">Type</Text>
                  <Badge colorScheme={zone.type === 'master' ? 'blue' : 'purple'}>
                    {zone.type.charAt(0).toUpperCase() + zone.type.slice(1)}
                  </Badge>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500">Created</Text>
                  <Text fontSize="sm">{zone.creation_date ? new Date(zone.creation_date).toLocaleString() : 'N/A'}</Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500">Modified</Text>
                  <Text fontSize="sm">{zone.modification_date ? new Date(zone.modification_date).toLocaleString() : 'N/A'}</Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500">DNSSEC</Text>
                  <Badge colorScheme={zone.secured ? 'green' : 'gray'}>
                    {zone.secured ? 'Enabled' : 'Disabled'}
                  </Badge>
                </Box>
              </Flex>
            </Box>
          )}

          <Tabs isFitted variant="enclosed">
            <TabList mb="1em">
              <Tab>All Records</Tab>
              {recordTypes.map(type => (
                <Tab key={type}>{type}</Tab>
              ))}
            </TabList>

            <TabPanels>
              <TabPanel px={0}>
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Type</Th>
                        <Th>Name</Th>
                        <Th>Content</Th>
                        <Th>TTL</Th>
                        <Th>Priority</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {records.map((record, index) => (
                        <Tr key={index}>
                          <Td>
                            <Badge colorScheme={getRecordTypeBadgeColor(record.type)}>
                              {record.type}
                            </Badge>
                          </Td>
                          <Td>{record.name || '@'}</Td>
                          <Td>
                            <Box maxW="300px" overflowX="auto">
                              <Text fontSize="sm" fontFamily="mono">{record.value}</Text>
                            </Box>
                          </Td>
                          <Td>{record.ttl}</Td>
                          <Td>{record.prio || '-'}</Td>
                          <Td>
                            <HStack spacing={2}>
                              <IconButton
                                aria-label="Edit record"
                                icon={<EditIcon />}
                                size="sm"
                                onClick={() => handleEditRecord(record)}
                              />
                              <IconButton
                                aria-label="Delete record"
                                icon={<DeleteIcon />}
                                size="sm"
                                colorScheme="red"
                                onClick={() => handleDeleteRecord(record)}
                              />
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                      {records.length === 0 && (
                        <Tr>
                          <Td colSpan={6} textAlign="center" py={4}>
                            No records found. Click "Add Record" to create one.
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </Box>
              </TabPanel>

              {/* Tabs for each record type */}
              {recordTypes.map(type => (
                <TabPanel key={type} px={0}>
                  <Box overflowX="auto">
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Name</Th>
                          <Th>Content</Th>
                          <Th>TTL</Th>
                          {type === 'MX' && <Th>Priority</Th>}
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {groupedRecords[type].map((record, index) => (
                          <Tr key={index}>
                            <Td>{record.name || '@'}</Td>
                            <Td>
                              <Box maxW="300px" overflowX="auto">
                                <Text fontSize="sm" fontFamily="mono">{record.value}</Text>
                              </Box>
                            </Td>
                            <Td>{record.ttl}</Td>
                            {type === 'MX' && <Td>{record.prio}</Td>}
                            <Td>
                              <HStack spacing={2}>
                                <IconButton
                                  aria-label="Edit record"
                                  icon={<EditIcon />}
                                  size="sm"
                                  onClick={() => handleEditRecord(record)}
                                />
                                <IconButton
                                  aria-label="Delete record"
                                  icon={<DeleteIcon />}
                                  size="sm"
                                  colorScheme="red"
                                  onClick={() => handleDeleteRecord(record)}
                                />
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </>
      )}

      <RecordModal
        isOpen={isOpen}
        onClose={onClose}
        onSave={handleSaveRecord}
        record={selectedRecord}
      />
    </Container>
  );
};

export default DNSRecordsPage;
