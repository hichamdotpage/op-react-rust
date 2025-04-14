use actix_web::{web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};

use crate::api::OpenproviderClient;
use crate::models::auth::LoginRequest;

#[derive(Deserialize)]
pub struct LoginPayload {
    pub username: String,
    pub password: String,
}

#[derive(Serialize)]
pub struct LoginResponseData {
    pub token: String,
    pub reseller_id: i32,
}

// Login handler
pub async fn login(
    payload: web::Json<LoginPayload>,
    client: web::Data<OpenproviderClient>
) -> impl Responder {
    // Create the login request
    let request = LoginRequest {
        username: payload.username.clone(),
        password: payload.password.clone(),
        ip: None, // IP is optional
    };
    
    // Attempt to login
    match client.api_login(&request.username, &request.password).await {
        Ok(response) => {
            // Create the response data
            let response_data = LoginResponseData {
                token: response.token,
                reseller_id: response.reseller_id,
            };
            
            HttpResponse::Ok().json(response_data)
        },
        Err(err) => {
            log::error!("Login error: {}", err);
            HttpResponse::Unauthorized().json(serde_json::json!({
                "error": "Invalid credentials",
                "message": err.to_string()
            }))
        }
    }
}
