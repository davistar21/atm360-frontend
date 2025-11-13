import { motion } from "framer-motion";

export default function AttentionButton({
  children,
  onClick,
  className,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  title?: string;
}) {
  return (
    <motion.button
      animate={{
        // Vertical bounce (y), then wiggle (rotate)
        y: [0, -20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        rotate: [
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0, // pause
          0,
          0,
          0,
          -10,
          10,
          -8,
          8,
          -5,
          5,
          0,
        ],
      }}
      transition={{
        duration: 3.4, // 0.6 (bounce) + 7 (pause) + 0.8 (wiggle) + 5 (pause)
        times: [
          0,
          0.045,
          0.09, // bounce up and down
          0.6 / 3.4, // end bounce ~0.6s
          7.6 / 3.4, // pause until ~7.6s
          8.4 / 3.4, // end wiggle ~8.4s
          1, // rest of loop
        ],
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={className}
      onClick={onClick}
      title={title}
    >
      {children || "Click Me"}
    </motion.button>
  );
}
