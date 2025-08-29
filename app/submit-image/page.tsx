"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Image as ImageIcon, 
  CheckCircle, 
  ArrowLeft,
  Camera,
  FileText,
  AlertCircle
} from "lucide-react";
import { authService } from "@/lib/auth-service";

export default function SubmitImagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    "Nature",
    "Urban",
    "Portrait",
    "Wildlife",
    "Food",
    "Art",
    "Travel",
    "Sports",
    "Architecture",
    "Other"
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert("Image size must be less than 10MB");
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert("Please select a valid image file");
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageFile || !title || !description || !category) {
      alert("Please fill in all fields and upload an image");
      return;
    }

    setLoading(true);

    try {
      // Create FormData for image upload
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);

      // In production, you would upload to your backend
      // const response = await fetch('/api/images/submit', {
      //   method: 'POST',
      //   body: formData,
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      //   }
      // });

      // For now, simulate successful submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitted(true);
      
      // Reset form
      setImageFile(null);
      setImagePreview("");
      setTitle("");
      setDescription("");
      setCategory("");
      
    } catch (error) {
      console.error('Error submitting image:', error);
      alert('Failed to submit image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Image Submitted Successfully! 🎉</h1>
          <p className="text-slate-600 mb-6 text-lg">
            Your image has been submitted for review. Our admin team will review it and award you 20 points if approved!
          </p>
          <div className="space-y-4">
            <Button
              onClick={() => setSubmitted(false)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3"
            >
              Submit Another Image
            </Button>
            <div>
              <Button
                onClick={handleBackToDashboard}
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-xl text-white font-bold">₽</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">PineCoin Casino</h1>
                <p className="text-sm text-slate-600">Submit Image for Review</p>
              </div>
            </div>
            <Button
              onClick={handleBackToDashboard}
              variant="outline"
              size="sm"
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Submit Your Image 📸</h2>
            <p className="text-slate-600 text-lg">
              Share your amazing photos and earn 20 points when approved by our admin team!
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Get 20 points + 2.00 PineCoins for each approved image</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-800">Image Submission Form</CardTitle>
                <CardDescription>
                  Fill out the form below to submit your image for review
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Image Upload */}
                  <div className="space-y-3">
                    <Label htmlFor="image" className="text-base font-medium text-slate-700">
                      Upload Image *
                    </Label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-emerald-400 transition-colors">
                      <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        required
                      />
                      <label htmlFor="image" className="cursor-pointer">
                        {imagePreview ? (
                          <div className="space-y-4">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-48 h-32 object-cover rounded-lg mx-auto shadow-lg"
                            />
                            <p className="text-sm text-slate-500">
                              Click to change image
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                              <Upload className="w-8 h-8 text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-lg font-medium text-slate-700 mb-2">
                                Click to upload or drag and drop
                              </p>
                              <p className="text-sm text-slate-500">
                                PNG, JPG, GIF up to 10MB
                              </p>
                            </div>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="space-y-3">
                    <Label htmlFor="title" className="text-base font-medium text-slate-700">
                      Image Title *
                    </Label>
                    <Input
                      id="title"
                      type="text"
                      placeholder="Enter a descriptive title for your image"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="text-base"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-base font-medium text-slate-700">
                      Description *
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your image, what makes it special, or the story behind it"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      rows={4}
                      className="text-base resize-none"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-3">
                    <Label htmlFor="category" className="text-base font-medium text-slate-700">
                      Category *
                    </Label>
                    <Select value={category} onValueChange={setCategory} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category for your image" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Guidelines */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-2">Submission Guidelines:</p>
                        <ul className="space-y-1 text-blue-700">
                          <li>• Images must be original and high quality</li>
                          <li>• No copyrighted or inappropriate content</li>
                          <li>• Maximum file size: 10MB</li>
                          <li>• Supported formats: PNG, JPG, GIF</li>
                          <li>• Admin review typically takes 24-48 hours</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={loading || !imageFile || !title || !description || !category}
                      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 mr-2" />
                          Submit Image for Review
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

