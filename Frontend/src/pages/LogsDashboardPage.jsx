import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  Search, 
  User, 
  Calendar, 
  Clock, 
  Globe,
  Monitor,
  LogIn,
  LogOut,
  Link as LinkIcon,
  Trash2,
  UserPlus,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import api from "@/axios/api";

const actionIcons = {
  login: <LogIn className="h-4 w-4" />,
  logout: <LogOut className="h-4 w-4" />,
  link_click: <LinkIcon className="h-4 w-4" />,
  link_added: <LinkIcon className="h-4 w-4 text-green-500" />,
  link_deleted: <Trash2 className="h-4 w-4 text-red-500" />,
  link_updated: <LinkIcon className="h-4 w-4 text-blue-500" />,
  user_registered: <UserPlus className="h-4 w-4" />
};

const actionColors = {
  login: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  logout: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  link_click: "bg-green-500/20 text-green-300 border-green-500/40",
  link_added: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  link_deleted: "bg-red-500/20 text-red-300 border-red-500/40",
  link_updated: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  user_registered: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
};

export default function LogsDashboardPage({ user, setUser }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users"); // "users" or "recent"
  const [users, setUsers] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userLogs, setUserLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);

  // Fetch users with latest activity
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/logs/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch recent logs
  const fetchRecentLogs = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`/logs/recent?page=${pageNum}&limit=100`);
      setRecentLogs(response.data.logs);
      setTotalPages(response.data.pagination.pages);
      setPage(pageNum);
    } catch (error) {
      console.error("Failed to fetch recent logs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch logs for specific user
  const fetchUserLogs = async (userId, pageNum = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`/logs/user/${userId}?page=${pageNum}&limit=50`);
      setUserLogs(response.data.logs);
      setUserTotalPages(response.data.pagination.pages);
      setUserPage(pageNum);
    } catch (error) {
      console.error("Failed to fetch user logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    if (activeTab === "users") {
      fetchUsers();
    } else {
      fetchRecentLogs();
    }
  }, [activeTab, navigate, user.role]);

  useEffect(() => {
    if (selectedUser) {
      fetchUserLogs(selectedUser._id);
    }
  }, [selectedUser]);

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const handleBackToUsers = () => {
    setSelectedUser(null);
    fetchUsers();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRecentLogs = recentLogs.filter(log =>
    log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUserLogs = userLogs.filter(log =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !selectedUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">System Logs Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Monitor user activity and system events
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-border/60 px-3 py-1">
              <User className="h-4 w-4" />
              <span className="text-sm">{user.username}</span>
              <Badge variant="outline" className="ml-2">
                {user.role}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {!selectedUser ? (
          <>
            {/* Tabs */}
            <div className="mb-8 flex gap-4 border-b border-border/40">
              <Button
                variant={activeTab === "users" ? "default" : "ghost"}
                onClick={() => setActiveTab("users")}
                className="rounded-full"
              >
                <User className="mr-2 h-4 w-4" />
                Users Activity
              </Button>
              <Button
                variant={activeTab === "recent" ? "default" : "ghost"}
                onClick={() => setActiveTab("recent")}
                className="rounded-full"
              >
                <Clock className="mr-2 h-4 w-4" />
                Recent Logs
              </Button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={`Search ${activeTab === "users" ? "users" : "logs"}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-full"
                />
              </div>
            </div>

            {activeTab === "users" ? (
              <Card>
                <CardHeader>
                  <CardTitle>User Activity</CardTitle>
                  <CardDescription>
                    {filteredUsers.length} users found • Click on a user to view their logs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Last Activity</TableHead>
                        <TableHead>Last Action</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow 
                          key={user._id} 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleUserClick(user)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{user.username}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatTimeAgo(user.lastActivity)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={actionColors[user.lastAction] || "bg-gray-500/20"}>
                              {user.lastAction.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {formatDate(user.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUserClick(user)}
                            >
                              View Logs
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Recent System Logs</CardTitle>
                  <CardDescription>
                    Latest 100 system activities • Page {page} of {totalPages}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredRecentLogs.map((log) => (
                      <div
                        key={log._id}
                        className="rounded-xl border border-border/40 bg-card/50 p-4 hover:bg-card/80 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`rounded-full p-2 ${actionColors[log.action]}`}>
                              {actionIcons[log.action] || <Clock className="h-4 w-4" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{log.username}</p>
                                <Badge variant="outline" className="text-xs">
                                  {log.role}
                                </Badge>
                                <Badge className={`text-xs ${actionColors[log.action]}`}>
                                  {log.action.replace("_", " ")}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {log.details}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(log.timestamp)}
                                </span>
                                {log.ipAddress && (
                                  <span className="flex items-center gap-1">
                                    <Globe className="h-3 w-3" />
                                    {log.ipAddress}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchRecentLogs(page - 1)}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchRecentLogs(page + 1)}
                        disabled={page === totalPages}
                      >
                        Next
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          /* User-specific logs view */
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToUsers}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Users
                  </Button>
                  <div>
                    <CardTitle className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p>{selectedUser.username}</p>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <span>{selectedUser.email}</span>
                          <Badge variant="outline">{selectedUser.role}</Badge>
                          <span className="text-xs">
                            Joined: {formatDate(selectedUser.createdAt)}
                          </span>
                        </CardDescription>
                      </div>
                    </CardTitle>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    Last activity: {formatTimeAgo(selectedUser.lastActivity)}
                  </p>
                  <p className="text-sm">
                    <Badge className={actionColors[selectedUser.lastAction]}>
                      {selectedUser.lastAction.replace("_", " ")}
                    </Badge>
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search user logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 rounded-full"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {filteredUserLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No logs found for this user.</p>
                  </div>
                ) : (
                  filteredUserLogs.map((log) => (
                    <div
                      key={log._id}
                      className="rounded-xl border border-border/40 bg-card/50 p-4 hover:bg-card/80 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`rounded-full p-2 ${actionColors[log.action]}`}>
                            {actionIcons[log.action] || <Clock className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge className={`text-xs ${actionColors[log.action]}`}>
                                {log.action.replace("_", " ")}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {formatDate(log.timestamp)}
                              </span>
                            </div>
                            <p className="mt-2">{log.details}</p>
                            {log.ipAddress && (
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <Globe className="h-3 w-3" />
                                <span>IP: {log.ipAddress}</span>
                                <Monitor className="h-3 w-3 ml-2" />
                                <span>Browser: {log.userAgent?.substring(0, 50)}...</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination for user logs */}
              {userTotalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchUserLogs(selectedUser._id, userPage - 1)}
                    disabled={userPage === 1}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {userPage} of {userTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchUserLogs(selectedUser._id, userPage + 1)}
                    disabled={userPage === userTotalPages}
                  >
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}