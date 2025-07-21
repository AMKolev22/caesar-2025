import React, { useEffect, useState } from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  FileText, 
  BarChart3, 
  Users, 
  Download,
  ChevronDown,
  XCircle,
  Clock,
  TrendingUp,
  X
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import "@/styles/pulse.css"

export default function Page(){
  const [selectedReport, setSelectedReport] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [labels, setLabels] = useState([]);

  const fetchLabels = async () => {
    const res = await fetch('/api/labels', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      setLabels(data.labels);
      console.log(data.labels);
    }
  };

  useEffect(() => {
    fetchLabels();
  }, []);



  const reportTypes = [
    {
      id: 'usage-stats',
      label: 'Usage Statistics',
      icon: BarChart3,
      description: 'Equipment usage trends and statistics'
    },
    {
      id: 'user-activity',
      label: 'User Activity',
      icon: Users,
      description: 'User engagement and activity reports'
    },
  ];

  const exportToPDF = () => {
  const reportTitle = reportTypes.find(r => r.id === selectedReport)?.label;

  // creates html content, ready for pdf
  let htmlContent = `
    <html>
      <head>
        <title>${reportTitle} - Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.4; }
          .header { border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 30px; }
          .header h1 { margin: 0; color: #333; }
          .header p { margin: 5px 0 0 0; color: #666; }
          .section { margin: 30px 0; }
          .section h2 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          .metrics { display: flex; flex-wrap: wrap; gap: 20px; margin: 20px 0; }
          .metric { border: 1px solid #ddd; padding: 15px; border-radius: 5px; min-width: 200px; }
          .metric-value { font-size: 24px; font-weight: bold; color: #333; }
          .metric-label { color: #666; font-size: 14px; margin-top: 5px; }
          .list-item { padding: 10px; border-bottom: 1px solid #eee; }
          .list-item:last-child { border-bottom: none; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .print-button { margin: 20px 0; text-decoration: underline; background: white; color: black; border: none; border-radius: 5px; cursor: pointer; }
          @media print {
            .print-button { display: none; }
            body { margin: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${reportTitle}</h1>
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>
        
        <button class="print-button" onclick="window.print()">Save PDF</button>
  `;

  // summary metrics
  if (reportData.summary) {
    htmlContent += `
      <div class="section">
        <h2>Summary Metrics</h2>
        <div class="metrics">
    `;
    
    Object.entries(reportData.summary).forEach(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      htmlContent += `
        <div class="metric">
          <div class="metric-value">${value}</div>
          <div class="metric-label">${label}</div>
        </div>
      `;
    });
    
    htmlContent += '</div></div>';
  }

  // adds report-specific data
  if (selectedReport === 'usage-stats' && reportData.topRequestedItems) {
    htmlContent += `
      <div class="section">
        <h2>Top Requested Items</h2>
        <table>
          <thead>
            <tr><th>Rank</th><th>Name</th><th>Category</th><th>Requests</th><th>Utilization</th></tr>
          </thead>
          <tbody>
    `;
    
    reportData.topRequestedItems.forEach((item, index) => {
      htmlContent += `
        <tr>
          <td>${index + 1}</td>
          <td>${item.name}</td>
          <td>${item.category}</td>
          <td>${item.totalRequests}</td>
          <td>${item.utilizationRate}%</td>
        </tr>
      `;
    });
    
    htmlContent += '</tbody></table></div>';
  }

  if (selectedReport === 'user-activity' && reportData.mostActiveUsers) {
    htmlContent += `
      <div class="section">
        <h2>Most Active Users</h2>
        <table>
          <thead>
            <tr><th>Rank</th><th>Name</th><th>Email</th><th>Requests</th><th>Approval Rate</th></tr>
          </thead>
          <tbody>
    `;
    
    reportData.mostActiveUsers.slice(0, 10).forEach((user, index) => {
      htmlContent += `
        <tr>
          <td>${index + 1}</td>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.totalRequests}</td>
          <td>${user.approvalRate}%</td>
        </tr>
      `;
    });
    
    htmlContent += '</tbody></table></div>';
  }

  htmlContent += '</body></html>';

  // opens new window, for print
  const printWindow = window.open('', '_blank');
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // focuses on the window
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 1000); // delay 
};

const exportToCSV = () => {
  let csvContent = '';
  const reportTitle = reportTypes.find(r => r.id === selectedReport)?.label;
  
  // header
  csvContent += `${reportTitle} Report\n`;
  csvContent += `Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n\n`;
  
  // report specific data
  if (reportData.summary) {
    csvContent += 'Summary Metrics\n';
    Object.entries(reportData.summary).forEach(([key, value]) => {
      csvContent += `${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())},${value}\n`;
    });
    csvContent += '\n';
  }
  
  // adds detailed report-specific data
  if (selectedReport === 'usage-stats' && reportData.topRequestedItems) {
    csvContent += 'Top Requested Items\n';
    csvContent += 'Rank,Name,Category,Total Requests,Utilization Rate\n';
    reportData.topRequestedItems.forEach((item, index) => {
      csvContent += `${index + 1},${item.name},${item.category},${item.totalRequests},${item.utilizationRate}%\n`;
    });
  }
  
  if (selectedReport === 'user-activity' && reportData.mostActiveUsers) {
    csvContent += 'Most Active Users\n';
    csvContent += 'Rank,Name,Email,Total Requests,Approval Rate\n';
    reportData.mostActiveUsers.forEach((user, index) => {
      csvContent += `${index + 1},${user.name},${user.email},${user.totalRequests},${user.approvalRate}%\n`;
    });
  }
  
  // creates and downloads file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  const generateReport = async (reportType, dateRange = 30) => {
    setLoading(true);
    setError('');
    setSelectedReport(reportType);
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportType,
          dateRange,
        }),
      });

      if (!response.ok)
        throw new Error(`${response.status}`);

      const data = await response.json();
      setReportData(data);
    } 
    catch (err) {
      setError(err.message || 'Failed to generate report');
      console.error('Error generating report:', err);
    } finally {
      setLoading(false);
    }
  };

  // renders usage stats
  const renderUsageStats = (data) => (
    <div className="space-y-6 bg-[#0a0a0a]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              {data.summary.approvalRate}% approval rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Users making requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Approval Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.averageApprovalTime}h</div>
            <p className="text-xs text-muted-foreground">Average processing time</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.requestTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Requested Items with Labels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topRequestedItems.map((item, index) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {labels.length > 0 && labels.filter(label => label.id === item.id).length !== 0 && (
                        <>
                          <span className="mr-1 text-sm text-zinc-300 font-medium">Labels:</span>
                          {labels
                            .filter(label => label.id === item.id)
                            .map((label) => (
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
                      )}
                      {labels.filter(label => label.id === item.id).length === 0 && (
                        <span className="text-sm text-zinc-400 italic">No labels yet</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{item.totalRequests} requests</p>
                  <p className="text-sm text-muted-foreground">{item.utilizationRate}% of requests</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUserActivity = (data) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.summary.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {((data.summary.activeUsers / data.summary.totalUsers) * 100).toFixed(1)}% engagement
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Requests</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.averageRequestsPerUser}</div>
            <p className="text-xs text-muted-foreground">Per active user</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{data.summary.adminUsers}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Engagement Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(data.userEngagement).map(([key, value]) => ({
              name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
              value
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Most Active Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.mostActiveUsers.slice(0, 10).map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{user.totalRequests} requests</p>
                  <p className="text-sm text-muted-foreground">{user.approvalRate}% approved</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderReportContent = () => {
    if (!reportData) return null;

    switch (selectedReport) {
      case 'usage-stats':
        return renderUsageStats(reportData);
      case 'user-activity':
        return renderUserActivity(reportData);
      default:
        return null;
    }
  };

  return (
   <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <FileText className="h-4 w-4" />
          <span>Export/View Stats</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <DropdownMenuItem
              key={report.id}
              onClick={() => generateReport(report.id)}
              disabled={loading}
              className="flex items-center space-x-3 p-3"
            >
              <Icon className="h-5 w-5" />
              <div className="flex-1">
                <p className="font-medium">{report.label}</p>
                <p className="text-sm text-muted-foreground">{report.description}</p>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
      {reportData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-6xl max-h-[90vh] overflow-auto bg-[#0a0a0a]">
          <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-transparent border-b z-10">
            <div>
              <CardTitle className="flex items-center space-x-2">
                {reportTypes.find(r => r.id === selectedReport)?.icon && 
                  React.createElement(reportTypes.find(r => r.id === selectedReport).icon, { className: "h-5 w-5" })
                }
                <span>{reportTypes.find(r => r.id === selectedReport)?.label}</span>
              </CardTitle>
              <CardDescription>
                Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button className='cursor-pointer hover:-translate-y-1 duration-300' style={{backgroundColor: "#171717"}} variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button className='cursor-pointer hover:-translate-y-1 duration-300' style={{backgroundColor: "#171717"}} variant="outline" size="sm" onClick={exportToPDF}>
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setReportData(null)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4 cursor-pointer hover:-translate-y-1 duration-300" style={{color: "white"}}  />
              </Button>
            </div>
          </CardHeader>
            <CardContent>
              {renderReportContent()}
            </CardContent>
          </Card>
        </div>
      )}

    {loading && (
          <div className="text-center -mt-12">
            <div className="animate-spin rounded-full h-8 w-8 mb-4"></div>
            <p className="text-zinc-400 italic">Generating report
              <span className='font-black animate-pulse ease-in- ml-1'>.</span>
              <span className='font-black animate-pulse ease-in-out'>.</span>
              <span className='font-black animate-pulse ease-in-out'>.</span>
            </p>
          </div>
     )}

    {error && (
      <Alert variant="destructive" className="mt-4">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )}

  </DropdownMenu>
  );
};
