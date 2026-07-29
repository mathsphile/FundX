#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    token::{StellarAssetClient, Client as TokenClient},
    Address, Env, String,
};

#[test]
fn test_create_donate_withdraw_flow() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let creator = Address::generate(&env);
    let contributor = Address::generate(&env);

    // Create mock SAC token
    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_address = token_contract.address();
    let token_client = TokenClient::new(&env, &token_address);
    let token_admin_client = StellarAssetClient::new(&env, &token_address);

    // Mint token balance to contributor
    token_admin_client.mint(&contributor, &1000);

    // Register contract
    let contract_id = env.register(CrowdFundXContract, ());
    let client = CrowdFundXContractClient::new(&env, &contract_id);

    // Initialize
    client.initialize(&admin, &token_address);

    // Create campaign: Goal 500 XLM, deadline in 100 seconds
    let deadline = env.ledger().timestamp() + 100;
    let title = String::from_str(&env, "Build Next-Gen DApp on Stellar");
    let campaign_id = client.create_campaign(&creator, &title, &500i128, &deadline);

    assert_eq!(campaign_id, 1);
    assert_eq!(client.get_campaign_count(), 1);

    // Donate 600 XLM
    client.donate(&contributor, &campaign_id, &600i128);

    let campaign = client.get_campaign(&campaign_id);
    assert_eq!(campaign.total_raised, 600i128);
    assert_eq!(client.get_donation(&contributor, &campaign_id), 600i128);
    assert_eq!(token_client.balance(&contract_id), 600i128);

    // Creator withdraws
    client.withdraw(&creator, &campaign_id);

    assert_eq!(token_client.balance(&creator), 600i128);
    assert_eq!(token_client.balance(&contract_id), 0i128);
    assert!(client.get_campaign(&campaign_id).withdrawn);
}

#[test]
fn test_refund_flow() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let creator = Address::generate(&env);
    let contributor = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_address = token_contract.address();
    let token_client = TokenClient::new(&env, &token_address);
    let token_admin_client = StellarAssetClient::new(&env, &token_address);

    token_admin_client.mint(&contributor, &1000);

    let contract_id = env.register(CrowdFundXContract, ());
    let client = CrowdFundXContractClient::new(&env, &contract_id);

    client.initialize(&admin, &token_address);

    // Deadline 50 seconds from now, Goal 1000
    let deadline = env.ledger().timestamp() + 50;
    let title = String::from_str(&env, "Failing Campaign Demo");
    let campaign_id = client.create_campaign(&creator, &title, &1000i128, &deadline);

    // Donate 300 (Under goal)
    client.donate(&contributor, &campaign_id, &300i128);
    assert_eq!(token_client.balance(&contributor), 700i128);

    // Fast-forward past deadline
    env.ledger().set_timestamp(deadline + 10);

    // Claim refund
    client.claim_refund(&contributor, &campaign_id);

    assert_eq!(token_client.balance(&contributor), 1000i128);
    assert_eq!(client.get_donation(&contributor, &campaign_id), 0i128);
}

#[test]
fn test_multiple_contributors_flow() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let creator = Address::generate(&env);
    let contributor1 = Address::generate(&env);
    let contributor2 = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_address = token_contract.address();
    let token_client = TokenClient::new(&env, &token_address);
    let token_admin_client = StellarAssetClient::new(&env, &token_address);

    token_admin_client.mint(&contributor1, &500);
    token_admin_client.mint(&contributor2, &700);

    let contract_id = env.register(CrowdFundXContract, ());
    let client = CrowdFundXContractClient::new(&env, &contract_id);

    client.initialize(&admin, &token_address);

    let deadline = env.ledger().timestamp() + 200;
    let title = String::from_str(&env, "Community Open Source Grant");
    let campaign_id = client.create_campaign(&creator, &title, &1000i128, &deadline);

    client.donate(&contributor1, &campaign_id, &400i128);
    client.donate(&contributor2, &campaign_id, &600i128);

    let campaign = client.get_campaign(&campaign_id);
    assert_eq!(campaign.total_raised, 1000i128);
    assert_eq!(token_client.balance(&contract_id), 1000i128);

    client.withdraw(&creator, &campaign_id);
    assert_eq!(token_client.balance(&creator), 1000i128);
}

#[test]
#[should_panic(expected = "Amount must be positive")]
fn test_zero_donation_panics() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let creator = Address::generate(&env);
    let contributor = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_address = token_contract.address();

    let contract_id = env.register(CrowdFundXContract, ());
    let client = CrowdFundXContractClient::new(&env, &contract_id);

    client.initialize(&admin, &token_address);

    let deadline = env.ledger().timestamp() + 100;
    let title = String::from_str(&env, "Test Zero Donation");
    let campaign_id = client.create_campaign(&creator, &title, &500i128, &deadline);

    client.donate(&contributor, &campaign_id, &0i128);
}
