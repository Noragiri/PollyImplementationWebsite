import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container, TextField, Button, Typography, Box, FormControl, InputLabel, Select, MenuItem, List, ListItem, ListItemText, Divider, SelectChangeEvent, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh'; // Import the refresh icon
import { RootState } from '@/app/store';
import { setText, setTaskId, setStatus, setMp3Url } from '@/app/textSlice';
import { login, getStoredToken, getCurrentUser } from '@/utils/cognitoAuth';
import Navbar from './Navbar';
import voices from "@/data/voices"; // Import the voices object

export default function Home() {
  const dispatch = useDispatch();
  const { text, taskId, status, mp3Url } = useSelector((state: RootState) => state.text);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedVoice, setSelectedVoice] = useState<string>('');

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      setIsAuthenticated(true);
      const user = getCurrentUser();
      if (user) {
        setCurrentUsername(user.getUsername());
      }
      fetchHistory(token);
    }
  }, []);

  const fetchHistory = async (token?: string) => {
    setLoadingHistory(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/history', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token || getStoredToken()}`,
        },
      });
      const data = await response.json();
      setHistory(data.history || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleLogin = async () => {
    try {
      const token = await login(username, password);
      setIsAuthenticated(true);
      const user = getCurrentUser();
      if (user) {
        setCurrentUsername(user.getUsername());
      }
      fetchHistory(token);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUsername(null);
    setHistory([]);
  };

  const handleSynthesize = async () => {
    if (!isAuthenticated) {
      alert('Please log in to use this feature.');
      return;
    }

    try {
      const selectedVoiceData = voices[selectedLanguage];
      if (!selectedVoiceData) {
        throw new Error('Invalid language selected');
      }

      const voiceDetails = selectedVoiceData.names[selectedVoice];
      if (!voiceDetails) {
        throw new Error('Invalid voice selected');
      }

      const response = await fetch('http://127.0.0.1:8000/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getStoredToken()}`,
        },
        body: JSON.stringify({
          text,
          voice: selectedVoice,
          language: selectedVoiceData.code,
          voiceType: voiceDetails.engine,
        }),
      });
      const data = await response.json();
      dispatch(setTaskId(data.taskId));
      fetchHistory(getStoredToken() || '');
    } catch (error) {
      console.error('Error synthesizing text:', error);
    }
  };

  const handleLanguageChange = (e: SelectChangeEvent<string>) => {
    setSelectedLanguage(e.target.value as string);
    setSelectedVoice('');
  };

  const handleVoiceChange = (e: SelectChangeEvent<string>) => {
    setSelectedVoice(e.target.value as string);
  };

  const handleDeleteHistoryItem = async (taskId: string) => {
    try {
      const token = getStoredToken();
      const response = await fetch(`http://127.0.0.1:8000/history/${taskId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Remove the item from the history state
        setHistory((prevHistory) => prevHistory.filter((item) => item.taskId !== taskId));
      } else {
        console.error('Failed to delete history item');
      }
    } catch (error) {
      console.error('Error deleting history item:', error);
    }
  };

  const selectedVoices = voices[selectedLanguage]?.names || {};

  return (
    <Box display="flex" minHeight="100vh">
      {/* Sidebar */}
      <Box
        width="300px"
        bgcolor="#f4f4f4"
        p={2}
        borderRight="1px solid #ddd"
        overflow="auto"
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" gutterBottom>
            Request History
          </Typography>
          <IconButton
            aria-label="refresh"
            onClick={() => fetchHistory()} // Call fetchHistory on click
          >
            <RefreshIcon />
          </IconButton>
        </Box>
        <List>
          {history.map((item, index) => (
            <React.Fragment key={index}>
              <ListItem
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteHistoryItem(item.taskId)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={item.text || 'No text provided'}
                  secondary={`Status: ${item.status}`}
                />
              </ListItem>
              {item.preSignedUrl && (
                <Box my={1} ml={2}>
                  <audio controls>
                    <source src={item.preSignedUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </Box>
              )}
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Box>

      {/* Main Content */}
      <Box flex="1">
        <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} username={currentUsername} />
        <Container maxWidth="sm">
          <Box>
            {!isAuthenticated ? (
              <>
                <Typography variant="h4">Welcome to Text-to-Speech</Typography>
                <Typography variant="body1">Log in to start synthesizing text into speech.</Typography>
                <TextField
                  fullWidth
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  variant="outlined"
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="outlined"
                  margin="normal"
                />
                <Button variant="contained" color="primary" onClick={handleLogin} fullWidth>
                  Login
                </Button>
              </>
            ) : (
              <>
                <TextField
                  fullWidth
                  label="Enter text to synthesize"
                  value={text}
                  onChange={(e) => dispatch(setText(e.target.value))}
                  variant="outlined"
                  margin="normal"
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel id="language-label">Select Language</InputLabel>
                  <Select
                    labelId="language-label"
                    id="language"
                    value={selectedLanguage}
                    onChange={handleLanguageChange}
                  >
                    <MenuItem value="">--Select Language--</MenuItem>
                    {Object.keys(voices).map((language) => (
                      <MenuItem key={language} value={language}>
                        {language}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {selectedLanguage && (
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="voice-label">Select Voice</InputLabel>
                    <Select
                      labelId="voice-label"
                      id="voice"
                      value={selectedVoice}
                      onChange={handleVoiceChange}
                    >
                      <MenuItem value="">--Select Voice--</MenuItem>
                      {Object.entries(selectedVoices).map(([name, details]) => (
                        <MenuItem key={name} value={name}>
                          {name} - {details.gender} ({details.engine})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                <Button variant="contained" color="primary" onClick={handleSynthesize} fullWidth>
                  Synthesize
                </Button>
                {status && <Typography variant="body1">Status: {status}</Typography>}
                {mp3Url && (
                  <Box>
                    <audio controls>
                      <source src={mp3Url} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}