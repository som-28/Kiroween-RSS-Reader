import { motion } from 'framer-motion';

interface GhostlySkeletonProps {
  variant?: 'article' | 'feed' | 'digest' | 'text' | 'card';
  count?: number;
  className?: string;
}

export const GhostlySkeleton = ({
  variant = 'article',
  count = 1,
  className = '',
}: GhostlySkeletonProps) => {
  const shimmerVariants = {
    initial: { x: '-100%' },
    animate: {
      x: '100%',
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: 'linear',
      },
    },
  };

  const SkeletonBox = ({ width, height }: { width: string; height: string }) => (
    <div
      className="relative overflow-hidden rounded bg-graveyard-gray/50"
      style={{ width, height }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(240,240,240,0.1), transparent)',
        }}
        variants={shimmerVariants}
        initial="initial"
        animate="animate"
      />
    </div>
  );

  const ArticleSkeleton = () => (
    <div className="bg-haunted-black/30 border border-witch-purple/20 rounded-lg p-6 space-y-4">
      <SkeletonBox width="70%" height="24px" />
      <SkeletonBox width="40%" height="16px" />
      <div className="space-y-2">
        <SkeletonBox width="100%" height="12px" />
        <SkeletonBox width="100%" height="12px" />
        <SkeletonBox width="80%" height="12px" />
      </div>
      <div className="flex gap-2">
        <SkeletonBox width="60px" height="24px" />
        <SkeletonBox width="60px" height="24px" />
        <SkeletonBox width="60px" height="24px" />
      </div>
    </div>
  );

  const FeedSkeleton = () => (
    <div className="bg-haunted-black/30 border border-pumpkin-orange/20 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-3">
        <SkeletonBox width="48px" height="48px" />
        <div className="flex-1 space-y-2">
          <SkeletonBox width="60%" height="20px" />
          <SkeletonBox width="40%" height="14px" />
        </div>
      </div>
      <SkeletonBox width="100%" height="12px" />
    </div>
  );

  const DigestSkeleton = () => (
    <div className="bg-haunted-black/30 border border-poison-green/20 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <SkeletonBox width="150px" height="28px" />
        <SkeletonBox width="100px" height="20px" />
      </div>
      <SkeletonBox width="100%" height="16px" />
      <SkeletonBox width="90%" height="16px" />
      <div className="grid grid-cols-3 gap-2 mt-4">
        <SkeletonBox width="100%" height="32px" />
        <SkeletonBox width="100%" height="32px" />
        <SkeletonBox width="100%" height="32px" />
      </div>
    </div>
  );

  const TextSkeleton = () => (
    <div className="space-y-2">
      <SkeletonBox width="100%" height="12px" />
      <SkeletonBox width="95%" height="12px" />
      <SkeletonBox width="85%" height="12px" />
    </div>
  );

  const CardSkeleton = () => (
    <div className="bg-haunted-black/30 border border-ghost-white/10 rounded-lg p-4 space-y-3">
      <SkeletonBox width="100%" height="120px" />
      <SkeletonBox width="80%" height="20px" />
      <SkeletonBox width="60%" height="16px" />
    </div>
  );

  const renderSkeleton = () => {
    switch (variant) {
      case 'article':
        return <ArticleSkeleton />;
      case 'feed':
        return <FeedSkeleton />;
      case 'digest':
        return <DigestSkeleton />;
      case 'text':
        return <TextSkeleton />;
      case 'card':
        return <CardSkeleton />;
      default:
        return <ArticleSkeleton />;
    }
  };

  return (
    <div
      className={`space-y-4 ${className}`}
      role="status"
      aria-live="polite"
      aria-label="Loading content"
    >
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          aria-hidden="true"
        >
          {renderSkeleton()}
        </motion.div>
      ))}
    </div>
  );
};
