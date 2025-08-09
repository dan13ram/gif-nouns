"use client";

import { useState } from "react";
import { FileUpload } from "./FileUpload";

import { ImagePreview } from "./ImagePreview";
import { DownloadSharePage } from "./DownloadSharePage";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Icon } from "../icons";
import { useTracking } from "../analytics/Tracking";

interface NounTraits {
  eyes: string;
  noggles: string;
  background: string;
  body: string;
  head: string;
  glasses?: string;
  hat?: string;
  shirt?: string;
}

interface UploadStudioProps {
  className?: string;
  onGifCreated?: (gifData: { 
    gifUrl: string; 
    shareUrl?: string; // Supabase URL for sharing
    title: string; 
    noggleColor: string; 
    eyeAnimation: string;
    creator: {
      wallet: string;
      username: string;

    };
  }) => void;
}

type UploadStep = "upload" | "customize" | "download";

export function UploadStudio({ className = "", onGifCreated }: UploadStudioProps) {
  const [currentStep, setCurrentStep] = useState<UploadStep>("upload");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [traits, setTraits] = useState<NounTraits | null>(null);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [createdGifData, setCreatedGifData] = useState<{
    gifUrl: string;
    shareUrl?: string; // Supabase URL for sharing
    title: string;
    noggleColor: string;
    eyeAnimation: string;
    creator: {
      wallet: string;
      username: string;

    };
  } | null>(null);
  const tracking = useTracking();

  const handleFileUpload = (file: File) => {
    try {
      setError("");
      
      // Create object URL for preview
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      
      // Don't set default traits - let user select them in the customize step
      setTraits(null);
      
      // Move to customize step
      setCurrentStep("customize");
      
      // Track upload event
      tracking.uploadStart(file.name, file.size);
      
    } catch (err) {
      setError("Failed to process uploaded file");
      console.error("File processing error:", err);
    }
  };



  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleSuccess = (message: string) => {
    // Clear any existing errors and show success
    setError("");
    setSuccessMessage(message);
    // Auto-clear success message after 5 seconds
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  const handleGifCreated = (gifData: { 
    gifUrl: string; // Generated GIF URL for preview/download
    shareUrl?: string; // Supabase URL for sharing
    title: string; 
    noggleColor: string; 
    eyeAnimation: string;
    creator: {
      wallet: string;
      username: string;

    };
  }) => {
    console.log('🔄 ===== UploadStudio handleGifCreated CALLED =====');
    console.log('🔄 Received gifData:', gifData);
    console.log('🔄 Setting createdGifData...');
    setCreatedGifData(gifData);
    console.log('🔄 Changing step to download...');
    setCurrentStep("download");
    // Don't call onGifCreated here - only call it when user clicks "View in Gallery"
    console.log('🔄 ===== UploadStudio handleGifCreated COMPLETED =====');
  };

  const handleBackToCreate = () => {
    setCurrentStep("upload");
    setImageUrl("");
    setTraits(null);
    setCreatedGifData(null);
    setError("");
    setSuccessMessage("");
  };

  const handleViewInGallery = async () => {
    console.log('🔄 ===== handleViewInGallery CALLED =====');
    console.log('🔄 createdGifData:', createdGifData);
    
    if (!createdGifData) {
      console.error('❌ No GIF data available for gallery upload');
      return;
    }

    // Since the database entry is automatically created during GIF upload,
    // we just need to call the parent callback to switch to gallery view
    console.log('🔄 Database entry already exists, just switching to gallery view...');
    onGifCreated?.(createdGifData);
  };



  const renderStep = () => {
    switch (currentStep) {
      case "upload":
        return (
          <FileUpload
            onFileSelect={handleFileUpload}
            onError={handleError}
            className="max-w-2xl mx-auto"
          />
        );



      case "customize":
        return (
          <ImagePreview
            originalImageUrl={imageUrl}
            traits={traits}
            onError={handleError}
            onSuccess={handleSuccess}
            onGifCreated={handleGifCreated}
            className="max-w-6xl mx-auto"
          />
        );

      case "download":
        console.log('🔄 ===== RENDERING DOWNLOAD STEP =====');
        console.log('🔄 Current step:', currentStep);
        console.log('🔄 createdGifData:', createdGifData);
        console.log('🔄 createdGifData type:', typeof createdGifData);
        console.log('🔄 createdGifData is null?', createdGifData === null);
        console.log('🔄 createdGifData is undefined?', createdGifData === undefined);
        
        if (!createdGifData) {
          console.error('❌ createdGifData is null/undefined in download step');
          console.error('❌ This means handleGifCreated was not called properly');
          return (
            <div className="text-center p-8">
              <p className="text-red-600 dark:text-red-400 mb-4">
                Error: GIF data not found. Please try creating the GIF again.
              </p>
              <Button onClick={handleBackToCreate} variant="outline">
                Back to Create
              </Button>
            </div>
          );
        }
        return (
          <DownloadSharePage
            gifUrl={createdGifData.gifUrl}
            shareUrl={createdGifData.shareUrl}
            title={createdGifData.title}
            noggleColor={createdGifData.noggleColor}
            eyeAnimation={createdGifData.eyeAnimation}
            creator={createdGifData.creator}
            onBackToCreate={handleBackToCreate}
            onViewInGallery={handleViewInGallery}
            className="max-w-6xl mx-auto"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 ${className}`}>
      <div className="max-w-sm mx-auto px-3 py-3 sm:max-w-md sm:px-4 sm:py-4 md:max-w-2xl lg:max-w-7xl lg:px-8">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
            GifNouns
          </h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-center space-x-1 sm:space-x-2">
            {[
              { step: "upload", label: "Upload", icon: "upload" },
              { step: "customize", label: "Customize", icon: "palette" },
              { step: "download", label: "Download", icon: "download" },
            ].map((stepInfo, index) => {
              const isActive = currentStep === stepInfo.step;
              const isCompleted = [
                "customize", "download"
              ].includes(currentStep) && index < [
                "customize", "download"
              ].indexOf(currentStep) + 1;

              return (
                <div key={stepInfo.step} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all duration-300 ${
                    isActive 
                      ? "border-purple-500 bg-purple-500 text-white" 
                      : isCompleted
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500"
                  }`}>
                    <Icon name={stepInfo.icon} size="sm" />
                  </div>
                  <span className={`ml-1 sm:ml-2 text-xs sm:text-sm font-medium ${
                    isActive 
                      ? "text-purple-600 dark:text-purple-400" 
                      : isCompleted
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}>
                    {stepInfo.label}
                  </span>
                  {index < 2 && (
                    <div className={`w-4 sm:w-8 h-0.5 mx-1 sm:mx-2 ${
                      isCompleted ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 sm:mb-6">
            <Card variant="default" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <div className="p-3 sm:p-4 flex items-start space-x-2">
                <Icon name="close" className="text-red-500 flex-shrink-0 mt-0.5" size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-red-700 dark:text-red-300 font-medium text-sm sm:text-base">Error</p>
                  <p className="text-red-600 dark:text-red-400 text-xs sm:text-sm break-words">{error}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError("")}
                  className="flex-shrink-0"
                >
                  <span className="sr-only">Dismiss</span>
                  <Icon name="close" size="sm" />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Success Display */}
        {successMessage && (
          <div className="mb-4 sm:mb-6">
            <Card variant="default" className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <div className="p-3 sm:p-4 flex items-start space-x-2">
                <Icon name="check" className="text-green-500 flex-shrink-0 mt-0.5" size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-green-700 dark:text-green-300 font-medium text-sm sm:text-base">Success!</p>
                  <p className="text-green-600 dark:text-green-400 text-xs sm:text-sm break-words">{successMessage}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSuccessMessage("")}
                  className="flex-shrink-0"
                >
                  <span className="sr-only">Dismiss</span>
                  <Icon name="close" size="sm" />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className="min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]">
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="text-center mt-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Built with ❤️ for the Nouns community
          </p>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <span className="text-xs text-gray-400 dark:text-gray-500">Base L2</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">Farcaster Native</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">Open Source</span>
          </div>
        </div>
      </div>
    </div>
  );
} 