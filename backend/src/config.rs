use actix_web::web;
use crate::handlers::{auth, customers, domains, dns};

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            // Authentication routes
            .service(
                web::scope("/auth")
                    .route("/login", web::post().to(auth::login))
            )
            
            // Customer routes
            .service(
                web::scope("/customers")
                    .route("", web::get().to(customers::get_customers))
                    .route("", web::post().to(customers::create_customer))
                    .route("/{handle}", web::get().to(customers::get_customer))
                    .route("/{handle}", web::put().to(customers::update_customer))
                    .route("/{handle}", web::delete().to(customers::delete_customer))
            )
            
            // Domain routes
            .service(
                web::scope("/domains")
                    .route("", web::get().to(domains::get_domains))
                    .route("", web::post().to(domains::register_domain))
                    .route("/check", web::post().to(domains::check_domains))
                    .route("/transfer", web::post().to(domains::transfer_domain))
                    .route("/{id}", web::get().to(domains::get_domain))
                    .route("/{id}", web::put().to(domains::update_domain))
                    .route("/{id}/authcode", web::get().to(domains::get_auth_code))
                    .route("/{id}/authcode/reset", web::post().to(domains::reset_auth_code))
                    .route("/{id}/renew", web::post().to(domains::renew_domain))
                    .route("/additional-data", web::get().to(domains::get_domain_additional_data))
                    .route("/additional-data/customers", web::get().to(domains::get_customer_additional_data))
            )
            
            // DNS routes
            .service(
                web::scope("/dns/zones")
                    .route("", web::get().to(dns::get_zones))
                    .route("", web::post().to(dns::create_zone))
                    .route("/{name}", web::get().to(dns::get_zone))
                    .route("/{name}", web::put().to(dns::update_zone))
                    .route("/{name}", web::delete().to(dns::delete_zone))
            )
    );
}
