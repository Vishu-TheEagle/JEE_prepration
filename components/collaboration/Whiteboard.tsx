import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import Card from '../common/Card';
import Button from '../common/Button';
import { PencilSquareIcon, TrashIcon } from '../icons/HeroIcons';

const COLORS = ['#FFFFFF', '#EF4444', '#3B82F6', '#22C55E', '#FBBF24']; // White, Red, Blue, Green, Yellow

interface WhiteboardProps {
    socket: Socket | null;
    roomId?: string;
}

interface DrawData {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    color: string;
    brushSize: number;
}

const Whiteboard: React.FC<WhiteboardProps> = ({ socket, roomId }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState(COLORS[0]);
    const [brushSize, setBrushSize] = useState(3);
    const currentDrawRef = useRef<{ x: number, y: number } | null>(null);

    const getContext = () => canvasRef.current?.getContext('2d');

    const drawLine = useCallback((data: DrawData, emit: boolean = false) => {
        const context = getContext();
        if (!context) return;

        context.beginPath();
        context.moveTo(data.x0, data.y0);
        context.lineTo(data.x1, data.y1);
        context.strokeStyle = data.color;
        context.lineWidth = data.brushSize;
        context.stroke();
        context.closePath();

        if (emit && socket) {
            socket.emit('whiteboard-draw', { roomId, data });
        }
    }, [socket, roomId]);

    const handleClearCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const context = getContext();
            context?.clearRect(0, 0, canvas.width, canvas.height);
        }
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const setCanvasDimensions = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            const context = canvas.getContext('2d');
            context?.scale(dpr, dpr);
        };
        
        setCanvasDimensions();
        
        const resizeObserver = new ResizeObserver(() => {
            // A real implementation would redraw the canvas content on resize
            setCanvasDimensions();
        });
        resizeObserver.observe(canvas.parentElement!);

        if (socket) {
            socket.on('whiteboard-draw', (data: DrawData) => drawLine(data));
            socket.on('whiteboard-clear', handleClearCanvas);
        }

        return () => {
            resizeObserver.disconnect();
            if (socket) {
                socket.off('whiteboard-draw');
                socket.off('whiteboard-clear');
            }
        };

    }, [socket, drawLine, handleClearCanvas]);

    const startDrawing = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
        const { offsetX, offsetY } = nativeEvent;
        setIsDrawing(true);
        currentDrawRef.current = { x: offsetX, y: offsetY };
    };

    const finishDrawing = () => {
        setIsDrawing(false);
        currentDrawRef.current = null;
    };

    const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !currentDrawRef.current) return;
        const { offsetX, offsetY } = nativeEvent;
        
        const data: DrawData = {
            x0: currentDrawRef.current.x,
            y0: currentDrawRef.current.y,
            x1: offsetX,
            y1: offsetY,
            color,
            brushSize
        };
        drawLine(data, true);
        currentDrawRef.current = { x: offsetX, y: offsetY };
    };
    
    const clearCanvas = () => {
        handleClearCanvas();
        if (socket) {
            socket.emit('whiteboard-clear', roomId);
        }
    }
    
    const setEraser = () => {
        setColor('#1F2937'); // bg-gray-800
        setBrushSize(20);
    }
    
    const setPen = () => {
        setColor(COLORS[0]); // Default to white
        setBrushSize(3);
    }

    return (
        <Card className="flex-1 flex flex-col p-2">
             <div className="flex-shrink-0 p-2 mb-2 bg-gray-900/50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button onClick={setPen} size="sm" variant="secondary" leftIcon={<PencilSquareIcon className="w-4 h-4"/>}>Pen</Button>
                    {COLORS.map(c => (
                        <button key={c} onClick={() => {setColor(c); setBrushSize(3)}} style={{backgroundColor: c}} className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-cyan-400' : 'border-gray-500'}`}></button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                     <Button onClick={setEraser} size="sm" variant="secondary">Eraser</Button>
                     <Button onClick={clearCanvas} size="sm" variant="secondary" leftIcon={<TrashIcon className="w-4 h-4"/>}>Clear</Button>
                </div>
            </div>
            <div className="flex-1 bg-gray-800 rounded-lg overflow-hidden">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseUp={finishDrawing}
                    onMouseMove={draw}
                    onMouseLeave={finishDrawing}
                    className="w-full h-full cursor-crosshair"
                />
            </div>
        </Card>
    );
};

export default Whiteboard;