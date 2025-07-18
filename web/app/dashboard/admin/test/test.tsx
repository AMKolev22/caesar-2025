import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  FileText, 
  BarChart3, 
  Users, 
  Package, 
  Activity,
  Calendar,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

const ReportExportButton = ({ 
  recentRequests, 
  pendingRequests, 
  lowItems, 
  showToast 
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [dateRange, setDateRange] = useState('30');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);

  const reportTypes = [
    { 
      id: 'usage-stats', 
      name: 'Usage Statistics', 
      description: 'Item usage, borrow/return patterns, and user activity',
      icon: <BarChart3 className="w-4 h-4" />
    },
    { 
      id: 'inventory-status', 
      name: 'Inventory Status', 
      description: 'Current stock levels, item conditions, and availability',
      icon: <Package className="w-4 h-4" />
    },
    { 
      id: 'user-activity', 
      name: 'User Activity', 
      description: 'User requests, approvals, and borrowing history',
      icon: <Users className="w-4 h-4" />
    },
    { 
      id: 'maintenance-report', 
      name: 'Maintenance Report', 
      description: 'Items under repair, broken items, and maintenance trends',
      icon: <AlertTriangle className="w-4 h-4" />
    },
    { 
      id: 'comprehensive', 
      name: 'Comprehensive Report', 
      description: 'All-in-one report with complete system overview',
      icon: <FileText className="w-4 h-4" />
    }
  ];

  const fetchReportData = async (reportType, days) => {
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reportType, 
          dateRange: parseInt(days),
          organisationId: 1 // You'll need to get this from your auth context
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      throw new Error('Failed to fetch report data');
    } catch (error) {
      console.error('Error fetching report data:', error);
      return null;
    }
  };

  const generatePDF = (data, reportType) => {
    // Create PDF content
    const pdfContent = `
      <html>
        <head>
          <title>${reportTypes.find(r => r.id === reportType)?.name} Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .section { margin: 20px 0; }
            .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
            .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
            .stat-value { font-size: 24px; font-weight: bold; color: #2563eb; }
            .stat-label { color: #666; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .status-approved { color: #10b981; }
            .status-pending { color: #f59e0b; }
            .status-denied { color: #ef4444; }
            .low-stock { color: #ef4444; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${reportTypes.find(r => r.id === reportType)?.name}</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <p>Period: Last ${dateRange} days</p>
          </div>
          
          ${generateReportContent(data, reportType)}
        </body>
      </html>
    `;

    // Create and download PDF
    const blob = new Blob([pdfContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateCSV = (data, reportType) => {
    let csvContent = '';
    
    switch (reportType) {
      case 'usage-stats':
        csvContent = 'Product Name,Total Requests,Approved,Pending,Denied,Current Stock,Low Stock Alert\n';
        data.productUsage?.forEach(item => {
          csvContent += `"${item.name}",${item.totalRequests},${item.approved},${item.pending},${item.denied},${item.currentStock},${item.isLowStock ? 'Yes' : 'No'}\n`;
        });
        break;
        
      case 'user-activity':
        csvContent = 'User Email,User Name,Total Requests,Approved,Pending,Denied,Items Currently Borrowed\n';
        data.userActivity?.forEach(user => {
          csvContent += `"${user.email}","${user.name}",${user.totalRequests},${user.approved},${user.pending},${user.denied},${user.currentlyBorrowed}\n`;
        });
        break;
        
      case 'inventory-status':
        csvContent = 'Product Name,Serial Code,Status,Assigned To,Location,Created Date\n';
        data.inventoryItems?.forEach(item => {
          csvContent += `"${item.productName}","${item.serialCode}","${item.status}","${item.assignedTo || 'N/A'}","${item.location || 'N/A'}","${item.createdAt}"\n`;
        });
        break;
        
      default:
        csvContent = 'Report Type,Value,Description\n';
        csvContent += `"Total Requests",${data.totalRequests || 0},"All time requests"\n`;
        csvContent += `"Pending Requests",${data.pendingRequests || 0},"Currently pending"\n`;
        csvContent += `"Low Stock Items",${data.lowStockItems || 0},"Items needing restock"\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateReportContent = (data, reportType) => {
    switch (reportType) {
      case 'usage-stats':
        return `
          <div class="section">
            <h2>Usage Statistics Overview</h2>
            <div class="stat-grid">
              <div class="stat-card">
                <div class="stat-value">${data.totalRequests || 0}</div>
                <div class="stat-label">Total Requests</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${data.approvedRequests || 0}</div>
                <div class="stat-label">Approved Requests</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${data.pendingRequests || 0}</div>
                <div class="stat-label">Pending Requests</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${data.activeUsers || 0}</div>
                <div class="stat-label">Active Users</div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h2>Most Requested Items</h2>
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Total Requests</th>
                  <th>Approved</th>
                  <th>Pending</th>
                  <th>Current Stock</th>
                </tr>
              </thead>
              <tbody>
                ${data.productUsage?.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.totalRequests}</td>
                    <td class="status-approved">${item.approved}</td>
                    <td class="status-pending">${item.pending}</td>
                    <td ${item.isLowStock ? 'class="low-stock"' : ''}>${item.currentStock}</td>
                  </tr>
                `).join('') || '<tr><td colspan="5">No data available</td></tr>'}
              </tbody>
            </table>
          </div>
        `;
        
      case 'user-activity':
        return `
          <div class="section">
            <h2>User Activity Summary</h2>
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Total Requests</th>
                  <th>Approved</th>
                  <th>Pending</th>
                  <th>Items Borrowed</th>
                </tr>
              </thead>
              <tbody>
                ${data.userActivity?.map(user => `
                  <tr>
                    <td>${user.name} (${user.email})</td>
                    <td>${user.totalRequests}</td>
                    <td class="status-approved">${user.approved}</td>
                    <td class="status-pending">${user.pending}</td>
                    <td>${user.currentlyBorrowed}</td>
                  </tr>
                `).join('') || '<tr><td colspan="5">No data available</td></tr>'}
              </tbody>
            </table>
          </div>
        `;
        
      default:
        return `
          <div class="section">
            <h2>System Overview</h2>
            <div class="stat-grid">
              <div class="stat-card">
                <div class="stat-value">${data.totalItems || 0}</div>
                <div class="stat-label">Total Items</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${data.availableItems || 0}</div>
                <div class="stat-label">Available Items</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${data.borrowedItems || 0}</div>
                <div class="stat-label">Items in Use</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${data.lowStockItems || 0}</div>
                <div class="stat-label">Low Stock Alerts</div>
              </div>
            </div>
          </div>
        `;
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedReport) return;
    
    setIsGenerating(true);
    
    try {
      const data = await fetchReportData(selectedReport, dateRange);
      
      if (data) {
        setReportData(data);
        
        if (selectedFormat === 'pdf') {
          generatePDF(data, selectedReport);
        } else {
          generateCSV(data, selectedReport);
        }
        
        showToast({
          show: "Report generated successfully",
          description: "success",
          label: `${reportTypes.find(r => r.id === selectedReport)?.name} report has been downloaded.`
        });
        
        setIsDialogOpen(false);
      } else {
        showToast({
          show: "Failed to generate report",
          description: "error",
          label: "Unable to fetch report data. Please try again."
        });
      }
    } catch (error) {
      console.error('Error generating report:', error);
      showToast({
        show: "Error generating report",
        description: "error",
        label: "An error occurred while generating the report."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const quickExportStats = () => {
    const quickData = {
      totalRequests: recentRequests.length,
      pendingRequests: pendingRequests.length,
      lowStockItems: lowItems.length,
      recentActivity: recentRequests.slice(0, 10)
    };
    
    if (selectedFormat === 'csv') {
      let csvContent = 'Metric,Value,Description\n';
      csvContent += `"Total Recent Requests",${quickData.totalRequests},"Recent requests in system"\n`;
      csvContent += `"Pending Requests",${quickData.pendingRequests},"Requests awaiting approval"\n`;
      csvContent += `"Low Stock Items",${quickData.lowStockItems},"Items needing restocking"\n`;
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quick-stats-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Reports
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Quick Export</DropdownMenuLabel>
          <DropdownMenuItem onClick={quickExportStats}>
            <Activity className="w-4 h-4 mr-2" />
            Current Stats (CSV)
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Detailed Reports</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
            <FileText className="w-4 h-4 mr-2" />
            Custom Report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate Custom Report</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Report Type</label>
                <div className="grid grid-cols-1 gap-2">
                  {reportTypes.map((report) => (
                    <Card 
                      key={report.id} 
                      className={`cursor-pointer transition-all ${
                        selectedReport === report.id 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedReport(report.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          {report.icon}
                          <div className="flex-1">
                            <div className="font-medium text-sm">{report.name}</div>
                            <div className="text-xs text-gray-600">{report.description}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Date Range</label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                      <SelectItem value="365">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Export Format</label>
                  <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Report</SelectItem>
                      <SelectItem value="csv">CSV Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleGenerateReport}
                disabled={!selectedReport || isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportExportButton;