import { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eraser, Check, X } from 'lucide-react';

interface SignatureCanvasProps {
  open: boolean;
  onClose: () => void;
  onAccept: (dataUrl: string) => void;
}

const SignatureCanvas = ({ open, onClose, onAccept }: SignatureCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);

  const getCtx = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      const ctx = getCtx();
      if (!ctx || !canvasRef.current) return;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setHasContent(false);
    }, 50);
    return () => clearTimeout(timer);
  }, [open, getCtx]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      const touch = e.touches[0];
      return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const ctx = getCtx();
    if (!ctx) return;
    setIsDrawing(true);
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const ctx = getCtx();
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasContent(true);
  };

  const stopDraw = () => setIsDrawing(false);

  const clearCanvas = () => {
    const ctx = getCtx();
    if (!ctx || !canvasRef.current) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHasContent(false);
  };

  const accept = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Convert white to transparent
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) {
        data[i + 3] = 0; // Make white pixels transparent
      }
    }
    ctx.putImageData(imageData, 0, 0);
    onAccept(canvas.toDataURL('image/png'));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Draw Your Signature</DialogTitle>
        </DialogHeader>
        <div className="border rounded-lg overflow-hidden bg-white">
          <canvas
            ref={canvasRef}
            width={480}
            height={160}
            className="w-full cursor-crosshair touch-none"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />
        </div>
        <p className="text-xs text-muted-foreground text-center">Use your mouse or finger to draw your signature</p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={clearCanvas}>
            <Eraser className="mr-1 h-3 w-3" /> Clear
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="mr-1 h-3 w-3" /> Cancel
          </Button>
          <Button size="sm" onClick={accept} disabled={!hasContent}>
            <Check className="mr-1 h-3 w-3" /> Use This Signature
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignatureCanvas;
