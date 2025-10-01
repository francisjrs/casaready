// Layout Components
export { Header } from './layout/header';
export { Footer } from './layout/footer';
export { Container, HeroContainer, ContentContainer, FormContainer } from './layout/container';
export { Grid, FeatureGrid, TestimonialGrid, ServiceGrid, TwoColumnGrid } from './layout/grid';

// UI Components
export { LanguageToggle } from './ui/language-toggle';
export { ThemeToggle, SimpleThemeToggle } from './ui/theme-toggle';
export { SkipLink } from './ui/skip-link';
export { FocusTrap } from './ui/focus-trap';
export { Stepper, CompactStepper, StepDots } from './ui/stepper';
export {
  Text,
  Heading,
  Paragraph,
  Label,
  ErrorText,
  SuccessText,
  HelpText
} from './ui/text';

// Re-export shadcn/ui components for convenience
export { Button } from './ui/button';
export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
