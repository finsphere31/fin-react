# Quick Integration Guide for fin-react App

## How to Use LoadingButton in Your Existing Application

This guide shows how to integrate the `LoadingButton` component into your fin-react application's existing pages.

## Quick Start

### 1. Import the Component

```jsx
import LoadingButton from '../components/LoadingButton';
```

### 2. Replace Buttons in Your Forms

#### Example 1: Transaction Form (TransactionsPage)

**Before:**
```jsx
<button 
  type="submit" 
  className="bg-[#2980b9] hover:bg-[#3498db] text-white font-black px-8 py-2.5 rounded"
  disabled={loading}
>
  {loading ? (
    <>
      <RefreshCw className="animate-spin" size={16} /> Saving...
    </>
  ) : (
    <Check size={18} /> SAVE
  )}
</button>
```

**After:**
```jsx
<LoadingButton 
  type="submit"
  onClick={async (e) => {
    e.preventDefault();
    await handleEntry(e);
  }}
  successMessage="Transaction recorded successfully!"
  errorMessage="Failed to record transaction"
  loadingText="Recording..."
  className="bg-[#2980b9] hover:bg-[#3498db]"
>
  <Check size={18} /> SAVE
</LoadingButton>
```

#### Example 2: Company Admin Form (SuperAdminDashboard)

**Before:**
```jsx
<Button type="submit" disabled={loading}>
  {loading ? (
    <>
      <RefreshCw className="animate-spin" size={16} /> Saving...
    </>
  ) : (
    editId ? 'Update Entity' : 'Create Entity'
  )}
</Button>
```

**After:**
```jsx
<LoadingButton 
  type="submit"
  onClick={handleAddCompany}
  successMessage={editId ? "Company updated successfully!" : "Company created successfully!"}
  errorMessage="Failed to save company"
  loadingText="Saving..."
>
  {editId ? 'Update Entity' : 'Create Entity'}
</LoadingButton>
```

#### Example 3: Customer Account Form (MasterAccountsPage)

**Before:**
```jsx
<Button type="submit" className="w-full">
  {editId ? 'Update Ledger' : 'Register Ledger'}
</Button>
```

**After:**
```jsx
<LoadingButton 
  type="submit"
  onClick={handleSubmit}
  successMessage={editId ? "Ledger updated!" : "Ledger created!"}
  errorMessage="Failed to save ledger"
  loadingText="Saving..."
  className="w-full"
>
  {editId ? 'Update Ledger' : 'Register Ledger'}
</LoadingButton>
```

## Common Integration Patterns in fin-react

### Pattern 1: Form Submission with Validation

```jsx
import LoadingButton from '../components/LoadingButton';

const handleAddCompany = async () => {
  // Your existing validation logic
  const isDuplicate = companies.some(c => c.name.toLowerCase() === newName.toLowerCase());
  if (isDuplicate) {
    throw new Error('Company name already exists!');
  }

  // Your API call
  if (editId) {
    await api.put(`/admin/companies/${editId}`, payload);
  } else {
    await api.post('/admin/companies', payload);
  }
};

// In your JSX:
<LoadingButton 
  onClick={handleAddCompany}
  successMessage="Company saved successfully!"
  errorMessage="Failed to save company"
  loadingText="Processing..."
>
  Save Company
</LoadingButton>
```

### Pattern 2: Delete with Confirmation

```jsx
import LoadingButton from '../components/LoadingButton';

<LoadingButton 
  onClick={async () => {
    if (!window.confirm("Permanently delete this company?")) {
      throw new Error('Cancelled by user');
    }
    await api.delete(`/admin/companies/${id}`);
  }}
  successMessage="Company deleted successfully"
  errorMessage="Failed to delete company"
  loadingText="Deleting..."
  variant="danger"
>
  <Trash2 size={16} /> Delete Company
</LoadingButton>
```

### Pattern 3: Multiple Related Buttons

```jsx
// In SuperAdminDashboard - multiple actions on same card
<LoadingButton 
  onClick={() => {
    const shareText = `Access Link: ${window.location.origin}`;
    navigator.clipboard.writeText(shareText);
  }}
  successMessage="Application link copied!"
  showToast={true}
>
  <Share2 size={16} /> Share
</LoadingButton>

<LoadingButton 
  onClick={() => handleEdit(company)}
  className="p-2 text-indigo-600"
  variant="ghost"
>
  <Edit2 size={16} /> Edit
</LoadingButton>

<LoadingButton 
  onClick={() => toggleCompanyStatus(company.id)}
  successMessage="Status updated"
  loadingText="Updating..."
>
  {company.active ? 'Deactivate' : 'Activate'}
</LoadingButton>
```

### Pattern 4: Account Assignment for Agents

```jsx
import LoadingButton from '../components/LoadingButton';

<LoadingButton 
  onClick={async () => {
    if (!selectedAgentForAssign) {
      throw new Error('Please select an agent');
    }
    if (selectedAccsForAssign.length === 0) {
      throw new Error('Please select at least one account');
    }
    
    await api.put(`/agents/${selectedAgentForAssign}`, { 
      assignedAccounts: selectedAccsForAssign 
    });
  }}
  successMessage="Accounts assigned successfully!"
  errorMessage="Failed to assign accounts"
  loadingText="Assigning..."
  className="w-full py-4 bg-[#ef8a26] hover:bg-[#d67b21]"
>
  Save Assignments
</LoadingButton>
```

### Pattern 5: Journal Entry / Adjustment

```jsx
import LoadingButton from '../components/LoadingButton';

<LoadingButton 
  type="submit"
  onClick={handlePost}
  successMessage={initialData?.id ? "Journal Entry Updated" : "Journal Entry Posted successfully!"}
  errorMessage="Failed to post journal entry"
  loadingText="Posting entry..."
  className="bg-[#1e293b] hover:bg-[#0f172a]"
>
  <FileCheck size={18} /> {initialData?.id ? 'Update' : 'Post'} Journal Entry
</LoadingButton>
```

## Step-by-Step Integration Example

Here's a complete example of converting the `handleAddCompany` function:

### Current Code in SuperAdminDashboard

```jsx
const [loading, setLoading] = useState(false);

const handleAddCompany = async (e) => {
  e.preventDefault();
  setLoading(true);

  const isDuplicate = companies.some(c => c.name.toLowerCase() === newName.toLowerCase() && c.id !== editId);
  if (isDuplicate) {
    toast.error('Company name already exists!');
    setLoading(false);
    return;
  }

  const payload = { 
    name: newName, 
    username: newUsername, 
    password: newPassword,
    startDate,
    expiryDate,
    amcAmount,
    amcStatus
  };
  try {
    if (editId) {
      await api.put(`/admin/companies/${editId}`, payload);
      toast.success('Company updated');
    } else {
      await api.post('/admin/companies', payload);
      toast.success('Company created');
    }
    resetForm();
    fetchCompanies();
  } catch (err) {
    toast.error(err.response?.data?.message || 'Error saving company');
  } finally {
    setLoading(false);
  }
};
```

### Converted to Use LoadingButton

```jsx
import LoadingButton from '../components/LoadingButton';

// Remove the loading state - it's handled by LoadingButton now
// const [loading, setLoading] = useState(false);

// Simplify the handler - no need for manual state management
const handleAddCompany = async (e) => {
  e.preventDefault();

  const isDuplicate = companies.some(c => c.name.toLowerCase() === newName.toLowerCase() && c.id !== editId);
  if (isDuplicate) {
    throw new Error('Company name already exists!');
  }

  const payload = { 
    name: newName, 
    username: newUsername, 
    password: newPassword,
    startDate,
    expiryDate,
    amcAmount,
    amcStatus
  };
  
  if (editId) {
    await api.put(`/admin/companies/${editId}`, payload);
  } else {
    await api.post('/admin/companies', payload);
  }
  
  resetForm();
  fetchCompanies();
};

// In your JSX - much cleaner!
<LoadingButton 
  onClick={handleAddCompany}
  successMessage={editId ? "Company updated successfully!" : "Company created!"}
  errorMessage="Failed to save company"
  loadingText="Saving..."
  className="w-full"
>
  {editId ? 'Update Entity' : 'Create Entity'}
</LoadingButton>
```

## Benefits You'll See

1. **Less Code** - Remove manual `useState` for loading, toast handling
2. **Better UX** - Automatic button disabling, spinner animation
3. **Zero Duplicates** - Multiple clicks are automatically ignored
4. **Single Toasts** - No more duplicate notifications on re-render
5. **Consistent** - Same behavior across all buttons in your app

## Where to Start

1. **Easy wins first** - Start with simple buttons that don't already have complex logic
   - Delete buttons
   - Copy buttons
   - Status toggle buttons

2. **Move to forms** - Then convert form submission buttons
   - Company creation
   - Customer forms
   - Account forms

3. **Advanced patterns** - Finally, convert complex flows
   - Bulk operations
   - Multi-step processes
   - Conditional submissions

## Files Modified

When you're ready to integrate, you'll need:

- ✅ `/src/components/LoadingButton.jsx` - The button component
- ✅ `/src/hooks/useLoadingButton.js` - The hook (optional, for advanced usage)
- ✅ `/src/LOADING_BUTTON_GUIDE.md` - Full documentation
- ✅ This file - Integration guide

## Support

For examples and detailed usage, see:
- `/src/examples/LoadingButtonExample.jsx` - Comprehensive examples
- `/src/LOADING_BUTTON_GUIDE.md` - Full API reference

All examples include validation, error handling, success callbacks, and more!
