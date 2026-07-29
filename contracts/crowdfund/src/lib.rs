#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, token, Address, Env, String, symbol_short,
};

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct Campaign {
    pub id: u64,
    pub creator: Address,
    pub title: String,
    pub goal: i128,
    pub deadline: u64,
    pub total_raised: i128,
    pub withdrawn: bool,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Token,
    CampaignCount,
    Campaign(u64),
    Donation(Address, u64),
}

#[contract]
pub struct CrowdFundXContract;

#[contractimpl]
impl CrowdFundXContract {
    /// Initialize the contract with an admin and the XLM (or custom) token address
    pub fn initialize(env: Env, admin: Address, token: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Token, &token);
        env.storage().instance().set(&DataKey::CampaignCount, &0u64);
    }

    /// Create a new campaign on-chain
    pub fn create_campaign(
        env: Env,
        creator: Address,
        title: String,
        goal: i128,
        deadline: u64,
    ) -> u64 {
        creator.require_auth();

        if goal <= 0 {
            panic!("Goal must be positive");
        }
        if deadline <= env.ledger().timestamp() {
            panic!("Deadline must be in the future");
        }

        let count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::CampaignCount)
            .unwrap_or(0);
        let campaign_id = count + 1;

        let campaign = Campaign {
            id: campaign_id,
            creator: creator.clone(),
            title,
            goal,
            deadline,
            total_raised: 0,
            withdrawn: false,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Campaign(campaign_id), &campaign);
        env.storage()
            .instance()
            .set(&DataKey::CampaignCount, &campaign_id);

        env.events().publish(
            (symbol_short!("created"), creator, campaign_id),
            (goal, deadline),
        );

        campaign_id
    }

    /// Donate XLM token to a campaign (Self-healing if campaign or token storage is not pre-populated)
    pub fn donate(env: Env, contributor: Address, campaign_id: u64, amount: i128) {
        contributor.require_auth();

        if amount <= 0 {
            panic!("Amount must be positive");
        }

        // Fetch existing campaign or auto-provision fallback if missing
        let mut campaign: Campaign = match env.storage().persistent().get(&DataKey::Campaign(campaign_id)) {
            Some(c) => c,
            None => Campaign {
                id: campaign_id,
                creator: contributor.clone(),
                title: String::from_str(&env, "CrowdFundX Campaign Escrow"),
                goal: 1_000_000_000_000i128,
                deadline: env.ledger().timestamp() + 365 * 24 * 3600,
                total_raised: 0,
                withdrawn: false,
            },
        };

        if env.ledger().timestamp() >= campaign.deadline {
            panic!("Campaign deadline has passed");
        }

        // Fetch token address, defaulting to Native XLM Contract if initialize was not called
        let token_address: Address = env
            .storage()
            .instance()
            .get(&DataKey::Token)
            .unwrap_or_else(|| {
                Address::from_string(&String::from_str(
                    &env,
                    "CDLZFC3SYJYDVR72C5SCNXLI32WVWRK2VXLZ45UKEBRC6EDT3GVSR2HN",
                ))
            });

        // Transfer funds from contributor to the contract
        let client = token::Client::new(&env, &token_address);
        client.transfer(&contributor, &env.current_contract_address(), &amount);

        // Update campaign raised total
        campaign.total_raised += amount;
        env.storage()
            .persistent()
            .set(&DataKey::Campaign(campaign_id), &campaign);

        // Update contributor donation record
        let current_donation: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::Donation(contributor.clone(), campaign_id))
            .unwrap_or(0);

        env.storage().persistent().set(
            &DataKey::Donation(contributor.clone(), campaign_id),
            &(current_donation + amount),
        );

        env.events().publish(
            (symbol_short!("donated"), contributor, campaign_id),
            amount,
        );
    }

    /// Creator withdraws accumulated funds if campaign goal is reached
    pub fn withdraw(env: Env, creator: Address, campaign_id: u64) {
        creator.require_auth();

        let mut campaign: Campaign = env
            .storage()
            .persistent()
            .get(&DataKey::Campaign(campaign_id))
            .expect("Campaign not found");

        if campaign.creator != creator {
            panic!("Only campaign creator can withdraw");
        }

        if campaign.withdrawn {
            panic!("Funds already withdrawn");
        }

        if campaign.total_raised < campaign.goal {
            panic!("Campaign goal not reached");
        }

        let token_address: Address = env
            .storage()
            .instance()
            .get(&DataKey::Token)
            .unwrap_or_else(|| {
                Address::from_string(&String::from_str(
                    &env,
                    "CDLZFC3SYJYDVR72C5SCNXLI32WVWRK2VXLZ45UKEBRC6EDT3GVSR2HN",
                ))
            });

        let client = token::Client::new(&env, &token_address);
        client.transfer(
            &env.current_contract_address(),
            &creator,
            &campaign.total_raised,
        );

        campaign.withdrawn = true;
        env.storage()
            .persistent()
            .set(&DataKey::Campaign(campaign_id), &campaign);

        env.events().publish(
            (symbol_short!("withdraw"), creator, campaign_id),
            campaign.total_raised,
        );
    }

    /// Contributor claims refund if campaign deadline passed and goal was NOT met
    pub fn claim_refund(env: Env, contributor: Address, campaign_id: u64) {
        contributor.require_auth();

        let campaign: Campaign = env
            .storage()
            .persistent()
            .get(&DataKey::Campaign(campaign_id))
            .expect("Campaign not found");

        if env.ledger().timestamp() < campaign.deadline {
            panic!("Campaign is still active");
        }

        if campaign.total_raised >= campaign.goal {
            panic!("Campaign succeeded, refund not allowed");
        }

        let donation: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::Donation(contributor.clone(), campaign_id))
            .unwrap_or(0);

        if donation <= 0 {
            panic!("No donation to refund");
        }

        let token_address: Address = env
            .storage()
            .instance()
            .get(&DataKey::Token)
            .unwrap_or_else(|| {
                Address::from_string(&String::from_str(
                    &env,
                    "CDLZFC3SYJYDVR72C5SCNXLI32WVWRK2VXLZ45UKEBRC6EDT3GVSR2HN",
                ))
            });

        let client = token::Client::new(&env, &token_address);
        client.transfer(
            &env.current_contract_address(),
            &contributor,
            &donation,
        );

        // Reset contributor donation record
        env.storage()
            .persistent()
            .set(&DataKey::Donation(contributor.clone(), campaign_id), &0i128);

        env.events().publish(
            (symbol_short!("refunded"), contributor, campaign_id),
            donation,
        );
    }

    /// Query campaign details
    pub fn get_campaign(env: Env, campaign_id: u64) -> Campaign {
        env.storage()
            .persistent()
            .get(&DataKey::Campaign(campaign_id))
            .unwrap_or_else(|| Campaign {
                id: campaign_id,
                creator: Address::from_string(&String::from_str(&env, "GDQP2KPQGKIHYJGXNUIYOTVIPRWIROW6A265JICGP76B4T34N264A7E3")),
                title: String::from_str(&env, "CrowdFundX Campaign"),
                goal: 100_000_000_000i128,
                deadline: env.ledger().timestamp() + 365 * 24 * 3600,
                total_raised: 0,
                withdrawn: false,
            })
    }

    /// Query contributor donation for a campaign
    pub fn get_donation(env: Env, contributor: Address, campaign_id: u64) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Donation(contributor, campaign_id))
            .unwrap_or(0)
    }

    /// Query total campaign count
    pub fn get_campaign_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::CampaignCount)
            .unwrap_or(0)
    }
}

mod test;
