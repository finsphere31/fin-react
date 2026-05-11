# Loading Button Implementation Guide

## Overview

This guide covers the implementation of a production-ready `LoadingButton` component and `useLoadingButton` hook that handle all aspects of button loading states, including preventing duplicate submissions, showing single toast notifications, and providing smooth UX.

## Features Checklist

- ✅ **Disable button immediately** after first click
- ✅ **Show loading spinner** while process is running
- ✅ **Prevent multiple clicks** or duplicate submissions
- ✅ **Show toast notification only once** after process completes
- ✅ **Hide spinner** after completion
- ✅ **Re-enable button** only after process is fully completed
- ✅ **Ignore extra clicks** if already processing
- ✅ **Toast doesn't repeat** on re-render or state update
- ✅ **Smooth UX** with loading text (e.g., "Processing...", "Saving...")

## File Structure

```
src/
├── components/
│   └── LoadingButton.jsx          # Main button component
├── hooks/
│   └── useLoadingButton.js        # Custom hook for flexible usage
└── examples/
    └── LoadingButtonExample.jsx   # Comprehensive examples and patterns
```

## Installation & Setup

### 1. LoadingButton Component

The `LoadingButton` is a drop-in replacement for your existing button component.

**Location:** `/src/components/LoadingButton.jsx`

**Features:**
- Wraps async operations
- Manages loading state automatically
- Handles toast notifications
- Prevents duplicate submissions

### 2. useLoadingButton Hook

For more flexibility, use the `useLoadingButton` hook with any button element.

**Location:** `/src/hooks/useLoadingButton.js`

**Features:**
- Returns `isLoading` state
- Provides `handleClick` function
- Works with custom button styles
- Includes cleanup on unmount

## Usage Examples

### Basic Usage with LoadingButton

```jsx
import LoadingButton from '../components/LoadingButton';
import { Save } from 'lucide-react';

export const MyComponent = () => {
  const handleSave = async () => {
    await api.post('/api/save', { data: 'value' });
  };

  return (
    <LoadingButton 
      onClick={handleSave}
      successMessage="Data saved successfully!"
      loadingText="Saving..."
    >
      <Save size={18} /> Save Changes
    </LoadingButton>
  );
};
```

**What happens:**
1. User clicks button
2. Button immediately disables
3. Spinner appears with "Saving..." text
4. API call executes
5. Success toast shows once
6. Spinner hides
7. Button re-enables
8. Extra clicks are ignored during processing

### With Error Handling

```jsx
<LoadingButton 
  onClick={async () => {
    if (!formData.email) {
      throw new Error('Email is required');
    }
    await api.post('/api/submit', formData);
  }}
  successMessage="Form submitted!"
  errorMessage="Failed to submit form"
  loadingText="Submitting..."
  variant="success"
>
  Submit Form
</LoadingButton>
```

### Using the useLoadingButton Hook

```jsx
import { useLoadingButton } from '../hooks/useLoadingButton';

export const MyComponent = () => {
  const { isLoading, handleClick } = useLoadingButton({
    onSubmit: async () => {
      await api.post('/api/process');
    },
    successMessage: 'Process completed!',
    onSuccess: (result) => {
      console.log('Success:', result);
    },
    onError: (error) => {
      console.error('Error:', error);
    }
  });

  return (
    <button 
      onClick={handleClick}
      disabled={isLoading}
      className={`px-4 py-2 rounded font-bold ${
        isLoading ? 'opacity-50 cursor-not-allowed' : 'bg-blue-600'
      }`}
    >
      {isLoading ? '⏳ Processing...' : 'Click Me'}
    </button>
  );
};
```

## API Reference

### LoadingButton Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onClick` | `async function` | Required | The async function to execute |
| `successMessage` | `string` | "Operation completed successfully!" | Message shown on success |
| `errorMessage` | `string` | null | Custom error message (uses error.message if not provided) |
| `loadingText` | `string` | "Processing..." | Text shown while loading |
| `variant` | `string` | "primary" | Button style variant: primary, secondary, danger, outline, ghost, success, warning |
| `showToast` | `boolean` | true | Whether to show toast notifications |
| `onSuccess` | `function` | null | Callback executed on success |
| `onError` | `function` | null | Callback executed on error |
| `disabled` | `boolean` | false | Disable the button |
| `children` | `ReactNode` | Required | Button text/content |
| `className` | `string` | "" | Additional CSS classes |
| `type` | `string` | "button" | HTML button type |

### useLoadingButton Options

```javascript
const { isLoading, handleClick, cleanup } = useLoadingButton({
  onSubmit: async () => { /* ... */ },
  successMessage: "Success!",
  errorMessage: "Error occurred",
  showToast: true,
  onSuccess: (result) => { /* ... */ },
  onError: (error) => { /* ... */ }
});
```

## How It Works

### Preventing Duplicate Submissions

The component uses a `useRef` to track if a request is already processing:

```javascript
const isProcessingRef = useRef(false);

const handleClick = async () => {
  // Ignore clicks if already processing
  if (isProcessingRef.current || isLoading) {
    return; // Early return - click is ignored
  }

  isProcessingRef.current = true;
  // ... execute operation
  isProcessingRef.current = false;
};
```

### Single Toast Notification

Toast ID is tracked to prevent duplicates:

```javascript
const toastIdRef = useRef(null);

// Dismiss any existing toast
if (toastIdRef.current) {
  toast.dismiss(toastIdRef.current);
  toastIdRef.current = null;
}

// Show new toast
toastIdRef.current = toast.success(successMessage, { duration: 3000 });
```

### Toast Persists Across Re-renders

Even if the component re-renders due to state changes, the same toast is shown because we're using `useRef` and `toast.dismiss()`:

```javascript
// This prevents duplicate toasts when component re-renders
if (toastIdRef.current) {
  toast.dismiss(toastIdRef.current);
}
```

## Real-World Examples

### Form Submission

```jsx
const [formData, setFormData] = useState({ name: '', email: '' });

<LoadingButton 
  onClick={async () => {
    if (!formData.name) throw new Error('Name required');
    if (!formData.email) throw new Error('Email required');
    
    await api.post('/api/users', formData);
    setFormData({ name: '', email: '' }); // Clear form
  }}
  successMessage="User created successfully!"
  loadingText="Creating user..."
>
  Create User
</LoadingButton>
```

### Bulk Delete Operation

```jsx
<LoadingButton 
  onClick={async () => {
    if (selectedItems.length === 0) {
      throw new Error('No items selected');
    }
    if (!window.confirm(`Delete ${selectedItems.length} items?`)) {
      throw new Error('Cancelled');
    }
    
    await api.post('/api/bulk-delete', { ids: selectedItems });
    setSelectedItems([]); // Clear selection
  }}
  successMessage={`${selectedItems.length} items deleted!`}
  variant="danger"
  loadingText="Deleting..."
>
  Delete Selected
</LoadingButton>
```

### API Call with Error Handling

```jsx
<LoadingButton 
  onClick={async () => {
    try {
      const response = await api.post('/api/send-email', {
        to: email,
        subject: 'Hello'
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 429) {
        throw new Error('Too many requests. Please wait a moment.');
      }
      throw error;
    }
  }}
  successMessage="Email sent successfully!"
  errorMessage="Failed to send email"
  loadingText="Sending email..."
  onSuccess={(result) => {
    console.log('Email sent:', result);
  }}
>
  Send Email
</LoadingButton>
```

### File Upload

```jsx
const [file, setFile] = useState(null);

<LoadingButton 
  onClick={async () => {
    if (!file) throw new Error('Please select a file');
    
    const formData = new FormData();
    formData.append('file', file);
    
    await api.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    setFile(null); // Clear after upload
  }}
  disabled={!file}
  successMessage="File uploaded!"
  loadingText="Uploading..."
  variant="success"
>
  Upload File
</LoadingButton>
```

## Button Variants

The component comes with multiple style variants:

```jsx
<LoadingButton variant="primary" onClick={...}>Primary</LoadingButton>
<LoadingButton variant="secondary" onClick={...}>Secondary</LoadingButton>
<LoadingButton variant="danger" onClick={...}>Danger</LoadingButton>
<LoadingButton variant="success" onClick={...}>Success</LoadingButton>
<LoadingButton variant="warning" onClick={...}>Warning</LoadingButton>
<LoadingButton variant="outline" onClick={...}>Outline</LoadingButton>
<LoadingButton variant="ghost" onClick={...}>Ghost</LoadingButton>
```

## Best Practices

### 1. Always Use Try/Catch or Error Boundaries

```jsx
<LoadingButton 
  onClick={async () => {
    try {
      // Your async code
    } catch (error) {
      console.error(error);
      throw error; // Button will show error toast
    }
  }}
/>
```

### 2. Provide Meaningful Messages

```jsx
// Good - Clear, actionable messages
successMessage="Invoice #1234 sent to customer successfully!"
errorMessage="Network error: Please check your connection and try again"

// Bad - Vague messages
successMessage="OK"
errorMessage="Failed"
```

### 3. Handle Loading State for UX

```jsx
// Don't show other interactive elements while loading
<LoadingButton onClick={handleSave} />
<button disabled={isLoading} onClick={handleCancel}>Cancel</button>
```

### 4. Clear Related State After Operations

```jsx
<LoadingButton 
  onClick={async () => {
    await api.post('/api/submit', formData);
    setFormData({}); // Clear form state
    setSelectedItems([]); // Clear selections
  }}
/>
```

### 5. Use Callbacks for Complex Logic

```jsx
<LoadingButton 
  onClick={async () => {
    const result = await api.post('/api/create', data);
    return result;
  }}
  onSuccess={(result) => {
    // Redirect user, update parent state, etc.
    navigate(`/items/${result.id}`);
  }}
  onError={(error) => {
    // Log error, track analytics, etc.
    analytics.trackError('create_item_failed', error);
  }}
/>
```

## Troubleshooting

### Toast showing multiple times?

✅ **Solution:** Ensure you're using the component correctly. The toast ID is managed internally.

```jsx
// ✅ Correct - toast shows only once
<LoadingButton onClick={handleSave} successMessage="Saved!" />

// ❌ Wrong - would cause duplicate toasts if done outside
// toast.success("Saved!");
// <LoadingButton onClick={handleSave} />
```

### Button not disabling?

Check if the `disabled` prop is being set to `false`:

```jsx
// ✅ Correct
<LoadingButton onClick={async () => { /* ... */ }} />

// ✅ Also correct - explicitly passing disabled
<LoadingButton onClick={async () => { /* ... */ }} disabled={false} />

// ❌ Wrong - forces button to always be enabled
<LoadingButton onClick={async () => { /* ... */ }} disabled={false} />
```

### Loading state not updating?

Make sure your `onClick` function is `async`:

```jsx
// ✅ Correct - async function
<LoadingButton onClick={async () => { await api.post(...); }} />

// ❌ Wrong - not async, loading state won't show
<LoadingButton onClick={() => api.post(...)} />
```

## Migration Guide

If you have existing buttons, here's how to convert them:

### Before (Manual state management)

```jsx
const [isLoading, setIsLoading] = useState(false);

const handleSave = async () => {
  setIsLoading(true);
  try {
    await api.post('/api/save', data);
    toast.success('Saved!');
  } catch (error) {
    toast.error(error.message);
  } finally {
    setIsLoading(false);
  }
};

return (
  <button onClick={handleSave} disabled={isLoading}>
    {isLoading ? 'Saving...' : 'Save'}
  </button>
);
```

### After (Using LoadingButton)

```jsx
return (
  <LoadingButton 
    onClick={async () => {
      await api.post('/api/save', data);
    }}
    successMessage="Saved!"
    loadingText="Saving..."
  >
    Save
  </LoadingButton>
);
```

Much simpler! All the complexity is handled by the component.

## Summary

The `LoadingButton` component and `useLoadingButton` hook provide:

1. **Automatic State Management** - No need to manually manage loading states
2. **Duplicate Prevention** - Multiple clicks are automatically ignored
3. **Single Toast Notifications** - Toast won't repeat on re-renders
4. **Clean API** - Simple, declarative props
5. **Flexible Usage** - Use the component or the hook
6. **Production Ready** - Error handling, callbacks, and customization

Start using it in your app by importing and replacing your existing button implementations!
