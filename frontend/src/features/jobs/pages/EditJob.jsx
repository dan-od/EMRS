/**
 * EditJob Page
 * Edit existing job details
 */
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageWrapper } from '@/components/layout';
import { Card, CardContent, Button, Input, Select } from '@/components/common';
import { PageLoader } from '@/components/feedback';
import { useJob, useJobActions } from '../hooks/useJobs';
import { ChevronLeft, Save, Briefcase } from 'lucide-react';

const PRIORITIES = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
  { value: 'Critical', label: 'Critical' }
];

// Format date for input (YYYY-MM-DD)
const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0];
};

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { job, isLoading: loadingJob } = useJob(id);
  const { updateJob } = useJobActions();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    client: '',
    location: '',
    description: '',
    start_date: '',
    end_date: '',
    priority: 'Medium'
  });

  // Load job data into form when available
  useEffect(() => {
    if (job) {
      setFormData({
        client: job.client || '',
        location: job.location || '',
        description: job.description || '',
        start_date: formatDateForInput(job.start_date),
        end_date: formatDateForInput(job.end_date),
        priority: job.priority || 'Medium'
      });
    }
  }, [job]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validate = () => {
    if (!formData.client.trim()) return 'Client name is required';
    if (!formData.location.trim()) return 'Location is required';
    if (!formData.start_date) return 'Start date is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      // Convert dates to ISO format for backend
      const payload = {
        ...formData,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null
      };
      
      await updateJob(id, payload);
      navigate(`/jobs/${id}`);
    } catch (err) {
      console.error('Failed to update job:', err);
      setError(err.response?.data?.error || 'Failed to update job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingJob) return <PageLoader />;

  if (!job) {
    return (
      <PageWrapper title="Edit Job">
        <div className="text-center py-12">
          <p className="text-text-muted">Job not found</p>
          <Button variant="secondary" className="mt-4" onClick={() => navigate('/jobs')}>
            Back to Jobs
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title={
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/jobs/${id}`)} className="p-1 hover:bg-background-secondary dark:hover:bg-gray-800 rounded">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <Briefcase className="w-5 h-5 text-primary-500" />
          <span>Edit Job</span>
          <span className="text-sm font-normal text-text-muted">({job.job_number})</span>
        </div>
      }
    >
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Client Name"
                value={formData.client}
                onChange={(e) => handleChange('client', e.target.value)}
                placeholder="Enter client name"
                required
              />
              
              <Input
                label="Location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Enter job location"
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Enter job description (optional)"
                  rows={3}
                  className="w-full px-3 py-2 border border-border-light dark:border-gray-600 rounded-lg 
                    bg-white dark:bg-gray-800 text-text-primary
                    focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleChange('start_date', e.target.value)}
                  required
                />
                <Input
                  label="Estimated End Date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleChange('end_date', e.target.value)}
                />
              </div>
              
              <Select
                label="Priority"
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                options={PRIORITIES}
              />

              {/* Error Display */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-xs">!</span>
                    {error}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t border-border-light dark:border-gray-700">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate(`/jobs/${id}`)}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Cancel
                </Button>

                <Button 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (
                    <>
                      <Save className="w-4 h-4 mr-1" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
};

export default EditJob;
