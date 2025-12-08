// hooks/useProviderFormStorage.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { CreateProviderProfileInput } from "./form.schema";

const STORAGE_KEY = "provider_form_draft";
const STORAGE_VERSION = "1.0";

interface StorageData {
  version: string;
  data: Partial<CreateProviderProfileInput>;
  currentStep: number;
  lastSaved: string;
}

export function useProviderFormStorage() {
  const [formData, setFormData] = useState<Partial<CreateProviderProfileInput>>(
    {}
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: StorageData = JSON.parse(stored);

        // Check version compatibility
        if (parsed.version === STORAGE_VERSION) {
          setFormData(parsed.data);
          setCurrentStep(parsed.currentStep);
        } else {
          // Version mismatch, clear old data
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error("Error loading form data from storage:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage
  const saveToStorage = useCallback(
    (data: Partial<CreateProviderProfileInput>, step: number) => {
      try {
        const storageData: StorageData = {
          version: STORAGE_VERSION,
          data,
          currentStep: step,
          lastSaved: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
      } catch (error) {
        console.error("Error saving form data to storage:", error);
      }
    },
    []
  );

  // Update form data and save
  const updateFormData = useCallback(
    (data: Partial<CreateProviderProfileInput>) => {
      setFormData((prev) => {
        const updated = { ...prev, ...data };
        saveToStorage(updated, currentStep);
        return updated;
      });
    },
    [currentStep, saveToStorage]
  );

  // Update current step
  const updateStep = useCallback(
    (step: number) => {
      setCurrentStep(step);
      saveToStorage(formData, step);
    },
    [formData, saveToStorage]
  );

  // Clear storage
  const clearStorage = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setFormData({});
    setCurrentStep(0);
  }, []);

  // Check if draft exists
  const hasDraft = useCallback(() => {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }, []);

  return {
    formData,
    currentStep,
    isLoaded,
    updateFormData,
    updateStep,
    clearStorage,
    hasDraft,
  };
}
