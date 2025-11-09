/**
 * Centralized definitions for job states, default configuration values,
 * and file paths used throughout the system.
 */

export const JOB_STATES = {
  PENDING: "pending",        
  PROCESSING: "processing", 
  COMPLETED: "completed",    
  FAILED: "failed",          
  DEAD: "dead",              
};

export const DEFAULTS = {
  MAX_RETRIES: 3,            
  BACKOFF_BASE: 2,           
  JOBS_FILE: "./data/jobs.json",
  DLQ_FILE: "./data/dlq.json",
  CONFIG_FILE: "./data/config.json",
};
