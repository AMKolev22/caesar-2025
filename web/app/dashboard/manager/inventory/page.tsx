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
  const [inventory, setInventory] = useState([]);
  const [labels, setLabels] = useState([]);
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("all");
  const [expandedProductId, setExpandedProductId] = useState(null);
  const [serialCodes, setSerialCodes] = useState(['']);

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




  // workflow conditions
  const conditionOptions = [
    { value: 'quantity_below', label: 'Quantity Below' },
    { value: 'quantity_above', label: 'Quantity Above' },
    { value: 'all_broken', label: 'All Items Broken' },
    { value: 'low_available', label: 'Low Available Items' },
    { value: 'no_available', label: 'No Available Items' },
  ];

  // workflow actioms
  const actionOptions = [
    { value: 'restock', label: 'Auto Restock' },
    { value: 'notify', label: 'Send Notification' },
    { value: 'change_status', label: 'Change Item Status' },
    { value: 'add_label', label: 'Add Label' },
  ];

  const saveWorkflow = async () => {
    const payload = {
      productId: selectedProductForWorkflow,
      condition: workflowCondition,
      threshold: workflowThreshold,
      action: workflowAction,
      restockQuantity: workflowAction === 'restock' ? restockQuantity : null,
      serialPattern: workflowAction === 'restock' ? serialPattern : null,
      enabled: workflowEnabled,
    };

    const method = editingWorkflow ? 'PUT' : 'POST';
    const url = editingWorkflow
      ? `/api/workflows/${editingWorkflow.id}`
      : '/api/workflows';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('Failed to save workflow');
    const saved = await res.json();

    setWorkflows((prev) =>
      editingWorkflow
        ? prev.map((w) => (w.id === saved.id ? saved : w))
        : [...prev, saved]
    );
    resetWorkflowForm();
  };


  const deleteWorkflow = async (workflowId) => {
    const res = await fetch(`/api/workflows/${workflowId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete');
    setWorkflows((prev) => prev.filter((w) => w.id !== workflowId));
  };


  const toggleWorkflow = async (workflowId) => {
    const wf = workflows.find((w) => w.id === workflowId);
    if (!wf) return;

    const updated = { ...wf, enabled: !wf.enabled };
    const res = await fetch(`/api/workflows/${workflowId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: updated.enabled }),
    });
    if (!res.ok) throw new Error('Failed to toggle');

    const saved = await res.json();
    setWorkflows((prev) =>
      prev.map((w) => (w.id === saved.id ? saved : w))
    );
  };

  const resetWorkflowForm = () => {
    setShowWorkflowDialog(false);
    setSelectedProductForWorkflow(null);
    setWorkflowCondition('quantity_below');
    setWorkflowThreshold(5);
    setWorkflowAction('restock');
    setRestockQuantity(10);
    setSerialPattern('');
    setWorkflowEnabled(true);
    setEditingWorkflow(null);
  };

  const editWorkflow = (workflow) => {
    setEditingWorkflow(workflow);
    setSelectedProductForWorkflow(workflow.productId);
    setWorkflowCondition(workflow.condition);
    setWorkflowThreshold(workflow.threshold);
    setWorkflowAction(workflow.action);
    setRestockQuantity(workflow.restockQuantity || 10);
    setSerialPattern(workflow.serialPattern || '');
    setWorkflowEnabled(workflow.enabled);
    setShowWorkflowDialog(true);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/workflows/check');
      fetchInventory();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const inputRef = useRef<HTMLInputElement | null>(null);


  const confirmClasses = labelConfirmation?.isRemoving
    ? 'bg-red-500 hover:bg-red-600 text-white'
    : 'bg-emerald-400 hover:bg-emerald-500 text-white';


  const getCurrentLocation = async () => {
    setLocationLoading(true);
    const loadingToast = toast.loading('Detecting location...');

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported');
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      setCurrentLocation({ latitude, longitude });

      try {
        const reverseGeoResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
        );

        if (reverseGeoResponse.ok) {
          const geoData = await reverseGeoResponse.json();
          const address = geoData.address;

          const cityName = address?.city || address?.town || address?.village ||
            address?.municipality || address?.county || 'Unknown location';
          const country = address?.country || '';

          const locationName = cityName !== 'Unknown location'
            ? `${cityName}${country ? `, ${country}` : ''}`
            : `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`;

          setProductLocation(locationName);
        } else {
          const fallback = `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`;
          setProductLocation(fallback);
        }
      } catch (geoError) {
        console.warn('Reverse geocoding failed, using coordinates:', geoError);
        const fallback = `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`;
        setProductLocation(fallback);
      }

      toast.dismiss(loadingToast);
      showToast({
        show: "Success",
        description: "success",
        label: "Location detected successfully!",
      });
    } catch (error) {
      console.error("Geolocation failed:", error);
      toast.dismiss(loadingToast);
      showToast({
        show: "Error",
        description: "error",
        label: "Could not detect location",
      });
    } finally {
      setLocationLoading(false);
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
      await fetch(`/api/core/items/${id}/serialCode`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serialCode: newCode }),
      });

      setEditingSerialId(null);
      setEditingSerialCode('');
      fetchInventory();
    }
    catch (err) {
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
    const imageFile = selectedImages?.[productId];
    if (!imageFile) {
      showToast({
        show: "Error",
        description: "error",
        label: "No image selected",
      });
      return;
    }

    const loadingToast = toast.loading("Uploading image...");
    setUploadingImages(prev => ({ ...prev, [productId]: true }));

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("productId", productId);

      const res = await fetch("/api/core/products/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      await fetchInventory();
      setSelectedImages({});
      setImagePreviews({});

      toast.dismiss(loadingToast);
      showToast({
        show: "Success",
        description: "success",
        label: "Product image uploaded successfully!",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast.dismiss(loadingToast);
      showToast({
        show: "Error",
        description: "error",
        label: "Failed to upload image",
      });
    } finally {
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

  const fetchInventory = async () => {
    const res = await fetch('/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      setInventory(data.inventory);
    }
  };

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

  const createLabel = async () => {
    if (!newLabelName.trim()) {
      showToast({
        show: "Error",
        description: "error",
        label: "Label name cannot be empty",
      });
      return;
    }

    const loadingToast = toast.loading("Creating label...");

    try {
      const res = await fetch('/api/labels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newLabelName,
          color: newLabelColor,
        }),
      });

      if (!res.ok) throw new Error("Failed to create label");

      await fetchLabels();
      setNewLabelName("");
      setNewLabelColor("#3b82f6");

      toast.dismiss(loadingToast);
      showToast({
        show: "Success",
        description: "success",
        label: `Label "${newLabelName}" created successfully!`,
      });
    } catch (error) {
      console.error("Create label error:", error);
      toast.dismiss(loadingToast);
      showToast({
        show: "Error",
        description: "error",
        label: "Failed to create label",
      });
    }
  };

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
    const product = inventory.find(p => p.id === productId);
    const currentLabels = product?.labels?.map(l => l.id) || [];

    let newLabels;
    if (currentLabels.includes(labelId)) {
      newLabels = currentLabels.filter(id => id !== labelId);
    } else {
      newLabels = [...currentLabels, labelId];
    }

    await updateProductLabels(productId, newLabels);
  };

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

  // filter, now supports location
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = searchTerm === "" ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.items?.some(it => it.serialCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLabel = selectedLabel === "all" ||
      item.labels?.some(label => label.id === parseInt(selectedLabel));

    return matchesSearch && matchesLabel;
  });

  const fetchWorkflows = async () => {
    const res = await fetch('/api/workflows');
    if (res.ok) {
      const data = await res.json();
      setWorkflows(data);
    }
  };

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
    const loadingToast = toast.loading("Deleting product...");

    try {
      const res = await fetch(`/api/core/products/${productId}/delete`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error("Delete failed");

      await fetchInventory(); // refreshes

      toast.dismiss(loadingToast);
      showToast({
        show: "Success",
        description: "success",
        label: "Product deleted successfully!",
      });
    } catch (error) {
      console.error("Delete product error:", error);
      toast.dismiss(loadingToast);
      showToast({
        show: "Error",
        description: "error",
        label: "Failed to delete product",
      });
    } finally {
      setSelectedDeletingProduct({});
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    const loadingToast = toast.loading("Deleting item...");

    try {
      const res = await fetch(`/api/core/items/${itemId}/delete`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      await fetchInventory();

      toast.dismiss(loadingToast);
      showToast({
        show: "Success",
        description: "success",
        label: "Item deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.dismiss(loadingToast);
      showToast({
        show: "Error",
        description: "error",
        label: "Failed to delete item",
      });
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
              <div className="flex justify-between z-30">
                <h1 className="text-xl font-semibold">Inventory</h1>
                <div className="flex gap-2 z-30">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="font-semibold cursor-pointer hover:-translate-y-1 duration-300">
                        <div className="text-center mr-2 flex flex-row gap-2">
                          <Workflow className="mt-[2px]" />
                          Workflows ({workflows.length})
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-96">
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
                                      <span className="font-medium text-sm">{product?.name}</span>
                                      <div className="flex items-center gap-2">
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
                                    <div className={`text-xs px-2 py-1 rounded ${workflow.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
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
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="font-semibold cursor-pointer hover:-translate-y-1 duration-300">
                        <Tag className="w-4 h-4 mr-2" />
                        Manage Labels
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium">Create New Label</h4>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Label name"
                              value={newLabelName}
                              onChange={(e) => setNewLabelName(e.target.value)}
                            />
                            <input
                              type="color"
                              value={newLabelColor}
                              onChange={(e) => setNewLabelColor(e.target.value)}
                              className="w-12 h-9 rounded border"
                            />
                            <Button onClick={createLabel} size="sm">
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
                                className="text-xs font-medium px-2 py-0.5 rounded-md border-0"
                              >
                                {label.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button className="font-semibold hover:cursor-pointer duration-300 hover:-translate-y-1">
                        CREATE
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <h4 className="leading-none font-medium">Create a new product.</h4>
                          <p className="text-muted-foreground text-sm">
                            Enter the details down below. You can add your own items later.
                          </p>
                        </div>
                        <div className="grid gap-2">
                          <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="title">Product Title</Label>
                            <Input
                              id="title"
                              autoComplete="off"
                              autoCapitalize="on"
                              placeholder="Enter the product's title."
                              className="col-span-2 h-8"
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                            />
                          </div>
                          <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="description">Product Info</Label>
                            <Input
                              id="description"
                              className="col-span-2 h-8"
                              placeholder="Enter description."
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                            />
                          </div>
                          <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="location">Location</Label>
                            <div className="col-span-2 flex gap-2">
                              <Input
                                id="location"
                                className="h-8"
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
                                className="h-8"
                              >
                                {locationLoading ? (
                                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                                ) : (
                                  <MapPin className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <span>
                            <Button
                              size="sm"
                              className="ml-auto mr-4 font-semibold hover:cursor-pointer duration-300 hover:-translate-y-1 ml-auto mr-0 float-right mt-2"
                              onClick={() => setShowCreateProductConfirmation(true)}
                            >
                              CREATE
                            </Button>
                          </span>
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
                      <div key={item.id} className="border border-zinc-700 text-white px-4 py-3 rounded-md space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1 cursor-pointer"
                            onClick={() => {
                              if (!isEditingName) {
                                setExpandedProductId(item.id === expandedProductId ? null : item.id);
                                setSerialCodes(['']);
                              }
                            }}>
                            {/*  dispaly product Image */}
                            <div className="flex-shrink-0">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-16 h-16 object-cover rounded-md border border-zinc-600"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-zinc-700 rounded-md border border-zinc-600 flex items-center justify-center">
                                  <Camera className="w-6 h-6 text-zinc-400" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1">
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
                                      className="text-sm font-medium text-white bg-transparent border-none outline-none focus:ring-0 p-0 m-0"
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
                                  <div className="text-sm font-medium">{item.name}</div>
                                )}
                              </div>




                              {/* l;ocation display */}
                              {item.location && (
                                <div className="flex items-center gap-1 mt-1">
                                  <MapPin className="w-3 h-3 text-zinc-400" />
                                  <span className="text-sm text-zinc-400">{item.location}</span>
                                </div>
                              )}

                              <div className="flex flex-wrap gap-2 mt-3">
                                {item.labels && item.labels.length > 0 ? (
                                  <>
                                    <span className="mr-1 text-sm text-zinc-300 font-medium">Labels:</span>
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
                                  <span className="text-zinc-400 italic text-sm ml-1">No labels yet.</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 text-sm text-zinc-300">
                            <div>
                              <span className="font-semibold text-white">Item Quantity:</span> {item.totalQuantity}
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-white">Total Stock <span className="p-1">(NOT BROKEN)</span>:</span>
                              <span className={stockClass}>{stockLabel}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mr-2 ml-2">
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
                                      onClick={() => {
                                        const newDescription = prompt("Enter product description:", item.description || "");
                                        if (newDescription !== null) {
                                          updateProductDescription(item.id, newDescription);
                                          // console.log("Update description:", newDescription);
                                        }
                                      }}
                                      className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-zinc-800"
                                    >
                                      <FileText className="w-4 h-4" />
                                      <span>Edit Description</span>
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

                        {/* image upload preview */}
                        {selectedImages[item.id] && imagePreviews[item.id] && (
                          <div className="mt-4 p-3 rounded-md border border-zinc-600">
                            <div className="flex items-center gap-4">
                              <img
                                src={imagePreviews[item.id]}
                                alt="Preview"
                                className="w-16 h-16 object-cover rounded-md border border-zinc-600"
                              />
                              <div className="flex-1">
                                <p className="text-sm text-white font-semibold">Selected: <span className="text-zinc-400 font-normal">{selectedImages[item.id].name}</span></p>
                                <p className="text-xs text-zinc-400">
                                  Size: <span className="text-white font-semibold">{(selectedImages[item.id].size / 1024 / 1024).toFixed(2)} MB</span>
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => uploadProductImage(item.id)}
                                  disabled={uploadingImages?.[item.id] ?? false}
                                  className="text-xs hover:-translate-y-1 duration-300 cursor-pointer"
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
                                  className="text-xs text-zinc-400 hover:-translate-y-1 duration-300 cursor-pointer"
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
                                <div key={idx} className="flex gap-2">
                                  <Input
                                    className="mb-2 max-w-[15%] mt-2"
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
                                      className="mt-2 bg-transparent cursor-pointer hover:-translate-y-1 duration-300 hover:bg-transparent hover:border  hover:border-zinc-200"
                                    >
                                      <Minus className="text-red-500" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                              <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setSerialCodes([...serialCodes, ''])}>
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
                                        className="flex items-center justify-between border border-zinc-600 rounded px-2 py-0"
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
                                              <span className="text-white tracking-normal text-sm">{it.serialCode}</span>
                                              <button
                                                onClick={() => {
                                                  setEditingSerialId(it.id);
                                                  setEditingSerialCode(it.serialCode);
                                                }}
                                                className="p-1 hover:bg-zinc-800 rounded"
                                              >
                                                <Edit3 className="w-3.5 h-3.5 text-zinc-400" />
                                              </button>
                                            </>
                                          )}
                                        </div>


                                        <div className="flex items-center mr-2">
                                          <span className="font-semibold text-sm text-white">Status:</span>
                                          <Badge
                                            variant="outline"
                                            className={`${getStatusColor(it.status)} uppercase border-none font-semibold text-xs py-1 mr-1`}
                                          >
                                            {getStatusText(it.status)}
                                          </Badge>
                                          <Popover>
                                            <PopoverTrigger asChild>
                                              <button
                                                className="p-1 rounded hover:bg-zinc-100 transition"
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
                                          <Popover>
                                            <PopoverTrigger>
                                              <span className="uppercase border-none font-semibold text-xs py-1 mr-1 ml-4">
                                                <Trash2 className="w-4 h-4 text-zinc-400 ml-2" />
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
                                                    onClick={() => {handleDeleteItem(it.id); setToggleDeleteItemPopover(false); setSelectedDeletingItem({})}}
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
        <Dialog open={toggleDeleteProductDialog} onOpenChange={setToggleDeleteProductDialog}>
          <DialogContent
            className="flex flex-col bg-zinc-900 border border-zinc-700 p-3 rounded-md space-y-3"
          >
            <DialogTitle className="mt-4 flex flex-col gap-y-2">
              <p className="ml-3">Are you sure you want to <span className="text-red-500 underline">delete</span> {selectedDeletingProduct.name}? </p>
              <span className="text-zinc-400 text-xs font-normal inline ml-3">This actions is <span className="text-red-500 font-semibold uppercase underline">irreversible</span>.</span>
            </DialogTitle>
            <p className="text-sm text-center text-zinc-400">You will also delete the following <span className="text-emerald-400 font-semibold">{selectedDeletingProduct.totalQuantity}</span> items</p>

            <div className="space-y-1"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgb(113 113 122) transparent'
              }}
            >
              {selectedDeletingProduct.items && selectedDeletingProduct.items.length > 0 ? (
                <>
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                    {[...selectedDeletingProduct.items]
                      .sort((a, b) => a.id - b.id)
                      .map((it) => (
                        <div
                          key={it.id}
                          className="flex items-center justify-between border border-zinc-600 rounded p-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-white tracking-normal text-sm">{it.serialCode}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </>
              ) : (
                <p className="text-zinc-400 text-sm">No items added yet.</p>
              )}
            </div>

            <Button
              type="button"
              size="sm"
              className="h-8 hover:-translate-y-1 duration-300 cursor-pointer hover:-translate-y-1 duration-300 mr-4"
              onClick={() => { handleDeleteProduct(selectedDeletingProduct.id); setSelectedDeletingProduct({}); setToggleDeleteProductDialog(false) }}
            >
              Delete
            </Button>
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
              variant="outline"
              onClick={() => setShowItemsConfirmation(false)}
            >
              Cancel
            </Button>
            <Button
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingWorkflow ? 'Edit Workflow' : 'Create Workflow'}
            </DialogTitle>
            <DialogDescription>
              Set up automated actions based on product conditions.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="product">Product</Label>
              <Select value={selectedProductForWorkflow} onValueChange={setSelectedProductForWorkflow}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {inventory.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="condition">Condition</Label>
              <Select value={workflowCondition} onValueChange={setWorkflowCondition}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {conditionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(workflowCondition === 'quantity_below' || workflowCondition === 'quantity_above' || workflowCondition === 'low_available') && (
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

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="action">Action</Label>
              <Select value={workflowAction} onValueChange={setWorkflowAction}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {actionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
            <Button variant="outline" onClick={resetWorkflowForm}>
              Cancel
            </Button>
            <Button onClick={saveWorkflow} disabled={!selectedProductForWorkflow}>
              {editingWorkflow ? 'Update' : 'Create'} Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}