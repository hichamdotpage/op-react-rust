use anyhow::{Context, Result};
use serde_json;

use super::OpenproviderClient;
use crate::models::dns::{
    DnsZoneSearchParams, DnsZone, DnsZoneCreateRequest, DnsZoneCreateResponse,
    DnsZoneUpdate, DnsZoneUpdateResponse, DnsZoneDeleteResponse, PaginatedResponse
};

impl OpenproviderClient {
    // Get DNS zones
    pub async fn get_dns_zones(&self, params: &DnsZoneSearchParams) -> Result<PaginatedResponse<DnsZone>> {
        // Build query string
        let mut query_parts = Vec::new();
        
        if let Some(ref pattern) = params.name_pattern {
            query_parts.push(format!("name_pattern={}", pattern));
        }
        
        if let Some(ref type_field) = params.type_field {
            query_parts.push(format!("type={}", type_field));
        }
        
        if let Some(with_records) = params.with_records {
            query_parts.push(format!("with_records={}", with_records));
        }
        
        if let Some(with_history) = params.with_history {
            query_parts.push(format!("with_history={}", with_history));
        }
        
        if let Some(limit) = params.limit {
            query_parts.push(format!("limit={}", limit));
        }
        
        if let Some(offset) = params.offset {
            query_parts.push(format!("offset={}", offset));
        }
        
        let query_string = if !query_parts.is_empty() {
            format!("?{}", query_parts.join("&"))
        } else {
            String::new()
        };
        
        // Make request
        self.authenticated_request(
            reqwest::Method::GET, 
            &format!("/dns/zones{}", query_string),
            None
        ).await
    }
    
    // Get DNS zone
    pub async fn get_dns_zone(&self, name: &str, with_records: bool) -> Result<DnsZone> {
        let query = if with_records {
            format!("?with_records=true")
        } else {
            String::new()
        };
        
        self.authenticated_request(
            reqwest::Method::GET, 
            &format!("/dns/zones/{}{}", name, query),
            None
        ).await
    }
    
    // Create DNS zone
    pub async fn create_dns_zone(&self, zone: &DnsZoneCreateRequest) -> Result<DnsZoneCreateResponse> {
        self.authenticated_request(
            reqwest::Method::POST, 
            "/dns/zones",
            Some(serde_json::to_value(zone).context("Failed to serialize DNS zone")?)
        ).await
    }
    
    // Update DNS zone
    pub async fn update_dns_zone(&self, name: &str, update: &DnsZoneUpdate) -> Result<DnsZoneUpdateResponse> {
        self.authenticated_request(
            reqwest::Method::PUT, 
            &format!("/dns/zones/{}", name),
            Some(serde_json::to_value(update).context("Failed to serialize DNS zone update")?)
        ).await
    }
    
    // Delete DNS zone
    pub async fn delete_dns_zone(&self, name: &str) -> Result<DnsZoneDeleteResponse> {
        self.authenticated_request(
            reqwest::Method::DELETE, 
            &format!("/dns/zones/{}", name),
            None
        ).await
    }
}
