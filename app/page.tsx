"use client";
import { Quicksand } from 'next/font/google';
import { useState, useEffect, useRef } from "react";
const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['400','500','700'],
});
import Head from "next/head";
import {
  FiTrash,
  FiEdit2,
  FiCheckSquare,
  FiChevronDown,
  FiPlus,
  FiX,
  FiXCircle,
  FiSun,
  FiMoon,
  FiCalendar,
  FiFlag,
  FiSearch,
  FiMove,
  FiClock,
  FiUser,
  FiArchive,
  FiCopy,
  FiMoreHorizontal,
  FiCheck,
} from "react-icons/fi";

interface Task {
  id: number;
  title: string;
  description: string;
  column: string;
  priority?: string;
  dueDate?: string;
  completed?: boolean;
  createdAt: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color?: string;
}

interface Board {
  columns: Column[];
}

const TrelloClone = () => {
  const isTouchDevice = typeof window !== "undefined" && "ontouchstart" in window;
  const [board, setBoard] = useState<Board>({
    columns: [
      { id: "todo", title: "To Do", tasks: [], color: "#818cf8" },
      { id: "inprogress", title: "In Progress", tasks: [], color: "#f59e0b" },
      { id: "done", title: "Done", tasks: [], color: "#10b981" },
    ],
  });
  const [boardName, setBoardName] = useState("My Board");
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const draggedTaskRef = useRef<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [userName, setUserName] = useState("User");
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedTaskForMove, setSelectedTaskForMove] = useState<Task | null>(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [showBoardNameModal, setShowBoardNameModal] = useState(false);
  const [boardNameInput, setBoardNameInput] = useState(boardName);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [profileNameInput, setProfileNameInput] = useState(userName);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [newColumnColor, setNewColumnColor] = useState("#818cf8");

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const saveTaskEdit = (updatedTask: Task) => {
    setBoard(prev => {
      const newColumns = prev.columns.map(col => {
        if (col.id === updatedTask.column) {
          return {
            ...col,
            tasks: col.tasks.map(task =>
              task.id === updatedTask.id ? updatedTask : task
            ),
          };
        }
        return col;
      });
      return { columns: newColumns };
    });
    setShowEditTaskModal(false);
    setTaskToEdit(null);
  };

  const handleMobileTaskMove = (task: Task) => {
    setSelectedTaskForMove(task);
    setShowMoveModal(true);
  };

  const moveTaskToColumn = (taskId: number, targetColumnId: string) => {
    setBoard(prev => {
      const sourceColumn = prev.columns.find(col => 
        col.tasks.some(task => task.id === taskId)
      );
      const targetColumn = prev.columns.find(col => col.id === targetColumnId);
      
      if (!sourceColumn || !targetColumn) return prev;
      
      const taskToMove = sourceColumn.tasks.find(task => task.id === taskId);
      if (!taskToMove) return prev;
      
      const updatedSourceTasks = sourceColumn.tasks.filter(t => t.id !== taskId);
      const updatedTargetTasks = [...targetColumn.tasks, { ...taskToMove, column: targetColumnId }];
      
      return {
        columns: prev.columns.map(col => {
          if (col.id === sourceColumn.id) return { ...col, tasks: updatedSourceTasks };
          if (col.id === targetColumn.id) return { ...col, tasks: updatedTargetTasks };
          return col;
        }),
      };
    });
    setShowMoveModal(false);
    setSelectedTaskForMove(null);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", task.id.toString());

    draggedTaskRef.current = task;
    setDraggedTask(task);
  };

const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, columnId: string) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  setDragOverColumn(columnId);
};

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.currentTarget === e.target) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, columnId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const taskBeingDragged = draggedTaskRef.current;
    if (!taskBeingDragged) return;

    if (columnId === taskBeingDragged.column) {
      setDraggedTask(null);
      setDragOverColumn(null);
      return;
    }

    moveTaskToColumn(taskBeingDragged.id, columnId);

    draggedTaskRef.current = null;
    setDraggedTask(null);
    setDragOverColumn(null);
  };


  const handleAddTask = (columnId: string, task: Task) => {
    setBoard(prev => ({
      columns: prev.columns.map(col =>
        col.id === columnId ? { ...col, tasks: [...col.tasks, task] } : col
      ),
    }));
  };

  const handleRemoveTask = (columnId: string, taskId: number) => {
    setBoard(prev => ({
      columns: prev.columns.map(col =>
        col.id === columnId
          ? { ...col, tasks: col.tasks.filter(t => t.id !== taskId) }
          : col
      ),
    }));
  };

  const handleToggleTaskComplete = (taskId: number) => {
    setBoard(prev => ({
      columns: prev.columns.map(col => ({
        ...col,
        tasks: col.tasks.map(task =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        ),
      })),
    }));
  };

  const handleDuplicateTask = (task: Task) => {
    const duplicatedTask: Task = {
      ...task,
      id: generateId(),
      title: `${task.title} (Copy)`,
      createdAt: new Date().toISOString(),
    };
    handleAddTask(task.column, duplicatedTask);
  };

  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) return;
    const newColumn: Column = { 
      id: newColumnTitle.toLowerCase().replace(/\s+/g, ""), 
      title: newColumnTitle, 
      tasks: [],
      color: newColumnColor
    };
    setBoard(prev => ({ columns: [...prev.columns, newColumn] }));
    setNewColumnTitle("");
    setNewColumnColor("#818cf8");
    setShowAddColumnModal(false);
  };

  const handleRemoveColumn = (columnId: string) => {
    setBoard(prev => ({
      columns: prev.columns.filter(col => col.id !== columnId),
    }));
  };

  const generateId = () => Date.now() + Math.floor(Math.random() * 1000);

  const filteredColumns = board.columns.map(column => ({
    ...column,
    tasks: column.tasks.filter(task => {
      const matchesSearch = !searchQuery || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = !filterPriority || task.priority === filterPriority;
      return matchesSearch && matchesPriority;
    })
  }));

  const TaskCard = ({ task, onRemove }: { task: Task; onRemove: () => void }) => {
  const placeholderCloneRef = useRef<HTMLDivElement | null>(null);
  const originalCardRef = useRef<HTMLDivElement | null>(null);

  const isCurrentlyDragging = draggedTask?.id === task.id;
  const [showMenu, setShowMenu] = useState(false);
  const [showActionsMobile, setShowActionsMobile] = useState(false);

  const isDraggingRef = useRef(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });

  const handleMouseDownManual = (e: React.MouseEvent<HTMLDivElement>, task: Task) => {
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
    
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    
    draggedTaskRef.current = task;
    setDraggedTask(task);

    document.addEventListener("mousemove", onFakeMouseMove);
    document.addEventListener("mouseup", onFakeMouseUp);
  };

  const onFakeMouseMove = (e: MouseEvent) => {
    e.preventDefault();
    
    const deltaX = Math.abs(e.clientX - dragStartPosRef.current.x);
    const deltaY = Math.abs(e.clientY - dragStartPosRef.current.y);
    
    if (deltaX < 5 && deltaY < 5) return;
    
    if (!placeholderCloneRef.current) {
      const originalCard = document.querySelector<HTMLElement>(
        `.task-card[data-task-id="${task.id}"]`
      );
      if (originalCard) {
        originalCardRef.current = originalCard as HTMLDivElement;
        
        originalCard.style.opacity = '0.3';
        originalCard.style.transform = 'scale(0.95)';
        originalCard.style.transition = 'all 0.2s ease';
        
        const clone = originalCard.cloneNode(true) as HTMLDivElement;
        clone.classList.add("drag-placeholder");
        clone.style.position = "fixed";
        clone.style.left = "0";
        clone.style.top = "0";
        clone.style.pointerEvents = "none";
        clone.style.opacity = "0.9";
        clone.style.transform = "rotate(5deg) scale(1.05)";
        clone.style.width = `${originalCard.offsetWidth}px`;
        clone.style.height = `${originalCard.offsetHeight}px`;
        clone.style.zIndex = "9999";
        clone.style.transition = "all 0.1s ease-out";
        clone.style.boxShadow = "0 20px 40px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.1)";
        clone.style.border = "2px solid #6366f1";
        
        document.body.appendChild(clone);
        placeholderCloneRef.current = clone;
      }
    }
    
    if (placeholderCloneRef.current) {
      placeholderCloneRef.current.style.transform = 
        `translate3d(${e.clientX - 20}px, ${e.clientY - 30}px, 0) rotate(5deg) scale(1.05)`;
    }

    highlightDropZones(e.clientX, e.clientY);
  };

  const highlightDropZones = (x: number, y: number) => {
    const columns = document.querySelectorAll<HTMLElement>(".column-wrapper");
    let foundTarget = false;
    
    columns.forEach(colEl => {
      const rect = colEl.getBoundingClientRect();
      const isOver = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      const columnId = colEl.dataset.columnId;
      
      if (isOver && columnId !== task.column) {
        colEl.style.transform = 'scale(1.02)';
        colEl.style.background = darkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)';
        colEl.style.borderColor = '#6366f1';
        colEl.style.boxShadow = '0 0 20px rgba(99, 102, 241, 0.3)';
        colEl.style.transition = 'all 0.2s ease';
        setDragOverColumn(columnId);
        foundTarget = true;
      } else {
        colEl.style.transform = '';
        colEl.style.background = '';
        colEl.style.borderColor = '';
        colEl.style.boxShadow = '';
        colEl.style.transition = 'all 0.2s ease';
      }
    });
    
    if (!foundTarget) {
      setDragOverColumn(null);
    }
  };

  const onFakeMouseUp = (e: MouseEvent) => {
    document.removeEventListener("mousemove", onFakeMouseMove);
    document.removeEventListener("mouseup", onFakeMouseUp);

    document.body.style.userSelect = '';
    document.body.style.cursor = '';

    if (originalCardRef.current) {
      originalCardRef.current.style.opacity = '';
      originalCardRef.current.style.transform = '';
      originalCardRef.current.style.transition = '';
    }

    if (placeholderCloneRef.current) {
      const placeholder = placeholderCloneRef.current;
      placeholder.style.transform += ' scale(0.8)';
      placeholder.style.opacity = '0';
      setTimeout(() => {
        if (placeholder.parentNode) {
          placeholder.remove();
        }
      }, 200);
      placeholderCloneRef.current = null;
    }

    const columns = document.querySelectorAll<HTMLElement>(".column-wrapper");
    columns.forEach(colEl => {
      colEl.style.transform = '';
      colEl.style.background = '';
      colEl.style.borderColor = '';
      colEl.style.boxShadow = '';
      colEl.style.transition = '';
    });

    if (draggedTaskRef.current) {
      const dropColumnId = detectColumnUnderPointer(e.clientX, e.clientY);
      if (dropColumnId && dropColumnId !== draggedTaskRef.current.column) {
        moveTaskToColumn(draggedTaskRef.current.id, dropColumnId);
        
        const targetColumn = document.querySelector(`[data-column-id="${dropColumnId}"]`);
        if (targetColumn) {
          targetColumn.style.background = darkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)';
          targetColumn.style.borderColor = '#22c55e';
          setTimeout(() => {
            targetColumn.style.background = '';
            targetColumn.style.borderColor = '';
          }, 500);
        }
      }
    }
    
    draggedTaskRef.current = null;
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const detectColumnUnderPointer = (x: number, y: number): string | null => {
    const columns = document.querySelectorAll<HTMLElement>(".column-wrapper");
    for (const colEl of columns) {
      const rect = colEl.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return colEl.dataset.columnId || null;
      }
    }
    return null;
  };

  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const touchMovedRef = useRef(false);

  const touchMoveListener = (e: TouchEvent) => {
    touchMovedRef.current = true;
    const touch = e.touches[0];
    if (touchStartPosRef.current) {
      const deltaX = Math.abs(touch.clientX - touchStartPosRef.current.x);
      const deltaY = Math.abs(touch.clientY - touchStartPosRef.current.y);
      if (deltaX > 5 && deltaX > deltaY) {
        handleMobileTaskMove(task);
        document.removeEventListener("touchmove", touchMoveListener);
        document.removeEventListener("touchend", touchEndListener);
      }
    }
  };

  const touchEndListener = () => {
    document.removeEventListener("touchmove", touchMoveListener);
    document.removeEventListener("touchend", touchEndListener);

    if (!touchMovedRef.current) {
      setShowActionsMobile(prev => !prev);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    touchMovedRef.current = false;

    document.addEventListener("touchmove", touchMoveListener, { passive: false });
    document.addEventListener("touchend", touchEndListener);
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case "high": return "border-red-600 bg-red-50 dark:bg-red-900/20";
      case "medium": return "border-amber-600 bg-amber-50 dark:bg-amber-900/20";
      case "low": return "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20";
      default: return "";
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <div
      ref={originalCardRef}
      onMouseDown={(e) => handleMouseDownManual(e, task)}
      onTouchStart={handleTouchStart}
      data-task-id={task.id}
      className={`task-card group relative rounded-xl shadow-sm hover:shadow-md transition-all duration-200 select-none border-2 ${showMenu ? 'z-[9999]' : ''} ${
        !isTouchDevice ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      } ${
        darkMode ? 'bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:border-slate-600' : 'bg-white/90 backdrop-blur-sm border-slate-200 hover:border-slate-300'
      } ${getPriorityColor()} ${
        task.completed ? 'opacity-75' : ''
      } ${
        isCurrentlyDragging ? 'opacity-30 scale-95' : 'hover:scale-[1.02]'
      }`}
      style={{
        transform: isCurrentlyDragging ? 'scale(0.95)' : '',
        transition: isCurrentlyDragging ? 'all 0.2s ease' : 'all 0.2s ease'
      }}
    >
      <div className="p-4">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-medium leading-snug break-words ${
              darkMode ? 'text-slate-100' : 'text-slate-900'
            } ${task.completed ? 'line-through opacity-60' : ''}`}>
              {task.title}
            </h4>
          </div>
          <div className="flex items-center gap-1">
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); handleToggleTaskComplete(task.id); setShowActionsMobile(false); }}
              className={`cursor-pointer relative z-20 p-1.5 rounded-lg transition-all opacity-100 ${
                task.completed 
                  ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' 
                  : darkMode 
                    ? 'text-slate-200 hover:bg-slate-700' 
                    : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <FiCheckSquare className="h-3.5 w-3.5" />
            </button>
            <div className="relative">
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className={`cursor-pointer relative z-20 p-1.5 rounded-lg transition-all opacity-100 ${
                  darkMode 
                    ? 'text-slate-200 hover:bg-slate-700' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FiMoreHorizontal className="h-3.5 w-3.5" />
              </button>
              {showMenu && (
                <div
                  onMouseDown={(e) => e.stopPropagation()}
                  className={`absolute right-0 top-full mt-1 py-2 w-40 rounded-xl shadow-xl border backdrop-blur-xl z-[9999] ${
                    darkMode ? 'bg-slate-800/95 border-slate-700' : 'bg-white/95 border-slate-200'
                  }`}>
                  <button
                    onClick={() => {
                      setTaskToEdit(task);
                      setShowEditTaskModal(true);
                      setShowMenu(false);
                    }}
                    className={`cursor-pointer w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      darkMode ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <FiEdit2 className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      handleMobileTaskMove(task);
                      setShowMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      darkMode ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <FiMove className="h-3.5 w-3.5" />
                    Move
                  </button>
                  <button
                    onClick={() => {
                      handleDuplicateTask(task);
                      setShowMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      darkMode ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <FiCopy className="h-3.5 w-3.5" />
                    Duplicate
                  </button>
                  <button
                    onClick={() => {
                      onRemove();
                      setShowMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      darkMode ? 'hover:bg-slate-700 text-red-400' : 'hover:bg-slate-50 text-red-600'
                    }`}
                  >
                    <FiTrash className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {task.description && (
          <p className={`text-sm mt-3 leading-relaxed break-words ${
            darkMode ? 'text-slate-300' : 'text-slate-600'
          } ${task.completed ? 'opacity-60' : ''}`}>
            {task.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          {task.dueDate && (
            <div className={`flex items-center text-xs px-2.5 py-1 rounded-full ${
              isOverdue
                ? (darkMode
                    ? 'text-red-400 bg-red-900/30 border border-red-800'
                    : 'text-white bg-red-500 border border-red-600'
                  )
                : darkMode
                  ? 'text-slate-300 bg-slate-700/50'
                  : 'text-slate-600 bg-slate-100'
            }`}>
              <FiCalendar className="mr-1 h-3 w-3" />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              {isOverdue && <FiClock className="ml-1 h-3 w-3" />}
            </div>
          )}
          {task.priority && (
            <div className={`flex items-center text-xs px-2.5 py-1 rounded-full ${
              darkMode ? 'text-slate-300 bg-slate-700/50' : 'text-slate-600 bg-slate-100'
            }`}>
              <FiFlag className="mr-1 h-3 w-3" />
              <span className="capitalize">{task.priority}</span>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};

  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [addTaskColumnId, setAddTaskColumnId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("");

  const ColumnComponent = ({ column }: { column: Column }) => {
    const isDropTarget = dragOverColumn === column.id;
    
    return (
      <div
        className={`column-wrapper flex flex-col rounded-2xl transition-all duration-300 min-h-[400px] ${
          darkMode ? 'bg-slate-900/50 backdrop-blur-xl' : 'bg-white/70 backdrop-blur-xl'
        } ${isDropTarget ? 'ring-2 ring-offset-2 ring-offset-transparent shadow-2xl' : 'hover:shadow-xl'} border ${
          darkMode ? 'border-slate-700/50' : 'border-slate-200/70'
        }`}
        data-column-id={column.id}
        style={{ 
          borderTop: `3px solid ${column.color}`,
          boxShadow: isDropTarget ? `0 20px 25px -5px ${column.color}20, 0 10px 10px -5px ${column.color}10` : '',
          ['--ring-color' as any]: column.color 
        }}
        onDragOver={(e) => handleDragOver(e, column.id)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, column.id)}
      >
        <div className="flex justify-between items-center p-5 pb-3">
          <div className="flex items-center gap-3">
            <div 
              className="w-3 h-3 rounded-full ring-2 ring-offset-2"
              style={{ 
                backgroundColor: column.color,
                ['--tw-ring-color' as any]: `${column.color}40`,
                ['--tw-ring-offset-color' as any]: darkMode ? '#0f172a' : '#ffffff'
              }}
            />
            <h2 className={`text-base font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
              {column.title}
            </h2>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              darkMode ? 'text-slate-400 bg-slate-800/50' : 'text-slate-600 bg-slate-100/80'
            }`}>
              {column.tasks.length}
            </span>
          </div>
          {board.columns.length > 1 && (
            <button
              onClick={() => handleRemoveColumn(column.id)}
              className={`cursor-pointer p-1.5 rounded-lg opacity-0 hover:opacity-100 transition-all duration-200 ${
                darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
              }`}
            >
              <FiXCircle className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto overflow-visible px-4 pb-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          {column.tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onRemove={() => handleRemoveTask(column.id, task.id)}
            />
          ))}
          <div className="mt-3">
            <button
              onClick={() => {
                setAddTaskColumnId(column.id);
                setNewTaskTitle("");
                setNewTaskDescription("");
                setNewTaskDueDate("");
                setNewTaskPriority("");
                setShowAddTaskModal(true);
              }}
              className={`w-full cursor-pointer flex items-center justify-center space-x-2 px-4 py-3 text-sm rounded-xl transition-all duration-200 border-2 border-dashed hover:border-solid group ${
                darkMode
                  ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border-slate-700 hover:border-slate-600'
                  : 'text-slate-500 hover:bg-slate-50 border-slate-300 hover:border-slate-400'
              }`}
            >
              <FiPlus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-200" />
              <span>Add a card</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const CustomDropdown = ({ 
    value, 
    onChange, 
    options, 
    placeholder,
    className = "" 
  }: {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder: string;
    className?: string;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
      <div ref={dropdownRef} className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`cursor-pointer w-full px-3 py-2 text-sm rounded-xl transition-all duration-200 border flex items-center justify-between ${
            darkMode 
              ? 'bg-slate-800/50 border-slate-700 text-slate-100 hover:bg-slate-800' 
              : 'bg-white/70 border-slate-200 text-slate-900 hover:bg-slate-50'
          } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
        >
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
          <FiChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className={`absolute top-full mt-1 w-full rounded-xl shadow-xl border backdrop-blur-xl z-50 overflow-hidden ${
            darkMode ? 'bg-slate-800/95 border-slate-700' : 'bg-white/95 border-slate-200'
          }`}>
            {options.map(option => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`cursor-pointer w-full px-3 py-2.5 text-sm text-left transition-colors flex items-center justify-between ${
                  value === option.value
                    ? darkMode ? 'bg-slate-700 text-slate-100' : 'bg-indigo-50 text-indigo-600'
                    : darkMode ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span>{option.label}</span>
                {value === option.value && <FiCheck className="h-4 w-4" />}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const colorOptions = [
    { value: "#818cf8", label: "Indigo", color: "#818cf8" },
    { value: "#f59e0b", label: "Amber", color: "#f59e0b" },
    { value: "#10b981", label: "Emerald", color: "#10b981" },
    { value: "#ef4444", label: "Red", color: "#ef4444" },
    { value: "#8b5cf6", label: "Purple", color: "#8b5cf6" },
    { value: "#3b82f6", label: "Blue", color: "#3b82f6" },
    { value: "#ec4899", label: "Pink", color: "#ec4899" },
    { value: "#14b8a6", label: "Teal", color: "#14b8a6" },
  ];

  useEffect(() => {
    let touchStartY = 0;
    let touchStartX = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      const touchX = e.touches[0].clientX;
      const deltaY = Math.abs(touchY - touchStartY);
      const deltaX = Math.abs(touchX - touchStartX);
      
      if (deltaX > deltaY && deltaX > 10) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <>
      <Head>
        <title>TaskBoard</title>
      </Head>
      <div
        className={`${quicksand.className} min-h-screen overflow-x-hidden transition-all duration-300 ${
          darkMode
            ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100'
            : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50 text-slate-900'
        }`}
      >
      <nav className={`sticky top-0 z-50 backdrop-blur-2xl border-b transition-all duration-500 ${
  darkMode 
    ? 'bg-slate-900/70 border-slate-700/50 shadow-[0_8px_32px_rgba(0,0,0,0.3)]' 
    : 'bg-white/70 border-slate-200/50 shadow-[0_8px_32px_rgba(0,0,0,0.08)]'
}`}>
  <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
    <div className="flex justify-between items-center h-20">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25 transform hover:scale-105 transition-all duration-300">
              <div className="w-6 h-6 bg-white/20 rounded-lg backdrop-blur-sm flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-sm"></div>
              </div>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              TaskBoard
            </h1>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Live
              </span>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <div className="relative group">
            <div className={`absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors duration-200" />
              <input
                type="text"
                placeholder="Search cards, tags, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-12 pr-4 py-3.5 w-80 text-sm rounded-2xl transition-all duration-300 border-2 ${
                  darkMode 
                    ? 'bg-slate-800/60 border-slate-700/50 text-slate-100 placeholder-slate-400 focus:bg-slate-800/80 focus:border-indigo-500/50' 
                    : 'bg-white/60 border-slate-200/50 text-slate-900 placeholder-slate-500 focus:bg-white/80 focus:border-indigo-500/50'
                } focus:outline-none focus:ring-4 focus:ring-indigo-500/10 hover:border-indigo-500/30`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <FiX className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            <CustomDropdown
              value={filterPriority}
              onChange={setFilterPriority}
              options={[
                { value: "", label: "All Priorities" },
                { value: "high", label: "🔴 High Priority" },
                { value: "medium", label: "🟡 Medium Priority" },
                { value: "low", label: "🟢 Low Priority" }
              ]}
              placeholder="Filter priorities"
              className="w-44"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          className={`md:hidden p-3 rounded-2xl transition-all duration-300 hover:scale-105 ${
            showSearch 
              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
              : darkMode ? 'hover:bg-slate-800/60' : 'hover:bg-slate-100/60'
          }`}
          onClick={() => setShowSearch(!showSearch)}
        >
          <FiSearch className="h-5 w-5" />
        </button>

        <button
          onClick={toggleDarkMode}
          className={`cursor-pointer relative p-3 rounded-2xl transition-all duration-300 hover:scale-105 ${
            darkMode 
              ? 'bg-amber-500 text-white shadow-md' 
              : 'bg-slate-200 text-slate-700 shadow-md'
          }`}
        >
          <div className="relative z-10">
            {darkMode ? (
              <FiSun className="h-5 w-5 transform rotate-0 transition-transform duration-500" />
            ) : (
              <FiMoon className="h-5 w-5 transform rotate-0 transition-transform duration-500" />
            )}
          </div>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`cursor-pointer flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-300 hover:scale-105 group ${
              darkMode ? 'hover:bg-slate-800/60' : 'hover:bg-slate-100/60'
            }`}
          >
            <div className="relative">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-indigo-500/25 ring-2 ring-white/20">
                {userName.charAt(0)}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900"></div>
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-semibold">{userName}</div>
              <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Board Owner
              </div>
            </div>
            <FiChevronDown className={`h-4 w-4 transition-transform duration-300 ${
              showProfileMenu ? 'rotate-180' : ''
            } ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
          </button>
        </div>
      </div>
    </div>

    {showSearch && (
      <div className="lg:hidden pb-6 space-y-4 animate-in slide-in-from-top duration-300">
        <div className="relative group">
          <div className={`absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-60`}></div>
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search cards, tags, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-3.5 text-sm rounded-2xl transition-all duration-300 border-2 ${
                darkMode 
                  ? 'bg-slate-800/60 border-slate-700/50 text-slate-100 placeholder-slate-400 focus:bg-slate-800/80 focus:border-indigo-500/50' 
                  : 'bg-white/60 border-slate-200/50 text-slate-900 placeholder-slate-500 focus:bg-white/80 focus:border-indigo-500/50'
              } focus:outline-none focus:ring-4 focus:ring-indigo-500/10`}
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <FiX className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <CustomDropdown
          value={filterPriority}
          onChange={setFilterPriority}
          options={[
            { value: "", label: "All Priorities" },
            { value: "high", label: "🔴 High Priority" },
            { value: "medium", label: "🟡 Medium Priority" },
            { value: "low", label: "🟢 Low Priority" }
          ]}
          placeholder="Filter by priority"
        />
      </div>
    )}
  </div>
</nav>


      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-3xl font-bold">{boardName}</h2>
              <button
                onClick={() => {
                  setBoardNameInput(boardName);
                  setShowBoardNameModal(true);
                }}
                className={`cursor-pointer p-1.5 rounded-lg transition-colors ${
                  darkMode ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-600"
                }`}
              >
                <FiEdit2 className="h-5 w-5" />
              </button>
            </div>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {board.columns.reduce((acc, col) => acc + col.tasks.length, 0)} total tasks
            </p>
          </div>
          <button
            onClick={() => setShowAddColumnModal(true)}
            className={`cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02] font-medium ${
              darkMode 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white' 
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white'
            } shadow-md`}
          >
            <FiPlus className="h-4 w-4" />
            <span>Add List</span>
          </button>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => e.preventDefault()}
        >
          {filteredColumns.map(column => (
            <ColumnComponent key={column.id} column={column} />
          ))}
        </div>
      </main>


      {showAddColumnModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl w-full max-w-md shadow-2xl ${
            darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
          }`}>
            <div className={`flex justify-between items-center p-6 border-b ${
              darkMode ? 'border-slate-700' : 'border-slate-200'
            }`}>
              <h3 className="text-lg font-semibold">Add New List</h3>
              <button
                onClick={() => {
                  setShowAddColumnModal(false);
                  setNewColumnTitle("");
                  setNewColumnColor("#818cf8");
                }}
                className={`cursor-pointer p-1.5 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
                }`}
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">List Title</label>
                <input
                  value={newColumnTitle}
                  onChange={e => setNewColumnTitle(e.target.value)}
                  placeholder="Enter list title..."
                  className={`w-full px-4 py-2.5 rounded-xl outline-none transition-all duration-200 border ${
                    darkMode 
                      ? 'bg-slate-700/50 text-slate-100 placeholder-slate-400 border-slate-600 focus:border-indigo-500' 
                      : 'bg-slate-50 text-slate-900 placeholder-slate-500 border-slate-200 focus:border-indigo-500'
                  } focus:ring-2 focus:ring-indigo-500/20`}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Color Theme</label>
                <div className="grid grid-cols-4 gap-3">
                  {colorOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setNewColumnColor(option.value)}
                      className={`cursor-pointer relative h-12 rounded-lg transition-all duration-200 ${
                        newColumnColor === option.value 
                          ? 'ring-2 ring-offset-2 scale-110' 
                          : 'hover:scale-105'
                      }`}
                      style={{ 
                        backgroundColor: option.color,
                        ['--tw-ring-color' as any]: option.color,
                        ['--tw-ring-offset-color' as any]: darkMode ? '#1e293b' : '#ffffff'
                      }}
                    >
                      {newColumnColor === option.value && (
                        <FiCheck className="absolute inset-0 m-auto h-5 w-5 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className={`flex justify-end gap-3 p-6 border-t ${
              darkMode ? 'border-slate-700' : 'border-slate-200'
            }`}>
              <button
                onClick={() => {
                  setShowAddColumnModal(false);
                  setNewColumnTitle("");
                  setNewColumnColor("#818cf8");
                }}
                className={`cursor-pointer px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                  darkMode 
                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleAddColumn}
                disabled={!newColumnTitle.trim()}
                className={`cursor-pointer px-5 py-2 rounded-xl transition-all duration-200 font-medium ${
                  newColumnTitle.trim()
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                Create List
              </button>
            </div>
          </div>
        </div>
      )}

     {showMoveModal && selectedTaskForMove && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className={`rounded-2xl w-full max-w-sm shadow-2xl transform transition-all duration-300 ${
      darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
    }`}>
      <div className={`flex justify-between items-center p-6 border-b ${
        darkMode ? 'border-slate-700' : 'border-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          <FiMove className="h-5 w-5 text-indigo-500" />
          <h3 className="text-lg font-semibold">Move Card</h3>
        </div>
        <button
          onClick={() => setShowMoveModal(false)}
          className={`p-1.5 rounded-lg transition-colors ${
            darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
          }`}
        >
          <FiX className="h-5 w-5" />
        </button>
      </div>
      <div className="p-6">
        <div className={`mb-4 p-3 rounded-lg border ${
          darkMode ? 'bg-slate-700/30 border-slate-600' : 'bg-slate-50 border-slate-200'
        }`}>
          <p className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
            {selectedTaskForMove.title}
          </p>
          {selectedTaskForMove.description && (
            <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {selectedTaskForMove.description.substring(0, 50)}
              {selectedTaskForMove.description.length > 50 ? '...' : ''}
            </p>
          )}
        </div>
        <p className={`text-sm mb-4 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          Select destination:
        </p>
        <div className="space-y-2">
          {board.columns.map(column => (
            <button
              key={column.id}
              onClick={() => moveTaskToColumn(selectedTaskForMove.id, column.id)}
              disabled={column.id === selectedTaskForMove.column}
              className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 text-left ${
                column.id === selectedTaskForMove.column
                  ? darkMode ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : darkMode ? 'hover:bg-slate-700 text-slate-200 border border-slate-600 hover:border-slate-500' : 'hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300'
              }`}
              style={{
                transform: column.id === selectedTaskForMove.column ? 'none' : 'scale(1)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (column.id !== selectedTaskForMove.column) {
                  e.currentTarget.style.transform = 'scale(1.02)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <div 
                className="w-4 h-4 rounded-full ring-2 ring-offset-2 flex-shrink-0"
                style={{ 
                  backgroundColor: column.color,
                  ['--tw-ring-color' as any]: `${column.color}40`,
                  ['--tw-ring-offset-color' as any]: darkMode ? '#1e293b' : '#ffffff'
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate">{column.title}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    darkMode ? 'bg-slate-600/50 text-slate-300' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {column.tasks.length} cards
                  </span>
                </div>
              </div>
              {column.id === selectedTaskForMove.column ? (
                <span className="text-xs bg-slate-200 !text-white dark:bg-slate-700 dark:!text-white px-2 py-1 rounded-full flex-shrink-0">
                  Current
                </span>
              ) : (
                <div className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
)}


      {showEditTaskModal && taskToEdit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl w-full max-w-md shadow-2xl ${
            darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
          }`}>
            <div className={`flex justify-between items-center p-6 border-b ${
              darkMode ? 'border-slate-700' : 'border-slate-200'
            }`}>
              <h3 className="text-lg font-semibold">Edit Card</h3>
              <button
                onClick={() => setShowEditTaskModal(false)}
                className={`cursor-pointer p-1.5 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
                }`}
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <input
                  value={taskToEdit.title}
                  onChange={e => setTaskToEdit({ ...taskToEdit, title: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl outline-none transition-all duration-200 border ${
                    darkMode 
                      ? 'bg-slate-700/50 text-slate-100 border-slate-600 focus:border-indigo-500' 
                      : 'bg-slate-50 text-slate-900 border-slate-200 focus:border-indigo-500'
                  } focus:ring-2 focus:ring-indigo-500/20`}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <textarea
                  value={taskToEdit.description}
                  onChange={e => setTaskToEdit({ ...taskToEdit, description: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl outline-none resize-none transition-all duration-200 border ${
                    darkMode 
                      ? 'bg-slate-700/50 text-slate-100 border-slate-600 focus:border-indigo-500' 
                      : 'bg-slate-50 text-slate-900 border-slate-200 focus:border-indigo-500'
                  } focus:ring-2 focus:ring-indigo-500/20`}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Due Date</label>
                  <input
                    type="date"
                    value={taskToEdit.dueDate || ""}
                    onChange={e => setTaskToEdit({ ...taskToEdit, dueDate: e.target.value })}
                    className={`cursor-pointer w-full px-4 py-2.5 rounded-xl outline-none transition-all duration-200 border ${
                      darkMode 
                        ? 'bg-slate-700/50 text-slate-100 border-slate-600 focus:border-indigo-500' 
                        : 'bg-slate-50 text-slate-900 border-slate-200 focus:border-indigo-500'
                    } focus:ring-2 focus:ring-indigo-500/20`}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Priority</label>
                  <CustomDropdown
                    value={taskToEdit.priority || ""}
                    onChange={(value) => setTaskToEdit({ ...taskToEdit, priority: value })}
                    options={[
                      { value: "", label: "None" },
                      { value: "low", label: "Low" },
                      { value: "medium", label: "Medium" },
                      { value: "high", label: "High" }
                    ]}
                    placeholder="Select priority"
                  />
                </div>
              </div>
            </div>
            <div className={`flex justify-end gap-3 p-6 border-t ${
              darkMode ? 'border-slate-700' : 'border-slate-200'
            }`}>
              <button
                onClick={() => setShowEditTaskModal(false)}
                className={`cursor-pointer px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                  darkMode 
                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => saveTaskEdit(taskToEdit)}
                className="cursor-pointer px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
  @media (max-width: 768px) {
    .group:hover .opacity-0 {
      opacity: 1;
    }
  }
  
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }
  
  .dark .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .task-card {
    user-select: none;
    pointer-events: auto;
    touch-action: none;
    will-change: transform, opacity;
  }

  .task-card * {
    user-select: none;
    pointer-events: auto;
  }

  .drag-placeholder {
    animation: dragFloat 0.5s ease-in-out infinite alternate;
  }

  @keyframes dragFloat {
    0% { transform: translateY(0px); }
    100% { transform: translateY(-2px); }
  }

  .column-wrapper {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .column-wrapper.drag-over {
    transform: scale(1.02);
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
  }

 
  .task-card:hover {
    transform: translateY(-1px);
  }

  .task-card:active {
    transform: scale(0.98);
  }


  @media (hover: none) and (pointer: coarse) {
    .task-card:active {
      transform: scale(0.98);
      transition: transform 0.1s ease;
    }
    .task-card button {
      opacity: 1 !important;
    }
  }

  input[type="date"]::-webkit-calendar-picker-indicator {
    cursor: pointer;
  }
      `}</style>
      {showAddTaskModal && addTaskColumnId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl w-full max-w-md shadow-2xl ${
            darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
          }`}>
            <div className={`flex justify-between items-center p-6 border-b ${
              darkMode ? 'border-slate-700' : 'border-slate-200'
            }`}>
              <h3 className="text-lg font-semibold">Add New Card</h3>
              <button
                onClick={() => {
                  setShowAddTaskModal(false);
                  setAddTaskColumnId(null);
                  setNewTaskTitle("");
                  setNewTaskDescription("");
                  setNewTaskDueDate("");
                  setNewTaskPriority("");
                }}
                className={`cursor-pointer p-1.5 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
                }`}
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <input
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  placeholder="Enter card title..."
                  className={`w-full px-4 py-2.5 rounded-xl outline-none transition-all duration-200 border ${
                    darkMode 
                      ? 'bg-slate-700/50 text-slate-100 placeholder-slate-400 border-slate-600 focus:border-indigo-500' 
                      : 'bg-slate-50 text-slate-900 placeholder-slate-500 border-slate-200 focus:border-indigo-500'
                  } focus:ring-2 focus:ring-indigo-500/20`}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <textarea
                  value={newTaskDescription}
                  onChange={e => setNewTaskDescription(e.target.value)}
                  placeholder="Enter description..."
                  className={`w-full px-4 py-2.5 rounded-xl outline-none resize-none transition-all duration-200 border ${
                    darkMode 
                      ? 'bg-slate-700/50 text-slate-100 placeholder-slate-400 border-slate-600 focus:border-indigo-500' 
                      : 'bg-slate-50 text-slate-900 placeholder-slate-500 border-slate-200 focus:border-indigo-500'
                  } focus:ring-2 focus:ring-indigo-500/20`}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Due Date</label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={e => setNewTaskDueDate(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl outline-none transition-all duration-200 border ${
                      darkMode 
                        ? 'bg-slate-700/50 text-slate-100 border-slate-600 focus:border-indigo-500' 
                        : 'bg-slate-50 text-slate-900 border-slate-200 focus:border-indigo-500'
                    } focus:ring-2 focus:ring-indigo-500/20`}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Priority</label>
                  <CustomDropdown
                    value={newTaskPriority}
                    onChange={setNewTaskPriority}
                    options={[
                      { value: "", label: "None" },
                      { value: "low", label: "Low" },
                      { value: "medium", label: "Medium" },
                      { value: "high", label: "High" }
                    ]}
                    placeholder="Select priority"
                  />
                </div>
              </div>
            </div>
            <div className={`flex justify-end gap-3 p-6 border-t ${
              darkMode ? 'border-slate-700' : 'border-slate-200'
            }`}>
              <button
                onClick={() => {
                  setShowAddTaskModal(false);
                  setAddTaskColumnId(null);
                  setNewTaskTitle("");
                  setNewTaskDescription("");
                  setNewTaskDueDate("");
                  setNewTaskPriority("");
                }}
                className={`cursor-pointer px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                  darkMode 
                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newTaskTitle.trim()) return;
                  
                  const newTask: Task = {
                    id: generateId(),
                    title: newTaskTitle,
                    description: newTaskDescription,
                    column: addTaskColumnId,
                    priority: newTaskPriority || undefined,
                    dueDate: newTaskDueDate || undefined,
                    completed: false,
                    createdAt: new Date().toISOString(),
                  };
                  
                  handleAddTask(addTaskColumnId, newTask);
                  setShowAddTaskModal(false);
                  setAddTaskColumnId(null);
                  setNewTaskTitle("");
                  setNewTaskDescription("");
                  setNewTaskDueDate("");
                  setNewTaskPriority("");
                }}
                disabled={!newTaskTitle.trim()}
                className={`cursor-pointer px-5 py-2 rounded-xl transition-all duration-200 font-medium ${
                  newTaskTitle.trim()
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                Create Card
              </button>
            </div>
          </div>
        </div>
      )}

      {showBoardNameModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl w-full max-w-sm shadow-2xl ${
            darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
          }`}>
            <div className={`flex justify-between items-center p-6 border-b ${
              darkMode ? 'border-slate-700' : 'border-slate-200'
            }`}>
              <h3 className="text-lg font-semibold">Edit Board Name</h3>
              <button
                onClick={() => setShowBoardNameModal(false)}
                className={`cursor-pointer p-1.5 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
                }`}
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <input
                value={boardNameInput}
                onChange={e => setBoardNameInput(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl outline-none transition-all duration-200 border ${
                  darkMode 
                    ? 'bg-slate-700/50 text-slate-100 border-slate-600 focus:border-indigo-500' 
                    : 'bg-slate-50 text-slate-900 border-slate-200 focus:border-indigo-500'
                } focus:ring-2 focus:ring-indigo-500/20`}
                autoFocus
              />
            </div>
            <div className={`flex justify-end gap-3 p-6 border-t ${
              darkMode ? 'border-slate-700' : 'border-slate-200'
            }`}>
              <button
                onClick={() => setShowBoardNameModal(false)}
                className={`cursor-pointer px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                  darkMode 
                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setBoardName(boardNameInput);
                  setShowBoardNameModal(false);
                }}
                className="cursor-pointer px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showProfileMenu && (
  <>
    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
    <div className={`absolute top-24 right-4 sm:right-8 w-80 rounded-3xl shadow-2xl border backdrop-blur-2xl z-50 overflow-hidden ${
      darkMode ? 'bg-slate-800/95 border-slate-700/50' : 'bg-white/95 border-slate-200/50'
    }`}>
      <div className="relative p-6 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-500/25">
              {userName.charAt(0)}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-3 border-white dark:border-slate-800"></div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold">{userName}</h3>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Board Owner
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Online
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={`px-6 py-4 border-b ${darkMode ? 'border-slate-700/50' : 'border-slate-200/50'}`}>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-indigo-500">
              {board.columns.reduce((acc, col) => acc + col.tasks.length, 0)}
            </div>
            <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Total Cards
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-500">
              {board.columns.length}
            </div>
            <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Lists
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-emerald-500">
              {board.columns.reduce((acc, col) => acc + col.tasks.filter(t => t.completed).length, 0)}
            </div>
            <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Completed
            </div>
          </div>
        </div>
      </div>

      <div className="p-3">
        <button
          onClick={() => {
            setProfileNameInput(userName);
            setShowEditProfileModal(true);
            setShowProfileMenu(false);
          }}
          className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 text-sm rounded-2xl transition-all duration-200 hover:scale-[1.02] ${
            darkMode ? 'hover:bg-slate-700/50 text-slate-200' : 'hover:bg-slate-50 text-slate-700'
          }`}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
            <FiUser className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="flex-1 text-left">
            <div className="font-medium">Edit Profile</div>
            <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Update your information
            </div>
          </div>
        </button>

        <button
          onClick={() => {
            setBoard(prev => ({
              columns: prev.columns.map(col => ({ ...col, tasks: [] }))
            }));
            setShowProfileMenu(false);
          }}
          className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 text-sm rounded-2xl transition-all duration-200 hover:scale-[1.02] ${
            darkMode ? 'hover:bg-slate-700/50 text-slate-200' : 'hover:bg-slate-50 text-slate-700'
          }`}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl flex items-center justify-center">
            <FiArchive className="h-4 w-4 text-amber-500" />
          </div>
          <div className="flex-1 text-left">
            <div className="font-medium">Clear All Tasks</div>
            <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Reset your board
            </div>
          </div>
        </button>
      </div>
    </div>
  </>
)}

      {showEditProfileModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl w-full max-w-sm shadow-2xl ${
            darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
          }`}>
            <div className={`flex justify-between items-center p-6 border-b ${
              darkMode ? 'border-slate-700' : 'border-slate-200'
            }`}>
              <h3 className="text-lg font-semibold">Edit Profile</h3>
              <button
                onClick={() => setShowEditProfileModal(false)}
                className={`cursor-pointer p-1.5 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
                }`}
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <label className="text-sm font-medium mb-2 block">Display Name</label>
              <input
                value={profileNameInput}
                onChange={e => setProfileNameInput(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl outline-none transition-all duration-200 border ${
                  darkMode 
                    ? 'bg-slate-700/50 text-slate-100 border-slate-600 focus:border-indigo-500' 
                    : 'bg-slate-50 text-slate-900 border-slate-200 focus:border-indigo-500'
                } focus:ring-2 focus:ring-indigo-500/20`}
                autoFocus
              />
            </div>
            <div className={`flex justify-end gap-3 p-6 border-t ${
              darkMode ? 'border-slate-700' : 'border-slate-200'
            }`}>
              <button
                onClick={() => setShowEditProfileModal(false)}
                className={`cursor-pointer px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                  darkMode 
                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setUserName(profileNameInput);
                  setShowEditProfileModal(false);
                }}
                className="cursor-pointer px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default TrelloClone;