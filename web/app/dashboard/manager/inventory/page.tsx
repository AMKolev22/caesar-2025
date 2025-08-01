"use client"
import "@/styles/question.css"
import { AppSidebar } from "@/components/app-sidebar-manager"
import { ScrollArea } from "@/components/ui/scroll-area";
import Breadcrumb from '@/components/breadcrumb';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Search,
  Tag,
  Plus,
  MoreHorizontal,
  Check,
  Upload,
  MapPin,
  Camera,
  Trash2,
  Edit,
  Package,
  FileText,
  Minus,
  Play,
  Pause,
  Workflow,
  QrCode,
  Edit3,
  Settings,
  X,
} from 'lucide-react';

import { Button } from "@/components/ui/button"

import { useEffect, useRef, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { showToast } from "@/scripts/toast";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { toast } from "sonner"
import { useRouter } from "next/navigation";


const DrawnQuestionMark = () => (
  <svg
    width="20"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="inline-block text-white"
  >
    <path
      d="M9 7a3 3 0 1 1 6 0c0 2-3 2-3 5"
      className="question-path"
    />
    <path
      d="M12 17h.01"
      className="dot-path"
    />
  </svg>
);
export default function Page() {

  // inventory and to each product state
  const [inventory, setInventory] = useState([]);
  const [labels, setLabels] = useState([]);
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("all");
  const [expandedProductId, setExpandedProductId] = useState(null);
  const [serialCodes, setSerialCodes] = useState(['']);
  const [confirmationInput, setConfirmationInput] = useState('');

  // image upload stuff
  const [selectedImages, setSelectedImages] = useState({});
  const [uploadingImages, setUploadingImages] = useState({});
  const [imagePreviews, setImagePreviews] = useState({});
  const fileInputRef = useRef(null);

  // location
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState(null);
  const [productLocation, setProductLocation] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // label related stuff
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#3b82f6");
  const [selectedProductLabels, setSelectedProductLabels] = useState([]);
  const [openDropdownProductId, setOpenDropdownProductId] = useState(null);

  // confirmation states
  const [showLabelConfirmation, setShowLabelConfirmation] = useState(false);
  const [labelConfirmation, setLabelConfirmation] = useState(null);
  const [showCreateProductConfirmation, setShowCreateProductConfirmation] = useState(false);
  const [showItemsConfirmation, setShowItemsConfirmation] = useState(false);
  const [itemsConfirmation, setItemsConfirmation] = useState(null);
  const [updatingProduct, setUpdatingProduct] = useState({});

  // workflow local config for item
  const [workflows, setWorkflows] = useState([]);
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
  const [selectedProductForWorkflow, setSelectedProductForWorkflow] = useState(null);
  const [workflowCondition, setWorkflowCondition] = useState('quantity_below');
  const [workflowThreshold, setWorkflowThreshold] = useState(5);
  const [workflowAction, setWorkflowAction] = useState('restock');
  const [restockQuantity, setRestockQuantity] = useState(10);
  const [serialPattern, setSerialPattern] = useState('');
  const [workflowEnabled, setWorkflowEnabled] = useState(true);
  const [editingWorkflow, setEditingWorkflow] = useState(null);

  const [editingProductId, setEditingProductId] = useState(null);
  const [editingProductName, setEditingProductName] = useState('');
  const [editingSerialId, setEditingSerialId] = useState<string | null>(null);
  const [editingSerialCode, setEditingSerialCode] = useState('');
  const inputSerialRef = useRef<HTMLInputElement | null>(null);

  // deletion stuff
  const [selectedDeletingProduct, setSelectedDeletingProduct] = useState({});
  const [toggleDeleteProductDialog, setToggleDeleteProductDialog] = useState(false);
  const [selectedDeletingItem, setSelectedDeletingItem] = useState({});
  const [toggleDeleteItemPopover, setToggleDeleteItemPopover] = useState(false);


  // additional labels for dialog show
  const [editingDescriptionProduct, setEditingDescriptionProduct] = useState({});
  const [editingDescriptionDialog, toggleEditingDescriptionDialog] = useState(false);
  const [productDescription, setProductDescription] = useState("");

  const [selectedLabelId, setSelectedLabelId] = useState();

  const [rank, setRank] = useState("");
  const router = useRouter();

  const inputRef = useRef<HTMLInputElement | null>(null); // for editable name

  const confirmClasses = labelConfirmation?.isRemoving
    ? 'bg-red-500 hover:bg-red-600 text-white'
    : 'bg-emerald-400 hover:bg-emerald-500 text-white';


  // returns text for a status of an item
  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'text-emerald-400';
      case 'IN_USE':
        return 'text-red-400';
      case 'BROKEN':
        return 'text-red-500';
      case 'UNDER_REPAIR':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  // returns edited text-
  const getStatusText = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'Available';
      case 'IN_USE':
        return 'In Use';
      case 'BROKEN':
        return 'Broken';
      case 'UNDER_REPAIR':
        return 'Under Repair';
      default:
        return status;
    }
  };

  // helper functino to fetch workflows
  const fetchWorkflows = async () => {
    const res = await fetch('/api/workflows');
    if (res.ok) {
      const data = await res.json();
      setWorkflows(data);
    }
  };

  //helper function to fetch inventory
  const fetchInventory = async () => {
    const res = await fetch('/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      setInventory(data.inventory);
      console.log(data.inventory);
    }
  };

  // helper functions to fetch labels
  const fetchLabels = async () => {
    const res = await fetch('/api/labels', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      setLabels(data.labels);
    }
  };


  // Checks if user is allowed
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/who', {
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok && data.success) {
          console.log("кяеи", data);
          setRank(data.user.rank);

          if (data.user.rank !== "MANAGER")
            router.push("/no-permission");
        }
      }
      catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };

    fetchUser();
  }, [router, rank]);



  // Workflow states
  const conditionOptions = [
    { value: 'quantity_below', label: 'Quantity Below' },
    { value: 'any_broken', label: 'Any Items Broken' },
  ];

  const actionOptions = [
    { value: 'restock', label: 'Auto Restock' },
    { value: 'notify', label: 'Send Notification' },
    { value: 'mark_unavailable', label: 'Mark Items Unavailable' },
    { value: 'add_label', label: 'Add Label' },
  ];

  const saveWorkflow = async () => {
    // Show loading toast depending on whether it's a new workflow or an edit
    const loadingToast = toast.loading(
      editingWorkflow ? 'Updating workflow...' : 'Creating workflow...'
    );

    // Prepare the request payload based on the form inputs
    const payload = {
      productId: selectedProductForWorkflow,
      condition: workflowCondition,
      threshold: workflowThreshold,
      action: workflowAction,
      // Only include restock quantity and serial pattern if action is 'restock'
      restockQuantity: workflowAction === 'restock' ? restockQuantity : null,
      serialPattern: workflowAction === 'restock' ? serialPattern : null,
      // Only include label ID if action is 'add_label'
      labelId: workflowAction === 'add_label' ? parseInt(selectedLabelId) : null,
      enabled: workflowEnabled,
    };

    // Determine the request method and URL based on whether it's an edit
    const method = editingWorkflow ? 'PUT' : 'POST';
    const url = editingWorkflow
      ? `/api/workflows/${editingWorkflow.id}` // Update existing
      : '/api/workflows'; // Create new

    try {
      // Make API request
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // Throw error if request failed
      if (!res.ok) throw new Error('Failed to save workflow');

      const saved = await res.json();

      // Update local workflow list state:
      // - If editing, replace the old one
      // - If creating, add the new one to the end
      setWorkflows((prev) =>
        editingWorkflow
          ? prev.map((w) => (w.id === saved.id ? saved : w))
          : [...prev, saved]
      );

      // Reset form and close dialog
      resetWorkflowForm();
      setShowWorkflowDialog(false);

      // Dismiss loading toast and show success toast
      toast.dismiss(loadingToast);
      showToast({
        show: "Success",
        description: "success",
        label: editingWorkflow
          ? "Workflow updated successfully!"
          : "Workflow created successfully!",
      });

    } catch (error) {
      // Handle and log any errors
      console.error('Error saving workflow:', error);
      toast.dismiss(loadingToast);
      showToast({
        show: "Error",
        description: "error",
        label: editingWorkflow
          ? "Failed to update workflow"
          : "Failed to create workflow",
      });
    }
  };


  const deleteWorkflow = async (workflowId) => {
    // Show loading toast while deletion is in progress
    const loadingToast = toast.loading('Deleting workflow...');

    try {
      // Send DELETE request to the server
      const res = await fetch(`/api/workflows/${workflowId}`, {
        method: 'DELETE',
      });

      // If the response is not OK, throw an error
      if (!res.ok) throw new Error('Failed to delete workflow');

      // Remove the deleted workflow from the local state
      setWorkflows((prev) => prev.filter((w) => w.id !== workflowId));

      // Dismiss loading toast and show success notification
      toast.dismiss(loadingToast);
      showToast({
        show: "Success",
        description: "success",
        label: "Workflow deleted successfully!",
      });

    } catch (error) {
      // Handle any errors and notify the user
      console.error('Error deleting workflow:', error);
      toast.dismiss(loadingToast);
      showToast({
        show: "Error",
        description: "error",
        label: "Failed to delete workflow",
      });
    }
  };

  const toggleWorkflow = async (workflowId) => {
    // Find the workflow by ID from the current list
    const wf = workflows.find((w) => w.id === workflowId);
    if (!wf) return; // If not found, exit early

    // Create a copy of the workflow with its 'enabled' state toggled
    const updated = { ...wf, enabled: !wf.enabled };

    // Send a PUT request to update the workflow on the server
    const res = await fetch(`/api/workflows/${workflowId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: updated.enabled }),
    });

    // If the response is not successful, throw an error
    if (!res.ok) throw new Error('Failed to toggle');

    // Parse the response and update the local state with the saved workflow
    const saved = await res.json();
    setWorkflows((prev) =>
      prev.map((w) => (w.id === saved.id ? saved : w))
    );
  };

  const resetWorkflowForm = () => {
    // Close the workflow dialog
    setShowWorkflowDialog(false);

    // Clear the selected product
    setSelectedProductForWorkflow(null);

    // Reset condition to default: 'quantity_below'
    setWorkflowCondition('quantity_below');

    // Reset threshold value to default: 5
    setWorkflowThreshold(5);

    // Set default action to 'restock'
    setWorkflowAction('restock');

    // Default restock quantity
    setRestockQuantity(10);

    // Clear the serial pattern input
    setSerialPattern('');

    // Clear the selected label (used when action is 'add_label')
    setSelectedLabelId(undefined);

    // Enable the workflow by default
    setWorkflowEnabled(true);

    // Clear any existing workflow being edited
    setEditingWorkflow(null);
  };

  const editWorkflow = (workflow) => {
    // Set the workflow to be edited
    setEditingWorkflow(workflow);

    // Pre-fill the form with existing workflow data
    setSelectedProductForWorkflow(workflow.productId);       // Set associated product
    setWorkflowCondition(workflow.condition);                // Set condition type (e.g., quantity_below)
    setWorkflowThreshold(workflow.threshold);                // Set the threshold value
    setWorkflowAction(workflow.action);                      // Set the action type (e.g., restock, add_label)

    // Default restock quantity to 10 if null
    setRestockQuantity(workflow.restockQuantity || 10);

    // Default serial pattern to empty string if null
    setSerialPattern(workflow.serialPattern || '');

    // Set whether the workflow is enabled
    setWorkflowEnabled(workflow.enabled);

    // Open the dialog for editing
    setShowWorkflowDialog(true);
  };

  useEffect(() => {
    // Define the function to trigger workflow checks on the backend
    const checkWorkflows = async () => {
      try {
        // Send POST request to trigger the workflow check endpoint
        const response = await fetch('/api/workflows/check', {
          method: "POST",
          credentials: "include",
          headers: {
            'Content-Type': 'application/json',
          },
          // Include currently selected labelId (optional filter)
          body: JSON.stringify({ labelId: selectedLabelId }),
        });

        // If the response is OK, refresh inventory data
        if (response.ok) {
          fetchInventory();
        }
      } catch (error) {
        // Log any request or server errors
        console.error('Error checking workflows:', error);
      }
    };

    // Set interval to check workflows every 10 seconds
    const interval = setInterval(checkWorkflows, 10000);

    // Also trigger a check immediately on mount or label change
    checkWorkflows();

    // Clear interval when component unmounts or selectedLabelId changes
    return () => clearInterval(interval);
  }, [selectedLabelId]);





  const getCurrentLocation = async () => {
    setLocationLoading(true); // Indicate location fetch is in progress
    const loadingToast = toast.loading('Detecting location...'); // Show loading toast

    try {
      // Check if the browser supports geolocation
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported');
      }

      // Get current position using the Geolocation API
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      setCurrentLocation({ latitude, longitude }); // Save raw coordinates

      try {
        // Make a reverse geocoding request to OpenStreetMap
        const reverseGeoResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
        );

        if (reverseGeoResponse.ok) {
          const geoData = await reverseGeoResponse.json();
          const address = geoData.address;

          // Try to get a human-readable location name from the address
          const cityName = address?.city || address?.town || address?.village ||
            address?.municipality || address?.county || 'Unknown location';
          const country = address?.country || '';

          // Build location name or fall back to coordinates if unknown
          const locationName = cityName !== 'Unknown location'
            ? `${cityName}${country ? `, ${country}` : ''}`
            : `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`;

          setProductLocation(locationName); // Set resolved location
        } else {
          // If reverse geocoding fails, show fallback
          const fallback = `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`;
          setProductLocation(fallback);
        }
      } catch (geoError) {
        // Handle reverse geocoding fetch failure
        console.warn('Reverse geocoding failed, using coordinates:', geoError);
        const fallback = `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`;
        setProductLocation(fallback);
      }

      toast.dismiss(loadingToast); // Remove loading toast
      showToast({
        show: "Success",
        description: "success",
        label: "Location detected successfully!",
      });
    } catch (error) {
      // Handle any errors in geolocation process
      console.error("Geolocation failed:", error);
      toast.dismiss(loadingToast);
      showToast({
        show: "Error",
        description: "error",
        label: "Could not detect location",
      });
    } finally {
      setLocationLoading(false); // Reset loading state
    }
  };


  useEffect(() => {
    if (editingProductId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingProductId]);


  const handleUpdateProductName = async (productId, newName) => {
    try {
      const response = await fetch(`/api/core/products/${productId}/name`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });

      if (response.ok) {
        setEditingProductId(null);
        setEditingProductName('');
        fetchInventory();
      }
    }
    catch (error) {
      console.error('Error updating product name:', error);
    }
  };

  useEffect(() => {
    if (editingSerialId && inputSerialRef.current) {
      inputSerialRef.current.focus();
      inputSerialRef.current.select();
    }
  }, [editingSerialId]);

  const handleUpdateSerialCode = async (id: string, newCode: string) => {
    try {
      // Send a PUT request to update the serial code of a specific item
      await fetch(`/api/core/items/${id}/serialCode`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serialCode: newCode }), // Include new serial code in request body
      });

      // Reset editing state after successful update
      setEditingSerialId(null);     // Exit edit mode
      setEditingSerialCode('');     // Clear the input field
      fetchInventory();             // Refresh inventory to reflect changes
    }
    catch (err) {
      // Log any errors that occurred during the update
      console.error('Failed to update serial code', err);
    }
  };




  // handle image file selection
  const handleImageSelect = (event, productId) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const loadingToast = toast.loading("Loading image...");

    if (file.size > 5 * 1024 * 1024) {
      toast.dismiss(loadingToast);
      showToast({
        show: "Error",
        description: "error",
        label: "Image size must be less than 5MB",
      });
      return;
    }

    setSelectedImages(prev => ({ ...prev, [productId]: file }));

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreviews(prev => ({ ...prev, [productId]: e.target?.result }));
      toast.dismiss(loadingToast);
      showToast({
        show: "Success",
        description: "success",
        label: "Image loaded successfully!",
      });
    };
    reader.onerror = () => {
      toast.dismiss(loadingToast);
      showToast({
        show: "Error",
        description: "error",
        label: "Failed to load image preview",
      });
    };

    reader.readAsDataURL(file);
  };


  // upload image for product
  const uploadProductImage = async (productId) => {
    // Get the selected image file for the given product ID
    const imageFile = selectedImages?.[productId];

    // If no image is selected, show an error toast and exit
    if (!imageFile) {
      showToast({
        show: "Error",
        description: "error",
        label: "No image selected",
      });
      return;
    }

    // Show loading toast and set uploading state for this product to true
    const loadingToast = toast.loading("Uploading image...");
    setUploadingImages(prev => ({ ...prev, [productId]: true }));

    try {
      // Prepare form data with image file and product ID
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("productId", productId);

      // Send POST request to upload the image
      const res = await fetch("/api/core/products/upload-image", {
        method: "POST",
        body: formData,
      });

      // Throw an error if the response is not successful
      if (!res.ok) throw new Error("Upload failed");

      // Refresh inventory to reflect the updated product image
      await fetchInventory();

      // Clear selected images and previews after successful upload
      setSelectedImages({});
      setImagePreviews({});

      // Dismiss loading toast and show success message
      toast.dismiss(loadingToast);
      showToast({
        show: "Success",
        description: "success",
        label: "Product image uploaded successfully!",
      });
    } catch (error) {
      // Log error, dismiss loading toast, and show error message
      console.error("Upload error:", error);
      toast.dismiss(loadingToast);
      showToast({
        show: "Error",
        description: "error",
        label: "Failed to upload image",
      });
    } finally {
      // Set uploading state for this product back to false regardless of outcome
      setUploadingImages(prev => ({ ...prev, [productId]: false }));
    }
  };



  // delete product image
  const deleteProductImage = async (productId) => {
    const loadingToast = toast.loading("Deleting image...");


    try {
      const res = await fetch(`/api/core/products/${productId}/image`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      await fetchInventory();
      toast.dismiss(loadingToast);
      showToast({
        show: "Success",
        description: "success",
        label: "Product image deleted successfully!",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast.dismiss(loadingToast);
      showToast({
        show: "Error",
        description: "error",
        label: "Failed to delete image",
      });
    }
  };

  // update product location
  const updateProductLocation = async (productId, location) => {
    const loadingToast = toast.loading("Updating product location...");
    try {
      const res = await fetch(`/api/core/products/${productId}/location`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, productId }),
      });
      if (!res.ok) throw new Error("Update failed");

      await fetchInventory();
      toast.dismiss(loadingToast);
      showToast({
        show: "Success",
        description: "success",
        label: "Product location updated successfully!",
      });
    }
    catch (error) {
      toast.dismiss(loadingToast);
      showToast({
        show: "Error",
        description: "error",
        label: "Failed to update product location",
      });
    }
  };


  const createLabel = async () => {
    // Validate that the new label name is not empty or just whitespace
    if (!newLabelName.trim()) {
      showToast({
        show: "Error",
        description: "error",
        label: "Label name cannot be empty",
      });
      return;
    }

    // Show loading toast while the label creation request is in progress
    const loadingToast = toast.loading("Creating label...");

    try {
      // Send POST request to create a new label with name and color
      const res = await fetch('/api/labels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newLabelName,
          color: newLabelColor,
        }),
      });

      // If response is not OK, throw error to catch block
      if (!res.ok) throw new Error("Failed to create label");

      // Refresh labels list from the server
      await fetchLabels();

      // Reset input states to default values
      setNewLabelName("");
      setNewLabelColor("#3b82f6");

      // Dismiss loading toast and show success message
      toast.dismiss(loadingToast);
      showToast({
        show: "Success",
        description: "success",
        label: `Label "${newLabelName}" created successfully!`,
      });
    } catch (error) {
      // Log error, dismiss loading toast, and show error message
      console.error("Create label error:", error);
      toast.dismiss(loadingToast);
      showToast({
        show: "Error",
        description: "error",
        label: "Failed to create label",
      });
    }
  };



  // Function to update a product's labels
  const updateProductLabels = async (productId, labelIds) => {
    const loadingToast = toast.loading("Updating product labels...");

    try {
      const res = await fetch('/api/core/products/labels', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          labelIds,
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      await fetchInventory();

      toast.dismiss(loadingToast);
      showToast({
        show: "Success",
        description: "success",
        label: "Product labels updated successfully!",
      });
    } catch (error) {
      console.error("Update product labels error:", error);
      toast.dismiss(loadingToast);
      showToast({
        show: "Error",
        description: "error",
        label: "Failed to update product labels",
      });
    }
  };


  const toggleProductLabel = async (productId, labelId) => {
    // Find the product in the inventory by ID
    const product = inventory.find(p => p.id === productId);
    // Get current label IDs of the product or empty array if none
    const currentLabels = product?.labels?.map(l => l.id) || [];

    let newLabels;
    // If labelId already exists, remove it (toggle off)
    if (currentLabels.includes(labelId)) {
      newLabels = currentLabels.filter(id => id !== labelId);
    } else {
      // Otherwise, add the labelId (toggle on)
      newLabels = [...currentLabels, labelId];
    }

    // Call API or update function to save the new labels array for the product
    await updateProductLabels(productId, newLabels);
  };




  // filter, now supports location
  const filteredInventory = inventory.filter(item => {
    // Check if searchTerm is empty or matches the product name (case-insensitive)
    const matchesSearch = searchTerm === "" ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      // Or any item's serialCode matches searchTerm (case-insensitive)
      item.items?.some(it => it.serialCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      // Or the product's location contains the searchTerm (case-insensitive)
      (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase()));

    // Check if selectedLabel is "all" or the product has the selected label by id
    const matchesLabel = selectedLabel === "all" ||
      item.labels?.some(label => label.id === parseInt(selectedLabel));

    // Only include items that satisfy both search and label conditions
    return matchesSearch && matchesLabel;
  });


  // Updates a product description
  const updateProductDescription = async (productId, description) => {
    console.log("Data: ", productId, description);
    const res = await fetch(`/api/core/products/${productId}/description`, {
      method: "PUT",
      body: JSON.stringify({
        description,
      })
    })
    if (res.ok)
      console.log("success");
  }

  const handleDeleteProduct = async (productId: number) => {
    // Show loading toast while the product deletion is in progress
    const loadingToast = toast.loading("Deleting product...");

    try {
      // Send DELETE request to delete the product by its ID
      const res = await fetch(`/api/core/products/${productId}/delete`, {
        method: 'DELETE',
      });

      // Throw an error if the response status is not OK
      if (!res.ok) throw new Error("Delete failed");

      // Refresh the inventory data after successful deletion
      await fetchInventory();

      // Dismiss the loading toast and show a success notification
      toast.dismiss(loadingToast);
      showToast({
        show: "Success",
        description: "success",
        label: "Product deleted successfully!",
      });
    } catch (error) {
      // Log error, dismiss loading toast, and show an error notification
      console.error("Delete product error:", error);
      toast.dismiss(loadingToast);
      showToast({
        show: "Error",
        description: "error",
        label: "Failed to delete product",
      });
    } finally {
      // Reset the selected product for deletion state regardless of outcome
      setSelectedDeletingProduct({});
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    // Show loading toast while deletion is in progress
    const loadingToast = toast.loading("Deleting item...");

    try {
      // Send DELETE request to delete item by ID
      const res = await fetch(`/api/core/items/${itemId}/delete`, {
        method: "DELETE",
      });

      // Throw error if the response is not OK
      if (!res.ok) throw new Error("Delete failed");

      // Refresh the inventory data after successful deletion
      await fetchInventory();

      // Dismiss loading toast and show success notification
      toast.dismiss(loadingToast);
      showToast({
        show: "Success",
        description: "success",
        label: "Item deleted successfully!",
      });
    } catch (error) {
      // Log error, dismiss loading toast, and show error notification
      console.error("Error deleting item:", error);
      toast.dismiss(loadingToast);
      showToast({
        show: "Error",
        description: "error",
        label: "Failed to delete item",
      });
    }
  };


  const handleRemoveLabel = async (id) => {
    try {
      // Send DELETE request to remove label by id
      const res = await fetch(`/api/labels/${id}`, {
        method: 'DELETE',
      });

      // Throw error if response is not ok (e.g., 4xx or 5xx)
      if (!res.ok)
        throw new Error(await res.text());

      // Refresh inventory and labels data after successful deletion
      fetchInventory();
      fetchLabels();

    } catch (err) {
      // Log any error that occurs during the deletion process
      console.error('Failed to delete label:', err);
    }
  };



  useEffect(() => {
    fetchInventory();
    fetchLabels();
    fetchWorkflows();
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <span className="mt-4 "><Breadcrumb /></span>
          </div>
        </header>
        <div className="flex flex-col h-[calc(100vh-64px)] gap-4 p-4 pt-0 overflow-hidden">
          <div className="flex-1 rounded-xl bg-muted/50 p-4 overflow-hidden flex flex-col">
            <ScrollArea className="flex items-center justify-between mb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-4 sm:gap-0 z-30">
                <h1 className="text-lg sm:text-xl font-semibold">Inventory</h1>
                <div className="flex gap-1 sm:gap-2 z-30">
                  {/* Workflow popover */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="font-semibold cursor-pointer hover:-translate-y-1 duration-300 text-xs sm:text-sm flex-shrink-0">
                        <div className="text-center mr-2 flex flex-row gap-2 items-center justify-center">
                          <Workflow className="w-4 h-4 flex-shrink-0" />
                          <span className="hidden sm:inline">Workflows ({workflows.length})</span>
                          <span className="sm:hidden">Workflows</span>
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 sm:w-96 mx-2 sm:mx-0">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium">Active Workflows</h4>
                          {workflows.length > 0 ? (
                            <div className="space-y-2">
                              {workflows.map((workflow) => {
                                const product = inventory.find(p => p.id === workflow.productId);
                                const condition = conditionOptions.find(c => c.value === workflow.condition);
                                const action = actionOptions.find(a => a.value === workflow.action);
                                return (
                                  <div key={workflow.id} className="p-3 border rounded-md space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-sm truncate flex-1 mr-2">{product?.name}</span>
                                      <div className="flex items-center gap-1 flex-shrink-0">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => toggleWorkflow(workflow.id)}
                                          className={workflow.enabled ? 'text-emerald-600' : 'text-gray-400'}
                                        >
                                          {workflow.enabled ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => editWorkflow(workflow)}
                                        >
                                          <Edit className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => { deleteWorkflow(workflow.id); fetchWorkflows() }}
                                          className="text-red-500"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      <span className="font-medium">When:</span> {condition?.label} {workflow.threshold && `(${workflow.threshold})`}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      <span className="font-medium">Then:</span> {action?.label}
                                    </div>
                                    <div className={`text-xs px-2 py-1 rounded inline-block ${workflow.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                      {workflow.enabled ? 'Active' : 'Disabled'}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No workflows created yet.</p>
                          )}
                          <Button
                            onClick={() => setShowWorkflowDialog(true)}
                            size="sm"
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Workflow
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Popover for creating and deleting labels */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="font-semibold cursor-pointer hover:-translate-y-1 duration-300 text-xs sm:text-sm flex-shrink-0">
                        <Tag className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="hidden sm:inline">Manage Labels</span>
                        <span className="sm:hidden">Labels</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 sm:w-80 mx-2 sm:mx-0">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium">Create New Label</h4>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Label name"
                              value={newLabelName}
                              onChange={(e) => setNewLabelName(e.target.value)}
                              className="flex-1 min-w-0"
                            />
                            <input
                              type="color"
                              value={newLabelColor}
                              onChange={(e) => setNewLabelColor(e.target.value)}
                              className="w-10 sm:w-12 h-9 rounded border flex-shrink-0"
                            />
                            <Button onClick={createLabel} size="sm" className="flex-shrink-0">
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Existing Labels</h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {labels.map((label) => (
                              <Badge
                                key={label.id}
                                style={{
                                  backgroundColor: `${label.color}33`,
                                  color: label.color,
                                  boxShadow: `inset 0 0 0 1px ${label.color}80`,
                                }}
                                className="text-xs font-medium px-2 py-0.5 rounded-md border-0 flex items-center gap-1 max-w-full"
                              >
                                <span className="truncate">{label.name}</span>
                                <span onClick={(e) => { handleRemoveLabel(label.id) }} className="flex-shrink-0">
                                  <X className="hover:-translate-y-0.5 duration-300 text-red-500 w-3.5 h-3.5 cursor-pointer" />
                                </span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Popover for creating a new product */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button className="font-semibold hover:cursor-pointer duration-300 hover:-translate-y-1 text-xs sm:text-sm flex-shrink-0">
                        <span className="hidden sm:inline">CREATE</span>
                        <span className="sm:hidden">CREATE</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 sm:w-80 mx-2 sm:mx-0">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <h4 className="leading-none font-medium">Create a new product.</h4>
                          <p className="text-muted-foreground text-sm">
                            Enter the details down below. You can add your own items later.
                          </p>
                        </div>
                        <div className="grid gap-3">
                          <div className="grid gap-2">
                            <Label htmlFor="title" className="text-sm font-medium">Product Title</Label>
                            <Input
                              id="title"
                              autoComplete="off"
                              autoCapitalize="on"
                              placeholder="Enter the product's title."
                              className="h-8"
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="description" className="text-sm font-medium">Product Info</Label>
                            <Input
                              id="description"
                              className="h-8"
                              placeholder="Enter description."
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                            <div className="flex gap-2">
                              <Input
                                id="location"
                                className="h-8 flex-1 min-w-0"
                                placeholder="Enter location or detect current"
                                value={productLocation}
                                onChange={(e) => setProductLocation(e.target.value)}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={getCurrentLocation}
                                disabled={locationLoading}
                                className="h-8 flex-shrink-0"
                              >
                                {locationLoading ? (
                                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                                ) : (
                                  <MapPin className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <div className="flex justify-end pt-2">
                            <Button
                              size="sm"
                              className="font-semibold hover:cursor-pointer duration-300 hover:-translate-y-1"
                              onClick={() => setShowCreateProductConfirmation(true)}
                            >
                              CREATE
                            </Button>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </ScrollArea>

            {/* search and filter controls (topnav) */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search products, serial codes, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedLabel} onValueChange={setSelectedLabel}>
                <SelectTrigger className="w-48 hover:cursor-pointer">
                  <SelectValue placeholder="Filter by label" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="hover:cursor-pointer" value="all">All Labels</SelectItem>
                  {labels.map((label) => (
                    <SelectItem className="hover:cursor-pointer" key={label.id} value={label.id.toString()}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: label.color }}
                        />
                        <span className="-mt-1">{label.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />

            <div
              className="h-full w-full overflow-y-auto"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgb(113 113 122) transparent'
              }}
            >
              <div className="space-y-2 pr-2 pb-4">
                {[...filteredInventory]
                  .sort((a, b) => a.id - b.id)
                  .map((item) => {
                    const isLowStock = item.totalQuantity < 5;
                    const stockClass = isLowStock ? 'text-red-500' : 'text-emerald-400';
                    const stockLabel = isLowStock ? 'Low' : 'OK';
                    const isEditingName = editingProductId === item.id;

                    return (
                      <div key={item.id} className="border border-zinc-700 text-white px-2 sm:px-4 py-3 rounded-md space-y-2">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex items-center gap-2 sm:gap-4 flex-1 cursor-pointer"
                            onClick={() => {
                              if (!isEditingName) {
                                setExpandedProductId(item.id === expandedProductId ? null : item.id);
                                setSerialCodes(['']);
                              }
                            }}>
                            {/*  display product Image */}
                            <div className="flex-shrink-0">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-md border border-zinc-600"
                                />
                              ) : (
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-zinc-700 rounded-md border border-zinc-600 flex items-center justify-center">
                                  <Camera className="w-4 h-4 sm:w-6 sm:h-6 text-zinc-400" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              {/* Editable Product Name */}
                              <div className="flex items-center gap-2 min-h-[24px]">
                                {isEditingName ? (
                                  <>
                                    <input
                                      id={`edit-input-${item.id}`}
                                      ref={inputRef}
                                      autoFocus
                                      value={editingProductName}
                                      onChange={(e) => setEditingProductName(e.target.value)}
                                      className="text-sm font-medium text-white bg-transparent border-none outline-none focus:ring-0 p-0 m-0 w-fit"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleUpdateProductName(item.id, editingProductName);
                                        } else if (e.key === 'Escape') {
                                          setEditingProductId(null);
                                          setEditingProductName('');
                                        }
                                      }}
                                    />

                                    <Button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleUpdateProductName(item.id, editingProductName);
                                      }}
                                      className="w-6 h-6 flex items-center justify-center rounded bg-transparent hover:bg-transparent hover:-translate-y-1 duration-300 cursor-pointer"
                                    >
                                      <Check className="w-4 h-4 text-emerald-400" />
                                    </Button>
                                    <Button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingProductId(null);
                                        setEditingProductName('');
                                      }}
                                      className="w-6 h-6 flex items-center justify-center bg-transparent hover:bg-transparent hover:-translate-y-1 duration-300 cursor-pointer"
                                    >
                                      <X className="w-4 h-4 text-red-500" />
                                    </Button>
                                  </>
                                ) : (
                                  <div className="text-sm font-medium truncate">{item.name}</div>
                                )}
                              </div>

                              {/* location display */}
                              {item.location && (
                                <div className="flex items-center gap-1 mt-1">
                                  <MapPin className="w-3 h-3 text-zinc-400 flex-shrink-0" />
                                  <span className="text-sm text-zinc-400 truncate">{item.location}</span>
                                </div>
                              )}

                              <div className="flex flex-wrap gap-1 sm:gap-2 mt-2 sm:mt-3">
                                {item.labels && item.labels.length > 0 ? (
                                  <>
                                    <span className="text-xs sm:text-sm text-zinc-300 font-medium">Labels:</span>
                                    {item.labels?.map((label) => (
                                      <Badge
                                        key={label.id}
                                        style={{
                                          backgroundColor: `${label.color}33`,
                                          color: label.color,
                                          boxShadow: `inset 0 0 0 1px ${label.color}80`,
                                        }}
                                        className="text-xs font-medium px-2 py-0.5 rounded-md border-0"
                                      >
                                        {label.name}
                                      </Badge>
                                    ))}
                                  </>
                                ) : (
                                  <span className="text-zinc-400 italic text-xs sm:text-sm">No labels yet.</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right-handside of each product */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 lg:gap-6">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-zinc-300">
                              <div>
                                <span className="font-semibold text-white">Items:</span> {item.totalQuantity}
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-semibold text-white">Stock <span className="hidden sm:inline">(NOT BROKEN)</span>:</span>
                                <span className={stockClass}>{stockLabel}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Label menu for each product */}
                              <DropdownMenu
                                open={openDropdownProductId === item.id}
                                onOpenChange={(open) => setOpenDropdownProductId(open ? item.id : null)}
                              >
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="hover:bg-zinc-700 border-zinc-600 text-zinc-300 hover:text-white transition-all duration-200 hover:border-zinc-500"
                                  >
                                    <Tag className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-64 bg-zinc-900 border-zinc-700" align="end">
                                  <div className="px-3 py-2 text-sm font-semibold text-white border-b border-zinc-700">
                                    Available Labels
                                  </div>
                                  {labels.length > 0 ? (
                                    <div className="py-1">
                                      {labels.map((label) => {
                                        const isSelected = item.labels?.some(l => l.id === label.id);
                                        return (
                                          <DropdownMenuItem
                                            key={label.id}
                                            className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-zinc-800 transition-colors duration-150"
                                            onClick={() => {
                                              setLabelConfirmation({
                                                productId: item.id,
                                                labelId: label.id,
                                                productName: item.name,
                                                labelName: label.name,
                                                labelColor: label.color,
                                                isRemoving: isSelected
                                              });
                                              setShowLabelConfirmation(true);
                                            }}
                                          >
                                            <div className="flex items-center gap-3 flex-1">
                                              <div
                                                className="w-4 h-4 rounded-full border-2 border-white/20 shadow-sm"
                                                style={{ backgroundColor: label.color }}
                                              />
                                              <span className="text-zinc-100 font-medium">{label.name}</span>
                                            </div>
                                            {isSelected && (
                                              <Check className="w-4 h-4 text-emerald-400 font-bold" />
                                            )}
                                          </DropdownMenuItem>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <DropdownMenuItem disabled className="text-zinc-400 italic py-3">
                                      No labels available
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>

                              {/* options menu for each product */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="hover:bg-zinc-700 text-zinc-400 hover:text-white"
                                  >
                                    <MoreHorizontal className="w-5 h-5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 bg-zinc-900 border-zinc-700" align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setExpandedProductId(item.id === expandedProductId ? null : item.id);
                                      setSerialCodes(['']);
                                    }}
                                    className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-zinc-800"
                                  >
                                    <Edit className="w-4 h-4" />
                                    <span>Manage Items</span>
                                  </DropdownMenuItem>

                                  <DropdownMenuSub>
                                    <DropdownMenuSubTrigger className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-zinc-800">
                                      <Settings className="w-4 h-4" />
                                      <span>Product Settings</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent className="w-48 bg-zinc-900 border-zinc-700">
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setEditingProductId(item.id);
                                          setEditingProductName(item.name);
                                        }}
                                        className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-zinc-800"
                                      >
                                        <Edit3 className="w-4 h-4" />
                                        <span>Edit Name</span>
                                      </DropdownMenuItem>

                                      <DropdownMenuItem
                                        // onClick={() => {

                                        //   if (newDescription !== null) {
                                        //     updateProductDescription(item.id, newDescription);
                                        //     // console.log("Update description:", newDescription);
                                        //   }
                                        // }}
                                        className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-zinc-800"
                                      >
                                        <FileText className="w-4 h-4" />
                                        <span onClick={() => { setEditingDescriptionProduct(item); toggleEditingDescriptionDialog(true) }}>Edit Description</span>
                                      </DropdownMenuItem>

                                      <DropdownMenuItem
                                        onClick={() => {
                                          fileInputRef.current?.click();
                                          fileInputRef.current.onchange = (e) => handleImageSelect(e, item.id);
                                        }}
                                        className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-zinc-800"
                                      >
                                        <Upload className="w-4 h-4" />
                                        <span>Upload Image</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-zinc-800" onClick={() => { setUpdatingProduct(item); setLocationDialogOpen(true); setProductLocation(item.location) }}>
                                        <MapPin className="w-4 h-4" />
                                        <span>Update Location</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => { setToggleDeleteProductDialog(true); setSelectedDeletingProduct(item); console.log(item) }}
                                        className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-zinc-800 text-red-400"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        <span>Delete Product</span>
                                      </DropdownMenuItem>

                                      {item.imageUrl && (
                                        <DropdownMenuItem
                                          onClick={() => deleteProductImage(item.id)}
                                          className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-zinc-800 text-red-400"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                          <span>Delete Image</span>
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuSubContent>
                                  </DropdownMenuSub>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>

                        {/* image upload preview */}
                        {selectedImages[item.id] && imagePreviews[item.id] && (
                          <div className="mt-4 p-3 rounded-md border border-zinc-600">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                              <img
                                src={imagePreviews[item.id]}
                                alt="Preview"
                                className="w-16 h-16 object-cover rounded-md border border-zinc-600"
                              />
                              <div className="flex-1">
                                <p className="text-sm text-white font-semibold">Selected: <span className="text-zinc-400 font-normal break-all">{selectedImages[item.id].name}</span></p>
                                <p className="text-xs text-zinc-400">
                                  Size: <span className="text-white font-semibold">{(selectedImages[item.id].size / 1024 / 1024).toFixed(2)} MB</span>
                                </p>
                              </div>
                              <div className="flex gap-2 w-full sm:w-auto">
                                <Button
                                  size="sm"
                                  onClick={() => uploadProductImage(item.id)}
                                  disabled={uploadingImages?.[item.id] ?? false}
                                  className="text-xs hover:-translate-y-1 duration-300 cursor-pointer flex-1 sm:flex-none"
                                >
                                  {uploadingImages[item.id] ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    "Upload"
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedImages(prev => ({ ...prev, [item.id]: null }));
                                    setImagePreviews(prev => ({ ...prev, [item.id]: null }));
                                  }}
                                  className="text-xs text-zinc-400 hover:-translate-y-1 duration-300 cursor-pointer flex-1 sm:flex-none"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* add item + show items logic */}
                        {expandedProductId === item.id && (
                          <div className="mt-4 border-t border-zinc-600 pt-4 space-y-4">
                            {/* new items frontend */}
                            <div className="space-y-2">
                              <Label className="text-white">Add New Items</Label>
                              {serialCodes.map((code, idx) => (
                                <div key={idx} className="flex flex-col sm:flex-row gap-2">
                                  <Input
                                    className="mb-2 sm:mb-0 sm:max-w-[15%] mt-2"
                                    placeholder="Serial Code"
                                    value={code}
                                    onChange={(e) => {
                                      const updated = [...serialCodes];
                                      updated[idx] = e.target.value;
                                      setSerialCodes(updated);
                                    }}
                                  />
                                  {serialCodes.length > 1 && (
                                    <Button
                                      onClick={() => {
                                        setSerialCodes(serialCodes.filter((_, i) => i !== idx));
                                      }}
                                      className="mt-2 bg-transparent cursor-pointer hover:-translate-y-1 duration-300 hover:bg-transparent hover:border hover:border-zinc-200 w-full sm:w-auto"
                                    >
                                      <Minus className="text-red-500" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                              <div className="flex flex-col sm:flex-row gap-2">
                                <Button variant="outline" onClick={() => setSerialCodes([...serialCodes, ''])} className="w-full sm:w-auto">
                                  + Another
                                </Button>
                                <Button
                                  onClick={() => {
                                    const validCodes = serialCodes.filter((code) => code.trim() !== '');
                                    if (validCodes.length === 0) {
                                      showToast({
                                        show: "Error",
                                        description: "error",
                                        label: "Please enter at least one serial code",
                                      });
                                      return;
                                    }
                                    setItemsConfirmation({
                                      productId: item.id,
                                      productName: item.name,
                                      items: validCodes.map((code) => ({ serialCode: code }))
                                    });
                                    setShowItemsConfirmation(true);
                                  }}
                                  className="w-full sm:w-auto"
                                >
                                  Add new items
                                </Button>
                              </div>
                            </div>

                            {/* existing Items with status */}
                            <div className="space-y-1">
                              {item.items && item.items.length > 0 ? (
                                <>
                                  <h4 className="font-semibold text-white mb-2">Existing Items</h4>
                                  <div className="space-y-2">
                                    {item.items.map((it) => (
                                      <div
                                        key={it.id}
                                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between border border-zinc-600 rounded px-2 py-2 gap-2"
                                      >
                                        <div className="flex items-center gap-2">
                                          {editingSerialId === it.id ? (
                                            <>
                                              <input
                                                ref={inputSerialRef}
                                                value={editingSerialCode}
                                                onChange={(e) => setEditingSerialCode(e.target.value)}
                                                onKeyDown={(e) => {
                                                  if (e.key === 'Enter') {
                                                    handleUpdateSerialCode(it.id, editingSerialCode);
                                                  } else if (e.key === 'Escape') {
                                                    setEditingSerialId(null);
                                                    setEditingSerialCode('');
                                                  }
                                                }}
                                                className="text-sm text-white font-normal bg-transparent border-none outline-none focus:ring-0 p-0 m-0 w-24"
                                              />
                                              <button
                                                onClick={() => handleUpdateSerialCode(it.id, editingSerialCode)}
                                                className="flex items-center justify-center rounded bg-transparent hover:bg-transparent hover:-translate-y-1 duration-300 cursor-pointer"
                                              >
                                                <Check className="w-4 h-4 text-emerald-400" />
                                              </button>
                                              <button
                                                onClick={() => {
                                                  setEditingSerialId(null);
                                                  setEditingSerialCode('');
                                                }}
                                                className="flex items-center justify-center bg-transparent hover:bg-transparent hover:-translate-y-1 duration-300 cursor-pointer"
                                              >
                                                <X className="w-4 h-4 text-red-500" />
                                              </button>
                                            </>
                                          ) : (
                                            <>
                                              <span className="text-white tracking-normal text-sm break-all">{it.serialCode}</span>
                                              <button
                                                onClick={() => {
                                                  setEditingSerialId(it.id);
                                                  setEditingSerialCode(it.serialCode);
                                                }}
                                                className="p-1 hover:bg-zinc-800 rounded flex-shrink-0"
                                              >
                                                <Edit3 className="w-3.5 h-3.5 text-zinc-400" />
                                              </button>
                                            </>
                                          )}
                                        </div>
                                        {/* Status of a product */}
                                        <div className="flex items-center justify-between sm:justify-end gap-2">
                                          <div className="flex items-center gap-1">
                                            <span className="font-semibold text-xs sm:text-sm text-white">Status:</span>
                                            <Badge
                                              variant="outline"
                                              className={`${getStatusColor(it.status)} uppercase border-none font-semibold text-xs py-1`}
                                            >
                                              {getStatusText(it.status)}
                                            </Badge>
                                          </div>

                                          <div className="flex items-center gap-2 mr-2">
                                            {/* Popover for opening an item's qr code */}
                                            <Popover>
                                              <PopoverTrigger asChild>
                                                <button
                                                  className="p-1 rounded cursor-pointer hover:-translate-y-1 duration-300 transition"
                                                  aria-label="Show QR Code"
                                                  onClick={() => console.log(it.id)}
                                                >
                                                  <QrCode className="w-4 h-4 text-zinc-400" />
                                                </button>
                                              </PopoverTrigger>
                                              <PopoverContent
                                                side="top"
                                                align="end"
                                                className="p-4 rounded-md shadow-xl z-50 border w-fit bg-[#171717]"
                                              >
                                                <div className="flex flex-col items-center space-y-3">
                                                  <span className="text-sm font-semibold text-zinc-700">
                                                    <span className="text-white bold underline">{it.serialCode}</span>
                                                  </span>

                                                  <img
                                                    src={`/api/core/items/qrCode?itemId=${it.id}`}
                                                    alt={`QR for ${it.serialCode}`}
                                                    className="w-32 h-32 rounded border "
                                                  />

                                                  <a
                                                    href={`/api/core/items/qrCode?itemId=${it.id}`}
                                                    download={`qr-${it.serialCode}.png`}
                                                    className="text-xs px-3 py-1 rounded transition duration-300 bg-transparent hover:-translate-y-1"
                                                  >
                                                    Download QR Code
                                                  </a>
                                                </div>
                                              </PopoverContent>
                                            </Popover>

                                            {/* Popover for deleting an item */}
                                            <Popover>
                                              <PopoverTrigger className="hover:-translate-y-1 duration-300 cursor-pointer">
                                                <span className="uppercase border-none font-semibold text-xs py-1">
                                                  <Trash2 className="w-4 h-4 text-zinc-400" />
                                                </span>
                                              </PopoverTrigger>
                                              <PopoverContent
                                                side="top"
                                                align="end"
                                                className="p-4 rounded-md shadow-xl z-50 border w-48"
                                              >
                                                <div className="flex flex-col items-center space-y-4">
                                                  <span className="text-sm font-semibold text-white text-center">
                                                    <span className="text-red-500">Delete</span> <span className="underline">{it.serialCode}</span>?
                                                  </span>

                                                  <div className="flex gap-3 w-full">
                                                    <Button
                                                      onClick={() => { handleDeleteItem(it.id); setToggleDeleteItemPopover(false); setSelectedDeletingItem({}) }}
                                                      className="text-red-500 bg-red-500/10 px-4 py-1 rounded-sm hover:bg-red-500/20 cursor-pointer hover:-translate-y-1 duration-300 flex-1 w-full"
                                                    >
                                                      Delete
                                                    </Button>
                                                  </div>
                                                </div>
                                              </PopoverContent>
                                            </Popover>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </>
                              ) : (
                                <p className="text-zinc-400 text-sm">No items added yet.</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
        {/* Dialog for updating a products location */}
        <Dialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen}>
          <DialogContent
            className="flex flex-col bg-zinc-900 border border-zinc-700 p-3 rounded-md space-y-3"
          >
            <DialogTitle className="mt-4 flex flex-row items-center">
              <p className="ml-3">Update {updatingProduct.name}'s location</p>
              <span className="text-zinc-400 text-xs font-normal inline ml-1">{updatingProduct.location}</span>
            </DialogTitle>
            <div className="flex flex-row gap-2">
              <Input
                id="location"
                className="h-8 selected:border-none ml-2"
                placeholder={`Current location: ${updatingProduct.location}`}
                value={productLocation}
                onChange={(e) => setProductLocation(e.target.value)}
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                disabled={locationLoading}
                className="h-8 w-10 self-start"
              >
                {locationLoading ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
              </Button>
            </div>
            <Button
              type="button"
              size="sm"
              className="h-8 hover:-translate-y-1 duration-300 cursor-pointer ml-2 hover:-translate-y-1 duration-300"
              onClick={() => { updateProductLocation(updatingProduct.id, productLocation); setUpdatingProduct({}); setLocationDialogOpen(false) }}
              disabled={!productLocation.trim()}
            >
              Save
            </Button>
          </DialogContent>
        </Dialog>
        {/* Dialog for updating a products location */}
        <Dialog open={editingDescriptionDialog} onOpenChange={toggleEditingDescriptionDialog}>
          <DialogContent
            className="flex flex-col bg-zinc-900 border border-zinc-700 p-3 rounded-md space-y-3"
          >
            <DialogTitle className="mt-4 flex flex-row items-center">
              <p onClick={() => console.log(editingDescriptionProduct.description)} className="ml-3">Update {editingDescriptionProduct.name}'s location</p>
              <span className="text-zinc-400 text-xs font-normal inline ml-1">{updatingProduct.location}</span>
            </DialogTitle>
            <div className="flex flex-row gap-2">
              <textarea
                id="location"
                className="h-32 w-full resize-y border border-gray-300 rounded-md px-3 py-2 ml-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Current location: ${updatingProduct.location}`}
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
              />
            </div>
            <Button
              type="button"
              size="sm"
              className="h-8 hover:-translate-y-1 duration-300 cursor-pointer ml-2 hover:-translate-y-1 duration-300"
              onClick={() => { updateProductDescription(editingDescriptionProduct.id, editingDescriptionProduct.description); setEditingDescriptionProduct({}); toggleEditingDescriptionDialog(false) }}
              disabled={!productLocation.trim()}
            >
              Save
            </Button>
          </DialogContent>
        </Dialog>
        {/* Dialog for confirming product deletion */}
        <Dialog open={toggleDeleteProductDialog} onOpenChange={setToggleDeleteProductDialog}>
          <DialogContent
            className="flex flex-col bg-zinc-900 border border-zinc-700 p-3 rounded-md space-y-3"
          >
            {/* Dialog title and warning message */}
            <DialogTitle className="mt-4 flex flex-col gap-y-2">
              <p className="ml-3">
                Are you sure you want to <span className="text-red-500 underline">delete</span> {selectedDeletingProduct.name}?
              </p>
              <span className="text-zinc-400 text-xs font-normal inline ml-3">
                This action is <span className="text-red-500 font-semibold uppercase underline">irreversible</span>.
              </span>
            </DialogTitle>

            {/* Inform about total items that will be deleted along with the product */}
            <p className="text-sm text-center text-zinc-400">
              You will also delete the following <span className="text-emerald-400 font-semibold">{selectedDeletingProduct.totalQuantity}</span> items
            </p>

            {/* Scrollable list of items associated with the product */}
            <div
              className="space-y-1 max-h-48 overflow-y-auto"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgb(113 113 122) transparent'
              }}
            >
              {selectedDeletingProduct.items && selectedDeletingProduct.items.length > 0 ? (
                <div className="space-y-2 pr-1">
                  {[...selectedDeletingProduct.items]
                    .sort((a, b) => a.id - b.id)
                    .map((it) => (
                      <div
                        key={it.id}
                        className="flex items-center justify-between border border-zinc-600 rounded p-2"
                      >
                        <div className="flex items-center gap-2">
                          {/* Display item serial code */}
                          <span className="text-white tracking-normal text-sm">{it.serialCode}</span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                // Fallback if no items are linked to the product
                <p className="text-zinc-400 text-sm">No items added yet.</p>
              )}
            </div>

            <div className="space-y-3">
              {/* Confirmation input for extra safety */}
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">
                  Type <span className="font-semibold text-white">{selectedDeletingProduct.name}</span> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmationInput}
                  onChange={(e) => setConfirmationInput(e.target.value)}
                  placeholder={selectedDeletingProduct.name}
                  className="w-full mt-3 mb-1 px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                />
              </div>

              {/* Final delete button (only enabled when confirmation input matches product name) */}
              <Button
                type="button"
                size="sm"
                className="h-8 w-full mt-2 text-red-500 hover:bg-red-400/20 bg-red-400/10 hover:-translate-y-1 duration-300 cursor-pointer mr-4"
                disabled={confirmationInput !== selectedDeletingProduct.name}
                onClick={() => {
                  handleDeleteProduct(selectedDeletingProduct.id); // Actual delete handler
                  setSelectedDeletingProduct({}); // Reset state
                  setConfirmationInput(''); // Clear confirmation input
                  setToggleDeleteProductDialog(false); // Close dialog
                }}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </SidebarInset>

      {/* label assign confirmation */}
      <Dialog open={showLabelConfirmation} onOpenChange={setShowLabelConfirmation}>
        <DialogContent className="sm:max-w-[425px] bg-[#171717] border rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="font-semibold">
              {labelConfirmation?.isRemoving ? 'Remove Label' : 'Assign Label'}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              {labelConfirmation?.isRemoving ? (
                <>
                  Are you sure you want to remove the label{" "}
                  <span style={{ color: labelConfirmation.labelColor }} className="font-semibold">
                    {labelConfirmation?.labelName}
                  </span>{" "}
                  from{" "}
                  <span className="text-white font-semibold">
                    {labelConfirmation?.productName}
                  </span>
                  <DrawnQuestionMark />
                </>
              ) : (
                <>
                  Are you sure you want to assign the label{" "}
                  <span style={{ color: labelConfirmation?.labelColor }} className="font-semibold">
                    {labelConfirmation?.labelName}
                  </span>{" "}
                  to{" "}
                  <span className="text-white font-semibold">
                    {labelConfirmation?.productName}
                  </span>
                  <DrawnQuestionMark />
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            {/* product preview */}
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <div className="flex-shrink-0">
                <Package className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{labelConfirmation?.productName}</p>
                <p className="text-sm text-zinc-400">Product</p>
              </div>
            </div>

            {/* action icons */}
            <div className="flex items-center justify-center py-2">
              {labelConfirmation?.isRemoving ? (
                <Minus className="w-6 h-6 text-red-500 font-semibold" />
              ) : (
                <Plus className="w-6 h-6 text-emerald-400 font-semibold" />
              )}
            </div>

            {/* preview for label */}
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <div
                className={`w-8 h-8 rounded-full border-2  shadow-sm`}
                style={{ backgroundColor: labelConfirmation?.labelColor }}

              />
              <div className="flex-1">
                <p className="font-semibold">{labelConfirmation?.labelName}</p>
                <p className="text-sm text-zinc-400">Label</p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-3">
            <Button
              variant="outline"
              className="border-gray-300 text-zinc-400 hover:bg-gray-100 hover:-translate-y-1 duration-300 cursor-pointer"
              onClick={() => setShowLabelConfirmation(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (labelConfirmation) {
                  toggleProductLabel(labelConfirmation.productId, labelConfirmation.labelId);
                  setShowLabelConfirmation(false);
                  setLabelConfirmation(null);
                }
              }}
              className={`${confirmClasses} hover:-translate-y-1 duration-300 cursor-pointer`}
            >
              {labelConfirmation?.isRemoving ? 'Remove Label' : 'Assign Label'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* product confirmation dialog */}
      <Dialog open={showCreateProductConfirmation} onOpenChange={setShowCreateProductConfirmation}>
        <DialogContent className="sm:max-w-[425px] bg-[#171717]">
          <DialogHeader>
            <DialogTitle>Create New Product</DialogTitle>
            <DialogDescription>
              Please review the product details before creating.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3  rounded-lg border">
                <Package className="w-6 h-6" />
                <div className="flex-1">
                  <p className="font-semibold">{title || 'Untitled Product'}</p>
                  <p className="text-sm text-zinc-400">Product Name</p>
                </div>
              </div>

              {description && (
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <FileText className="w-6 h-6" />
                  <div className="flex-1">
                    <p className="font-semibold">{description}</p>
                    <p className="text-sm text-zinc-400">Description</p>
                  </div>
                </div>
              )}

              {productLocation && (
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <MapPin className="w-6 h-6" />
                  <div className="flex-1">
                    <p className="font-semibold">{productLocation}</p>
                    <p className="text-sm text-zinc-400">Location</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateProductConfirmation(false)}
              className="text-zinc-400 font-medium duration-300 hover:-translate-y-1 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                const productPromise = async () => {
                  try {
                    const res = await fetch('/api/core/products', {
                      method: "POST",
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        productName: title,
                        description,
                        location: productLocation
                      }),
                    });

                    if (!res.ok) {
                      throw new Error('Failed to add product');
                    }

                    const data = await res.json();
                    await fetchInventory();

                    return { productName: title, data };
                  } catch (error) {
                    throw error;
                  }
                };

                const loadingToast = toast.loading('Adding product...');
                try {
                  const result = await productPromise();
                  toast.dismiss(loadingToast);

                  setTitle("");
                  setDescription("");
                  setProductLocation("");
                  setShowCreateProductConfirmation(false);

                  showToast({
                    show: "Successfully added a product",
                    description: "success",
                    label: `Successfully added ${result.productName} to inventory!`,
                  });
                } catch (error) {
                  toast.dismiss(loadingToast);

                  showToast({
                    show: "Failed to add product",
                    description: "error",
                    label: "There was an error adding the product to inventory",
                  });
                }
              }}
              className="bg-emerald-400 text-white hover:bg-emerald-500 font-medium duration-300 hover:-translate-y-1 cursor-pointer"
            >
              Create Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* add items dialog confirm */}
      <Dialog open={showItemsConfirmation} onOpenChange={setShowItemsConfirmation}>
        <DialogContent className="sm:max-w-[425px] bg-[#171717]">
          <DialogHeader>
            <DialogTitle>Add Item/s to Product</DialogTitle>
            <DialogDescription>
              Please review the items before adding them to <span className="text-white font-semibold">{itemsConfirmation?.productName}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <Package className="w-6 h-6 text-white" />
              <div className="flex-1">
                <p className="font-medium text-white">{itemsConfirmation?.productName}</p>
                <p className="text-sm text-zinc-400">Product</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-medium text-zinc-400 text-center mb-4">
                <Plus className="w-6 h-6 text-emerald-400 font-bold inline mr-2" />
                <span className="text-[#efefef]">
                  the below {itemsConfirmation?.items.length}
                  {itemsConfirmation?.items.length === 1 ? ' item' : ' items'}
                </span>
              </p>

              <div className="max-h-32 overflow-y-auto space-y-1">
                {itemsConfirmation?.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded border">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-sm text-white">{item.serialCode}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              className="hover:-translate-y-1 duration-300 cursor-pointer"
              variant="outline"
              onClick={() => setShowItemsConfirmation(false)}
            >
              Cancel
            </Button>
            <Button
              className="hover:-translate-y-1 duration-300 cursor-pointer"
              onClick={async () => {
                if (itemsConfirmation) {
                  const loadingToast = toast.loading('Adding items...');


                  try {
                    const body = {
                      productName: itemsConfirmation.productName,
                      items: itemsConfirmation.items,
                    };

                    const res = await fetch('/api/core/items', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(body),
                    });

                    toast.dismiss(loadingToast);

                    if (res.ok) {
                      await fetchInventory();
                      setExpandedProductId(null);
                      setSerialCodes(['']);
                      showToast({
                        show: "Success",
                        description: "success",
                        label: `Added ${itemsConfirmation.items.length} items to ${itemsConfirmation.productName}`,
                      });
                    } else {
                      const err = await res.json();
                      showToast({
                        show: "Error",
                        description: "error",
                        label: err?.error || 'Unknown error',
                      });
                    }
                  } catch (error) {
                    toast.dismiss(loadingToast);
                    showToast({
                      show: "Error",
                      description: "error",
                      label: "Failed to add items",
                    });
                  }

                  setShowItemsConfirmation(false);
                  setItemsConfirmation(null);
                }
              }}
            >
              Add Items
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showWorkflowDialog} onOpenChange={setShowWorkflowDialog}>
        {/* Dialog container, controlled by showWorkflowDialog state */}
        <DialogContent className="sm:max-w-[500px] bg-[#171717]">
          {/* Dialog content box with max width and dark background */}
          <DialogHeader>
            <DialogTitle>
              {/* Title changes depending on whether editing or creating a workflow */}
              {editingWorkflow ? 'Edit Workflow' : 'Create Workflow'}
            </DialogTitle>
            <DialogDescription>
              {/* Brief description explaining the dialog's purpose */}
              Set up automated actions based on product conditions.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Form grid container with vertical gaps and padding */}

            {/* Product selection row */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="product">Product</Label>
              <Select value={selectedProductForWorkflow} onValueChange={setSelectedProductForWorkflow}>
                {/* Trigger and dropdown for product select */}
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {/* Map over inventory to create dropdown items */}
                  {inventory.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Condition selection row */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="condition">Condition</Label>
              <Select value={workflowCondition} onValueChange={setWorkflowCondition}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {/* Map condition options into dropdown items */}
                  {conditionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Threshold input shows only for certain conditions */}
            {(workflowCondition === 'quantity_below' ||
              workflowCondition === 'quantity_above' ||
              workflowCondition === 'low_available') && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="threshold">Threshold</Label>
                  <Input
                    id="threshold"
                    type="number"
                    value={workflowThreshold}
                    onChange={(e) => setWorkflowThreshold(parseInt(e.target.value))}
                    className="col-span-3"
                  />
                </div>
              )}

            {/* Action selection row */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="action">Action</Label>
              <Select value={workflowAction} onValueChange={setWorkflowAction}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {/* Map action options into dropdown items */}
                  {actionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Restock-specific inputs appear only when action is 'restock' */}
            {workflowAction === 'restock' && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={restockQuantity}
                    onChange={(e) => setRestockQuantity(parseInt(e.target.value))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="pattern">Serial Pattern</Label>
                  <Input
                    id="pattern"
                    placeholder="e.g. PROD-001 or PROD-increment(1)(100)"
                    value={serialPattern}
                    onChange={(e) => setSerialPattern(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </>
            )}

            {/* Label selection shows only when action is 'add_label' */}
            {workflowAction === 'add_label' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="label">Label</Label>
                <Select value={selectedLabelId} onValueChange={setSelectedLabelId}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a label" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Map labels with colored badges into dropdown items */}
                    {labels.map((label) => (
                      <SelectItem key={label.id} value={label.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Badge
                            style={{
                              backgroundColor: `${label.color}33`,
                              color: label.color,
                              boxShadow: `inset 0 0 0 1px ${label.color}80`,
                            }}
                            className="text-xs font-medium px-2 py-0.5 rounded-md border-0"
                          >
                            {label.name}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Checkbox to enable/disable the workflow */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enabled"
                checked={workflowEnabled}
                onChange={(e) => setWorkflowEnabled(e.target.checked)}
              />
              <Label htmlFor="enabled">Enable workflow</Label>
            </div>
          </div>

          <DialogFooter>
            {/* Cancel button resets form */}
            <Button variant="outline" onClick={resetWorkflowForm}>
              Cancel
            </Button>
            {/* Save button is disabled if required fields are missing */}
            <Button
              onClick={saveWorkflow}
              disabled={!selectedProductForWorkflow || (workflowAction === 'add_label' && !selectedLabelId)}
            >
              {editingWorkflow ? 'Update' : 'Create'} Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </SidebarProvider>
  );
}