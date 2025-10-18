import { useState } from 'react';
import { GripVertical, AlertCircle } from 'lucide-react';

// Simple HTML5 Drag & Drop queue reordering
const DragDropQueue = ({ patients = [], onReorder }) => {
  const [items, setItems] = useState(patients);
  const [dragIndex, setDragIndex] = useState(null);

  const onDragStart = (index) => () => setDragIndex(index);
  const onDragOver = (index) => (e) => {
    e.preventDefault();
    if (dragIndex === index) return;
    const updated = [...items];
    const [removed] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, removed);
    setDragIndex(index);
    setItems(updated);
  };
  const onDrop = () => {
    setDragIndex(null);
    if (onReorder) onReorder(items);
  };

  return (
    <div className="card p-4 dark:bg-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Patient Queue</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">Drag to reorder</span>
      </div>
      <ul className="space-y-2">
        {items.map((p, idx) => (
          <li
            key={p.id || idx}
            draggable
            onDragStart={onDragStart(idx)}
            onDragOver={onDragOver(idx)}
            onDrop={onDrop}
            className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 cursor-move"
          >
            <div className="flex items-center space-x-3">
              <GripVertical className="w-4 h-4 text-gray-400" />
              <div>
                <p className="font-semibold text-gray-800 dark:text-white">{p.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{p.age} • {p.gender}</p>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
              p.urgency === 'Critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
              p.urgency === 'Urgent' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
              'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            }`}>
              {p.urgency}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
        <AlertCircle className="w-3 h-3" />
        <span>Queue priority can be adjusted manually for demonstration.</span>
      </div>
    </div>
  );
};

export default DragDropQueue;
