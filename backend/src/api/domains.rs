use anyhow::{Context, Result};
use serde_json::{self, json};

use super::OpenproviderClient;
use crate::models::domains::{
    DomainCheckRequest, DomainCheckResult,
    DomainRegistration, DomainRegistrationResponse,
    DomainTransfer, DomainTransferResponse,
    Domain, DomainUpdateResponse, DomainRenewResponse, DomainAuthCodeResponse,
    DomainSearchParams, PaginatedResponse, AdditionalDataField
};

impl OpenproviderClient {
    // Check domain availability
    pub async fn check_domains(&self, request: &DomainCheckRequest) -> Result<Vec<DomainCheckResult>> {
        self.authenticated_request(
            reqwest::Method::POST, 
            "/domains/check",
            Some(serde_json::to_value(request).context("Failed to serialize check request")?)
        ).await
    }
    
    // Get domains
    pub async fn get_domains(&self, params: &DomainSearchParams) -> Result<PaginatedResponse<Domain>> {
        // Build query string
        let mut query_parts = Vec::new();
        
        if let Some(ref pattern) = params.domain_name_pattern {
            query_parts.push(format!("domain_name_pattern={}", pattern));
        }
        
        if let Some(ref status) = params.status {
            query_parts.push(format!("status={}", status));
        }
        
        if let Some(ref handle) = params.owner_handle {
            query_parts.push(format!("owner_handle={}", handle));
        }
        
        if let Some(ref handle) = params.tech_handle {
            query_parts.push(format!("tech_handle={}", handle));
        }
        
        if let Some(ref handle) = params.admin_handle {
            query_parts.push(format!("admin_handle={}", handle));
        }
        
        if let Some(ref handle) = params.billing_handle {
            query_parts.push(format!("billing_handle={}", handle));
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
            &format!("/domains{}", query_string),
            None
        ).await
    }
    
    // Get domain by ID
    pub async fn get_domain(&self, id: i32) -> Result<Domain> {
        self.authenticated_request(
            reqwest::Method::GET, 
            &format!("/domains/{}", id),
            None
        ).await
    }
    
    // Register domain
    pub async fn register_domain(&self, domain: &DomainRegistration) -> Result<DomainRegistrationResponse> {
        self.authenticated_request(
            reqwest::Method::POST, 
            "/domains",
            Some(serde_json::to_value(domain).context("Failed to serialize domain registration")?)
        ).await
    }
    
    // Transfer domain
    pub async fn transfer_domain(&self, domain: &DomainTransfer) -> Result<DomainTransferResponse> {
        self.authenticated_request(
            reqwest::Method::POST, 
            "/domains/transfer",
            Some(serde_json::to_value(domain).context("Failed to serialize domain transfer")?)
        ).await
    }
    
    // Update domain
    pub async fn update_domain(&self, id: i32, update_data: serde_json::Value) -> Result<DomainUpdateResponse> {
        self.authenticated_request(
            reqwest::Method::PUT, 
            &format!("/domains/{}", id),
            Some(update_data)
        ).await
    }
    
    // Get domain auth code
    pub async fn get_domain_auth_code(&self, id: i32) -> Result<DomainAuthCodeResponse> {
        self.authenticated_request(
            reqwest::Method::GET, 
            &format!("/domains/{}/authcode", id),
            None
        ).await
    }
    
    // Reset domain auth code
    pub async fn reset_domain_auth_code(&self, id: i32) -> Result<DomainAuthCodeResponse> {
        self.authenticated_request(
            reqwest::Method::POST, 
            &format!("/domains/{}/authcode/reset", id),
            None
        ).await
    }
    
    // Renew domain
    pub async fn renew_domain(&self, id: i32, period: i32) -> Result<DomainRenewResponse> {
        self.authenticated_request(
            reqwest::Method::POST, 
            &format!("/domains/{}/renew", id),
            Some(json!({ "period": period }))
        ).await
    }
    
    // Get domain additional data
    pub async fn get_domain_additional_data(&self, extension: &str) -> Result<Vec<AdditionalDataField>> {
        self.authenticated_request(
            reqwest::Method::GET, 
            &format!("/domains/additional-data?domain.extension={}", extension),
            None
        ).await
    }
    
    // Get customer additional data
    pub async fn get_customer_additional_data(&self, extension: &str) -> Result<Vec<AdditionalDataField>> {
        self.authenticated_request(
            reqwest::Method::GET, 
            &format!("/domains/additional-data/customers?domain.extension={}", extension),
            None
        ).await
    }
}
