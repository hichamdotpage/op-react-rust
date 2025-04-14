use actix_web::{web, HttpResponse, Responder};
use serde::Deserialize;
use serde_json::json;

use crate::api::OpenproviderClient;
use crate::models::dns::{
    DnsZoneSearchParams, DnsZoneCreateRequest, DnsZoneUpdate
};

#[derive(Deserialize)]
pub struct GetZonesQuery {
    name_pattern: Option<String>,
    #[serde(rename = "type")]
    type_field: Option<String>,
    with_records: Option<bool>,
    with_history: Option<bool>,
    limit: Option<i32>,
    offset: Option<i32>,
}

#[derive(Deserialize)]
pub struct GetZoneQuery {
    with_records: Option<bool>,
    with_history: Option<bool>,
    with_dnskey: Option<bool>,
}

// Get DNS zones
pub async fn get_zones(
    query: web::Query<GetZonesQuery>,
    client: web::Data<OpenproviderClient>
) -> impl Responder {
    // Convert the query to search params
    let params = DnsZoneSearchParams {
        name_pattern: query.name_pattern.clone(),
        type_field: query.type_field.clone(),
        with_records: query.with_records,
        with_history: query.with_history,
        limit: query.limit,
        offset: query.offset,
    };
    
    // Make the API call
    match client.get_dns_zones(&params).await {
        Ok(response) => {
            HttpResponse::Ok().json(response)
        },
        Err(err) => {
            log::error!("Error getting DNS zones: {}", err);
            HttpResponse::InternalServerError().json(json!({
                "error": "Failed to retrieve DNS zones",
                "message": err.to_string()
            }))
        }
    }
}

// Get a specific DNS zone
pub async fn get_zone(
    path: web::Path<String>,
    query: web::Query<GetZoneQuery>,
    client: web::Data<OpenproviderClient>
) -> impl Responder {
    let name = path.into_inner();
    let with_records = query.with_records.unwrap_or(true);
    
    // Make the API call
    match client.get_dns_zone(&name, with_records).await {
        Ok(response) => {
            HttpResponse::Ok().json(response)
        },
        Err(err) => {
            log::error!("Error getting DNS zone {}: {}", name, err);
            HttpResponse::InternalServerError().json(json!({
                "error": "Failed to retrieve DNS zone",
                "message": err.to_string()
            }))
        }
    }
}

// Create a new DNS zone
pub async fn create_zone(
    zone: web::Json<DnsZoneCreateRequest>,
    client: web::Data<OpenproviderClient>
) -> impl Responder {
    // Make the API call
    match client.create_dns_zone(&zone).await {
        Ok(response) => {
            HttpResponse::Created().json(response)
        },
        Err(err) => {
            log::error!("Error creating DNS zone: {}", err);
            HttpResponse::InternalServerError().json(json!({
                "error": "Failed to create DNS zone",
                "message": err.to_string()
            }))
        }
    }
}

// Update a DNS zone
pub async fn update_zone(
    path: web::Path<String>,
    update: web::Json<DnsZoneUpdate>,
    client: web::Data<OpenproviderClient>
) -> impl Responder {
    let name = path.into_inner();
    
    // Make the API call
    match client.update_dns_zone(&name, &update).await {
        Ok(response) => {
            HttpResponse::Ok().json(response)
        },
        Err(err) => {
            log::error!("Error updating DNS zone {}: {}", name, err);
            HttpResponse::InternalServerError().json(json!({
                "error": "Failed to update DNS zone",
                "message": err.to_string()
            }))
        }
    }
}

// Delete a DNS zone
pub async fn delete_zone(
    path: web::Path<String>,
    client: web::Data<OpenproviderClient>
) -> impl Responder {
    let name = path.into_inner();
    
    // Make the API call
    match client.delete_dns_zone(&name).await {
        Ok(response) => {
            HttpResponse::Ok().json(response)
        },
        Err(err) => {
            log::error!("Error deleting DNS zone {}: {}", name, err);
            HttpResponse::InternalServerError().json(json!({
                "error": "Failed to delete DNS zone",
                "message": err.to_string()
            }))
        }
    }
}
