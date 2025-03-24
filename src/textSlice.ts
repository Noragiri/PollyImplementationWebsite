import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TextState {
  text: string;
  taskId: string;
  status: string;
  mp3Url: string | undefined;
  selectedLanguage: string;
  selectedVoice: string;
}

const initialState: TextState = {
  text: '',
  taskId: '',
  status: '',
  mp3Url: undefined,
  selectedLanguage: '',
  selectedVoice: '',
};

const textSlice = createSlice({
  name: 'text',
  initialState,
  reducers: {
    setText: (state, action: PayloadAction<string>) => {
      state.text = action.payload;
    },
    setTaskId: (state, action: PayloadAction<string>) => {
      state.taskId = action.payload;
    },
    setStatus: (state, action: PayloadAction<string>) => {
      state.status = action.payload;
    },
    setMp3Url: (state, action: PayloadAction<string | undefined>) => {
      state.mp3Url = action.payload;
    },
    setSelectedLanguage: (state, action: PayloadAction<string>) => {
      state.selectedLanguage = action.payload;
    },
    setSelectedVoice: (state, action: PayloadAction<string>) => {
      state.selectedVoice = action.payload;
    },
  },
});

export const { setText, setTaskId, setStatus, setMp3Url, setSelectedLanguage, setSelectedVoice } = textSlice.actions;
export default textSlice.reducer;