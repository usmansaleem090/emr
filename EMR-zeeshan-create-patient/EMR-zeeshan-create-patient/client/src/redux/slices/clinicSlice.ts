import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiClient } from "../../utils/apiClient";

interface Clinic {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ClinicState {
  clinics: Clinic[];
  selectedClinic: Clinic | null;
  loading: boolean;
  error: string | null;
}

const initialState: ClinicState = {
  clinics: [],
  selectedClinic: null,
  loading: false,
  error: null,
};

// Async thunk to fetch all clinics
export const fetchClinics = createAsyncThunk(
  "clinic/fetchClinics",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/api/clinics");
      return response.data.data || [];
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch clinics";
      return rejectWithValue(errorMessage);
    }
  }
);

const clinicSlice = createSlice({
  name: "clinic",
  initialState,
  reducers: {
    setSelectedClinic: (state, action: PayloadAction<Clinic | null>) => {
      state.selectedClinic = action.payload;
    },
    clearClinics: (state) => {
      state.clinics = [];
      state.selectedClinic = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClinics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClinics.fulfilled, (state, action) => {
        state.loading = false;
        state.clinics = action.payload;
        state.error = null;
      })
      .addCase(fetchClinics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedClinic, clearClinics } = clinicSlice.actions;
export default clinicSlice.reducer; 