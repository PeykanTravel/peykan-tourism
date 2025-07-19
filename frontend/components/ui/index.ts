// UI Components
export { default as Modal } from './Modal';
export { default as ProductCard } from './ProductCard';
export { default as MediaManager } from './MediaManager';
export { default as MediaGallery } from './MediaGallery';
export { default as MediaUpload } from './MediaUpload';
export { default as OptimizedImage } from './OptimizedImage';
export { ErrorBoundary } from './ErrorBoundary';

// New DDD UI Components
export { default as Button } from './Button/Button';
export { default as Card, CardHeader, CardContent, CardFooter } from './Card/Card';
export { default as Input } from './Input/Input';
export { default as Loading } from './Loading/Loading';
export { default as Accordion } from './Accordion/Accordion';
export type { AccordionItem } from './Accordion/Accordion';

// Contexts
export { ThemeProvider, useTheme } from '../../lib/contexts/ThemeContext';
export { AuthProvider, useAuth } from '../../lib/contexts/AuthContext';
export { useCartStore } from '../../lib/application/stores/cartStore';

// Utils
export { cn } from '../../lib/utils'; 