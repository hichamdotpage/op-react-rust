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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Heading,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { 
  Customer, 
  CustomerName, 
  CustomerAddress, 
  CustomerPhone,
  CustomerAdditionalData,
  CustomerExtensionAdditionalData
} from '../../types';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Customer) => void;
  customer: Customer | null;
}

// Country options
const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  // Add more countries as needed
].sort((a, b) => a.name.localeCompare(b.name));

const CustomerModal: React.FC<CustomerModalProps> = ({ isOpen, onClose, onSave, customer }) => {
  // Personal information
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [initials, setInitials] = useState<string>('');
  const [prefix, setPrefix] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  
  // Address
  const [street, setStreet] = useState<string>('');
  const [number, setNumber] = useState<string>('');
  const [suffix, setSuffix] = useState<string>('');
  const [zipcode, setZipcode] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  
  // Phone numbers
  const [phoneCountryCode, setPhoneCountryCode] = useState<string>('');
  const [phoneAreaCode, setPhoneAreaCode] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  
  const [faxCountryCode, setFaxCountryCode] = useState<string>('');
  const [faxAreaCode, setFaxAreaCode] = useState<string>('');
  const [faxNumber, setFaxNumber] = useState<string>('');
  
  // Additional data
  const [additionalData, setAdditionalData] = useState<CustomerAdditionalData>({});
  const [extensionAdditionalData, setExtensionAdditionalData] = useState<CustomerExtensionAdditionalData[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (customer) {
      // Personal information
      setFirstName(customer.name.first_name || '');
      setLastName(customer.name.last_name || '');
      setInitials(customer.name.initials || '');
      setPrefix(customer.name.prefix || '');
      setEmail(customer.email || '');
      setCompanyName(customer.company_name || '');
      
      // Address
      if (customer.address) {
        setStreet(customer.address.street || '');
        setNumber(customer.address.number || '');
        setSuffix(customer.address.suffix || '');
        setZipcode(customer.address.zipcode || '');
        setCity(customer.address.city || '');
        setState(customer.address.state || '');
        setCountry(customer.address.country || '');
      }
      
      // Phone
      if (customer.phone) {
        setPhoneCountryCode(customer.phone.country_code || '');
        setPhoneAreaCode(customer.phone.area_code || '');
        setPhoneNumber(customer.phone.subscriber_number || '');
      }
      
      // Fax
      if (customer.fax) {
        setFaxCountryCode(customer.fax.country_code || '');
        setFaxAreaCode(customer.fax.area_code || '');
        setFaxNumber(customer.fax.subscriber_number || '');
      }
      
      // Additional data
      if (customer.additional_data) {
        setAdditionalData(customer.additional_data);
      }
      
      // Extension additional data
      if (customer.extension_additional_data) {
        setExtensionAdditionalData(customer.extension_additional_data);
      }
    } else {
      // Clear form for new customer
      setFirstName('');
      setLastName('');
      setInitials('');
      setPrefix('');
      setEmail('');
      setCompanyName('');
      
      setStreet('');
      setNumber('');
      setSuffix('');
      setZipcode('');
      setCity('');
      setState('');
      setCountry('');
      
      setPhoneCountryCode('');
      setPhoneAreaCode('');
      setPhoneNumber('');
      
      setFaxCountryCode('');
      setFaxAreaCode('');
      setFaxNumber('');
      
      setAdditionalData({});
      setExtensionAdditionalData([]);
    }
  }, [customer, isOpen]);

  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Basic validation
    if (!firstName || !lastName || !email || !street || !number || 
        !zipcode || !city || !country || !phoneCountryCode || !phoneNumber) {
      alert('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }
    
    // Construct the customer object
    const customerData: Customer = {
      name: {
        first_name: firstName,
        last_name: lastName,
        initials: initials || `${firstName.charAt(0)}.${lastName.charAt(0)}.`,
        prefix: prefix || '',
        full_name: `${firstName} ${prefix ? prefix + ' ' : ''}${lastName}`
      },
      email,
      company_name: companyName || undefined,
      address: {
        street,
        number,
        suffix: suffix || undefined,
        zipcode,
        city,
        state: state || undefined,
        country
      },
      phone: {
        country_code: phoneCountryCode,
        area_code: phoneAreaCode || '',
        subscriber_number: phoneNumber
      }
    };
    
    // Add optional fields if they exist
    if (faxCountryCode && faxNumber) {
      customerData.fax = {
        country_code: faxCountryCode,
        area_code: faxAreaCode || '',
        subscriber_number: faxNumber
      };
    }
    
    // Add additional data if it exists
    if (Object.keys(additionalData).length > 0) {
      customerData.additional_data = additionalData;
    }
    
    // Add extension additional data if it exists
    if (extensionAdditionalData.length > 0) {
      customerData.extension_additional_data = extensionAdditionalData;
    }
    
    onSave(customerData);
    setIsSubmitting(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {customer ? 'Edit Customer' : 'Add Customer'}
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <Tabs>
            <TabList>
              <Tab>Personal Info</Tab>
              <Tab>Address</Tab>
              <Tab>Contact</Tab>
              <Tab>Additional Data</Tab>
            </TabList>

            <TabPanels>
              {/* Personal Information Tab */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel>First Name</FormLabel>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Last Name</FormLabel>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Initials</FormLabel>
                    <Input
                      value={initials}
                      onChange={(e) => setInitials(e.target.value)}
                      placeholder="J.D."
                    />
                    <FormHelperText>
                      Will be generated automatically if left empty
                    </FormHelperText>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Prefix/Title</FormLabel>
                    <Input
                      value={prefix}
                      onChange={(e) => setPrefix(e.target.value)}
                      placeholder="Dr., Mr., Mrs., etc."
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Company Name</FormLabel>
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Company Name (optional)"
                    />
                  </FormControl>
                </VStack>
              </TabPanel>
              
              {/* Address Tab */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel>Street</FormLabel>
                    <Input
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Main Street"
                    />
                  </FormControl>
                  
                  <HStack>
                    <FormControl isRequired>
                      <FormLabel>House Number</FormLabel>
                      <Input
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        placeholder="123"
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Suffix</FormLabel>
                      <Input
                        value={suffix}
                        onChange={(e) => setSuffix(e.target.value)}
                        placeholder="A, B, etc."
                      />
                    </FormControl>
                  </HStack>
                  
                  <FormControl isRequired>
                    <FormLabel>Postal/Zip Code</FormLabel>
                    <Input
                      value={zipcode}
                      onChange={(e) => setZipcode(e.target.value)}
                      placeholder="12345"
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>City</FormLabel>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="New York"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>State/Province</FormLabel>
                    <Input
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="NY"
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Country</FormLabel>
                    <Select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Select country"
                    >
                      {COUNTRIES.map(country => (
                        <option key={country.code} value={country.code}>
                          {country.name} ({country.code})
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </VStack>
              </TabPanel>
              
              {/* Contact Tab */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john.doe@example.com"
                      type="email"
                    />
                  </FormControl>
                  
                  <Box p={4} borderWidth="1px" borderRadius="md">
                    <Text fontWeight="bold" mb={2}>Phone</Text>
                    <HStack spacing={2}>
                      <FormControl isRequired w="30%">
                        <FormLabel>Country Code</FormLabel>
                        <Input
                          value={phoneCountryCode}
                          onChange={(e) => setPhoneCountryCode(e.target.value)}
                          placeholder="+1"
                        />
                      </FormControl>
                      
                      <FormControl w="30%">
                        <FormLabel>Area Code</FormLabel>
                        <Input
                          value={phoneAreaCode}
                          onChange={(e) => setPhoneAreaCode(e.target.value)}
                          placeholder="555"
                        />
                      </FormControl>
                      
                      <FormControl isRequired>
                        <FormLabel>Number</FormLabel>
                        <Input
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="1234567"
                        />
                      </FormControl>
                    </HStack>
                  </Box>
                  
                  <Box p={4} borderWidth="1px" borderRadius="md">
                    <Text fontWeight="bold" mb={2}>Fax (Optional)</Text>
                    <HStack spacing={2}>
                      <FormControl w="30%">
                        <FormLabel>Country Code</FormLabel>
                        <Input
                          value={faxCountryCode}
                          onChange={(e) => setFaxCountryCode(e.target.value)}
                          placeholder="+1"
                        />
                      </FormControl>
                      
                      <FormControl w="30%">
                        <FormLabel>Area Code</FormLabel>
                        <Input
                          value={faxAreaCode}
                          onChange={(e) => setFaxAreaCode(e.target.value)}
                          placeholder="555"
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Number</FormLabel>
                        <Input
                          value={faxNumber}
                          onChange={(e) => setFaxNumber(e.target.value)}
                          placeholder="1234567"
                        />
                      </FormControl>
                    </HStack>
                  </Box>
                </VStack>
              </TabPanel>
              
              {/* Additional Data Tab */}
              <TabPanel>
                <Text mb={4}>
                  Some domain registries require additional information. Add relevant data here if needed.
                </Text>
                
                <Accordion allowToggle>
                  <AccordionItem>
                    <h2>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          <Text fontWeight="medium">General Additional Data</Text>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      <VStack spacing={3} align="stretch">
                        <FormControl>
                          <FormLabel>Company Registration Number</FormLabel>
                          <Input
                            value={additionalData.company_registration_number || ''}
                            onChange={(e) => setAdditionalData({
                              ...additionalData,
                              company_registration_number: e.target.value
                            })}
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Company Registration City</FormLabel>
                          <Input
                            value={additionalData.company_registration_city || ''}
                            onChange={(e) => setAdditionalData({
                              ...additionalData,
                              company_registration_city: e.target.value
                            })}
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>VAT Number</FormLabel>
                          <Input
                            placeholder="Value-added tax identification number"
                            value={additionalData.vat || ''}
                            onChange={(e) => setAdditionalData({
                              ...additionalData,
                              vat: e.target.value
                            })}
                          />
                        </FormControl>
                        
                        <Divider />
                        
                        <FormControl>
                          <FormLabel>Birth Date</FormLabel>
                          <Input
                            type="date"
                            value={additionalData.birth_date || ''}
                            onChange={(e) => setAdditionalData({
                              ...additionalData,
                              birth_date: e.target.value
                            })}
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Birth Country</FormLabel>
                          <Select
                            placeholder="Select country of birth"
                            value={additionalData.birth_country || ''}
                            onChange={(e) => setAdditionalData({
                              ...additionalData,
                              birth_country: e.target.value
                            })}
                          >
                            {COUNTRIES.map(country => (
                              <option key={country.code} value={country.code}>
                                {country.name} ({country.code})
                              </option>
                            ))}
                          </Select>
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Passport Number</FormLabel>
                          <Input
                            value={additionalData.passport_number || ''}
                            onChange={(e) => setAdditionalData({
                              ...additionalData,
                              passport_number: e.target.value
                            })}
                          />
                        </FormControl>
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>
                  
                  <AccordionItem>
                    <h2>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          <Text fontWeight="medium">TLD-Specific Data</Text>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      <Text mb={4}>
                        Some TLDs require specific information. Consult the documentation for requirements.
                      </Text>
                      
                      {/* This could be expanded with specific TLD requirements based on Openprovider's API */}
                      <Box p={4} bg="gray.50" borderRadius="md">
                        <Text fontSize="sm">
                          TLD-specific fields will be added here in the future. For now, please refer to the Openprovider documentation for required fields.
                        </Text>
                      </Box>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CustomerModal;
