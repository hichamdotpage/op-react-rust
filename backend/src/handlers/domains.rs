use actix_web::{web, HttpResponse, Responder};
use serde::Deserialize;
use serde_json::json;
use std::collections::HashMap;

use crate::api::OpenproviderClient;
use crate::models::domains::{
    DomainCheckRequest, DomainRegistration, DomainTransfer, 
    DomainSearchParams
};

#[derive(Deserialize)]
pub struct GetDomainsQuery {
    domain_name_pattern: Option<String>,
    status: Option<String>,
    owner_handle: Option<String>,
    tech_handle: Option<String>,
    admin_handle: Option<String>,
    billing_handle: Option<String>,
    limit: Option<i32>,
    offset: Option<i32>,
}

#[derive(Deserialize)]
pub struct DomainRenewQuery {
    period: Option<i32>,
}

#[derive(Deserialize)]
pub struct DomainAdditionalDataQuery {
    #[serde(rename = "domain.extension")]
    extension: String,
}

// Check domain availability
pub async fn check_domains(
    request: web::Json<DomainCheckRequest>,
    client: web::Data<OpenproviderClient>
) -> impl Responder {
    // Make the API call
    match client.check_domains(&request).await {
        Ok(response) => {
            HttpResponse::Ok().json(response)
        },
        Err(err) => {
            log::error!("Error checking domains: {}", err);
            HttpResponse::InternalServerError().json(json!({
                "error": "Failed to check domains",
                "message": err.to_string()
            }))
        }
    }
}

// Get domains matching criteria
pub async fn get_domains(
    query: web::Query<GetDomainsQuery>,
    client: web::Data<OpenproviderClient>
) -> impl Responder {
    // Convert the query to search params
    let params = DomainSearchParams {
        domain_name_pattern: query.domain_name_pattern.clone(),
        status: query.status.clone(),
        owner_handle: query.owner_handle.clone(),
        tech_handle: query.tech_handle.clone(),
        admin_handle: query.admin_handle.clone(),
        billing_handle: query.billing_handle.clone(),
        limit: query.limit,
        offset: query.offset,
    };
    
    // Make the API call
    match client.get_domains(&params).await {
        Ok(response) => {
            HttpResponse::Ok().json(response)
        },
        Err(err) => {
            log::error!("Error getting domains: {}", err);
            HttpResponse::InternalServerError().json(json!({
                "error": "Failed to retrieve domains",
                "message": err.to_string()
            }))
        }
    }
}

// Get a specific domain by ID
pub async fn get_domain(
    path: web::Path<i32>,
    client: web::Data<OpenproviderClient>
) -> impl Responder {
    let id = path.into_inner();
    
    // Make the API call
    match client.get_domain(id).await {
        Ok(response) => {
            HttpResponse::Ok().json(response)
        },
        Err(err) => {
            log::error!("Error getting domain {}: {}", id, err);
            HttpResponse::InternalServerError().json(json!({
                "error": "Failed to retrieve domain",
                "message": err.to_string()
            }))
        }
    }
}

// Register a new domain
pub async fn register_domain(
    registration: web::Json<DomainRegistration>,
    client: web::Data<OpenproviderClient>
) -> impl Responder {
    // Make the API call
    match client.register_domain(&registration).await {
        Ok(response) => {
            HttpResponse::Created().json(response)
        },
        Err(err) => {
            log::error!("Error registering domain: {}", err);
            HttpResponse::InternalServerError().json(json!({
                "error": "Failed to register domain",
                "message": err.to_string()
            }))
        }
    }
}

// Transfer a domain
pub async fn transfer_domain(
    transfer: web::Json<DomainTransfer>,
    client: web::Data<OpenproviderClient>
) -> impl Responder {
    // Make the API call
    match client.transfer_domain(&transfer).await {
        Ok(response) => {
            HttpResponse::Created().json(response)
        },
        Err(err) => {
            log::error!("Error transferring domain: {}", err);
            HttpResponse::InternalServerError().json(json!({
                "error": "Failed to transfer domain",
                "message": err.to_string()
            }))
        }
    }
}

// Update a domain
pub async fn update_domain(
    path: web::Path<i32>,
    update_data: web::Json<HashMap<String, serde_json::Value>>,
    client: web::Data<OpenproviderClient>
) -> impl Responder {
    let id = path.into_inner();
    
    // Make the API call
    match client.update_domain(id, json!(update_data.into_inner())).await {
        Ok(response) => {
            HttpResponse::Ok().json(response)
        },
        Err(err) => {
            log::error!("Error updating domain {}: {}", id, err);
            HttpResponse::InternalServerError().json(json!({
                "error": "Failed to update domain",
                "message": err.to_string()
            }))
        }
    }
}

// Get domain auth code
pub async fn get_auth_code(
    path: web::Path<i32>,
    client: web::Data<OpenproviderClient>
) -> impl Responder {
    let id = path.into_inner();
    
    // Make the API call
    match client.get_domain_auth_code(id).await {
        Ok(response) => {
            HttpResponse::Ok().json(response)
        },
        Err(err) => {
            log::error!("Error getting auth code for domain {}: {}", id, err);
            HttpResponse::InternalServerError().json(json!({
                "error": "Failed to get auth code",
                "message": err.to_string()
            }))
        }
    }
}

// Reset domain auth code
pub async fn reset_auth_code(
    path: web::Path<i32>,
    client: web::Data<OpenproviderClient>
) -> impl Responder {
    let id = path.into_inner();
    
    // Make the API call
    match client.reset_domain_auth_code(id).await {
        Ok(response) => {
            HttpResponse::Ok().json(response)
        },
        Err(err) => {
            log::error!("Error resetting auth code for domain {}: {}", id, err);
            HttpResponse::InternalServerError().json(json!({
                "error": "Failed to reset auth code",
                "message": err.to_string()
            }))
        }
    }
}

// Renew a domain
pub async fn renew_domain(
    path: web::Path<i32>,
    query: web::Query<DomainRenewQuery>,
    client: web::Data<OpenproviderClient>
) -> impl Responder {
    let id = path.into_inner();
    let period = query.period.unwrap_or(1);
    
    // Make the API call
    match client.renew_domain(id, period).await {
        Ok(response) => {
            HttpResponse::Ok().json(response)
        },
        Err(err) => {
            log::error!("Error renewing domain {}: {}", id, err);
            HttpResponse::InternalServerError().json(json!({
                "error": "Failed to renew domain",
                "message": err.to_string()
            }))
        }
    }
}

// Get domain additional data requirements
pub async fn get_domain_additional_data(
    query: web::Query<DomainAdditionalDataQuery>,
    client: web::Data<OpenproviderClient>
) -> impl Responder {
    let extension = &query.extension;
    
    // Make the API call
    match client.get_domain_additional_data(extension).await {
        Ok(response) => {
            HttpResponse::Ok().json(response)
        },
        Err(err) => {
            log::error!("Error getting additional data for extension {}: {}", extension, err);
            HttpResponse::InternalServerError().json(json!({
                "error": "Failed to get additional data",
                "message": err.to_string()
            }))
        }
    }
}

// Get customer additional data requirements
pub async fn get_customer_additional_data(
    query: web::Query<DomainAdditionalDataQuery>,
    client: web::Data<OpenproviderClient>
) -> impl Responder {
    let extension = &query.extension;
    
    // Make the API call
    match client.get_customer_additional_data(extension).await {
        Ok(response) => {
            HttpResponse::Ok().json(response)
        },
        Err(err) => {
            log::error!("Error getting customer additional data for extension {}: {}", extension, err);
            HttpResponse::InternalServerError().json(json!({
                "error": "Failed to get customer additional data",
                "message": err.to_string()
            }))
        }
    }
}
