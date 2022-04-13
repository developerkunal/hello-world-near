use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::LookupMap;

use near_sdk::{env, near_bindgen};

near_sdk::setup_alloc!();

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct Message {
    message: LookupMap<String, String>,
}
impl Default for Message {
    fn default() -> Self {
        Self {
            message: LookupMap::new(b"r".to_vec()),
        }
    }
}
#[near_bindgen]

impl Message {
    pub fn get_message(&self, account_id: String) -> Option<String> {
        return self.message.get(&account_id);
    }

    pub fn set_message(&mut self,message: String) {
        
        let account_id = env::signer_account_id();
        self.message.insert(&account_id, &message);
    }

}

#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::MockedBlockchain;
    use near_sdk::{testing_env, VMContext};

    // part of writing unit tests is setting up a mock context
    // in this example, this is only needed for env::log in the contract
    // this is also a useful list to peek at when wondering what's available in env::*
    fn get_context(input: Vec<u8>, is_view: bool) -> VMContext {
        VMContext {
            current_account_id: "alice_near".to_string(),
            signer_account_id: "bob_near".to_string(),
            signer_account_pk: vec![0, 1, 2],
            predecessor_account_id: "carol_near".to_string(),
            input,
            block_index: 0,
            block_timestamp: 0,
            account_balance: 0,
            account_locked_balance: 0,
            storage_usage: 0,
            attached_deposit: 0,
            prepaid_gas: 10u64.pow(18),
            random_seed: vec![0, 1, 2],
            is_view,
            output_data_receivers: vec![],
            epoch_height: 0,
        }
    }

    #[test]
    fn set_get_message() {
        // set up the mock context into the testing environment
        let context = get_context(vec![], false);
        testing_env!(context);
        // instantiate a contract variable with the counter at zero
        let mut contract = Message::default();
        contract.set_message("world".to_string());
        assert_eq!(
            "world".to_string(),
            contract.get_message("bob_near".to_string()).unwrap()
        );
    }
    #[test]
    fn get_nonexistent_message() {
        let context = get_context(vec![], true);
        testing_env!(context);
        let contract = Message::default();
        assert_eq!(None, contract.get_message("francis.near".to_string()));
    }
}