/**
 * Reusable Card component with consistent styling and hover effects
 * Supports different variants and interactive states
 */
const Card = ({ 
  children, 
  variant = 'default',
  interactive = false,
  className = '',
  onClick,
  ...props 
}) => {
  const baseClasses = 'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200';
  
  const variants = {
    default: 'p-6',
    compact: 'p-4',
    loose: 'p-8',
    none: ''
  };
  
  const interactiveClasses = interactive 
    ? 'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer transform hover:-translate-y-0.5'
    : '';
  
  const classes = `${baseClasses} ${variants[variant]} ${interactiveClasses} ${className}`;
  
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component
      className={classes}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Card;
