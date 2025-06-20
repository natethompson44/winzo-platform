import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from '../../components/ui/Button/Button';

describe('Button Component', () => {
  // Basic rendering tests
  describe('Rendering', () => {
    test('renders button with text', () => {
      render(<Button>Click Me</Button>);
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    test('renders button with custom className', () => {
      render(<Button className="custom-class">Test</Button>);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    test('renders disabled button', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  // Variant tests
  describe('Variants', () => {
    test('renders primary variant', () => {
      render(<Button variant="primary">Primary</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-primary');
    });

    test('renders secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-secondary');
    });

    test('renders accent variant', () => {
      render(<Button variant="accent">Accent</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-accent');
    });

    test('renders danger variant', () => {
      render(<Button variant="danger">Danger</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-danger');
    });

    test('renders ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-ghost');
    });
  });

  // Size tests
  describe('Sizes', () => {
    test('renders extra small size', () => {
      render(<Button size="xs">Extra Small</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-xs');
    });

    test('renders small size', () => {
      render(<Button size="sm">Small</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-sm');
    });

    test('renders medium size (default)', () => {
      render(<Button>Medium</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-md');
    });

    test('renders large size', () => {
      render(<Button size="lg">Large</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-lg');
    });

    test('renders extra large size', () => {
      render(<Button size="xl">Extra Large</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-xl');
    });
  });

  // Interaction tests
  describe('Interactions', () => {
    test('calls onClick when clicked', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('does not call onClick when disabled', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} disabled>Click Me</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    test('handles keyboard events', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  // Accessibility tests
  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      render(<Button aria-label="Custom Label">Button</Button>);
      expect(screen.getByLabelText('Custom Label')).toBeInTheDocument();
    });

    test('has proper role', () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('is focusable', () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    test('disabled button is not focusable', () => {
      render(<Button disabled>Button</Button>);
      const button = screen.getByRole('button');
      expect(button).not.toHaveFocus();
    });
  });

  // Full width tests
  describe('Full Width', () => {
    test('handles full width', () => {
      render(<Button fullWidth>Full Width</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-full');
    });

    test('renders without full width by default', () => {
      render(<Button>Normal Width</Button>);
      expect(screen.getByRole('button')).not.toHaveClass('btn-full');
    });
  });

  // CSS Variables tests
  describe('CSS Variables', () => {
    test('applies custom CSS variables', () => {
      render(
        <Button 
          style={{ 
            '--btn-bg': '#ff0000',
            '--btn-text': '#ffffff'
          } as React.CSSProperties}
        >
          Custom Colors
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({
        '--btn-bg': '#ff0000',
        '--btn-text': '#ffffff'
      });
    });
  });

  // Form integration tests
  describe('Form Integration', () => {
    test('works as submit button', () => {
      const handleSubmit = jest.fn(e => e.preventDefault());
      
      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit</Button>
        </form>
      );
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    test('works as reset button', () => {
      render(
        <form>
          <Button type="reset">Reset</Button>
        </form>
      );
      
      expect(screen.getByRole('button')).toHaveAttribute('type', 'reset');
    });
  });
}); 