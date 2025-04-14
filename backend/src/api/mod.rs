// Export the OpenproviderClient and creation function
pub use self::client::{OpenproviderClient, create_openprovider_client};

// Module definitions
mod client;
pub mod auth;
pub mod customers;
pub mod domains;
pub mod dns;

// Reexport the modules
pub use self::auth::*;
pub use self::customers::*;
pub use self::domains::*;
pub use self::dns::*;
