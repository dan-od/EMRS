/**
 * CreateJob - Create new job form
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/components/layout';
import { Card, CardContent, Button, Input, Select } from '@/components/common';
import { ChevronLeft, Save, Briefcase } from 'lucide-react';
import { useJobActions } from '../hooks';
import { PRIORITY_OPTIONS } from '../constants';

const CreateJob = () => {
  const nav = useNavigate();
  const { createJob } = useJobActions();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({ client: '', well_name: '', location: '', description: '', start_date: '', expected_end_date: '', priority: 'Medium', special_requirements: '', safety_considerations: '' });

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: null })); };

  const validate = () => {
    const e = {};
    if (!form.client.trim()) e.client = 'Required';
    if (!form.location.trim()) e.location = 'Required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const job = await createJob(form);
      nav(`/jobs/${job.id}`);
    } catch (e) { setErrors({ submit: e.response?.data?.message || 'Failed' }); }
    setLoading(false);
  };

  return (
    <PageWrapper title={<div className="flex items-center gap-3"><button onClick={() => nav('/jobs')} className="p-1 hover:bg-background-secondary rounded"><ChevronLeft className="w-5 h-5" /></button><Briefcase className="w-5 h-5 text-primary-500" />New Job</div>}>
      <form onSubmit={submit} className="max-w-3xl">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div><h3 className="font-medium mb-4">Basic Info</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Client *" value={form.client} onChange={e => set('client', e.target.value)} error={errors.client} />
                <Input label="Well Name" value={form.well_name} onChange={e => set('well_name', e.target.value)} />
                <Input label="Location *" value={form.location} onChange={e => set('location', e.target.value)} error={errors.location} />
                <Select label="Priority" value={form.priority} onChange={e => set('priority', e.target.value)} options={PRIORITY_OPTIONS} />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                <textarea className="w-full px-3 py-2 border border-border-light rounded-lg text-sm" value={form.description} onChange={e => set('description', e.target.value)} rows={2} />
              </div>
            </div>
            <div><h3 className="font-medium mb-4">Schedule</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Input type="date" label="Start Date" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
                <Input type="date" label="End Date" value={form.expected_end_date} onChange={e => set('expected_end_date', e.target.value)} />
              </div>
            </div>
            {errors.submit && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{errors.submit}</div>}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="ghost" type="button" onClick={() => nav('/jobs')}>Cancel</Button>
              <Button variant="primary" type="submit" disabled={loading}>{loading ? 'Creating...' : <><Save className="w-4 h-4 mr-2" />Create Job</>}</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </PageWrapper>
  );
};

export default CreateJob;
