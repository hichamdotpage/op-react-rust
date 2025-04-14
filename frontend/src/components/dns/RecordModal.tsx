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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  InputGroup,
  InputRightAddon,
} from '@chakra-ui/react';
import { DnsRecord } from '../../types';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: DnsRecord) => void;
  record: DnsRecord | null;
}

const TTL_OPTIONS = [
  { value: 900, label: '15 minutes (900s)' },
  { value: 1800, label: '30 minutes (1800s)' },
  { value: 3600, label: '1 hour (3600s)' },
  { value: 7200, label: '2 hours (7200s)' },
  { value: 10800, label: '3 hours (10800s)' },
  { value: 21600, label: '6 hours (21600s)' },
  { value: 43200, label: '12 hours (43200s)' },
  { value: 86400, label: '1 day (86400s)' },
];

const RECORD_TYPES = [
  { value: 'A', label: 'A (IPv4 Address)' },
  { value: 'AAAA', label: 'AAAA (IPv6 Address)' },
  { value: 'CNAME', label: 'CNAME (Canonical Name)' },
  { value: 'MX', label: 'MX (Mail Exchange)' },
  { value: 'TXT', label: 'TXT (Text)' },
  { value: 'SRV', label: 'SRV (Service)' },
  { value: 'NS', label: 'NS (Name Server)' },
  { value: 'CAA', label: 'CAA (Certificate Authority Authorization)' },
  { value: 'TLSA', label: 'TLSA (TLS Authentication)' },
  { value: 'SSHFP', label: 'SSHFP (SSH Fingerprint)' },
];

const RecordModal: React.FC<RecordModalProps> = ({ isOpen, onClose, onSave, record }) => {
  const [type, setType] = useState<string>('A');
  const [name, setName] = useState<string>('');
  const [value, setValue] = useState<string>('');
  const [ttl, setTtl] = useState<number | string>(3600);
  const [prio, setPrio] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (record) {
      setType(record.type);
      setName(record.name || '');
      setValue(record.value);
      setTtl(record.ttl);
      setPrio(record.prio);
    } else {
      // Default values for new record
      setType('A');
      setName('');
      setValue('');
      setTtl(3600);
      setPrio(undefined);
    }
  }, [record, isOpen]);

  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Basic validation
    if (!value) {
      alert('Please enter a value');
      setIsSubmitting(false);
      return;
    }
    
    // MX requires priority
    if (type === 'MX' && (prio === undefined || prio < 0)) {
      alert('MX records require a valid priority');
      setIsSubmitting(false);
      return;
    }
    
    // Normalize the record data
    const recordData: DnsRecord = {
      type,
      name,
      value,
      ttl,
      ...(type === 'MX' || type === 'SRV' ? { prio } : {}),
    };
    
    onSave(recordData);
    setIsSubmitting(false);
  };

  const getValueHelperText = () => {
    switch (type) {
      case 'A':
        return 'IPv4 address (e.g. 192.168.1.1)';
      case 'AAAA':
        return 'IPv6 address (e.g. 2001:db8::1)';
      case 'CNAME':
        return 'Target domain name (e.g. example.com)';
      case 'MX':
        return 'Mail server hostname (e.g. mail.example.com)';
      case 'TXT':
        return 'Text content (e.g. v=spf1 include:_spf.example.com ~all)';
      case 'SRV':
        return 'Format: weight port target (e.g. 10 5060 sipserver.example.com)';
      case 'NS':
        return 'Nameserver hostname (e.g. ns1.example.com)';
      case 'CAA':
        return 'Format: flags tag value (e.g. 0 issue "letsencrypt.org")';
      default:
        return '';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {record ? 'Edit DNS Record' : 'Add DNS Record'}
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Record Type</FormLabel>
              <Select 
                value={type} 
                onChange={(e) => setType(e.target.value)}
                isDisabled={!!record} // Can't change type when editing
              >
                {RECORD_TYPES.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormControl>
            
            <FormControl>
              <FormLabel>Name</FormLabel>
              <InputGroup>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="subdomain or @ for root"
                />
              </InputGroup>
              <FormHelperText>
                Leave empty or use @ for zone apex. For subdomains, enter only the subdomain part.
              </FormHelperText>
            </FormControl>
            
            {(type === 'MX' || type === 'SRV') && (
              <FormControl isRequired>
                <FormLabel>Priority</FormLabel>
                <NumberInput 
                  min={0} 
                  max={65535} 
                  value={prio || 10} 
                  onChange={(_, val) => setPrio(val)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormHelperText>
                  {type === 'MX' ? 'Lower numbers have higher priority' : 'Service priority value'}
                </FormHelperText>
              </FormControl>
            )}
            
            <FormControl isRequired>
              <FormLabel>Value</FormLabel>
              <Input 
                value={value} 
                onChange={(e) => setValue(e.target.value)} 
                placeholder={`Enter ${type} record value`}
              />
              <FormHelperText>{getValueHelperText()}</FormHelperText>
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>TTL (Time To Live)</FormLabel>
              <Select 
                value={ttl} 
                onChange={(e) => setTtl(parseInt(e.target.value, 10))}
              >
                {TTL_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <FormHelperText>
                Time clients will cache this record before requesting an update
              </FormHelperText>
            </FormControl>
          </VStack>
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

export default RecordModal;
