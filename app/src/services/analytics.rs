use sails_rs::{collections::HashMap, gstd::msg, prelude::*};

#[derive(Default)]
pub struct AnalyticsState {
    pub credit_ratings: HashMap<ActorId, u16>,
    pub submitted_reports: Vec<String>,
    pub risk_requests: Vec<RiskReviewRequest>,
    pub request_count: u64,
    pub oracle_address: ActorId,
}

static mut STATE: Option<AnalyticsState> = None;

#[derive(Clone, Encode, Decode, TypeInfo)]
pub struct RiskReviewRequest {
    pub id: u64,
    pub requester: ActorId,
    pub target: ActorId,
    pub evidence_uri: String,
    pub context: String,
}

pub struct AnalyticsService;

impl AnalyticsService {
    pub fn init(oracle: ActorId) {
        unsafe {
            STATE = Some(AnalyticsState {
                credit_ratings: HashMap::new(),
                submitted_reports: Vec::new(),
                risk_requests: Vec::new(),
                request_count: 0,
                oracle_address: oracle,
            });
        }
    }

    pub fn new() -> Self {
        Self
    }
}

#[sails_rs::service]
impl AnalyticsService {
    #[export]
    pub fn update_credit_ratings(&mut self, ratings: Vec<(ActorId, u16)>) -> bool {
        let state = unsafe { STATE.as_mut().expect("State not initialized") };
        assert_eq!(
            msg::source(),
            state.oracle_address,
            "Only oracle can update ratings"
        );

        for (agent, rating) in ratings {
            assert!(rating <= 1000, "Rating must be between 0 and 1000");
            state.credit_ratings.insert(agent, rating);
        }
        true
    }

    #[export]
    pub fn submit_analytics_report(&mut self, report_hash: String) -> bool {
        let state = unsafe { STATE.as_mut().expect("State not initialized") };
        assert_eq!(
            msg::source(),
            state.oracle_address,
            "Only oracle can submit report hashes"
        );
        state.submitted_reports.push(report_hash);
        true
    }

    #[export]
    pub fn request_risk_review(
        &mut self,
        target: ActorId,
        evidence_uri: String,
        context: String,
    ) -> u64 {
        let state = unsafe { STATE.as_mut().expect("State not initialized") };
        assert!(!evidence_uri.is_empty(), "Evidence URI is required");
        assert!(!context.is_empty(), "Context is required");

        state.request_count += 1;
        let request_id = state.request_count;
        state.risk_requests.push(RiskReviewRequest {
            id: request_id,
            requester: msg::source(),
            target,
            evidence_uri,
            context,
        });
        request_id
    }

    #[export]
    pub fn get_credit_rating(&self, agent: ActorId) -> u16 {
        let state = unsafe { STATE.as_ref().expect("State not initialized") };
        *state.credit_ratings.get(&agent).unwrap_or(&500) // Default score is 500
    }

    #[export]
    pub fn get_submitted_reports(&self) -> Vec<String> {
        let state = unsafe { STATE.as_ref().expect("State not initialized") };
        state.submitted_reports.clone()
    }

    #[export]
    pub fn get_risk_review_requests(&self) -> Vec<RiskReviewRequest> {
        let state = unsafe { STATE.as_ref().expect("State not initialized") };
        state.risk_requests.clone()
    }
}
