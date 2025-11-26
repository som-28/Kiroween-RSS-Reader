import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Feed } from '../../services/feedService';
import FeedCard from './FeedCard';

interface FeedListProps {
  feeds: Feed[];
  onRefresh: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onReorder: (feeds: Feed[]) => void;
  refreshingFeedId?: string;
}

export default function FeedList({
  feeds,
  onRefresh,
  onDelete,
  onEdit,
  onReorder,
  refreshingFeedId,
}: FeedListProps) {
  const [orderedFeeds, setOrderedFeeds] = useState(feeds);

  // Update ordered feeds when feeds prop changes
  useEffect(() => {
    setOrderedFeeds(feeds);
  }, [feeds]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(orderedFeeds);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setOrderedFeeds(items);
    onReorder(items);
  };

  if (feeds.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-gradient-to-br from-pumpkin/10 via-pumpkin/5 to-transparent backdrop-blur-xl border border-pumpkin/30 rounded-2xl p-16 text-center overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-64 h-64 bg-pumpkin/10 rounded-full blur-3xl" />
        <div className="relative">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-7xl mb-6"
          >
            📡
          </motion.div>
          <h3 className="text-2xl font-bold text-ghost mb-3">No Feeds Yet</h3>
          <p className="text-fog/80 max-w-md mx-auto">
            Add your first RSS feed above to start discovering amazing content
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="feeds">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 
                       ${snapshot.isDraggingOver ? 'bg-witch/5 rounded-lg' : ''}`}
          >
            {orderedFeeds.map((feed, index) => (
              <Draggable key={feed.id} draggableId={feed.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`${snapshot.isDragging ? 'opacity-50' : ''}`}
                  >
                    <FeedCard
                      feed={feed}
                      onRefresh={onRefresh}
                      onDelete={onDelete}
                      onEdit={onEdit}
                      isRefreshing={refreshingFeedId === feed.id}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
