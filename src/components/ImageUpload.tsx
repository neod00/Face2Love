import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Upload, AlertCircle, Loader2 } from 'lucide-react';
import { detectFaceInImage } from '@/lib/faceDetection';

interface ImageUploadProps {
  onImageSelect: (file: File, preview: string) => void;
  isLoading?: boolean;
  onError?: (error: string) => void;
}

export default function ImageUpload({ onImageSelect, isLoading = false, onError }: ImageUploadProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  const validateFile = (file: File): boolean => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validTypes = ['image/jpeg', 'image/png'];

    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload JPG or PNG.');
      return false;
    }

    if (file.size > maxSize) {
      setError('File size exceeds 10MB limit.');
      return false;
    }

    setError(null);
    return true;
  };

  const handleFile = async (file: File) => {
    if (!validateFile(file)) return;

    setIsDetecting(true);
    setError(null);

    try {
      // Detect face in image
      const detectionResult = await detectFaceInImage(file);

      if (!detectionResult.hasFace) {
        const errorMsg = detectionResult.error || 'Unable to detect face in image';
        setError(errorMsg);
        if (onError) onError(errorMsg);
        setIsDetecting(false);
        return;
      }

      // Face detected successfully
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        setIsDetecting(false);
        onImageSelect(file, preview);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error detecting face:', err);
      const errorMsg = 'Error analyzing image. Please try again.';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      setIsDetecting(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-300 ease-out
          ${dragActive 
            ? 'border-primary bg-primary/5 scale-105' 
            : 'border-border bg-card hover:border-primary/50 hover:bg-primary/2'
          }
          ${isLoading || isDetecting ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleChange}
          disabled={isLoading || isDetecting}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            {isDetecting ? (
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-primary" />
            )}
          </div>

          <div>
            <p className="text-lg font-semibold text-foreground mb-1">
              {isDetecting ? (t('detecting_face') || 'Detecting face...') : t('upload_placeholder')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('upload_hint')}
            </p>
          </div>

          <Button
            variant="default"
            size="lg"
            disabled={isLoading || isDetecting}
            className="mt-2"
          >
            {isDetecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {t('detecting_face') || 'Detecting...'}
              </>
            ) : (
              t('upload_button')
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-destructive mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">
              {t('error_face_detection') || 'Face Detection Error'}
            </p>
            <p className="text-sm text-destructive/80 mt-1">{error}</p>
            <p className="text-xs text-destructive/70 mt-2">
              {t('face_detection_hint') || 'Please upload a clear photo with your face clearly visible.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
