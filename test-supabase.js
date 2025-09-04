// Test script to verify Supabase connection and database tables
// Run this in browser console to test your database setup

const testSupabaseConnection = async () => {
  console.log('🔍 Testing Supabase connection and database tables...');
  
  try {
    // Import the leaderboard functions
    const { getLeaderboard, getModuleLeaderboard, leaderboardHealthCheck } = await import('./modules/supabaseLeaderboard.js');
    
    console.log('✅ Leaderboard module imported successfully');
    
    // Test health check
    console.log('🏥 Running health check...');
    const healthResult = await leaderboardHealthCheck();
    console.log('🏥 Health check result:', healthResult);
    
    // Test overall leaderboard
    console.log('🏆 Testing overall leaderboard...');
    const overallLeaderboard = await getLeaderboard(10);
    console.log('🏆 Overall leaderboard result:', overallLeaderboard);
    
    // Test module leaderboard
    console.log('🎯 Testing module 0 leaderboard...');
    const moduleLeaderboard = await getModuleLeaderboard(0, 10);
    console.log('🎯 Module 0 leaderboard result:', moduleLeaderboard);
    
    console.log('✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('❌ Error details:', error.message);
  }
};

// Run the test
testSupabaseConnection();
