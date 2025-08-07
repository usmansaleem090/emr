import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { RootState, AppDispatch } from '../redux/store';
import { fetchClinics, setSelectedClinic } from '../redux/slices/clinicSlice';

export const useClinic = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { clinics, selectedClinic, loading, error } = useSelector((state: RootState) => state.clinic);

  const loadClinics = useCallback(() => {
    dispatch(fetchClinics());
  }, [dispatch]);

  const selectClinic = useCallback((clinic: any) => {
    dispatch(setSelectedClinic(clinic));
  }, [dispatch]);

  return {
    clinics,
    selectedClinic,
    loading,
    error,
    loadClinics,
    selectClinic,
  };
}; 