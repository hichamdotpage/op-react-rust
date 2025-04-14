use std::sync::Arc;
use anyhow::{Context, Result};
use reqwest::{Client, header};
use serde::de::DeserializeOwned;
use serde_json::json;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;

use crate::models::*;
use crate::config::Config;

/// Create and export the API client
pub fn create_openprovider_client() -> Result<OpenproviderClient> {
    let config = Config::new().context("Failed to load configuration")?;
    
    // Create HTTP client with reasonable timeouts
    let http_client = Client::builder()
        .timeout(Duration::from_secs(30))
        .build()
        .context("Failed to create HTTP client")?;
    
    // Create API client
    let client = OpenproviderClient {
        config,
        client: http_client,
        auth_token: RwLock::new(None),
        token_expiry: RwLock::new(None),
    };
    
    Ok(client)
}

/// OpenproviderClient is the main interface to interact with the Openprovider API
#[derive(Clone)]
pub struct OpenproviderClient {
    pub(crate) config: Config,
    pub(crate) client: Client,
    pub(crate) auth_token: Arc<RwLock<Option<String>>>,
    pub(crate) token_expiry: Arc<RwLock<Option<Instant>>>,
}

impl OpenproviderClient {
    // Get base URL
    pub(crate) fn base_url(&self) -> String {
        self.config.api_url.clone()
    }
    
    // Check if the token is expired or about to expire
    pub(crate) async fn token_expired(&self) -> bool {
        let expiry = self.token_expiry.read().await;
        if let Some(expiry) = *expiry {
            // Consider the token expired if it's less than 5 minutes from expiry
            return expiry <= Instant::now() + Duration::from_secs(300);
        }
        true // No token or expiry means it's expired
    }
    
    // Get the auth token, refreshing if needed
    pub(crate) async fn get_auth_token(&self) -> Result<String> {
        // Check if we need to refresh the token
        if self.token_expired().await {
            let username = self.config.username.clone();
            let password = self.config.password.clone();
            
            // Login to get a new token
            let login_result = self.login(&username, &password).await?;
            
            // Update token and expiry
            let mut token = self.auth_token.write().await;
            let mut expiry = self.token_expiry.write().await;
            
            *token = Some(login_result.token.clone());
            // Set the token to expire in 23 hours (default is 24)
            *expiry = Some(Instant::now() + Duration::from_secs(23 * 3600));
            
            return Ok(login_result.token);
        }
        
        // Return the existing token
        let token = self.auth_token.read().await;
        token.as_ref()
            .cloned()
            .ok_or_else(|| anyhow::anyhow!("No authentication token available"))
    }
    
    // Make authenticated request
    pub(crate) async fn authenticated_request<T>(&self, method: reqwest::Method, path: &str, body: Option<serde_json::Value>) -> Result<T> 
    where 
        T: DeserializeOwned,
    {
        // Get token
        let token = self.get_auth_token().await?;
        
        // Build request
        let url = format!("{}{}", self.base_url(), path);
        let mut request_builder = self.client.request(method, &url)
            .header(header::AUTHORIZATION, format!("Bearer {}", token))
            .header(header::CONTENT_TYPE, "application/json");
        
        // Add body if provided
        if let Some(json_body) = body {
            request_builder = request_builder.json(&json_body);
        }
        
        // Send request
        let response = request_builder.send().await
            .context("Failed to send request to Openprovider API")?;
        
        // Handle error
        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await
                .context("Failed to read error response")?;
            
            return Err(anyhow::anyhow!("API error ({}): {}", status, error_text));
        }
        
        // Parse response
        let api_response = response.json::<ApiResponse<T>>().await
            .context("Failed to parse API response")?;
        
        // Check API error code
        if api_response.code != 0 {
            return Err(anyhow::anyhow!("API error (code {}): {}", api_response.code, api_response.desc));
        }
        
        Ok(api_response.data)
    }
    
    // Make an unauthenticated request (for login)
    pub(crate) async fn request<T>(&self, method: reqwest::Method, path: &str, body: serde_json::Value) -> Result<T> 
    where 
        T: DeserializeOwned,
    {
        // Build request
        let url = format!("{}{}", self.base_url(), path);
        let request_builder = self.client.request(method, &url)
            .header(header::CONTENT_TYPE, "application/json")
            .json(&body);
        
        // Send request
        let response = request_builder.send().await
            .context("Failed to send request to Openprovider API")?;
        
        // Handle error
        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await
                .context("Failed to read error response")?;
            
            return Err(anyhow::anyhow!("API error ({}): {}", status, error_text));
        }
        
        // Parse response
        let api_response = response.json::<ApiResponse<T>>().await
            .context("Failed to parse API response")?;
        
        // Check API error code
        if api_response.code != 0 {
            return Err(anyhow::anyhow!("API error (code {}): {}", api_response.code, api_response.desc));
        }
        
        Ok(api_response.data)
    }
    
    // Implementation for login
    pub(crate) async fn login(&self, username: &str, password: &str) -> Result<LoginResponse> {
        let login_data = json!({
            "username": username,
            "password": password,
        });
        
        self.request(reqwest::Method::POST, "/auth/login", login_data).await
    }
}
