import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import LoadingButton from '../components/LoadingButton';
import { useLoadingButton } from '../hooks/useLoadingButton';
import { Plus, Save, Trash2, Send } from 'lucide-react';

/*
 * COMPREHENSIVE GUIDE: Loading Button Implementation
 * 
 * This file demonstrates all the features and usage patterns for the LoadingButton component
 * and useLoadingButton hook, including:
 * 
 * 1. ✅ Disable button immediately after first click
 * 2. ✅ Show loading spinner while process is running
 * 3. ✅ Prevent multiple clicks or duplicate submissions
 * 4. ✅ Show toast notification only one time after process completes successfully
 * 5. ✅ Hide spinner after completion
 * 6. ✅ Re-enable button only after process is fully completed
 * 7. ✅ If already processing, ignore extra clicks
 * 8. ✅ Toast should not repeat on re-render or state update
 * 9. ✅ Add smooth UX with loading text like "Processing..."
 *
 * EXAMPLE FLOW:
 * Button Click → Disable Button → Show Spinner + "Processing..." → 
 * Complete Process → Hide Spinner → Show Single Success Toast → Enable Button
 */

// ============================================================================
// PATTERN 1: Simple API Call with LoadingButton Component
// ============================================================================

export const SimpleApiCall = () => {
  const handleSaveClick = async () => {
    // This async function will automatically handle:
    // - Button disabling
    // - Loading spinner display
    // - Preventing duplicate submissions
    // - Single toast notification
    // - Button re-enabling
    
    const response = await axios.post('/api/save-data', {
      name: 'John Doe',
      email: 'john@example.com'
    });
    return response.data;
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold">Pattern 1: Simple API Call</h3>
      <LoadingButton 
        onClick={handleSaveClick}
        successMessage="Data saved successfully!"
        errorMessage="Failed to save data. Please try again."
        loadingText="Saving..."
        className="bg-blue-600 hover:bg-blue-700"
      >
        <Save size={18} /> Save Changes
      </LoadingButton>
    </div>
  );
};

// ============================================================================
// PATTERN 2: Form Submission with Validation
// ============================================================================

export const FormSubmissionWithValidation = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      throw new Error('Name is required');
    }
    if (!formData.email.trim()) {
      throw new Error('Email is required');
    }

    // API call
    const response = await axios.post('/api/submit-form', formData);
    return response.data;
  };

  return (
    <div className="space-y-4 p-6 border rounded-lg">
      <h3 className="font-bold">Pattern 2: Form Submission with Validation</h3>
      <input 
        placeholder="Name"
        value={formData.name}
        onChange={e => setFormData({ ...formData, name: e.target.value })}
        className="w-full p-2 border rounded"
      />
      <input 
        placeholder="Email"
        value={formData.email}
        onChange={e => setFormData({ ...formData, email: e.target.value })}
        className="w-full p-2 border rounded"
      />
      
      <LoadingButton 
        onClick={handleSubmit}
        successMessage="Form submitted successfully!"
        errorMessage="Form submission failed"
        loadingText="Submitting..."
        variant="success"
      >
        <Send size={18} /> Submit Form
      </LoadingButton>
    </div>
  );
};

// ============================================================================
// PATTERN 3: Using useLoadingButton Hook with Custom Button
// ============================================================================

export const CustomButtonWithHook = () => {
  const { isLoading, handleClick } = useLoadingButton({
    onSubmit: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      const response = await axios.post('/api/process');
      return response.data;
    },
    successMessage: 'Process completed!',
    onSuccess: (result) => {
      console.log('Success result:', result);
    },
    onError: (error) => {
      console.error('Error occurred:', error);
    }
  });

  return (
    <div className="space-y-4">
      <h3 className="font-bold">Pattern 3: Custom Button with Hook</h3>
      <button 
        onClick={handleClick}
        disabled={isLoading}
        className={`px-4 py-2 rounded font-bold transition-all ${
          isLoading 
            ? 'bg-gray-400 cursor-not-allowed opacity-50' 
            : 'bg-purple-600 hover:bg-purple-700 text-white'
        }`}
      >
        {isLoading ? '⏳ Processing...' : '🚀 Custom Action'}
      </button>
    </div>
  );
};

// ============================================================================
// PATTERN 4: Multiple Buttons with Different Actions
// ============================================================================

export const MultipleActionsExample = () => {
  return (
    <div className="space-y-4 p-6 border rounded-lg">
      <h3 className="font-bold mb-4">Pattern 4: Multiple Actions with Individual Loading States</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <LoadingButton 
          onClick={async () => {
            await new Promise(resolve => setTimeout(resolve, 1500));
            await axios.post('/api/send-email');
          }}
          successMessage="Email sent successfully!"
          loadingText="Sending..."
          variant="primary"
          className="w-full"
        >
          <Send size={16} /> Send Email
        </LoadingButton>

        <LoadingButton 
          onClick={async () => {
            await new Promise(resolve => setTimeout(resolve, 2000));
            await axios.post('/api/generate-report');
          }}
          successMessage="Report generated!"
          loadingText="Generating..."
          variant="success"
          className="w-full"
        >
          Generate Report
        </LoadingButton>

        <LoadingButton 
          onClick={async () => {
            if (!window.confirm('Delete this item?')) {
              throw new Error('Cancelled by user');
            }
            await axios.delete('/api/item/123');
          }}
          successMessage="Item deleted successfully!"
          errorMessage="Failed to delete item"
          loadingText="Deleting..."
          variant="danger"
          className="w-full"
        >
          <Trash2 size={16} /> Delete Item
        </LoadingButton>

        <LoadingButton 
          onClick={async () => {
            await axios.patch('/api/publish');
          }}
          successMessage="Published successfully!"
          loadingText="Publishing..."
          variant="warning"
          className="w-full"
        >
          📢 Publish
        </LoadingButton>
      </div>
    </div>
  );
};

// ============================================================================
// PATTERN 5: Conditional Toast Messages
// ============================================================================

export const ConditionalToastMessages = () => {
  const [itemCount, setItemCount] = useState(0);

  const handleAdd = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    setItemCount(prev => prev + 1);
    // The button automatically shows the success message
    // even if the component re-renders with new state
  };

  return (
    <div className="space-y-4 p-6 border rounded-lg">
      <h3 className="font-bold">Pattern 5: State Updates Don't Cause Duplicate Toasts</h3>
      <p className="text-sm text-gray-600">
        Items added: <span className="font-bold text-lg">{itemCount}</span>
      </p>
      <p className="text-xs text-gray-500">
        Notice: Adding an item updates the counter, but the toast only shows once!
      </p>
      
      <LoadingButton 
        onClick={handleAdd}
        successMessage={`Item added! (Total: ${itemCount + 1})`}
        loadingText="Adding..."
        className="bg-emerald-600 hover:bg-emerald-700"
      >
        <Plus size={18} /> Add Item
      </LoadingButton>
    </div>
  );
};

// ============================================================================
// PATTERN 6: Transaction/Database Operation Example
// ============================================================================

export const TransactionExample = () => {
  const handleCreateCustomer = async () => {
    // Simulate an API call to create a customer
    // The button will prevent multiple submissions even if the user
    // clicks repeatedly or if the page is sluggish
    
    const newCustomer = {
      name: 'New Customer',
      email: 'customer@example.com',
      accountType: 'savings'
    };

    const response = await axios.post('/api/customers', newCustomer);
    return response.data;
  };

  return (
    <div className="space-y-4 p-6 border rounded-lg">
      <h3 className="font-bold">Pattern 6: Database Operation (Create Customer)</h3>
      <p className="text-sm text-gray-600 mb-4">
        This demonstrates creating a record in the database.
        Multiple clicks are ignored while processing.
      </p>
      
      <LoadingButton 
        onClick={handleCreateCustomer}
        successMessage="Customer created successfully! 🎉"
        errorMessage="Failed to create customer. Please check your connection."
        loadingText="Creating customer..."
        variant="primary"
        onSuccess={(result) => {
          console.log('New customer created:', result);
        }}
        onError={(error) => {
          console.error('Customer creation failed:', error);
        }}
      >
        <Plus size={18} /> Create New Customer
      </LoadingButton>
    </div>
  );
};

// ============================================================================
// PATTERN 7: Batch Operations
// ============================================================================

export const BatchOperationsExample = () => {
  const [selectedItems, setSelectedItems] = useState([]);

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      throw new Error('Please select at least one item to delete');
    }

    if (!window.confirm(`Delete ${selectedItems.length} items?`)) {
      throw new Error('Operation cancelled');
    }

    await axios.post('/api/bulk-delete', { ids: selectedItems });
    setSelectedItems([]); // Clear selection after success
  };

  return (
    <div className="space-y-4 p-6 border rounded-lg">
      <h3 className="font-bold">Pattern 7: Batch Operations</h3>
      <p className="text-sm text-gray-600 mb-4">
        Selected items: {selectedItems.length}
      </p>
      
      <LoadingButton 
        onClick={handleBulkDelete}
        disabled={selectedItems.length === 0}
        successMessage={`${selectedItems.length} items deleted successfully!`}
        errorMessage="Bulk delete operation failed"
        loadingText="Deleting items..."
        variant="danger"
      >
        <Trash2 size={18} /> Delete Selected ({selectedItems.length})
      </LoadingButton>
    </div>
  );
};

// ============================================================================
// PATTERN 8: Upload File with Progress
// ============================================================================

export const FileUploadExample = () => {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      throw new Error('Please select a file first');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    setFile(null); // Clear file selection after success
    return response.data;
  };

  return (
    <div className="space-y-4 p-6 border rounded-lg">
      <h3 className="font-bold">Pattern 8: File Upload</h3>
      <input 
        type="file"
        onChange={e => setFile(e.target.files?.[0])}
        className="w-full p-2 border rounded"
      />
      <p className="text-sm text-gray-600">
        Selected: {file?.name || 'No file selected'}
      </p>
      
      <LoadingButton 
        onClick={handleUpload}
        disabled={!file}
        successMessage="File uploaded successfully! ✅"
        errorMessage="Failed to upload file"
        loadingText="Uploading..."
        variant="success"
      >
        Upload File
      </LoadingButton>
    </div>
  );
};

// ============================================================================
// MAIN DEMO COMPONENT
// ============================================================================

export const LoadingButtonDemo = () => {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black mb-2">Loading Button Patterns</h1>
          <p className="text-gray-600">
            Comprehensive examples of button loading states, error handling, 
            and preventing multiple submissions
          </p>
        </div>

        <SimpleApiCall />
        <FormSubmissionWithValidation />
        <CustomButtonWithHook />
        <MultipleActionsExample />
        <ConditionalToastMessages />
        <TransactionExample />
        <BatchOperationsExample />
        <FileUploadExample />

        {/* Key Features Summary */}
        <div className="bg-white p-6 rounded-lg border-l-4 border-blue-600">
          <h2 className="font-black mb-4">✨ Key Features Implemented</h2>
          <ul className="space-y-2 text-sm">
            <li>✅ Button disables immediately on click</li>
            <li>✅ Loading spinner animates during processing</li>
            <li>✅ Multiple clicks are ignored while processing</li>
            <li>✅ Success/error toast shows only once</li>
            <li>✅ Toast persists even if state updates</li>
            <li>✅ Button re-enables after completion</li>
            <li>✅ Customizable loading text ("Processing...", "Saving...", etc.)</li>
            <li>✅ Success and error callbacks for custom logic</li>
            <li>✅ Works with forms, API calls, and batch operations</li>
            <li>✅ Multiple buttons with independent loading states</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoadingButtonDemo;
