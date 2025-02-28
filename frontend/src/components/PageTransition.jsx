import { motion } from 'framer-motion';
import { Box } from '@chakra-ui/react';

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Box>{children}</Box>
    </motion.div>
  );
};

export default PageTransition; 