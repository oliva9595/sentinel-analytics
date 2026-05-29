use sails_rs::{
    gstd::msg,
    prelude::*,
    collections::HashMap,
};

#[derive(Default)]
pub struct AnalyticsState {
    pub credit_ratings: HashMap<ActorId, u16>,
    pub submitted_reports: Vec<String>,
    pub oracle_address: ActorId,
}

static mut STATE: Option<AnalyticsState> = None;

pub struct AnalyticsService;

#[sails_rs::service]
impl AnalyticsService {
    pub fn init(oracle: ActorId) {
        unsafe {
            STATE = Some(AnalyticsState {
                credit_ratings: HashMap::new(),
                submitted_reports: Vec::new(),
                oracle_address: oracle,
            });
        }
    }

    pub fn new() -> Self {
        Self
    }

    // Methods
    pub fn update_credit_ratings(&mut self, ratings: Vec<(ActorId, u16)>) -> bool {
        let state = unsafe { STATE.as_mut().expect("State not initialized") };
        assert_eq!(msg::source(), state.oracle_address, "Only oracle can update ratings");
        
        for (agent, rating) in ratings {
            assert!(rating <= 1000, "Rating must be between 0 and 1000");
            state.credit_ratings.insert(agent, rating);
        }
        true
    }

    pub fn submit_analytics_report(&mut self, report_hash: String) -> bool {
        let state = unsafe { STATE.as_mut().expect("State not initialized") };
        assert_eq!(msg::source(), state.oracle_address, "Only oracle can submit report hashes");
        state.submitted_reports.push(report_hash);
        true
    }

    // Queries
    pub fn get_credit_rating(&self, agent: ActorId) -> u16 {
        let state = unsafe { STATE.as_ref().expect("State not initialized") };
        *state.credit_ratings.get(&agent).unwrap_or(&500) // Default score is 500
    }

    pub fn get_submitted_reports(&self) -> Vec<String> {
        let state = unsafe { STATE.as_ref().expect("State not initialized") };
        state.submitted_reports.clone()
    }
}
