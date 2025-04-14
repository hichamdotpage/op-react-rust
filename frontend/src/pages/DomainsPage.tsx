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
  Badge,
  IconButton,
  useDisclosure,
  useToast,
  HStack,
  Select,
  Text,
  Spinner,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react';
import { SearchIcon, AddIcon, RepeatIcon, LockIcon, UnlockIcon } from '@chakra-ui/icons';
import { useApi } from '../api/apiClient';
import { Domain, ApiResponse, PaginatedResponse, DomainInfo, DomainCheckResult } from '../types';
import DomainRegisterModal from '../components/domains/DomainRegisterModal';
import DomainTransferModal from '../components/domains/DomainTransferModal';
import DomainSearchModal from '../components/domains/DomainSearchModal';

const DomainsPage: React.FC = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [totalDomains, setTotalDomains] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchField, setSearchField] = useState<string>('domain_name_pattern');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [limit, setLimit] = useState<number>(10);
  const [offset, setOffset] = useState<number>(0);
  
  const registerModal = useDisclosure();
  const transferModal = useDisclosure();
  const searchModal = useDisclosure();
  
  const api = useApi();
  const toast = useToast();

  const fetchDomains = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = {
        limit,
        offset,
      };

      if (searchTerm) {
        params[searchField] = searchTerm;
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await api.getDomains(params);
      setDomains(response.data.results);
      setTotalDomains(response.data.total);
    } catch (error) {
      toast({
        title: 'Error fetching domains',
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
    fetchDomains();
  }, [limit, offset, statusFilter]);

  const handleSearch = () => {
    setOffset(0);
    fetchDomains();
  };

  const handleRenewDomain = async (id: number) => {
    if (window.confirm('Are you sure you want to renew this domain?')) {
      try {
        await api.renewDomain(id.toString());
        toast({
          title: 'Domain renewed',
          description: 'The domain has been successfully renewed.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        fetchDomains();
      } catch (error) {
        toast({
          title: 'Error renewing domain',
          description: error instanceof Error ? error.message : 'An unexpected error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const handleToggleLock = async (domain: Domain) => {
    try {
      await api.updateDomain(domain.id.toString(), {
        is_locked: !domain.is_locked,
      });
      toast({
        title: domain.is_locked ? 'Domain unlocked' : 'Domain locked',
        description: `The domain has been successfully ${domain.is_locked ? 'unlocked' : 'locked'}.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      fetchDomains();
    } catch (error) {
      toast({
        title: `Error ${domain.is_locked ? 'unlocking' : 'locking'} domain`,
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleRegisterDomain = async (domainData: any) => {
    try {
      await api.registerDomain(domainData);
      toast({
        title: 'Domain registered',
        description: 'The domain has been successfully registered.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      registerModal.onClose();
      fetchDomains();
    } catch (error) {
      toast({
        title: 'Error registering domain',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleTransferDomain = async (transferData: any) => {
    try {
      await api.transferDomain(transferData);
      toast({
        title: 'Domain transfer initiated',
        description: 'The domain transfer has been successfully initiated.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      transferModal.onClose();
      fetchDomains();
    } catch (error) {
      toast({
        title: 'Error transferring domain',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACT':
        return <Badge colorScheme="green">Active</Badge>;
      case 'REQ':
        return <Badge colorScheme="yellow">Requested</Badge>;
      case 'FAI':
        return <Badge colorScheme="red">Failed</Badge>;
      case 'DEL':
        return <Badge colorScheme="gray">Deleted</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const totalPages = Math.ceil(totalDomains / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <Container maxW="container.xl" py={5}>
      <Tabs>
        <TabList>
          <Tab>My Domains</Tab>
          <Tab>Register New</Tab>
          <Tab>Transfer In</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <Flex justifyContent="space-between" alignItems="center" mb={6}>
              <Heading size="lg">Domain Portfolio</Heading>
              <HStack>
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="blue"
                  onClick={searchModal.onOpen}
                >
                  Check Availability
                </Button>
              </HStack>
            </Flex>

            <Flex mb={6} gap={2}>
              <Select 
                value={searchField} 
                onChange={(e) => setSearchField(e.target.value)}
                w="200px"
              >
                <option value="domain_name_pattern">Domain Name</option>
                <option value="owner_handle">Owner Handle</option>
                <option value="tech_handle">Tech Handle</option>
                <option value="admin_handle">Admin Handle</option>
              </Select>
              <InputGroup flex={1}>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Search domains..."
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
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                w="150px"
                placeholder="All Status"
              >
                <option value="ACT">Active</option>
                <option value="REQ">Requested</option>
                <option value="FAI">Failed</option>
                <option value="DEL">Deleted</option>
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
                        <Th>Domain</Th>
                        <Th>Status</Th>
                        <Th>Expiration</Th>
                        <Th>Owner</Th>
                        <Th>Auto Renew</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {domains.map((domain) => (
                        <Tr key={domain.id}>
                          <Td>
                            <Link to={`/domains/${domain.id}`}>
                              {domain.domain.name}.{domain.domain.extension}
                            </Link>
                          </Td>
                          <Td>{getStatusBadge(domain.status)}</Td>
                          <Td>{new Date(domain.expiration_date).toLocaleDateString()}</Td>
                          <Td>
                            {domain.owner?.company_name || domain.owner?.full_name || domain.owner_handle}
                          </Td>
                          <Td>
                            <Badge colorScheme={domain.autorenew === 'on' ? 'green' : 'gray'}>
                              {domain.autorenew === 'on' ? 'On' : domain.autorenew === 'off' ? 'Off' : 'Default'}
                            </Badge>
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <IconButton
                                aria-label="Renew domain"
                                icon={<RepeatIcon />}
                                size="sm"
                                colorScheme="green"
                                isDisabled={!domain.can_renew}
                                onClick={() => handleRenewDomain(domain.id)}
                              />
                              {domain.is_lockable && (
                                <IconButton
                                  aria-label={domain.is_locked ? "Unlock domain" : "Lock domain"}
                                  icon={domain.is_locked ? <UnlockIcon /> : <LockIcon />}
                                  size="sm"
                                  colorScheme={domain.is_locked ? "orange" : "blue"}
                                  onClick={() => handleToggleLock(domain)}
                                />
                              )}
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>

                <Flex justifyContent="space-between" alignItems="center" mt={4}>
                  <Text>
                    Showing {offset + 1}-{Math.min(offset + limit, totalDomains)} of {totalDomains} domains
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
                      isDisabled={offset + limit >= totalDomains}
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
          </TabPanel>

          <TabPanel>
            <Heading size="lg" mb={6}>Register New Domain</Heading>
            <DomainRegisterModal 
              isOpen={true} 
              onClose={() => {}} 
              onRegister={handleRegisterDomain} 
              isEmbedded={true}
            />
          </TabPanel>

          <TabPanel>
            <Heading size="lg" mb={6}>Transfer Domain</Heading>
            <DomainTransferModal 
              isOpen={true} 
              onClose={() => {}} 
              onTransfer={handleTransferDomain} 
              isEmbedded={true}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>

      <DomainSearchModal
        isOpen={searchModal.isOpen}
        onClose={searchModal.onClose}
        onRegister={(domainData) => {
          searchModal.onClose();
          registerModal.onOpen();
        }}
      />

      <DomainRegisterModal
        isOpen={registerModal.isOpen}
        onClose={registerModal.onClose}
        onRegister={handleRegisterDomain}
      />

      <DomainTransferModal
        isOpen={transferModal.isOpen}
        onClose={transferModal.onClose}
        onTransfer={handleTransferDomain}
      />
    </Container>
  );
};

export default DomainsPage;
