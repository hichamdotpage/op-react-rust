use actix_web::{web, HttpResponse, Responder};
use serde::Deserialize;

use crate::api::OpenproviderClient;
use crate::models::customers::{Customer, CustomerSearchParams};

#[derive(Deserialize)]
pub struct GetCustomersQuery {
    handle_pattern: Option<String>,
    email_pattern: Option<String>,
    first_name_pattern: Option<String>,
    last_name_pattern: Option<String>,
    company_name_pattern: Option<String>,
    comment_pattern: Option<String>,
    with_additional_data: Option<bool>,
    limit: Option<i32>,
    offset: Option<i32>,
}

#[derive(Deserialize)]
pub struct GetCustomerQuery {
    with_additional_data: Option<bool>,
}

// Get all customers matching the filter criteria
pub async fn get_customers(
    query: web::Query<GetCustomersQuery>,
    client: web::Data<OpenproviderClient>
) -> impl Responder {
    // Convert the query to search params
    let params = CustomerSearchParams {
        handle_pattern: query.handle_pattern.clone(),
        email_pattern: query.email_pattern.clone(),
        first_name_pattern: query.first_name_pattern.clone(),
        last_name_pattern: query.last_name_pattern.clone(),
        company_name_pattern: query.company_name_pattern.clone(),
        comment_pattern: query.comment_pattern.clone(),
        with_additional_data: query.with_additional_data,
        limit: query.limit,
        offset: query.offset,
    };
    
    // Make the API call
    match client.get_customers(&params).await {
        Ok(response) => {
            HttpResponse::Ok().json(response)
        },
        Err(err) => {
            log::error!("Error getting customers: {}", err);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to retrieve customers",
                "message": err.to_string()
            }))
        }
    }
}

// Get a specific customer by handle
pub async fn get_customer(
    path: web::Path<String>,
    query: web::Query<GetCustomerQuery>,
    client: web::Data<OpenproviderClient>
) -> impl Responder {
    let handle = path.into_inner();
    let with_additional_data = query.with_additional_data.unwrap_or(false);
    
    // Make the API call
    match client.get_customer(&handle, with_additional_data).await {
        Ok(response) => {
            HttpResponse::Ok().json(response)
        },
        Err(err) => {
            log::error!("Error getting customer {}: {}", handle, err);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to retrieve customer",
                "message": err.to_string()
            }))
        }
    }
}

// Create a new customer
pub async fn create_customer(
    customer: web::Json<Customer>,
    client: web::Data<OpenproviderClient>
) -> impl Responder {
    // Make the API call
    match client.create_customer(&customer).await {
        Ok(response) => {
            HttpResponse::Created().json(response)
        },
        Err(err) => {
            log::error!("Error creating customer: {}", err);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to create customer",
                "message": err.to_string()
            }))
        }
    }
}

// Update an existing customer
pub async fn update_customer(
    path: web::Path<String>,
    customer: web::Json<Customer>,
    client: web::Data<OpenproviderClient>
) -> impl Responder {
    let handle = path.into_inner();
    
    // Make the API call
    match client.update_customer(&handle, &customer).await {
        Ok(response) => {
            HttpResponse::Ok().json(response)
        },
        Err(err) => {
            log::error!("Error updating customer {}: {}", handle, err);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to update customer",
                "message": err.to_string()
            }))
        }
    }
}

// Delete a customer
pub async fn delete_customer(
    path: web::Path<String>,
    client: web::Data<OpenproviderClient>
) -> impl Responder {
    let handle = path.into_inner();
    
    // Make the API call
    match client.delete_customer(&handle).await {
        Ok(response) => {
            HttpResponse::Ok().json(response)
        },
        Err(err) => {
            log::error!("Error deleting customer {}: {}", handle, err);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to delete customer",
                "message": err.to_string()
            }))
        }
    }
}
