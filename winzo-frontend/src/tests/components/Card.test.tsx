import React from 'react';
import { render, screen } from '../utils/testUtils';
import Card from '../../components/ui/Card/Card';

describe('Card Component', () => {
  // Basic rendering tests
  describe('Rendering', () => {
    test('renders card with children', () => {
      render(
        <Card>
          <h2>Test Card</h2>
          <p>Card content</p>
        </Card>
      );
      
      expect(screen.getByText('Test Card')).toBeInTheDocument();
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    test('applies base card classes', () => {
      const { container } = render(<Card>Card Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('card');
    });

    test('applies custom className', () => {
      const { container } = render(
        <Card className="custom-card">
          Content
        </Card>
      );
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('card', 'custom-card');
    });

    test('renders card body', () => {
      render(<Card>Body Content</Card>);
      const cardBody = document.querySelector('.card-body');
      expect(cardBody).toBeInTheDocument();
      expect(cardBody).toHaveTextContent('Body Content');
    });
  });

  // Header and footer tests
  describe('Header and Footer', () => {
    test('renders card with header', () => {
      render(
        <Card header={<h3>Card Header</h3>}>
          Card body content
        </Card>
      );

      expect(screen.getByText('Card Header')).toBeInTheDocument();
      expect(screen.getByText('Card body content')).toBeInTheDocument();
      
      const cardHeader = document.querySelector('.card-header');
      expect(cardHeader).toBeInTheDocument();
    });

    test('renders card with footer', () => {
      render(
        <Card footer={<p>Card Footer</p>}>
          Card body content
        </Card>
      );

      expect(screen.getByText('Card Footer')).toBeInTheDocument();
      expect(screen.getByText('Card body content')).toBeInTheDocument();
      
      const cardFooter = document.querySelector('.card-footer');
      expect(cardFooter).toBeInTheDocument();
    });

    test('renders card with both header and footer', () => {
      render(
        <Card 
          header={<h3>Header</h3>}
          footer={<div>Footer</div>}
        >
          Body content
        </Card>
      );

      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Body content')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
      
      expect(document.querySelector('.card-header')).toBeInTheDocument();
      expect(document.querySelector('.card-body')).toBeInTheDocument();
      expect(document.querySelector('.card-footer')).toBeInTheDocument();
    });

    test('does not render header section when header prop is not provided', () => {
      render(<Card>Just body content</Card>);
      
      expect(document.querySelector('.card-header')).not.toBeInTheDocument();
      expect(document.querySelector('.card-body')).toBeInTheDocument();
      expect(document.querySelector('.card-footer')).not.toBeInTheDocument();
    });

    test('does not render footer section when footer prop is not provided', () => {
      render(<Card>Just body content</Card>);
      
      expect(document.querySelector('.card-footer')).not.toBeInTheDocument();
      expect(document.querySelector('.card-body')).toBeInTheDocument();
    });
  });

  // Structure tests
  describe('Structure', () => {
    test('maintains proper DOM structure', () => {
      const { container } = render(
        <Card 
          header="Header"
          footer="Footer"
          className="test-card"
        >
          Body
        </Card>
      );

      const card = container.firstChild as HTMLElement;
      expect(card.tagName).toBe('DIV');
      expect(card).toHaveClass('card', 'test-card');

      const children = Array.from(card.children);
      expect(children).toHaveLength(3);
      
      expect(children[0]).toHaveClass('card-header');
      expect(children[1]).toHaveClass('card-body');
      expect(children[2]).toHaveClass('card-footer');
    });

    test('renders only body when no header or footer provided', () => {
      const { container } = render(<Card>Only body</Card>);

      const card = container.firstChild as HTMLElement;
      const children = Array.from(card.children);
      expect(children).toHaveLength(1);
      expect(children[0]).toHaveClass('card-body');
    });
  });

  // Content tests
  describe('Content', () => {
    test('renders complex content in body', () => {
      render(
        <Card>
          <div data-testid="complex-content">
            <h4>Game Stats</h4>
            <ul>
              <li>Team A: 2</li>
              <li>Team B: 1</li>
            </ul>
            <button>Place Bet</button>
          </div>
        </Card>
      );

      const complexContent = screen.getByTestId('complex-content');
      expect(complexContent).toBeInTheDocument();
      expect(screen.getByText('Game Stats')).toBeInTheDocument();
      expect(screen.getByText('Team A: 2')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Place Bet' })).toBeInTheDocument();
    });

    test('renders complex header content', () => {
      render(
        <Card 
          header={
            <div data-testid="complex-header">
              <h3>Chiefs vs Bills</h3>
              <span>Live</span>
            </div>
          }
        >
          Game content
        </Card>
      );

      const complexHeader = screen.getByTestId('complex-header');
      expect(complexHeader).toBeInTheDocument();
      expect(screen.getByText('Chiefs vs Bills')).toBeInTheDocument();
      expect(screen.getByText('Live')).toBeInTheDocument();
    });

    test('renders complex footer content', () => {
      render(
        <Card 
          footer={
            <div data-testid="complex-footer">
              <button>Bet Now</button>
              <span>Min: $5</span>
            </div>
          }
        >
          Game details
        </Card>
      );

      const complexFooter = screen.getByTestId('complex-footer');
      expect(complexFooter).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Bet Now' })).toBeInTheDocument();
      expect(screen.getByText('Min: $5')).toBeInTheDocument();
    });
  });

  // CSS class filtering tests
  describe('CSS Classes', () => {
    test('filters out empty className', () => {
      const { container } = render(<Card className="">Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toBe('card');
    });

    test('handles multiple class names', () => {
      const { container } = render(
        <Card className="custom-card betting-card">
          Content
        </Card>
      );
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('card', 'custom-card', 'betting-card');
    });

    test('works without custom className', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toBe('card');
    });
  });

  // Props handling tests
  describe('Props Handling', () => {
    test('handles undefined header gracefully', () => {
      render(<Card header={undefined}>Content</Card>);
      expect(document.querySelector('.card-header')).not.toBeInTheDocument();
      expect(document.querySelector('.card-body')).toBeInTheDocument();
    });

    test('handles undefined footer gracefully', () => {
      render(<Card footer={undefined}>Content</Card>);
      expect(document.querySelector('.card-footer')).not.toBeInTheDocument();
      expect(document.querySelector('.card-body')).toBeInTheDocument();
    });

    test('handles null header gracefully', () => {
      render(<Card header={null}>Content</Card>);
      expect(document.querySelector('.card-header')).not.toBeInTheDocument();
    });

    test('handles null footer gracefully', () => {
      render(<Card footer={null}>Content</Card>);
      expect(document.querySelector('.card-footer')).not.toBeInTheDocument();
    });
  });


}); 