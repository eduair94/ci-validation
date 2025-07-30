// Test script for random CI generation
function generateValidRandomCI() {
    // Generate random 7 digits for the CI base
    let ciBase = '';
    for (let i = 0; i < 7; i++) {
        ciBase += Math.floor(Math.random() * 10).toString();
    }
    
    // Calculate the check digit using the same algorithm as the validator
    const multipliers = [2, 9, 8, 7, 6, 3, 4];
    let sum = 0;
    
    for (let i = 0; i < 7; i++) {
        const digit = parseInt(ciBase[i], 10);
        sum += digit * multipliers[i];
    }
    
    const remainder = sum % 10;
    const checkDigit = remainder === 0 ? 0 : 10 - remainder;
    
    return ciBase + checkDigit.toString();
}

// Test the function
console.log('Testing random CI generation:');
for (let i = 0; i < 5; i++) {
    const randomCI = generateValidRandomCI();
    console.log(`Generated CI: ${randomCI}`);
}
