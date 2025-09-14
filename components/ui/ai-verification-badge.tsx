import { Badge } from "@/components/ui/badge";
import { Bot, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

interface AIVerificationBadgeProps {
  verified?: boolean;
  confidence?: number;
  reason?: string;
  status?: 'approved' | 'rejected' | 'pending';
  reviewedBy?: number;
  provider?: 'openai' | 'gemini' | 'basic';
  className?: string;
}

export function AIVerificationBadge({ 
  verified, 
  confidence, 
  reason, 
  status,
  reviewedBy,
  provider,
  className = "" 
}: AIVerificationBadgeProps) {
  // If reviewed by AI (reviewed_by = 0)
  const isAIReviewed = reviewedBy === 0;
  
  // If no AI verification data, show based on status
  if (verified === undefined && status) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {status === 'approved' && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            {isAIReviewed ? 'AI Approved' : 'Approved'}
          </Badge>
        )}
        {status === 'rejected' && (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            {isAIReviewed ? 'AI Rejected' : 'Rejected'}
          </Badge>
        )}
        {status === 'pending' && (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        )}
      </div>
    );
  }

  // Show AI verification result
  if (verified !== undefined) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge 
          variant="outline" 
          className={`${
            verified 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          <Bot className="h-3 w-3 mr-1" />
          {provider === 'gemini' ? 'Gemini' : provider === 'basic' ? 'Basic' : 'AI'} {verified ? 'Verified' : 'Rejected'}
        </Badge>
        
        {confidence !== undefined && (
          <Badge variant="secondary" className="text-xs">
            {confidence}% confidence
          </Badge>
        )}
        
        {reason && (
          <div className="text-xs text-gray-600 max-w-xs truncate" title={reason}>
            {reason}
          </div>
        )}
      </div>
    );
  }

  return null;
}

export function AIVerificationDetails({ 
  verified, 
  confidence, 
  reason 
}: {
  verified?: boolean;
  confidence?: number;
  reason?: string;
}) {
  if (verified === undefined) return null;

  return (
    <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <Bot className="h-4 w-4 text-blue-600" />
        <span className="font-medium text-sm">AI Verification Result</span>
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Status:</span>
          <Badge 
            variant={verified ? "default" : "destructive"}
            className="text-xs"
          >
            {verified ? 'Verified' : 'Rejected'}
          </Badge>
        </div>
        
        {confidence !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Confidence:</span>
            <div className="flex items-center gap-2">
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    confidence >= 80 ? 'bg-green-500' : 
                    confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${confidence}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">{confidence}%</span>
            </div>
          </div>
        )}
        
        {reason && (
          <div>
            <span className="text-sm font-medium">Reason:</span>
            <p className="text-sm text-gray-600 mt-1">{reason}</p>
          </div>
        )}
      </div>
    </div>
  );
}
