import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent, Input, Select, Textarea, Button } from '@/components/common';
import { useSafetyActions } from '../hooks/useSafety';
import { useUiStore } from '@/store/uiStore';
import { SEVERITY } from '@/utils/constants';
import { AlertTriangle, AlertCircle, ShieldAlert, ChevronLeft } from 'lucide-react';

const TYPE_CONFIG = {
  Incident: { 
    icon: AlertTriangle, 
    color: 'text-red-600 bg-red-50 dark:bg-red-500/20 dark:text-red-400',
    description: 'Report an accident or injury that has occurred'
  },
  Hazard: { 
    icon: AlertCircle, 
    color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-500/20 dark:text-yellow-400',
    description: 'Report a potential danger or unsafe condition'
  },
  Near_Miss: { 
    icon: ShieldAlert, 
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/20 dark:text-blue-400',
    description: 'Report an event that could have caused harm'
  }
};

const CreateSafetyReport = () => {
  const navigate = useNavigate();
  const { addNotification } = useUiStore();
  const { createReport, isLoading } = useSafetyActions();
  const [selectedType, setSelectedType] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    incident_date: new Date().toISOString().split('T')[0],
    location: '',
    severity: 'Medium',
    description: '',
    actions_taken: '',
    witnesses: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.description.length < 20) newErrors.description = 'Please provide more detail (at least 20 characters)';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      // Map frontend field names to backend expected names
      const payload = {
        type: selectedType,
        severity: formData.severity,
        title: `${selectedType.replace('_', ' ')} at ${formData.location}`,
        description: formData.description,
        location: formData.location,
        incidentDate: formData.incident_date ? new Date(formData.incident_date).toISOString() : null
      };
      
      await createReport(payload);
      addNotification({ 
        type: 'success', 
        message: 'Safety report submitted. Safety department has been notified.' 
      });
      navigate('/safety');
    } catch (error) {
      addNotification({ type: 'error', message: error.message || 'Failed to submit report' });
    }
  };

  return (
    <PageWrapper title="Report Safety Concern">
      <div className="max-w-2xl mx-auto">
        {!selectedType ? (
          <Card>
            <CardHeader>
              <CardTitle>Select Report Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(TYPE_CONFIG).map(([type, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className="w-full flex items-start gap-4 p-4 border border-gray-200 dark:border-white/10
                               rounded-lg hover:border-primary-500 dark:hover:border-primary-400 
                               hover:bg-primary-50/50 dark:hover:bg-primary-500/10 transition-colors text-left
                               bg-white dark:bg-[#1a1f26]"
                    >
                      <div className={`p-3 rounded-lg ${config.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {type.replace('_', ' ')}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {config.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedType(null)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded text-gray-600 dark:text-gray-400"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <CardTitle>{selectedType.replace('_', ' ')} Report</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Date of Incident/Observation"
                  type="date"
                  name="incident_date"
                  value={formData.incident_date}
                  onChange={handleChange}
                />

                <Input
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  error={errors.location}
                  placeholder="Where did this occur?"
                  required
                />

                <Select
                  label="Severity"
                  name="severity"
                  value={formData.severity}
                  onChange={handleChange}
                >
                  {Object.values(SEVERITY).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>

                <Textarea
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  error={errors.description}
                  placeholder="Describe what happened in detail..."
                  rows={4}
                  required
                />

                <Textarea
                  label="Immediate Actions Taken (Optional)"
                  name="actions_taken"
                  value={formData.actions_taken}
                  onChange={handleChange}
                  placeholder="What steps were taken immediately after?"
                  rows={3}
                />

                <Input
                  label="Witnesses (Optional)"
                  name="witnesses"
                  value={formData.witnesses}
                  onChange={handleChange}
                  placeholder="John Doe, Jane Smith"
                />

                <div className="pt-4 safe-b">
                  <Button
                    type="submit"
                    variant="danger"
                    loading={isLoading}
                    className="w-full"
                  >
                    Submit Report to Safety Department
                  </Button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                    This report will be sent directly to the Safety department for review
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
};

export default CreateSafetyReport;
