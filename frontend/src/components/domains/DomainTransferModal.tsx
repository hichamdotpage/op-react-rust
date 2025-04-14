import React, { useState, useEffect } from 'react';
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
  Select,
  VStack,
  HStack,
  Box,
  Text,
  Checkbox,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  InputGroup,
  InputRightElement,
  IconButton,
  Spinner,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useApi } from '../../api/apiClient';
import { DomainInfo, DomainTransfer, NameServer } from '../../types';

interface DomainTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (transferData: DomainTransfer) => void;
  isEmbedded?: boolean;
}

const DomainTransferModal: React.FC<DomainTransferModalProps> = ({
  isOpen,
  onClose,
  onTransfer,
  isEmbedded = false,
}) => {
  // Domain information
  const [domainName, setDomainName] = useState<string>('');
  const [domainExtension, setDomainExtension] = useState<string>('com');
  const [authCode, setAuthCode] = useState<string>('');
  const [showAuthCode, setShowAuthCode] = useState<boolean>(false);
  
  // Contacts
  const [ownerHandle, setOwnerHandle] = useState<string>('');
  const [adminHandle, setAdminHandle] = useState<string>('');
  const [techHandle, setTechHandle] = useState<string>('');
  const [billingHandle, setBillingHandle] = useState<string>('');
  const [sameAsOwner, setSameAsOwner] = useState<boolean>(true);
  
  // Nameservers
  const [nameServers, setNameServers] = useState<NameServer[]>([
    { name: 'ns1.openprovider.nl' },
    { name: 'ns2.openprovider.be' },
    { name: 'ns3.openprovider.eu' },
  ]);
  
  // Auto-renew
  const [autoRenew, setAutoRenew] = useState<string>('default');
  
  // Customers list for handles
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState<boolean>(false);
  
  const api = useApi();
  const toast = useToast();
  
  // Common TLD extensions
  const popularTlds = ['com', 'net', 'org', 'io', 'co', 'app', 'dev', 'info'];
  const countryTlds = ['us', 'uk', 'ca', 'eu', 'de', 'fr', 'nl', 'es', 'it', 'au'];
  
  // Load customers when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCustomers();
    }
  }, [isOpen]);
  
  // Load customers for handles
  const loadCustomers = async () => {
    setIsLoadingCustomers(true);
    try {
      const response = await api.getCustomers({ limit: 100 });
      setCustomers(response.data.results);
    } catch (error) {
      toast({
        title: 'Error loading customers',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoadingCustomers(false);
    }
  };
  
  // Add/modify nameserver
  const handleNameServerChange = (index: number, value: string) => {
    const updated = [...nameServers];
    updated[index] = { ...updated[index], name: value };
    setNameServers(updated);
  };
  
  // Add a nameserver
  const addNameServer = () => {
    setNameServers([...nameServers, { name: '' }]);
  };
  
  // Remove a nameserver
  const removeNameServer = (index: number) => {
    const updated = nameServers.filter((_, i) => i !== index);
    setNameServers(updated);
  };
  
  // Handle form submission
  const handleSubmit = () => {
    // Check required fields
    if (!domainName || !domainExtension || !authCode || !ownerHandle) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in all required fields',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Prepare domain transfer data
    const transferData: DomainTransfer = {
      domain: {
        name: domainName,
        extension: domainExtension,
      },
      auth_code: authCode,
      owner_handle: ownerHandle,
      admin_handle: sameAsOwner ? ownerHandle : adminHandle,
      tech_handle: sameAsOwner ? ownerHandle : techHandle,
      name_servers: nameServers.filter(ns => ns.name.trim() !== ''),
      autorenew: autoRenew,
    };
    
    // Add billing handle if not same as owner
    if (!sameAsOwner && billingHandle) {
      transferData.billing_handle = billingHandle;
    }
    
    // Call the onTransfer callback
    onTransfer(transferData);
    
    // Don't close if embedded
    if (!isEmbedded) {
      onClose();
    }
  };
  
  return (
    <>
      {!isEmbedded ? (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Transfer Domain</ModalHeader>
            <ModalCloseButton />
            <ModalBody>{renderModalContent()}</ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleSubmit}
              >
                Transfer Domain
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      ) : (
        renderModalContent()
      )}
    </>
  );
  
  function renderModalContent() {
    return (
      <Tabs>
        <TabList>
          <Tab>Domain</Tab>
          <Tab>Contacts</Tab>
          <Tab>Nameservers</Tab>
        </TabList>

        <TabPanels>
          {/* Domain Tab */}
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <Text>
                Transfer a domain from another registrar to Openprovider. You'll need the domain's auth/EPP code from your current registrar.
              </Text>
              
              <FormControl isRequired>
                <FormLabel>Domain Name</FormLabel>
                <HStack>
                  <Input
                    value={domainName}
                    onChange={(e) => setDomainName(e.target.value)}
                    placeholder="example"
                  />
                  <Text>.</Text>
                  <Select
                    value={domainExtension}
                    onChange={(e) => setDomainExtension(e.target.value)}
                    width="150px"
                  >
                    <optgroup label="Popular TLDs">
                      {popularTlds.map(tld => (
                        <option key={tld} value={tld}>{tld}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Country TLDs">
                      {countryTlds.map(tld => (
                        <option key={tld} value={tld}>{tld}</option>
                      ))}
                    </optgroup>
                  </Select>
                </HStack>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Authorization Code (EPP/Auth Code)</FormLabel>
                <InputGroup>
                  <Input
                    type={showAuthCode ? 'text' : 'password'}
                    value={authCode}
                    onChange={(e) => setAuthCode(e.target.value)}
                    placeholder="Enter auth code from current registrar"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showAuthCode ? "Hide auth code" : "Show auth code"}
                      icon={showAuthCode ? <ViewOffIcon /> : <ViewIcon />}
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowAuthCode(!showAuthCode)}
                    />
                  </InputRightElement>
                </InputGroup>
                <FormHelperText>
                  You can get this from your current domain registrar
                </FormHelperText>
              </FormControl>
              
              <Box p={4} bg="blue.50" borderRadius="md">
                <Text fontSize="sm">
                  <strong>Transfer Process:</strong> After submission, the transfer will be initiated. The current registrar will receive a notification and may contact the domain owner for confirmation. Transfers typically complete within 5-7 days.
                </Text>
              </Box>
              
              <FormControl>
                <FormLabel>Auto-Renew After Transfer</FormLabel>
                <Select
                  value={autoRenew}
                  onChange={(e) => setAutoRenew(e.target.value)}
                >
                  <option value="default">Default (Account Setting)</option>
                  <option value="on">Enabled</option>
                  <option value="off">Disabled</option>
                </Select>
              </FormControl>
            </VStack>
          </TabPanel>
          
          {/* Contacts Tab */}
          <TabPanel>
            <VStack spacing={4} align="stretch">
              {isLoadingCustomers ? (
                <Box textAlign="center" py={4}>
                  <Spinner size="md" />
                  <Text mt={2}>Loading customers...</Text>
                </Box>
              ) : (
                <>
                  <FormControl isRequired>
                    <FormLabel>Owner Contact</FormLabel>
                    <Select
                      value={ownerHandle}
                      onChange={(e) => setOwnerHandle(e.target.value)}
                      placeholder="Select owner contact"
                    >
                      {customers.map((customer) => (
                        <option key={customer.handle} value={customer.handle}>
                          {customer.handle} - {customer.name.full_name} {customer.company_name ? `(${customer.company_name})` : ''}
                        </option>
                      ))}
                    </Select>
                    <FormHelperText>
                      The legal owner of the domain after transfer
                    </FormHelperText>
                  </FormControl>
                  
                  <Checkbox
                    isChecked={sameAsOwner}
                    onChange={(e) => setSameAsOwner(e.target.checked)}
                  >
                    Use owner contact for all contacts
                  </Checkbox>
                  
                  {!sameAsOwner && (
                    <>
                      <FormControl isRequired>
                        <FormLabel>Admin Contact</FormLabel>
                        <Select
                          value={adminHandle}
                          onChange={(e) => setAdminHandle(e.target.value)}
                          placeholder="Select admin contact"
                        >
                          {customers.map((customer) => (
                            <option key={customer.handle} value={customer.handle}>
                              {customer.handle} - {customer.name.full_name} {customer.company_name ? `(${customer.company_name})` : ''}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                      
                      <FormControl isRequired>
                        <FormLabel>Technical Contact</FormLabel>
                        <Select
                          value={techHandle}
                          onChange={(e) => setTechHandle(e.target.value)}
                          placeholder="Select technical contact"
                        >
                          {customers.map((customer) => (
                            <option key={customer.handle} value={customer.handle}>
                              {customer.handle} - {customer.name.full_name} {customer.company_name ? `(${customer.company_name})` : ''}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Billing Contact</FormLabel>
                        <Select
                          value={billingHandle}
                          onChange={(e) => setBillingHandle(e.target.value)}
                          placeholder="Select billing contact (optional)"
                        >
                          <option value="">Same as owner</option>
                          {customers.map((customer) => (
                            <option key={customer.handle} value={customer.handle}>
                              {customer.handle} - {customer.name.full_name} {customer.company_name ? `(${customer.company_name})` : ''}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                    </>
                  )}
                </>
              )}
            </VStack>
          </TabPanel>
          
          {/* Nameservers Tab */}
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <Text>
                Enter the nameservers that will handle the DNS for this domain after transfer. At least two nameservers are recommended.
              </Text>
              
              {nameServers.map((ns, index) => (
                <HStack key={index}>
                  <FormControl isRequired>
                    <FormLabel>Nameserver {index + 1}</FormLabel>
                    <Input
                      value={ns.name}
                      onChange={(e) => handleNameServerChange(index, e.target.value)}
                      placeholder="ns1.example.com"
                    />
                  </FormControl>
                  {index > 1 && (
                    <Button
                      colorScheme="red"
                      onClick={() => removeNameServer(index)}
                      alignSelf="flex-end"
                      mb={1}
                    >
                      Remove
                    </Button>
                  )}
                </HStack>
              ))}
              
              {nameServers.length < 5 && (
                <Button onClick={addNameServer} colorScheme="green" size="sm">
                  Add Nameserver
                </Button>
              )}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    );
  }
};

export default DomainTransferModal;
