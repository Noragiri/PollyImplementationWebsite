"use client";

import React, { useState } from "react";
import { Container, TextField, Button, Select, MenuItem, InputLabel, FormControl, Typography, Box, CircularProgress, SelectChangeEvent } from "@mui/material";
import voices from "./voices";

export default function Home() {
  const [text, setText] = useState("");
  const [taskId, setTaskId] = useState("");
  const [status, setStatus] = useState("");
  const [mp3Url, setMp3Url] = useState<string | undefined>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [selectedVoice, setSelectedVoice] = useState<string>("");

  const handleSynthesize = async () => {
    try {
      const selectedVoiceData = voices[selectedLanguage];
      if (!selectedVoiceData) {
        throw new Error("Invalid language selected");
      }

      const voiceDetails = selectedVoiceData.names[selectedVoice];
      if (!voiceDetails) {
        throw new Error("Invalid voice selected");
      }

      const response = await fetch("http://127.0.0.1:8000/synthesize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, voice: selectedVoice, language: selectedVoiceData.code, voiceType: voiceDetails.engine }),
      });
      const data = await response.json();
      setTaskId(data.taskId);
    } catch (error) {
      console.error("Error synthesizing text:", error);
    }
  };

  const handleCheckStatus = async () => {
    try {
      setMp3Url(undefined);
      console.log("Checking status...");
      console.log("Task ID:", taskId);
      const response = await fetch("http://127.0.0.1:8000/check_status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ taskId }),
      });
      console.log("Response:", response);
      const data = await response.json();
      console.log("Data:", data);
      setStatus(data.task_status.SynthesisTask.TaskStatus);
      if (data.task_status.SynthesisTask.TaskStatus === "completed") {
        setMp3Url(data.task_status.SynthesisTask.PreSignedUrl);
      }
    } catch (error) {
      console.error("Error checking status:", error);
    }
  };

  const handleLanguageChange = (e: SelectChangeEvent<string>) => {
    setSelectedLanguage(e.target.value as string);
    setSelectedVoice("");
  };

  const handleVoiceChange = (e: SelectChangeEvent<string>) => {
    setSelectedVoice(e.target.value as string);
  };

  const selectedVoices = voices[selectedLanguage]?.names || {};

  return (
    <Container maxWidth="sm">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Text to Speech
        </Typography>
        <TextField
          fullWidth
          label="Enter text to synthesize"
          value={text}
          onChange={(e) => setText(e.target.value)}
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
            label="Select Language"
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
              label="Select Voice"
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
        <Box my={2}>
          <Button variant="contained" color="primary" onClick={handleSynthesize} fullWidth>
            Synthesize
          </Button>
        </Box>
        {taskId && (
          <Box my={2}>
            <Typography variant="body1">Task ID: {taskId}</Typography>
            <Button variant="contained" color="secondary" onClick={handleCheckStatus} fullWidth>
              Check Status
            </Button>
            {status && <Typography variant="body1">Status: {status}</Typography>}
            {mp3Url && (
              <Box my={2}>
                <audio controls>
                  <source src={mp3Url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </Box>
            )}
            {!mp3Url && status === "inProgress" && <CircularProgress />}
          </Box>
        )}
      </Box>
    </Container>
  );
}
