#![no_std]
use sails_rs::prelude::*;

pub mod services;
use services::analytics::AnalyticsService;

pub struct AnalyticsProgram;

#[sails_rs::program]
impl AnalyticsProgram {
    pub fn new(oracle: ActorId) -> Self {
        AnalyticsService::init(oracle);
        Self
    }

    pub fn analytics(&self) -> AnalyticsService {
        AnalyticsService::new()
    }
}
