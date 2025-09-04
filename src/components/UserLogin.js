// src/components/UserLogin.js
import React, { useState, useEffect } from 'react';
import { User, Plus, LogIn, Loader2 } from 'lucide-react';
import { getAllUsers, createUserProfile, saveUser, setCurrentUser } from '../modules/userProfile';

const countries = [
    'Afghanistan', 'Åland Islands', 'Albania', 'Algeria', 'American Samoa',
    'Andorra', 'Angola', 'Anguilla', 'Antarctica', 'Antigua and Barbuda',
    'Argentina', 'Armenia', 'Aruba', 'Australia', 'Austria',
    'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados',
    'Belarus', 'Belgium', 'Belize', 'Benin', 'Bermuda',
    'Bhutan', 'Bolivia (Plurinational State of)', 'Bonaire, Sint Eustatius and Saba',
    'Bosnia and Herzegovina', 'Botswana', 'Bouvet Island', 'Brazil',
    'British Indian Ocean Territory', 'Brunei Darussalam', 'Bulgaria',
    'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon',
    'Canada', 'Cayman Islands', 'Central African Republic', 'Chad', 'Chile',
    'China', 'Christmas Island', 'Cocos (Keeling) Islands', 'Colombia',
    'Comoros', 'Congo', 'Congo (Democratic Republic)', 'Cook Islands',
    'Costa Rica', "Côte d'Ivoire", 'Croatia', 'Cuba', 'Curaçao',
    'Cyprus', 'Czechia', 'Denmark', 'Djibouti', 'Dominica',
    'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador',
    'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia',
    'Falkland Islands (Malvinas)', 'Faroe Islands', 'Fiji', 'Finland',
    'France', 'French Guiana', 'French Polynesia', 'French Southern Territories',
    'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Gibraltar',
    'Greece', 'Greenland', 'Grenada', 'Guadeloupe', 'Guam', 'Guatemala',
    'Guernsey', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti',
    'Heard Island and McDonald Islands', 'Holy See', 'Honduras',
    'Hong Kong', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran',
    'Iraq', 'Ireland', 'Isle of Man', 'Israel', 'Italy', 'Jamaica',
    'Japan', 'Jersey', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati',
    "Korea (Democratic People's Republic)", 'Korea (Republic)', 'Kuwait',
    'Kyrgyzstan', "Lao People's Democratic Republic", 'Latvia', 'Lebanon',
    'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania',
    'Luxembourg', 'Macao', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives',
    'Mali', 'Malta', 'Marshall Islands', 'Martinique', 'Mauritania',
    'Mauritius', 'Mayotte', 'Mexico', 'Micronesia (Federated States of)',
    'Moldova (Republic of)', 'Monaco', 'Mongolia', 'Montenegro',
    'Montserrat', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru',
    'Nepal', 'Netherlands', 'New Caledonia', 'New Zealand', 'Nicaragua',
    'Niger', 'Nigeria', 'Niue', 'Norfolk Island', 'North Macedonia', 'Northern Mariana Islands',
    'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine, State of', 'Panama',
    'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Pitcairn',
    'Poland', 'Portugal', 'Puerto Rico', 'Qatar', 'Réunion', 'Romania',
    'Russian Federation', 'Rwanda', 'Saint Barthélemy',
    'Saint Helena, Ascension and Tristan da Cunha', 'Saint Kitts and Nevis',
    'Saint Lucia', 'Saint Martin (French part)', 'Saint Pierre and Miquelon',
    'Saint Vincent and the Grenadines', 'Samoa', 'San Marino',
    'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia',
    'Seychelles', 'Sierra Leone', 'Singapore', 'Sint Maarten (Dutch part)',
    'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia',
    'South Africa', 'South Georgia and the South Sandwich Islands',
    'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Svalbard and Jan Mayen',
    'Sweden', 'Switzerland', 'Syrian Arab Republic', 'Taiwan, Province of China',
    'Tajikistan', 'Tanzania, United Republic of', 'Thailand', 'Timor-Leste',
    'Togo', 'Tokelau', 'Tonga', 'Trinidad and Tobago', 'Tunisia',
    'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine',
    'United Arab Emirates', 'United Kingdom', 'United States of America',
    'Uruguay', 'Uzbekistan', 'Vanuatu', 'Venezuela (Bolivarian Republic of)',
    'Viet Nam', 'Western Sahara', 'Yemen', 'Zambia', 'Zimbabwe'
].sort();

const UserLogin = ({ onLogin }) => {
  const [users, setUsers] = useState([]);
  const [showNewUser, setShowNewUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserOrg, setNewUserOrg] = useState('');
  const [newUserCountry, setNewUserCountry] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Load users from Supabase on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (newUserName.trim() && !isCreating) {
      setIsCreating(true);
      try {
        const newUser = await createUserProfile(
          newUserName.trim(), 
          newUserEmail.trim(), 
          newUserOrg.trim(),
          newUserCountry.trim()
        );
        
        if (newUser) {
          await saveUser(newUser);
          setCurrentUser(newUser.id);
          onLogin(newUser);
        }
      } catch (error) {
        console.error('Error creating user:', error);
        alert('Failed to create user. Please try again.');
      } finally {
        setIsCreating(false);
      }
    }
  };

  const handleSelectUser = (user) => {
    setCurrentUser(user.id);
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4 flex items-center justify-center">
      <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-white/10 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">IFRS 17 Master</h1>
          <p className="text-gray-400">Select your profile to continue</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        )}

        {/* Existing Users */}
        {!isLoading && users.length > 0 && !showNewUser && (
          <div className="space-y-3 mb-6">
            {users.map(user => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl p-4 transition-all duration-200 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {user.avatar}
                </div>
                <div className="text-left flex-1">
                  <p className="text-white font-semibold">{user.name}</p>
                  <p className="text-gray-400 text-sm">
                    {user.organization || 'No organization'}
                    {user.country && ` • 🌍 ${user.country}`}
                  </p>
                </div>
                <LogIn className="w-5 h-5 text-gray-400" />
              </button>
            ))}
          </div>
        )}

        {/* New User Form */}
        {showNewUser && (
          <div className="space-y-4 mb-6">
            <input
              type="text"
              placeholder="Your Name"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
              autoFocus
              disabled={isCreating}
            />
            <input
              type="email"
              placeholder="Email (optional)"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
              disabled={isCreating}
            />
            <input
              type="text"
              placeholder="Organization (optional)"
              value={newUserOrg}
              onChange={(e) => setNewUserOrg(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
              disabled={isCreating}
            />
            <select
              value={newUserCountry}
              onChange={(e) => setNewUserCountry(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
              disabled={isCreating}
            >
              <option value="" className="bg-gray-900">Select Country</option>
              {countries.map(country => (
                <option key={country} value={country} className="bg-gray-900">{country}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                onClick={handleCreateUser}
                disabled={!newUserName.trim() || isCreating}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white rounded-lg py-3 font-semibold transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Profile'
                )}
              </button>
              <button
                onClick={() => {
                  setShowNewUser(false);
                  // Reset form
                  setNewUserName('');
                  setNewUserEmail('');
                  setNewUserOrg('');
                  setNewUserCountry('');
                }}
                disabled={isCreating}
                className="px-6 bg-white/5 hover:bg-white/10 border border-white/20 text-white rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Add New User Button */}
        {!isLoading && !showNewUser && (
          <button
            onClick={() => setShowNewUser(true)}
            className="w-full bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-400 rounded-xl p-4 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Profile</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default UserLogin;