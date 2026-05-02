/**
 * Transport Request Form
 * Form for vehicle/transport requests
 */

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const VEHICLE_TYPES = ['Pickup', 'SUV', 'Bus', 'Truck', 'Crane', 'Forklift'];

const TransportRequestForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    priority: 'Medium',
    vehicleType: '',
    pickup: '',
    destination: '',
    passengers: 1,
    purpose: '',
    dateNeeded: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'passengers' ? parseInt(value) || 1 : value 
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.vehicleType) newErrors.vehicleType = 'Select a vehicle type';
    if (!formData.pickup.trim()) newErrors.pickup = 'Pickup location is required';
    if (!formData.destination.trim()) newErrors.destination = 'Destination is required';
    if (!formData.purpose.trim()) newErrors.purpose = 'Purpose is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Format data to match backend schema
      const payload = {
        type: 'Transport',
        priority: formData.priority,
        details: {
          vehicleType: formData.vehicleType,
          pickup: formData.pickup,
          destination: formData.destination,
          passengers: formData.passengers || undefined,
          purpose: formData.purpose
        },
        dateNeeded: formData.dateNeeded ? new Date(formData.dateNeeded).toISOString() : undefined
      };
      onSubmit(payload);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Vehicle Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Vehicle Type <span className="text-red-500">*</span>
        </label>
        <select
          name="vehicleType"
          value={formData.vehicleType}
          onChange={handleChange}
          className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-[#1a1f26] text-text-primary dark:text-white focus:ring-2 focus:ring-primary-500 ${
            errors.vehicleType ? 'border-red-500' : 'border-gray-200 dark:border-white/10'
          }`}
        >
          <option value="">Select vehicle type...</option>
          {VEHICLE_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        {errors.vehicleType && <p className="text-red-500 text-sm mt-1">{errors.vehicleType}</p>}
      </div>

      {/* Pickup & Destination */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Pickup Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="pickup"
            value={formData.pickup}
            onChange={handleChange}
            placeholder="e.g., Main Office"
            className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-[#1a1f26] text-text-primary dark:text-white focus:ring-2 focus:ring-primary-500 ${
              errors.pickup ? 'border-red-500' : 'border-gray-200 dark:border-white/10'
            }`}
          />
          {errors.pickup && <p className="text-red-500 text-sm mt-1">{errors.pickup}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Destination <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            placeholder="e.g., Field Site A"
            className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-[#1a1f26] text-text-primary dark:text-white focus:ring-2 focus:ring-primary-500 ${
              errors.destination ? 'border-red-500' : 'border-gray-200 dark:border-white/10'
            }`}
          />
          {errors.destination && <p className="text-red-500 text-sm mt-1">{errors.destination}</p>}
        </div>
      </div>

      {/* Passengers, Priority, Date */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passengers</label>
          <input
            type="number"
            name="passengers"
            min="1"
            value={formData.passengers}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1a1f26] text-text-primary dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1a1f26] text-text-primary dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Needed</label>
          <input
            type="date"
            name="dateNeeded"
            value={formData.dateNeeded}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1a1f26] text-text-primary dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Purpose */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Purpose <span className="text-red-500">*</span>
        </label>
        <textarea
          name="purpose"
          value={formData.purpose}
          onChange={handleChange}
          rows={3}
          placeholder="Describe the purpose of this transport request..."
          className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-[#1a1f26] text-text-primary dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 resize-none ${
            errors.purpose ? 'border-red-500' : 'border-gray-200 dark:border-white/10'
          }`}
        />
        {errors.purpose && <p className="text-red-500 text-sm mt-1">{errors.purpose}</p>}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Transport Request'
        )}
      </button>
    </form>
  );
};

export default TransportRequestForm;
