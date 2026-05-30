fn main() {
    sails_idl_gen::generate_idl_to_file::<sentinel_analytics::AnalyticsProgram>(
        "target/sentinel-analytics-091.idl",
    )
    .unwrap();
}
