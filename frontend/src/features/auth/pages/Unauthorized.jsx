import { Link } from 'react-router-dom';
import { ShieldX } from 'lucide-react';
import { Button } from '@/components/common';

export const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 safe-y">
      <div className="text-center">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text mb-2">Access Denied</h1>
        <p className="text-text-secondary dark:text-gray-400 mb-8 max-w-md">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <Link to="/dashboard">
          <Button variant="primary">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
