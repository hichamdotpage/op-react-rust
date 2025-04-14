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
  Divider,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Spinner,
  Badge,
} from '@chakra-ui/react';
import { useApi } from '../../api/apiClient';
import { DomainInfo, DomainRegistration, NameServer } from '../../types';

interface DomainRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (domainData: DomainRegistration) => void;
  initialDomain?: DomainInfo;
  isEmbedded?: boolean;
}

const PERIODS = [
  { value: 1, label: '1 Year' },
  { value: 2, label: '2 Years' },
  { value: 3, label: '3 Years' },
  { value: 5, label: '5 Years' },
  { value: 10, label: '10 Years' },
];

const DomainRegisterModal: React.FC<DomainRegisterModalProps> = ({
  isOpen,
  onClose,
  onRegister,
  initialDomain,
  isEmbedded = false,
}) => {
  // Domain information
  const [domainName, setDomainName] = useState<string>('');
  const [domainExtension, setDomainExtension] = useState<string>('com');
  const [period, setPeriod] = useState<number>(1);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [checkResult, setCheckResult] = useState<any>(null);
  
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
  
  // Additional data
  const [additionalData, setAdditionalData] = useState<Record<string, string>>({});
  const [requiredFields, setRequiredFields] = useState<any[]>([]);
  
  // Customers list for handles
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState<boolean>(false);
  
  const api = useApi();
  const toast = useToast();
  
  // Common TLD extensions
  const popularTlds = ['com', 'net', 'org', 'io', 'co', 'app', 'dev', 'info'];
  const countryTlds = ['us', 'uk', 'ca', 'eu', 'de', 'fr', 'nl', 'es', 'it', 'au'];
  
  // Initialize with initial domain if provided
  useEffect(() => {
    if (initialDomain) {
      setDomainName(initialDomain.name);
      setDomainExtension(initialDomain.extension);
      
      // Check availability right away
      handleCheckDomain();
    }
  }, [initialDomain]);
  
  // Load customers when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCustomers();
      if (initialDomain) {
        loadAdditionalDataRequirements(initialDomain.extension);
      }
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
  
  // Load additional data requirements for selected TLD
  const loadAdditionalDataRequirements = async (extension: string) => {
    try {
      const response = await api.getDomainAdditionalData(extension);
      setRequiredFields(response.data || []);
    } catch (error) {
      toast({
        title: 'Error loading additional data requirements',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Handle domain extension change
  const handleExtensionChange = (extension: string) => {
    setDomainExtension(extension);
    setIsAvailable(null);
    setCheckResult(null);
    loadAdditionalDataRequirements(extension);
  };
  
  // Check domain availability
  const handleCheckDomain = async () => {
    if (!domainName || !domainExtension) {
      toast({
        title: 'Incomplete information',
        description: 'Please enter a domain name and select an extension',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsChecking(true);
    setIsAvailable(null);
    
    try {
      const response = await api.checkDomainAvailability(
        [{ name: domainName, extension: domainExtension }],
        true
      );
      
      if (response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        setCheckResult(result);
        setIsAvailable(result.status === 'free');
      } else {
        setIsAvailable(false);
        toast({
          title: 'Availability check failed',
          description: 'Could not determine domain availability',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      setIsAvailable(false);
      toast({
        title: 'Error checking domain',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsChecking(false);
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
    if (!domainName || !domainExtension || !ownerHandle || !period) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in all required fields',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Prepare domain registration data
    const domainData: DomainRegistration = {
      domain: {
        name: domainName,
        extension: domainExtension,
      },
      period,
      owner_handle: ownerHandle,
      admin_handle: sameAsOwner ? ownerHandle : adminHandle,
      tech_handle: sameAsOwner ? ownerHandle : techHandle,
      name_servers: nameServers.filter(ns => ns.name.trim() !== ''),
      autorenew: autoRenew,
    };
    
    // Add billing handle if not same as owner
    if (!sameAsOwner && billingHandle) {
      domainData.billing_handle = billingHandle;
    }
    
    // Add additional data if required
    if (Object.keys(additionalData).length > 0) {
      domainData.additional_data = additionalData;
    }
    
    // Call the onRegister callback
    onRegister(domainData);
    
    // Don't close if embedded
    if (!isEmbedded) {
      onClose();
    }
  };
  
  // Handle additional data field change
  const handleAdditionalDataChange = (key: string, value: string) => {
    setAdditionalData({
      ...additionalData,
      [key]: value,
    });
  };
  
  return (
    <>
      {!isEmbedded ? (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Register New Domain</ModalHeader>
            <ModalCloseButton />
            <ModalBody>{renderModalContent()}</ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleSubmit}
                isDisabled={!isAvailable}
              >
                Register Domain
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
          {requiredFields.length > 0 && <Tab>Additional Data</Tab>}
        </TabList>

        <TabPanels>
          {/* Domain Tab */}
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Domain Name</FormLabel>
                <HStack>
                  <Input
                    value={domainName}
                    onChange={(e) => {
                      setDomainName(e.target.value);
                      setIsAvailable(null);
                      setCheckResult(null);
                    }}
                    placeholder="example"
                  />
                  <Text>.</Text>
                  <Select
                    value={domainExtension}
                    onChange={(e) => handleExtensionChange(e.target.value)}
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
              
              <Button
                onClick={handleCheckDomain}
                isLoading={isChecking}
                colorScheme="blue"
              >
                Check Availability
              </Button>
              
              {isChecking && (
                <Box textAlign="center">
                  <Spinner size="sm" mr={2} />
                  <Text display="inline">Checking availability...</Text>
                </Box>
              )}
              
              {isAvailable === true && (
                <Box p={4} bg="green.50" borderRadius="md">
                  <Text color="green.600" fontWeight="bold">
                    {domainName}.{domainExtension} is available!
                  </Text>
                  {checkResult?.price && (
                    <Text mt={2}>
                      Registration Price: {checkResult.price.reseller.currency} {checkResult.price.reseller.price}
                    </Text>
                  )}
                  {checkResult?.is_premium && (
                    <Badge colorScheme="purple" mt={2}>Premium Domain</Badge>
                  )}
                </Box>
              )}
              
              {isAvailable === false && (
                <Box p={4} bg="red.50" borderRadius="md">
                  <Text color="red.600" fontWeight="bold">
                    {domainName}.{domainExtension} is not available
                  </Text>
                  <Text mt={2}>
                    Please try a different domain name or extension.
                  </Text>
                </Box>
              )}
              
              <FormControl isRequired>
                <FormLabel>Registration Period</FormLabel>
                <Select
                  value={period}
                  onChange={(e) => setPeriod(parseInt(e.target.value))}
                >
                  {PERIODS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Auto-Renew</FormLabel>
                <Select
                  value={autoRenew}
                  onChange={(e) => setAutoRenew(e.target.value)}
                >
                  <option value="default">Default (Account Setting)</option>
                  <option value="on">Enabled</option>
                  <option value="off">Disabled</option>
                </Select>
                <FormHelperText>
                  Whether to automatically renew this domain before expiration
                </FormHelperText>
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
                      The legal owner of the domain
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
                        <FormHelperText>
                          Administrative contact for the domain
                        </FormHelperText>
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
                        <FormHelperText>
                          Technical contact for the domain
                        </FormHelperText>
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
                        <FormHelperText>
                          Billing contact for the domain (optional)
                        </FormHelperText>
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
                Enter the nameservers that will handle the DNS for this domain. At least two nameservers are recommended.
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
          
          {/* Additional Data Tab */}
          {requiredFields.length > 0 && (
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Text>
                  The selected TLD requires additional information. Please fill in all required fields.
                </Text>
                
                {requiredFields.map((field) => (
                  <FormControl key={field.name} isRequired={field.required}>
                    <FormLabel>{field.description || field.name}</FormLabel>
                    {field.type === 'select' && field.options ? (
                      <Select
                        value={additionalData[field.name] || ''}
                        onChange={(e) => handleAdditionalDataChange(field.name, e.target.value)}
                        placeholder={`Select ${field.description || field.name}`}
                      >
                        {field.options.map((option: any) => (
                          <option key={option.value} value={option.value}>
                            {option.description || option.value}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <Input
                        value={additionalData[field.name] || ''}
                        onChange={(e) => handleAdditionalDataChange(field.name, e.target.value)}
                        placeholder={field.description || field.name}
                        type={field.type === 'number' ? 'number' : 'text'}
                      />
                    )}
                    {field.description && (
                      <FormHelperText>
                        {field.description}
                      </FormHelperText>
                    )}
                  </FormControl>
                ))}
              </VStack>
            </TabPanel>
          )}
        </TabPanels>
      </Tabs>
    );
  }
};

export default DomainRegisterModal;
