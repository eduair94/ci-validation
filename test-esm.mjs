// Test script for ci-validation package using ES6 imports
import { validateCI, validateCIAndQuery } from './dist/lib/index.js';

console.log('🧪 Testing ci-validation package with ES6 imports...\n');

// Test 1: Simple validation
console.log('Test 1: Simple validation');
console.log('validateCI("19119365"):', validateCI('19119365'));
console.log('validateCI("12345678"):', validateCI('12345678'));
console.log('');

// Test 2: Validation with query (async)
console.log('Test 2: Validation with query');
try {
  const result = await validateCIAndQuery('19119365');
  console.log('validateCIAndQuery("19119365"):', JSON.stringify(result, null, 2));
} catch (error) {
  console.error('Error:', error.message);
}

console.log('\n✅ ES6 import test completed!');
