import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Submit score to module-specific leaderboard
export const submitModuleScore = async (userName, moduleId, moduleName, score) => {
  try {
    console.log('Submitting module score:', { userName, moduleId, moduleName, score });
    
    const { data, error } = await supabase
      .from('module_leaderboard')
      .upsert([
        {
          user_name: userName,
          module_id: moduleId,
          module_name: moduleName,
          score: score,
          updated_at: new Date().toISOString()
        }
      ], { 
        onConflict: 'user_name,module_id' 
      });

    if (error) throw error;
    console.log('Module score submitted successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error submitting module score:', error);
    return { success: false, error: error.message };
  }
};

// Get leaderboard data for all modules
export const getLeaderboard = async () => {
  try {
    console.log('Fetching overall leaderboard...');
    
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('total_score', { ascending: false })
      .limit(50);

    if (error) throw error;
    console.log('Overall leaderboard fetched:', data);
    return data || [];
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
};

// Get module-specific leaderboard
export const getModuleLeaderboard = async (moduleId = null) => {
  try {
    console.log('Fetching module leaderboard for:', moduleId);
    
    let query = supabase
      .from('module_leaderboard')
      .select('*')
      .order('score', { ascending: false });

    if (moduleId) {
      query = query.eq('module_id', moduleId);
    }

    const { data, error } = await query.limit(50);

    if (error) throw error;
    console.log('Module leaderboard fetched:', data);
    return data || [];
  } catch (error) {
    console.error('Error fetching module leaderboard:', error);
    return [];
  }
};

// Test database connection
export const testConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    const { data, error } = await supabase
      .from('module_leaderboard')
      .select('count', { count: 'exact', head: true });

    if (error) throw error;
    console.log('Connection test successful, record count:', data);
    return { success: true, count: data };
  } catch (error) {
    console.error('Connection test failed:', error);
    return { success: false, error: error.message };
  }
};

// Update overall leaderboard (aggregate scores)
export const updateOverallLeaderboard = async (userName) => {
  try {
    console.log('Updating overall leaderboard for:', userName);
    
    // Get total score for user across all modules
    const { data: moduleScores, error: fetchError } = await supabase
      .from('module_leaderboard')
      .select('score')
      .eq('user_name', userName);

    if (fetchError) throw fetchError;

    const totalScore = moduleScores.reduce((sum, record) => sum + (record.score || 0), 0);
    console.log('Calculated total score:', totalScore);

    // Update overall leaderboard
    const { data, error } = await supabase
      .from('leaderboard')
      .upsert([
        {
          user_name: userName,
          total_score: totalScore,
          updated_at: new Date().toISOString()
        }
      ], { 
        onConflict: 'user_name' 
      });

    if (error) throw error;
    console.log('Overall leaderboard updated:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error updating overall leaderboard:', error);
    return { success: false, error: error.message };
  }
};

// Submit detailed user data to leaderboard (for backward compatibility)
export const submitToLeaderboard = async (userData) => {
  try {
    console.log('Submitting user data to leaderboard:', userData);
    
    const { data, error } = await supabase
      .from('leaderboard')
      .upsert([
        {
          user_name: userData.name,
          total_score: userData.score || 0,
          level: userData.level || 1,
          achievements: userData.achievements || 0,
          modules_completed: userData.modulesCompleted || 0,
          perfect_modules: userData.perfectModules || 0,
          country: userData.country || 'Unknown',
          gender: userData.gender || 'Prefer not to say',
          updated_at: new Date().toISOString()
        }
      ], { 
        onConflict: 'user_name' 
      });

    if (error) throw error;
    console.log('User data submitted successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error submitting user data:', error);
    return { success: false, error: error.message };
  }
};
