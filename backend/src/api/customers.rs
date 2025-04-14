use anyhow::{Context, Result};
use serde_json;

use super::OpenproviderClient;
use crate::models::customers::{
    Customer, CustomerCreateResponse, CustomerUpdateResponse, CustomerDeleteResponse, 
    CustomerSearchParams, PaginatedResponse
};

impl OpenproviderClient {
    // Get customers
    pub async fn get_customers(&self, params: &CustomerSearchParams) -> Result<PaginatedResponse<Customer>> {
        // Build query string
        let mut query_parts = Vec::new();
        
        if let Some(ref pattern) = params.handle_pattern {
            query_parts.push(format!("handle_pattern={}", pattern));
        }
        
        if let Some(ref pattern) = params.email_pattern {
            query_parts.push(format!("email_pattern={}", pattern));
        }
        
        if let Some(ref pattern) = params.first_name_pattern {
            query_parts.push(format!("first_name_pattern={}", pattern));
        }
        
        if let Some(ref pattern) = params.last_name_pattern {
            query_parts.push(format!("last_name_pattern={}", pattern));
        }
        
        if let Some(ref pattern) = params.company_name_pattern {
            query_parts.push(format!("company_name_pattern={}", pattern));
        }
        
        if let Some(ref pattern) = params.comment_pattern {
            query_parts.push(format!("comment_pattern={}", pattern));
        }
        
        if let Some(with_data) = params.with_additional_data {
            query_parts.push(format!("with_additional_data={}", with_data));
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
            &format!("/customers{}", query_string),
            None
        ).await
    }
    
    // Get customer by handle
    pub async fn get_customer(&self, handle: &str, with_additional_data: bool) -> Result<Customer> {
        let query = if with_additional_data {
            format!("?with_additional_data=true")
        } else {
            String::new()
        };
        
        self.authenticated_request(
            reqwest::Method::GET, 
            &format!("/customers/{}{}", handle, query),
            None
        ).await
    }
    
    // Create customer
    pub async fn create_customer(&self, customer: &Customer) -> Result<CustomerCreateResponse> {
        self.authenticated_request(
            reqwest::Method::POST, 
            "/customers",
            Some(serde_json::to_value(customer).context("Failed to serialize customer")?)
        ).await
    }
    
    // Update customer
    pub async fn update_customer(&self, handle: &str, customer: &Customer) -> Result<CustomerUpdateResponse> {
        self.authenticated_request(
            reqwest::Method::PUT, 
            &format!("/customers/{}", handle),
            Some(serde_json::to_value(customer).context("Failed to serialize customer")?)
        ).await
    }
    
    // Delete customer
    pub async fn delete_customer(&self, handle: &str) -> Result<CustomerDeleteResponse> {
        self.authenticated_request(
            reqwest::Method::DELETE, 
            &format!("/customers/{}", handle),
            None
        ).await
    }
}
