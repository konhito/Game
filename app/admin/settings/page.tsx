"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Save, RefreshCw, DollarSign, Gift, Settings as SettingsIcon, TrendingUp, Plus, Trash2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Setting {
  id: number;
  setting_key: string;
  setting_value: string;
  data_type: string;
  category: string;
  description: string;
  is_editable: boolean;
  parsed_value: any;
}

interface GroupedSettings {
  [category: string]: Setting[];
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<GroupedSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedValues, setEditedValues] = useState<{ [key: string]: any }>({});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newSetting, setNewSetting] = useState({
    key: '',
    value: '',
    data_type: 'string',
    category: 'general',
    description: '',
    is_editable: true
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem("auth_token");
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_URL || 'https://pinecrest.konhito.me';
      
      const response = await fetch(`${API_BASE}/api/settings/admin`, {
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }

      const data = await response.json();
      setSettings(data.data.settings);
      
      // Initialize edited values
      const initial: { [key: string]: any } = {};
      Object.values(data.data.settings).flat().forEach((setting: Setting) => {
        initial[setting.setting_key] = setting.parsed_value;
      });
      setEditedValues(initial);
      
      toast.success("Settings loaded successfully");
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (key: string, value: any, dataType: string) => {
    setEditedValues(prev => ({
      ...prev,
      [key]: dataType === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      const authToken = localStorage.getItem("auth_token");
      
      // Prepare settings array
      const settingsArray = Object.entries(editedValues).map(([key, value]) => ({
        key,
        value
      }));

      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_URL || 'https://pinecrest.konhito.me';
      const response = await fetch(`${API_BASE}/api/settings/batch`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ settings: settingsArray }),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      const data = await response.json();
      
      if (data.data.errors && data.data.errors.length > 0) {
        toast.warning(`Saved ${data.data.updated.length} settings, ${data.data.errors.length} errors`);
      } else {
        toast.success(`All settings saved successfully`);
      }
      
      // Refresh settings
      await fetchSettings();
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSingle = async (key: string) => {
    try {
      const authToken = localStorage.getItem("auth_token");
      
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_URL || 'https://pinecrest.konhito.me';
      const response = await fetch(`${API_BASE}/api/settings/${key}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value: editedValues[key] }),
      });

      if (!response.ok) {
        throw new Error("Failed to save setting");
      }

      toast.success("Setting updated successfully");
      await fetchSettings();
    } catch (error) {
      console.error("Error saving setting:", error);
      toast.error("Failed to save setting");
    }
  };

  const handleCreateSetting = async () => {
    try {
      if (!newSetting.key || !newSetting.value) {
        toast.error("Key and value are required");
        return;
      }

      const authToken = localStorage.getItem("auth_token");
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_URL || 'https://pinecrest.konhito.me';
      const response = await fetch(`${API_BASE}/api/settings`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSetting),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create setting");
      }

      toast.success("Setting created successfully");
      setShowCreateDialog(false);
      setNewSetting({
        key: '',
        value: '',
        data_type: 'string',
        category: 'general',
        description: '',
        is_editable: true
      });
      await fetchSettings();
    } catch (error: any) {
      console.error("Error creating setting:", error);
      toast.error(error.message || "Failed to create setting");
    }
  };

  const handleDeleteSetting = async (key: string) => {
    if (!confirm(`Are you sure you want to delete the setting "${key}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const authToken = localStorage.getItem("auth_token");
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_URL || 'https://pinecrest.konhito.me';
      const response = await fetch(`${API_BASE}/api/settings/${key}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete setting");
      }

      toast.success("Setting deleted successfully");
      await fetchSettings();
    } catch (error) {
      console.error("Error deleting setting:", error);
      toast.error("Failed to delete setting");
    }
  };

  const renderSettingInput = (setting: Setting) => {
    const value = editedValues[setting.setting_key] ?? setting.parsed_value;
    
    if (!setting.is_editable) {
      return (
        <div className="p-2 bg-muted rounded text-sm text-muted-foreground">
          {value?.toString() || 'N/A'} (Read-only)
        </div>
      );
    }

    if (setting.data_type === 'json') {
      return (
        <div className="space-y-2">
          <textarea
            value={typeof value === 'string' ? value : JSON.stringify(value)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleValueChange(setting.setting_key, parsed, setting.data_type);
              } catch {
                // Invalid JSON, just store as string temporarily
                handleValueChange(setting.setting_key, e.target.value, setting.data_type);
              }
            }}
            className="w-full p-2 border rounded-md font-mono text-sm min-h-[80px]"
            placeholder="Enter JSON value"
          />
          <p className="text-xs text-muted-foreground">
            Current: {JSON.stringify(value)}
          </p>
        </div>
      );
    }

    if (setting.data_type === 'boolean') {
      return (
        <select
          value={value?.toString() || 'false'}
          onChange={(e) => handleValueChange(setting.setting_key, e.target.value === 'true', setting.data_type)}
          className="w-full p-2 border rounded-md"
        >
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      );
    }

    return (
      <Input
        type={setting.data_type === 'number' ? 'number' : 'text'}
        value={value?.toString() || ''}
        onChange={(e) => handleValueChange(setting.setting_key, e.target.value, setting.data_type)}
        step={setting.data_type === 'number' ? 'any' : undefined}
        placeholder={`Enter ${setting.data_type} value`}
      />
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bonuses':
        return <Gift className="h-5 w-5" />;
      case 'rewards':
        return <TrendingUp className="h-5 w-5" />;
      case 'limits':
        return <SettingsIcon className="h-5 w-5" />;
      default:
        return <DollarSign className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'bonuses':
        return 'text-green-600 bg-green-100';
      case 'rewards':
        return 'text-blue-600 bg-blue-100';
      case 'limits':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-purple-600 bg-purple-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              System Settings
            </h1>
            <p className="text-muted-foreground mt-2">
              Configure bonuses, rewards, and system limits
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={fetchSettings}
              variant="outline"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-green-600 text-white hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Setting
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Setting</DialogTitle>
                  <DialogDescription>
                    Add a new system setting that can be configured
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="new-key">Setting Key</Label>
                    <Input
                      id="new-key"
                      value={newSetting.key}
                      onChange={(e) => setNewSetting({...newSetting, key: e.target.value})}
                      placeholder="e.g., max_daily_tasks"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-value">Value</Label>
                    <Input
                      id="new-value"
                      value={newSetting.value}
                      onChange={(e) => setNewSetting({...newSetting, value: e.target.value})}
                      placeholder="Enter value"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-type">Data Type</Label>
                    <Select value={newSetting.data_type} onValueChange={(value) => setNewSetting({...newSetting, data_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="new-category">Category</Label>
                    <Select value={newSetting.category} onValueChange={(value) => setNewSetting({...newSetting, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="rewards">Rewards</SelectItem>
                        <SelectItem value="bonuses">Bonuses</SelectItem>
                        <SelectItem value="limits">Limits</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="new-description">Description</Label>
                    <Input
                      id="new-description"
                      value={newSetting.description}
                      onChange={(e) => setNewSetting({...newSetting, description: e.target.value})}
                      placeholder="Describe what this setting does"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateSetting}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              onClick={handleSaveAll}
              disabled={saving}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save All
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search settings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue={Object.keys(settings)[0] || 'general'} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-fit">
          {Object.keys(settings).map((category) => (
            <TabsTrigger key={category} value={category} className="capitalize">
              <span className="flex items-center gap-2">
                {getCategoryIcon(category)}
                {category}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(settings).map(([category, categorySettings]) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              {categorySettings.map((setting) => (
                <Card key={setting.setting_key} className="overflow-hidden">
                  <CardHeader className={`${getCategoryColor(category)} pb-3`}>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getCategoryIcon(category)}
                      {setting.setting_key.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </CardTitle>
                    {setting.description && (
                      <CardDescription className="text-xs">
                        {setting.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={setting.setting_key} className="text-sm font-medium">
                          Value ({setting.data_type})
                        </Label>
                        <div className="mt-2">
                          {renderSettingInput(setting)}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {setting.is_editable && (
                          <>
                            <Button
                              onClick={() => handleSaveSingle(setting.setting_key)}
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              <Save className="h-3 w-3 mr-2" />
                              Save
                            </Button>
                            <Button
                              onClick={() => handleDeleteSetting(setting.setting_key)}
                              variant="destructive"
                              size="sm"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

