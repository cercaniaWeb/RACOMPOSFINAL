#!/usr/bin/env node

/**
 * Database Configuration Setup Script
 * 
 * This script helps set up the database configuration for the POS application.
 * It validates environment variables and provides an interactive setup process.
 */

import fs from 'fs';
import path from 'path';
import { createInterface } from 'readline';

// Create readline interface for user input
const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt user for input
const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

// Function to validate Supabase URL
const isValidSupabaseUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsedUrl = new URL(url);
    return (parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:') && 
           url.includes('supabase.co');
  } catch {
    return false;
  }
};

// Function to validate Supabase key
const isValidSupabaseKey = (key) => {
  if (!key || typeof key !== 'string') return false;
  // Check that it's a proper JWT format
  if (key.startsWith('eyJ') && key.split('.').length === 3) {
    return key.length > 40; // Valid JWTs are typically longer than 40 characters
  }
  return key.length > 10; // Basic validation for a real key
};

// Main function to setup database configuration
async function setupDatabaseConfig() {
  console.log('POS App - Database Configuration Setup');
  console.log('=====================================');
  
  // Check for .env file first, then .env.local
  const envPath = path.resolve('.env');
  const envLocalPath = path.resolve('.env.local');
  let configPath = null;
  let configExists = false;
  let configContent = null;
  
  if (fs.existsSync(envPath)) {
    configPath = envPath;
    configExists = true;
    configContent = fs.readFileSync(configPath, 'utf8');
    console.log('Found existing .env file. Current configuration:');
  } else if (fs.existsSync(envLocalPath)) {
    configPath = envLocalPath;
    configExists = true;
    configContent = fs.readFileSync(configPath, 'utf8');
    console.log('Found existing .env.local file. Current configuration:');
  }
  
  if (configExists) {
    const urlMatch = configContent.match(/VITE_SUPABASE_URL=(.*)/);
    const keyMatch = configContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/);
    
    const currentUrl = urlMatch ? urlMatch[1] : 'Not set';
    const currentKey = keyMatch ? keyMatch[1] : 'Not set';
    
    console.log(`  VITE_SUPABASE_URL: ${currentUrl}`);
    console.log(`  VITE_SUPABASE_ANON_KEY: ${currentKey ? 'Set (length: ' + currentKey.length + ')' : 'Not set'}`);
    
    const updateConfig = await question('\nWould you like to update the configuration? (y/N): ');
    if (!updateConfig.toLowerCase().startsWith('y')) {
      console.log('Configuration unchanged. Exiting.');
      rl.close();
      return;
    }
  } else {
    configPath = envLocalPath; // Default to .env.local if no config file exists
    console.log('No existing configuration file found. Creating .env.local...');
  }
  
  console.log('\nTo find your Supabase credentials:');
  console.log('1. Go to your Supabase project dashboard');
  console.log('2. Navigate to Project Settings > API');
  console.log('3. Copy the URL and anon key');
  console.log('');
  
  // Get Supabase URL
  let supabaseUrl;
  while (true) {
    supabaseUrl = await question('Enter your Supabase URL: ');
    if (isValidSupabaseUrl(supabaseUrl)) {
      break;
    } else {
      console.log('Invalid Supabase URL. Make sure it looks like: https://xxxxx.supabase.co');
    }
  }
  
  // Get Supabase Anon Key
  let supabaseAnonKey;
  while (true) {
    supabaseAnonKey = await question('Enter your Supabase Anon Key: ');
    if (isValidSupabaseKey(supabaseAnonKey)) {
      break;
    } else {
      console.log('Invalid Supabase Anon Key. Make sure it looks like a JWT token.');
    }
  }
  
  // Create or update the environment file
  const newEnvContent = `# Supabase Configuration
VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${supabaseAnonKey}

# Additional configuration variables can be added here
`;
  
  fs.writeFileSync(configPath, newEnvContent);
  
  console.log('\n✅ Database configuration updated successfully!');
  console.log(`Configuration saved to: ${envPath}`);
  console.log('\nTo apply the changes, restart your development server.');
  console.log('Run: npm run dev');
  
  rl.close();
}

// Validate current configuration
function validateConfig() {
  console.log('POS App - Database Configuration Validation');
  console.log('==========================================');
  
  // Check for .env file first, then .env.local
  let envPath = path.resolve('.env');
  let envLocalPath = path.resolve('.env.local');
  let envContent = null;
  let actualPath = null;
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    actualPath = envPath;
  } else if (fs.existsSync(envLocalPath)) {
    envContent = fs.readFileSync(envLocalPath, 'utf8');
    actualPath = envLocalPath;
  } else {
    console.log('❌ .env or .env.local file not found. Run setup first.');
    return false;
  }
  
  // Read and parse the found environment file
  const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.*)/);
  const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/);
  
  const supabaseUrl = urlMatch ? urlMatch[1] : undefined;
  const supabaseAnonKey = keyMatch ? keyMatch[1] : undefined;
  
  let isValid = true;
  
  if (!supabaseUrl) {
    console.log(`❌ VITE_SUPABASE_URL not set in ${path.basename(actualPath)} file`);
    isValid = false;
  } else if (isValidSupabaseUrl(supabaseUrl)) {
    console.log('✅ VITE_SUPABASE_URL is set correctly');
  } else {
    console.log('❌ VITE_SUPABASE_URL is not valid. Should be a valid Supabase URL.');
    isValid = false;
  }
  
  if (!supabaseAnonKey) {
    console.log(`❌ VITE_SUPABASE_ANON_KEY not set in ${path.basename(actualPath)} file`);
    isValid = false;
  } else if (isValidSupabaseKey(supabaseAnonKey)) {
    console.log('✅ VITE_SUPABASE_ANON_KEY is set correctly');
  } else {
    console.log('❌ VITE_SUPABASE_ANON_KEY is not valid. Should be a JWT-like key.');
    isValid = false;
  }
  
  if (isValid) {
    console.log(`\n🎉 All database configuration is valid in ${path.basename(actualPath)}!`);
    return true;
  } else {
    console.log('\n❌ Database configuration has issues. Run setup to fix.');
    return false;
  }
}

// Run the appropriate command based on arguments
const command = process.argv[2];

if (command === 'validate') {
  validateConfig();
} else {
  setupDatabaseConfig().catch(err => {
    console.error('Error during configuration setup:', err);
    rl.close();
  });
}