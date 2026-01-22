import React, { useEffect, useState } from "react";
import {
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  Loader2,
  CheckCircle,
  Send,
  X,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  ChevronDown,
} from "lucide-react";
import { useCustomerTasks } from "@/hooks/useTasksAndBookings";
import {
  TaskPriority,
  TaskWithProvidersResponse,
  CreateTaskRequestBody,
} from "@/types/task.types";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

interface CalendarProps {
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
}

const Calendar: React.FC<CalendarProps> = ({
  selected,
  onSelect,
  disabled,
}) => {
  const [currentMonth, setCurrentMonth] = useState(selected || new Date());

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const days = daysInMonth(currentMonth);
  const firstDay = firstDayOfMonth(currentMonth);
  const blanks = Array(firstDay).fill(null);
  const daysArray = Array.from({ length: days }, (_, i) => i + 1);

  const isSelected = (day: number) => {
    if (!selected) return false;
    return (
      selected.getDate() === day &&
      selected.getMonth() === currentMonth.getMonth() &&
      selected.getFullYear() === currentMonth.getFullYear()
    );
  };

  const isDisabled = (day: number) => {
    if (!disabled) return false;
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    return disabled(date);
  };

  const handleDayClick = (day: number) => {
    if (isDisabled(day)) return;
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    onSelect(newDate);
  };

  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={previousMonth}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="font-semibold text-gray-900 dark:text-white">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
        <button
          onClick={nextMonth}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
        {blanks.map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {daysArray.map((day) => (
          <button
            key={day}
            onClick={() => handleDayClick(day)}
            disabled={isDisabled(day)}
            className={`p-2 text-sm rounded-md transition-colors ${
              isSelected(day)
                ? "bg-red-500 text-white font-semibold"
                : isDisabled(day)
                ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
            }`}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// DATE TIME PICKER COMPONENT
// ============================================================================

interface DateTimePickerProps {
  selectedDate?: Date;
  startTime: string;
  endTime: string;
  onDateChange: (date?: Date) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  hideDate?: boolean;
  hideTime?: boolean;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  selectedDate,
  startTime,
  endTime,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  hideDate = false,
  hideTime = false,
}) => {
  const [showCalendar, setShowCalendar] = useState(false);

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const hourStr = hour.toString().padStart(2, "0");
        const minuteStr = minute.toString().padStart(2, "0");
        const time = `${hourStr}:${minuteStr}`;
        const displayTime = new Date(
          2000,
          0,
          1,
          hour,
          minute
        ).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        slots.push({ value: time, label: displayTime });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleDateSelect = (date: Date | undefined) => {
    onDateChange(date);
    setShowCalendar(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTimeRange = () => {
    if (!startTime && !endTime) return "Select time range";

    const formatTime = (time: string) => {
      if (!time) return "";
      const [hours, minutes] = time.split(":");
      const date = new Date(2000, 0, 1, parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    };

    if (startTime && endTime) {
      return `${formatTime(startTime)} - ${formatTime(endTime)}`;
    } else if (startTime) {
      return `From ${formatTime(startTime)}`;
    } else if (endTime) {
      return `Until ${formatTime(endTime)}`;
    }
    return "Select time range";
  };

  return (
    <div className="space-y-4">
      {!hideDate && (
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            When Do You Need This Service?
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCalendar(!showCalendar)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white text-sm text-left flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span
                className={
                  selectedDate
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-400"
                }
              >
                {selectedDate ? formatDate(selectedDate) : "Pick a date"}
              </span>
              <CalendarIcon className="w-4 h-4 text-gray-400" />
            </button>
            {showCalendar && (
              <div className="absolute z-50 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <Calendar
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                />
              </div>
            )}
          </div>
        </div>
      )}

      {!hideTime && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Service needed between
          </label>

          <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-blue-900 dark:text-blue-100 font-medium">
                {formatTimeRange()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                From
              </label>
              <select
                value={startTime}
                onChange={(e) => onStartTimeChange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white text-sm"
              >
                <option value="">Start time</option>
                {timeSlots.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                To
              </label>
              <select
                value={endTime}
                onChange={(e) => onEndTimeChange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white text-sm"
              >
                <option value="">End time</option>
                {timeSlots.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Specify the time window when you need the service
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// FORM DATA INTERFACE
// ============================================================================

interface TaskFormData {
  title: string;
  description: string;
  ghanaPostGPS: string;
  nearbyLandmark: string;
  priority: TaskPriority;
  preferredDate?: Date;
  startTime: string;
  endTime: string;
  flexibleDates: boolean;
  flexibleTime: boolean;
  latitude?: number;
  longitude?: number;
}

interface TaskFormProps {
  onBrowseServices: () => void;
  onSuccess?: (response: TaskWithProvidersResponse) => void;
}

// ============================================================================
// MAIN TASK FORM COMPONENT
// ============================================================================

export default function TaskForm({
  onBrowseServices,
  onSuccess,
}: TaskFormProps) {
  const [showDetailForm, setShowDetailForm] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [matchedCount, setMatchedCount] = useState(0);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const { createTask, loading, error, clearError } = useCustomerTasks(
    undefined,
    false
  );

  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    ghanaPostGPS: "",
    nearbyLandmark: "",
    priority: TaskPriority.MEDIUM,
    preferredDate: undefined,
    startTime: "",
    endTime: "",
    flexibleDates: false,
    flexibleTime: false,
    latitude: undefined,
    longitude: undefined,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof TaskFormData, string>>
  >({});

  // ============================================================================
  // HANDLERS
  // ============================================================================

  // Replace the existing useEffect hook with this one:

  useEffect(() => {
    // Automatically get location when component mounts
    handleGetCurrentLocation();
  }, []); // Empty dependency array means this runs once on mount

  // The handleGetCurrentLocation function remains the same, but here it is for reference:
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setFormData((prev) => ({
          ...prev,
          latitude,
          longitude,
        }));

        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError(
              "Location access denied. Please enable location permissions."
            );
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information unavailable.");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out.");
            break;
          default:
            setLocationError(
              "An unknown error occurred while getting location."
            );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleTitleSubmit = () => {
    if (formData.title.trim()) {
      setShowDetailForm(true);
    }
    handleGetCurrentLocation();
  };

  const handleInputChange = <K extends keyof TaskFormData>(
    field: K,
    value: TaskFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    if (error) {
      clearError();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TaskFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Task title is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Task description is required";
    }
    if (!formData.ghanaPostGPS.trim()) {
      newErrors.ghanaPostGPS = "Ghana Post GPS address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePublishTask = async () => {
    if (!validateForm()) return;

    try {
      // Build the request body according to CreateTaskRequestBody interface
      const requestBody: CreateTaskRequestBody = {
        title: formData.title,
        description: formData.description,
        customerLocation: {
          ghanaPostGPS: formData.ghanaPostGPS,
          nearbyLandmark: formData.nearbyLandmark || undefined,
          gpsCoordinates:
            formData.latitude && formData.longitude
              ? {
                  latitude: formData.latitude,
                  longitude: formData.longitude,
                }
              : undefined,
        },
        schedule: {
          priority: formData.priority,
          preferredDate: formData.preferredDate,
          flexibleDates: formData.flexibleDates,
          timeSlot:
            formData.startTime && formData.endTime
              ? {
                  start: formData.startTime,
                  end: formData.endTime,
                }
              : undefined,
        },
        matchingStrategy: "intelligent",
      };

      const response = await createTask(requestBody);

      // Show success
      setMatchedCount(response.matchingSummary?.totalMatches || 0);
      setShowSuccess(true);

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(response);
        toast.success("Task created successfully!");
      }

      // Reset form after 3 seconds
      setTimeout(() => {
        handleReset();
      }, 5000);
    } catch (err) {
      // Error is handled by the hook
      console.error("Error creating task:", err);
      toast.error("Failed to create task");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && !showDetailForm) {
      handleTitleSubmit();
      handleGetCurrentLocation();
    }
  };

  const handleReset = () => {
    setShowDetailForm(false);
    setShowSuccess(false);
    setFormData({
      title: "",
      description: "",
      ghanaPostGPS: "",
      nearbyLandmark: "",
      priority: TaskPriority.MEDIUM,
      preferredDate: undefined,
      startTime: "",
      endTime: "",
      flexibleDates: false,
      flexibleTime: false,
      latitude: undefined,
      longitude: undefined,
    });
    setErrors({});
    clearError();
    setLocationError(null);
  };

  return (
    <div className="h-full bg-linear-to-br">
      <div className="max-w-2xl mx-auto">
        <div className="relative z-10">
          <div className="absolute inset-0 bg-linear-to-br from-red-400 to-blue-500 rounded-3xl transform rotate-3 opacity-10"></div>

          <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {showSuccess && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">
                      Task published successfully!
                    </h3>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Found {matchedCount} matching providers. Redirecting...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 dark:text-red-100 text-sm">
                      Error
                    </h3>
                    <p className="text-xs text-red-700 dark:text-red-300">
                      {error.message || "Failed to create task"}
                    </p>
                  </div>
                  <button
                    onClick={clearError}
                    className="text-red-600 dark:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {showDetailForm
                    ? "Task Details"
                    : "What do you need help with?"}
                </h2>
                {showDetailForm && (
                  <button
                    onClick={handleReset}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                )}
              </div>

              <div className="space-y-5">
                {/* Title Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Task Title{" "}
                    {!showDetailForm && <span className="text-red-500">*</span>}
                  </label>
                  <div
                    className={`relative transition-all duration-300 ${
                      isFocused && !showDetailForm
                        ? "ring-2 ring-red-500 rounded-xl"
                        : ""
                    }`}
                  >
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      onKeyPress={handleKeyPress}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      disabled={showDetailForm}
                      placeholder="e.g. Pick up a child, deliveries, home chores..."
                      className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border ${
                        errors.title
                          ? "border-red-500"
                          : "border-gray-200 dark:border-gray-700"
                      } rounded-xl focus:outline-none dark:text-white placeholder-gray-400 text-base disabled:opacity-50 disabled:cursor-not-allowed`}
                    />
                  </div>
                  {errors.title && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.title}
                    </p>
                  )}
                  {!showDetailForm && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Describe your task briefly
                    </p>
                  )}
                </div>

                {showDetailForm && (
                  <div className="space-y-5 animate-in slide-in-from-top duration-300">
                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        placeholder="Provide more details about your task..."
                        rows={4}
                        className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border ${
                          errors.description
                            ? "border-red-500"
                            : "border-gray-200 dark:border-gray-700"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white text-sm`}
                      />
                      {errors.description && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                          {errors.description}
                        </p>
                      )}
                    </div>

                    {/* Location Section */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                        <MapPin className="w-4 h-4 text-red-500" />
                        Location Details
                      </h3>

                      <div className="space-y-4">
                        {/* GPS Coordinates Button */}
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Crosshair className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                GPS Coordinates
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={handleGetCurrentLocation}
                              disabled={isGettingLocation}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-medium rounded-md transition-colors flex items-center gap-1.5"
                            >
                              {isGettingLocation ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  Refreshing...
                                </>
                              ) : (
                                <>
                                  <Crosshair className="w-3 h-3" />
                                  Refresh
                                </>
                              )}
                            </button>
                          </div>

                          {formData.latitude && formData.longitude ? (
                            <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                                <span className="font-medium">
                                  Location captured successfully!
                                </span>
                              </div>
                              <div className="pl-5 text-blue-600 dark:text-blue-400 font-mono">
                                {formData.latitude.toFixed(6)},{" "}
                                {formData.longitude.toFixed(6)}
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                              Click the button above to automatically detect
                              your current location
                            </p>
                          )}

                          {locationError && (
                            <div className="mt-2 flex items-start gap-2 text-xs text-red-600 dark:text-red-400">
                              <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                              <span>{locationError}</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Ghana Post GPS Address{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.ghanaPostGPS}
                            onChange={(e) =>
                              handleInputChange("ghanaPostGPS", e.target.value)
                            }
                            placeholder="e.g. GA-123-4567"
                            className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border ${
                              errors.ghanaPostGPS
                                ? "border-red-500"
                                : "border-gray-200 dark:border-gray-700"
                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white text-sm`}
                          />
                          {errors.ghanaPostGPS && (
                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                              {errors.ghanaPostGPS}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nearest Landmark
                          </label>
                          <input
                            type="text"
                            value={formData.nearbyLandmark}
                            onChange={(e) =>
                              handleInputChange(
                                "nearbyLandmark",
                                e.target.value
                              )
                            }
                            placeholder="e.g. Near the yellow house"
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Schedule Section */}
                    <div className="mt-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-5">
                      <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                        <CalendarIcon className="h-4 w-4 text-blue-500" />
                        Schedule & Priority
                      </h3>

                      <div className="space-y-5">
                        {/* Priority */}
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            Urgency Level
                          </label>

                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-between text-sm"
                              >
                                {formData.priority
                                  ? formData.priority.charAt(0).toUpperCase() +
                                    formData.priority.slice(1).toLowerCase()
                                  : "Select urgency"}
                                <ChevronDown className="w-4 h-4 ml-2" />
                              </Button>
                            </PopoverTrigger>

                            <PopoverContent className="w-48 p-2">
                              <div className="flex flex-col gap-1">
                                {Object.values(TaskPriority).map((priority) => (
                                  <button
                                    key={priority}
                                    type="button"
                                    onClick={() =>
                                      handleInputChange("priority", priority)
                                    }
                                    className={`rounded-lg px-3 py-2 text-left text-sm transition-all ${
                                      formData.priority === priority
                                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 font-semibold"
                                        : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                                    }`}
                                  >
                                    {priority.charAt(0).toUpperCase() +
                                      priority.slice(1).toLowerCase()}
                                  </button>
                                ))}
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Flexibility options */}
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 space-y-3">
                          <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                            <input
                              type="checkbox"
                              checked={formData.flexibleDates}
                              onChange={(e) => {
                                handleInputChange(
                                  "flexibleDates",
                                  e.target.checked
                                );
                                if (e.target.checked) {
                                  handleInputChange("preferredDate", undefined);
                                }
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                            />
                            I’m flexible with dates
                          </label>

                          <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                            <input
                              type="checkbox"
                              checked={formData.flexibleTime}
                              onChange={(e) => {
                                handleInputChange(
                                  "flexibleTime",
                                  e.target.checked
                                );
                                if (e.target.checked) {
                                  handleInputChange("startTime", "");
                                  handleInputChange("endTime", "");
                                }
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                            />
                            Service needed at any time
                          </label>
                        </div>

                        {/* Date & Time */}
                        <DateTimePicker
                          selectedDate={formData.preferredDate}
                          startTime={formData.startTime}
                          endTime={formData.endTime}
                          onDateChange={(date) =>
                            handleInputChange("preferredDate", date)
                          }
                          onStartTimeChange={(time) =>
                            handleInputChange("startTime", time)
                          }
                          onEndTimeChange={(time) =>
                            handleInputChange("endTime", time)
                          }
                          hideDate={formData.flexibleDates}
                          hideTime={formData.flexibleTime}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-4">
                  {!showDetailForm ? (
                    <>
                      <button
                        onClick={handleTitleSubmit}
                        disabled={!formData.title.trim()}
                        className="w-full py-3.5 bg-linear-to-r from-red-500 to-blue-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center gap-2"
                      >
                        Continue
                        <ArrowRight className="w-5 h-5" />
                      </button>

                      <div className="relative flex items-center justify-center my-4">
                        <div className="absolute inset-x-0 h-px bg-gray-200 dark:bg-gray-700"></div>
                        <span className="relative px-4 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
                          or
                        </span>
                      </div>

                      <button
                        onClick={onBrowseServices}
                        className="w-full py-3.5 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                      >
                        Browse All Services
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handlePublishTask}
                      disabled={loading}
                      className="w-full py-3.5 bg-linear-to-r from-red-500 to-blue-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Publish & Find Providers
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {!showDetailForm && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <span className="text-green-600 dark:text-green-400">
                        ✓
                      </span>
                      <span>Secure payments</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-green-600 dark:text-green-400">
                        ✓
                      </span>
                      <span>24/7 support</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
