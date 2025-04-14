use super::OpenproviderClient;
use crate::models::auth::LoginResponse;
use anyhow::Result;

impl OpenproviderClient {
    // Public login method (this is just a proxy to the internal one)
    pub async fn api_login(&self, username: &str, password: &str) -> Result<LoginResponse> {
        self.login(username, password).await
    }
}
