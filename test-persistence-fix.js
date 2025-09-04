// Test script to verify last_module_id persistence fix
// Run this in the browser console after logging in

console.log('🧪 TESTING LAST_MODULE_ID PERSISTENCE FIX');

// Test 1: Check if users table has the new columns
async function testUsersTableStructure() {
  console.log('\n📋 TEST 1: Checking users table structure...');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, last_module_id, last_question_index')
      .limit(1);
    
    if (error) {
      console.error('❌ Users table query failed:', error);
      return false;
    }
    
    console.log('✅ Users table structure is correct');
    return true;
  } catch (e) {
    console.error('❌ Users table test failed:', e);
    return false;
  }
}

// Test 2: Check current user's last_module_id
async function testCurrentUserLastModule() {
  console.log('\n📋 TEST 2: Checking current user last_module_id...');
  
  const user = getCurrentAuthUser();
  if (!user) {
    console.error('❌ No authenticated user found');
    return false;
  }
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, last_module_id, last_question_index')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('❌ User query failed:', error);
      return false;
    }
    
    console.log(`✅ User ${data.name} last_module_id: ${data.last_module_id}`);
    console.log(`✅ User ${data.name} last_question_index: ${data.last_question_index}`);
    return data;
  } catch (e) {
    console.error('❌ Current user test failed:', e);
    return false;
  }
}

// Test 3: Test getUserResumeModule function
async function testResumeModule() {
  console.log('\n📋 TEST 3: Testing getUserResumeModule...');
  
  const user = getCurrentAuthUser();
  if (!user) {
    console.error('❌ No authenticated user found');
    return false;
  }
  
  try {
    const resumeData = await getUserResumeModule(user.id, 10);
    console.log(`✅ Resume data:`, resumeData);
    console.log(`✅ Should navigate to module: ${resumeData.moduleIndex}`);
    console.log(`✅ Last completed module: ${resumeData.lastCompletedModule}`);
    return resumeData;
  } catch (e) {
    console.error('❌ Resume module test failed:', e);
    return false;
  }
}

// Test 4: Simulate module completion and check update
async function testModuleCompletion(moduleId = 1) {
  console.log(`\n📋 TEST 4: Testing module completion for module ${moduleId}...`);
  
  const user = getCurrentAuthUser();
  if (!user) {
    console.error('❌ No authenticated user found');
    return false;
  }
  
  try {
    // Simulate saving progress with a completed module
    const progressData = {
      currentModule: moduleId,
      currentQuestion: 0,
      score: 1000,
      level: 1,
      xp: 100,
      streak: 5,
      combo: 1,
      perfectModulesCount: 1,
      completedModules: [0, moduleId], // Complete modules 0 and the test module
      unlockedModules: [0, 1, 2],
      answeredQuestions: {},
      achievements: [],
      powerUps: {},
      shuffledQuestions: {}
    };
    
    const result = await saveGameProgress(user.id, progressData);
    
    if (!result.success) {
      console.error('❌ Save game progress failed:', result.error);
      return false;
    }
    
    console.log('✅ Progress saved successfully');
    
    // Check if users.last_module_id was updated
    const { data, error } = await supabase
      .from('users')
      .select('last_module_id')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('❌ Failed to fetch updated last_module_id:', error);
      return false;
    }
    
    console.log(`✅ Updated last_module_id: ${data.last_module_id} (expected: ${moduleId})`);
    
    if (data.last_module_id === moduleId) {
      console.log('✅ Module completion test PASSED!');
      return true;
    } else {
      console.error(`❌ Expected last_module_id to be ${moduleId}, got ${data.last_module_id}`);
      return false;
    }
  } catch (e) {
    console.error('❌ Module completion test failed:', e);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 STARTING PERSISTENCE TESTS...\n');
  
  const test1 = await testUsersTableStructure();
  const test2 = await testCurrentUserLastModule();
  const test3 = await testResumeModule();
  const test4 = await testModuleCompletion(2); // Test completing module 2
  
  console.log('\n📊 TEST RESULTS:');
  console.log(`Users table structure: ${test1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Current user data: ${test2 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Resume module logic: ${test3 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Module completion: ${test4 ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = test1 && test2 && test3 && test4;
  console.log(`\n🎯 OVERALL: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  return allPassed;
}

// Export for manual testing
window.persistenceTests = {
  runAllTests,
  testUsersTableStructure,
  testCurrentUserLastModule,
  testResumeModule,
  testModuleCompletion
};

console.log('🔧 Test functions available as: window.persistenceTests');
console.log('Run: window.persistenceTests.runAllTests()');
