import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import {
  FileText,
  Heart,
  Link,
  Users,
  ClipboardList,
  Image,
  Stethoscope,
  User,
  File,
  Tag,
  Check,
  X,
  RefreshCw,
  Search,
  Filter,
  Edit2,
  Link2,
} from 'lucide-react';
import { toast } from 'sonner';

const ICON_MAP = {
  FileText: FileText,
  Heart: Heart,
  Link: Link,
  Users: Users,
  ClipboardList: ClipboardList,
  Image: Image,
  Stethoscope: Stethoscope,
  User: User,
  File: File,
};

const CATEGORY_COLORS = {
  DD214: 'bg-blue-100 text-blue-700 border-blue-200',
  STR: 'bg-purple-100 text-purple-700 border-purple-200',
  MEDICAL_RECORDS: 'bg-green-100 text-green-700 border-green-200',
  NEXUS_LETTER: 'bg-orange-100 text-orange-700 border-orange-200',
  BUDDY_STATEMENT: 'bg-pink-100 text-pink-700 border-pink-200',
  DBQ: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  IMAGING: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  CP_EXAM: 'bg-teal-100 text-teal-700 border-teal-200',
  PERSONNEL_RECORD: 'bg-amber-100 text-amber-700 border-amber-200',
  OTHER: 'bg-gray-100 text-gray-700 border-gray-200',
};

function DocumentTagger({ claimId, documents: externalDocs, conditions, onTagged }) {
  const [documents, setDocuments] = useState(externalDocs || []);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDoc, setEditingDoc] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [linkedConditions, setLinkedConditions] = useState([]);
  const [tagNotes, setTagNotes] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (externalDocs) {
      setDocuments(externalDocs);
    }
  }, [externalDocs]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/evidence/categories');
      setCategories(response.data.categories || {});
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleOpenTagDialog = (doc) => {
    setEditingDoc(doc);
    setSelectedCategory(doc.category || '');
    setLinkedConditions(doc.linked_condition_ids || []);
    setTagNotes('');
  };

  const handleTagDocument = async () => {
    if (!selectedCategory) {
      toast.error('Please select a category');
      return;
    }

    try {
      setLoading(true);
      await api.post(`/evidence/tag/${editingDoc.id}`, {
        category: selectedCategory,
        linked_condition_ids: linkedConditions,
        notes: tagNotes || null,
      });

      setDocuments(prev => prev.map(doc => 
        doc.id === editingDoc.id 
          ? { ...doc, category: selectedCategory, linked_condition_ids: linkedConditions }
          : doc
      ));

      toast.success('Document tagged successfully');
      setEditingDoc(null);
      
      if (onTagged) {
        onTagged(editingDoc.id, selectedCategory, linkedConditions);
      }
    } catch (error) {
      console.error('Failed to tag document:', error);
      toast.error('Failed to tag document');
    } finally {
      setLoading(false);
    }
  };

  const toggleConditionLink = (conditionId) => {
    setLinkedConditions(prev => 
      prev.includes(conditionId)
        ? prev.filter(id => id !== conditionId)
        : [...prev, conditionId]
    );
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
    const matchesSearch = !searchTerm || 
      doc.filename?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const untaggedCount = documents.filter(d => !d.category || d.category === 'OTHER').length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Document Tagging
            </CardTitle>
            <CardDescription>
              Categorize and link documents to conditions
            </CardDescription>
          </div>
          {untaggedCount > 0 && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
              {untaggedCount} untagged
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(categories).map(([key, cat]) => (
                <SelectItem key={key} value={key}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="h-[350px]">
          <div className="space-y-2">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <File className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No documents found</p>
              </div>
            ) : (
              filteredDocuments.map((doc) => {
                const catInfo = categories[doc.category] || {};
                const IconComponent = ICON_MAP[catInfo.icon] || File;
                const colorClass = CATEGORY_COLORS[doc.category] || CATEGORY_COLORS.OTHER;
                
                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={`p-2 rounded ${doc.category ? colorClass : 'bg-gray-100'}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{doc.filename}</div>
                      <div className="flex items-center gap-2 mt-1">
                        {doc.category ? (
                          <Badge variant="outline" className={`text-xs ${colorClass}`}>
                            {catInfo.label || doc.category}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                            Untagged
                          </Badge>
                        )}
                        {doc.linked_condition_ids?.length > 0 && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Link2 className="h-3 w-3" />
                            {doc.linked_condition_ids.length} condition(s)
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenTagDialog(doc)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        <div className="mt-4 pt-4 border-t">
          <div className="flex flex-wrap gap-2">
            {Object.entries(categories).slice(0, 5).map(([key, cat]) => {
              const count = documents.filter(d => d.category === key).length;
              return (
                <Badge
                  key={key}
                  variant="outline"
                  className={`text-xs ${CATEGORY_COLORS[key] || ''}`}
                >
                  {cat.label.split(' ')[0]}: {count}
                </Badge>
              );
            })}
          </div>
        </div>
      </CardContent>

      <Dialog open={!!editingDoc} onOpenChange={() => setEditingDoc(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tag Document</DialogTitle>
          </DialogHeader>
          
          {editingDoc && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4" />
                  <span className="font-medium text-sm truncate">{editingDoc.filename}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categories).map(([key, cat]) => {
                      const IconComponent = ICON_MAP[cat.icon] || File;
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            {cat.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {conditions && conditions.length > 0 && (
                <div className="space-y-2">
                  <Label>Link to Conditions</Label>
                  <ScrollArea className="h-[120px] border rounded-lg p-2">
                    <div className="space-y-2">
                      {conditions.map((condition) => {
                        const condId = condition.id || condition.name;
                        const condName = condition.name || condition;
                        return (
                          <div key={condId} className="flex items-center gap-2">
                            <Checkbox
                              id={`cond-${condId}`}
                              checked={linkedConditions.includes(condId)}
                              onCheckedChange={() => toggleConditionLink(condId)}
                            />
                            <Label htmlFor={`cond-${condId}`} className="text-sm cursor-pointer">
                              {condName}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              )}

              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Input
                  placeholder="Add notes about this document..."
                  value={tagNotes}
                  onChange={(e) => setTagNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDoc(null)}>
              Cancel
            </Button>
            <Button onClick={handleTagDocument} disabled={loading}>
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Tag className="h-4 w-4 mr-1" />
              )}
              Save Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default DocumentTagger;
